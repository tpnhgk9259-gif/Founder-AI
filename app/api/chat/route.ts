import { NextRequest } from "next/server";
import { z } from "zod";
import { claude, MODELS, sseEvent } from "@/lib/claude";
import { buildSystemPrompt } from "@/lib/prompts";
import {
  getOrCreateConversation,
  buildConversationMessages,
  saveMessage,
  getStartupDescription,
  maybeSummarize,
} from "@/lib/orchestrator";
import type { AgentKey } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { checkChatAccess } from "@/lib/license-service";
import { createServerClient } from "@/lib/supabase";
import { retrieveRelevantChunks } from "@/lib/rag";
import { checkRateLimit } from "@/lib/rate-limit";
import { logUsage } from "@/lib/usage";

const chatSchema = z.object({
  startupId: z.string().uuid().optional(),
  agentKey: z.enum(["strategie", "vente", "finance", "technique"]),
  message: z.string().min(1).max(10000),
});

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Rate limit : 30 requêtes / minute par utilisateur
  const rl = checkRateLimit("chat", userId, 30, 60_000);
  if (!rl.ok) {
    return Response.json(
      { error: `Trop de requêtes. Réessayez dans ${rl.retryAfterSeconds}s.` },
      { status: 429 }
    );
  }

  let body: z.infer<typeof chatSchema>;
  try {
    body = chatSchema.parse(await req.json());
  } catch (e) {
    const msg = e instanceof z.ZodError
      ? e.issues.map((i) => i.message).join(", ")
      : "Corps de requête invalide";
    return Response.json({ error: msg }, { status: 400 });
  }

  const { startupId, agentKey, message } = body;

  let license = null;
  if (startupId) {
    const allowed = await userOwnsStartup(userId, startupId);
    if (!allowed) {
      return Response.json({ error: "Accès refusé" }, { status: 403 });
    }

    const check = await checkChatAccess(startupId, agentKey);
    if (!check.ok) {
      return Response.json({ error: check.error }, { status: check.status });
    }
    license = check.license;
  }

  const readable = new ReadableStream({
    async start(controller) {
      const send = (data: object) => controller.enqueue(sseEvent(data));

      try {
        const memoryEnabled = license?.conversational_memory_enabled ?? true;
        const supabaseAdmin = createServerClient();
        const [startupDescription, conversationId, ragChunks, knowledgeRow] = await Promise.all([
          startupId ? getStartupDescription(startupId).catch(() => null) : Promise.resolve(null),
          startupId && memoryEnabled
            ? getOrCreateConversation(startupId, agentKey).catch(() => null)
            : Promise.resolve(null),
          // Tentative RAG : chunks sémantiquement pertinents pour le message
          retrieveRelevantChunks(agentKey, message).catch(() => null),
          // Fallback : contenu complet si pas de chunks RAG disponibles
          supabaseAdmin
            .from("agent_knowledge")
            .select("content")
            .eq("agent_key", agentKey)
            .maybeSingle()
            .then((r) => r.data),
        ]);

        // RAG prioritaire si des chunks sont trouvés, sinon injection complète
        const extraKnowledge = ragChunks
          ? ragChunks.join("\n\n---\n\n")
          : (knowledgeRow?.content ?? null);

        if (!ragChunks && knowledgeRow?.content) {
          console.warn(`[RAG] Fallback injection complète pour agent=${agentKey} (${knowledgeRow.content.length} chars)`);
        }

        // 2. Persister le message utilisateur (si conversation disponible)
        if (conversationId) {
          await saveMessage(conversationId, "user", message);
        }

        // 3. Assembler le prompt
        const systemPrompt = buildSystemPrompt(agentKey, startupDescription, extraKnowledge);
        const history = conversationId
          ? await buildConversationMessages(
              conversationId,
              license?.conversational_memory_window ?? 10
            )
          : [];

        // Retirer le dernier message user qu'on vient d'ajouter (il sera passé en dernier)
        const historyWithoutLast = history.slice(0, -1);

        // 4. Appel Claude Sonnet en streaming
        const stream = claude.messages.stream({
          model: MODELS.CHAT,
          max_tokens: 2048,
          system: systemPrompt,
          messages: [
            ...historyWithoutLast,
            { role: "user", content: message },
          ],
        });

        let fullResponse = "";

        stream.on("text", (text) => {
          fullResponse += text;
          send({ type: "text", text });
        });

        const final = await stream.finalMessage();

        // 5. Persister la réponse de l'agent (si conversation disponible)
        if (conversationId) {
          await saveMessage(conversationId, "agent", fullResponse, final.model);
          // Résumé progressif — fire-and-forget, ne bloque pas la réponse
          maybeSummarize(conversationId).catch(() => {});
        }

        logUsage({
          startupId, userId, model: final.model, endpoint: "chat",
          inputTokens: final.usage?.input_tokens ?? 0,
          outputTokens: final.usage?.output_tokens ?? 0,
        });
        send({ type: "done", model: final.model });
      } catch (err) {
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
