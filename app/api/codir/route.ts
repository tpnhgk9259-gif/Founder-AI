import { NextRequest } from "next/server";
import { z } from "zod";
import { claude, MODELS, sseEvent } from "@/lib/claude";
import {
  buildCodirAgentPrompt,
  buildSynthesisUserMessage,
  buildStartupManagerMessage,
  CODIR_SYNTHESIS_PROMPT,
  STARTUP_MANAGER_PROMPT,
} from "@/lib/prompts";
import {
  getStartupDescription,
  saveCodirSession,
  updateCodirSession,
} from "@/lib/orchestrator";
import type { AgentKey } from "@/lib/supabase";
import type Anthropic from "@anthropic-ai/sdk";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { checkCodirAccess } from "@/lib/license-service";
import { createServerClient } from "@/lib/supabase";
import { retrieveRelevantChunks } from "@/lib/rag";
import { checkRateLimit } from "@/lib/rate-limit";
import { logUsage } from "@/lib/usage";

const CODIR_AGENTS: { key: AgentKey; label: string }[] = [
  { key: "strategie", label: "Maya" },
  { key: "vente", label: "Alex" },
  { key: "finance", label: "Sam" },
  { key: "technique", label: "Léo" },
  { key: "operations", label: "Marc" },
];

/** Timeout d'un appel agent (configurable via env, défaut 30s). */
const AGENT_TIMEOUT_MS = Number(process.env.CODIR_AGENT_TIMEOUT_MS) || 30_000;

type AgentResult = { text: string; inputTokens: number; outputTokens: number; model: string };

async function runAgentAnalysis(
  agentKey: AgentKey,
  question: string,
  startupDescription: string | null,
  extraKnowledge: string | null
): Promise<AgentResult> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("Timeout")), AGENT_TIMEOUT_MS)
  );

  const call = claude.messages.create({
    model: MODELS.CHAT,
    max_tokens: 1024,
    system: buildCodirAgentPrompt(agentKey, startupDescription, extraKnowledge),
    messages: [{ role: "user", content: question }],
  });

  const response = await Promise.race([call, timeout]);
  const text = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");
  return {
    text,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
    model: response.model,
  };
}

