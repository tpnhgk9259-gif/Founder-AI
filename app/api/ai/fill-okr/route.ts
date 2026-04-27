import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { getStartupDescription } from "@/lib/orchestrator";
import { buildCodirAgentPrompt } from "@/lib/prompts";
import { retrieveRelevantChunks } from "@/lib/rag";
import { logUsage } from "@/lib/usage";
import { jsonrepair } from "jsonrepair";
import { streamWithHeartbeat } from "@/lib/stream-helper";
import type { AgentKey } from "@/lib/supabase";
import type Anthropic from "@anthropic-ai/sdk";

export const maxDuration = 60;

const PROMPT_TEMPLATE = (quarter: string, collabs: string) => `Tu es un expert en OKR et execution. Genere un plan OKR complet pour le trimestre ${quarter}.

${collabs ? `Collaborateurs disponibles :\n${collabs}\n` : ""}

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) :

{
  "priority": "Priorite strategique du trimestre en 1 phrase",
  "okrs": [
    {
      "department": "Produit",
      "objective": "Objectif qualitatif et ambitieux",
      "keyResults": [
        {
          "title": "Key Result mesurable",
          "target": "Valeur cible chiffree",
          "owner": "Nom du responsable",
          "score": 0,
          "initiatives": [
            { "title": "Action concrete 1", "effort": 3, "assignees": ["Prenom1"] },
            { "title": "Action concrete 2", "effort": 2, "assignees": ["Prenom2", "Prenom3"] }
          ]
        }
      ]
    }
  ]
}

Regles :
- 5 departements : Produit, Commercial, Tech, Ops, Finance
- 1 objectif par departement (ambitieux mais realiste)
- 2-4 Key Results par objectif (mesurables, chiffres)
- 2-5 initiatives par KR (actions concretes, pas des voeux)
- effort : 1 (rapide) a 5 (projet majeur)
- assignees : noms des collaborateurs disponibles (utilise les prenoms fournis)
- Adapte au contexte de la startup, pas de generic
- Les initiatives doivent etre realisables dans le trimestre`;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifie" }, { status: 401 });

  const { startupId, quarter, collaborators } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Acces refuse" }, { status: 403 });

  return streamWithHeartbeat(async (send) => {
    const context = await getStartupDescription(startupId).catch(() => null);
    const chunks = await retrieveRelevantChunks("operations", "OKR objectifs key results execution planning").catch(() => null);
    const extraKnowledge = chunks?.join("\n\n") ?? null;
    const systemPrompt = buildCodirAgentPrompt("operations" as AgentKey, context, extraKnowledge);

    const collabStr = Array.isArray(collaborators) ? collaborators.join("\n") : "";
    const prompt = PROMPT_TEMPLATE(quarter || "T2 2026", collabStr);

    const response = await claude.messages.create({ model: MODELS.CHAT, max_tokens: 4000, system: systemPrompt, messages: [{ role: "user", content: prompt }] });
    const rawText = response.content.filter((b): b is Anthropic.TextBlock => b.type === "text").map((b) => b.text).join("");

    logUsage({ startupId, userId, model: response.model, endpoint: "fill-okr", inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) { send(JSON.stringify({ error: "Reponse IA invalide" })); return; }

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(jsonrepair(jsonMatch[0])); }
    catch { try { parsed = JSON.parse(jsonMatch[0]); } catch { send(JSON.stringify({ error: "Parse error" })); return; } }

    send(JSON.stringify({ data: parsed }));
  });
}