const codirSchema = z.object({
  startupId: z.string().uuid(),
  question: z.string().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Rate limit : 5 sessions CODIR / minute par utilisateur
  const rl = checkRateLimit("codir", userId, 5, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: `Trop de requêtes. Réessayez dans ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let body: z.infer<typeof codirSchema>;
  try {
    body = codirSchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError
      ? e.issues.map((i) => i.message).join(", ")
      : "Corps de requête invalide";
    return Response.json({ error: msg }, { status: 400 });
  }

  const { startupId, question } = body;

  if (startupId) {
    const allowed = await userOwnsStartup(userId, startupId);
    if (!allowed) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const check = await checkCodirAccess(startupId);
    if (!check.ok) {
      return Response.json({ error: check.error }, { status: check.status });
    }
  }

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));
      let sessionId: string | null = null;

      try {
        // startupId optionnel — si absent, on n'injecte pas de contexte startup
        const supabaseAdmin = createServerClient();
        const [startupDescription, knowledgeRows, ragResults] = await Promise.all([
          startupId ? getStartupDescription(startupId).catch(() => null) : Promise.resolve(null),
          // Fallback : contenu complet si RAG non disponible
          supabaseAdmin
            .from("agent_knowledge")
            .select("agent_key, content")
            .then((r) => r.data ?? []),
          // RAG : chunks pertinents par agent (parallèle)
          Promise.all(
            CODIR_AGENTS.map(async (agent) => ({
              agentKey: agent.key,
              chunks: await retrieveRelevantChunks(agent.key, question).catch(() => null),
            }))
          ),
        ]);

        const knowledgeMapFull: Record<string, string> = Object.fromEntries(
          (knowledgeRows as { agent_key: string; content: string }[]).map((r) => [r.agent_key, r.content])
        );
        // RAG prioritaire ; fallback sur contenu complet si aucun chunk
        const knowledgeMap: Record<string, string> = Object.fromEntries(
          ragResults.map(({ agentKey, chunks }) => [
            agentKey,
            chunks ? chunks.join("\n\n---\n\n") : (knowledgeMapFull[agentKey] ?? ""),
          ])
        );

        for (const { agentKey, chunks } of ragResults) {
          if (!chunks && knowledgeMapFull[agentKey]) {
            console.warn(`[RAG/CODIR] Fallback injection complète pour agent=${agentKey} (${knowledgeMapFull[agentKey].length} chars)`);
          }
        }

        // Persister la session si on a un startupId
        if (startupId) {
          sessionId = await saveCodirSession({
            startupId,
            question,
            status: "dispatching",
          }).catch(() => null);
        }

        // ── Phase 1 : dispatch parallèle ───────────────────────────────
        const analyses: { agentKey: string; content: string }[] = new Array(
          CODIR_AGENTS.length
        );

        await Promise.all(
          CODIR_AGENTS.map(async (agent, i) => {
            send({ type: "agent_start", agentKey: agent.key, label: agent.label });
            try {
              const result = await runAgentAnalysis(
                agent.key,
                question,
                startupDescription,
                knowledgeMap[agent.key] ?? null
              );
              analyses[i] = { agentKey: agent.key, content: result.text };
              logUsage({ startupId, userId, model: result.model, endpoint: "codir/agent", inputTokens: result.inputTokens, outputTokens: result.outputTokens });
              send({ type: "agent_done", agentKey: agent.key });
            } catch {
              // Timeout ou erreur : la synthèse se fait avec les autres agents
              analyses[i] = {
                agentKey: agent.key,
                content: "[Analyse non disponible — timeout]",
              };
              send({ type: "agent_error", agentKey: agent.key });
            }
          })
        );

        // Mettre à jour la session avec les analyses
        if (sessionId) {
          await updateCodirSession(sessionId, {
            agentAnalyses: analyses,
            status: "synthesizing",
          });
        }

        // ── Phase 2 : synthèse Opus en streaming ───────────────────────
        send({ type: "synthesis_start" });

        const stream = claude.messages.stream({
          model: MODELS.CODIR,
          max_tokens: 2048,
          system: CODIR_SYNTHESIS_PROMPT,
          messages: [
            {
              role: "user",
              content: buildSynthesisUserMessage(question, analyses),
            },
          ],
        });

        let synthesis = "";

        stream.on("text", (text) => {
          synthesis += text;
          send({ type: "text", text, phase: "synthesis" });
        });

        const synthFinal = await stream.finalMessage();
        logUsage({ startupId, userId, model: synthFinal.model, endpoint: "codir/synthesis", inputTokens: synthFinal.usage?.input_tokens ?? 0, outputTokens: synthFinal.usage?.output_tokens ?? 0 });

        // ── Phase 3 : Victor (Startup Manager) ────────────────────────
        send({ type: "manager_start" });

        const managerStream = claude.messages.stream({
          model: MODELS.CODIR,
          max_tokens: 3072,
          system: STARTUP_MANAGER_PROMPT,
          messages: [
            {
              role: "user",
              content: buildStartupManagerMessage(question, synthesis),
            },
          ],
        });

        let managerContent = "";

        managerStream.on("text", (text) => {
          managerContent += text;
          send({ type: "text", text, phase: "manager" });
        });

        const managerFinal = await managerStream.finalMessage();
        logUsage({ startupId, userId, model: managerFinal.model, endpoint: "codir/manager", inputTokens: managerFinal.usage?.input_tokens ?? 0, outputTokens: managerFinal.usage?.output_tokens ?? 0 });

        // Finaliser la session
        if (sessionId) {
          await updateCodirSession(sessionId, {
            synthesis: synthesis + "\n\n---\n\n" + managerContent,
            status: "done",
          });
        }

        send({ type: "done", sessionId, analyses });
      } catch (err) {
        if (sessionId) {
          await updateCodirSession(sessionId, { status: "error" }).catch(
            () => {}
          );
        }
        send({ type: "error", message: String(err) });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
