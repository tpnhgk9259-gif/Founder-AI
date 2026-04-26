import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { getStartupDescription } from "@/lib/orchestrator";
import { buildCodirAgentPrompt } from "@/lib/prompts";
import { retrieveRelevantChunks } from "@/lib/rag";
import { logUsage } from "@/lib/usage";
import { jsonrepair } from "jsonrepair";
import type { AgentKey } from "@/lib/supabase";
import type Anthropic from "@anthropic-ai/sdk";

const AGENT_TIMEOUT_MS = 30_000;

const PROMPT = `Tu es un expert produit. A partir du contexte de la startup, genere une roadmap produit structuree.

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) contenant :

{
  "objectives": [
    { "title": "Objectif business 1", "metric": "KR mesurable (ex: MRR > 50k)" },
    { "title": "Objectif business 2", "metric": "KR mesurable" },
    { "title": "Objectif business 3", "metric": "KR mesurable" }
  ],
  "actors": [
    { "name": "Acteur 1", "role": "Description du role" },
    { "name": "Acteur 2", "role": "Description du role" }
  ],
  "features": [
    {
      "title": "Nom de la feature",
      "description": "Valeur apportee en 1 phrase",
      "objectiveIdx": 0,
      "actorIdx": 0,
      "impact": 4,
      "effort": 2,
      "quarter": "T2 26"
    }
  ]
}

Regles :
- 3 objectifs business alignes sur le stade de la startup
- 2-3 acteurs (utilisateurs, admin, partenaires...)
- 6-10 features concretes, bien reparties sur 3 trimestres (T2 26, T3 26, T4 26)
- impact et effort notes de 1 a 5
- objectiveIdx et actorIdx referencent les index des tableaux ci-dessus
- Les features a haut ratio impact/effort doivent etre sur les premiers trimestres
- Sois concret et specifique au contexte de la startup, pas generique`;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifie" }, { status: 401 });

  const { startupId } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Acces refuse" }, { status: 403 });

  const context = await getStartupDescription(startupId).catch(() => null);
  const chunks = await retrieveRelevantChunks("technique", "roadmap produit features priorisation").catch(() => null);
  const extraKnowledge = chunks?.join("\n\n") ?? null;
  const systemPrompt = buildCodirAgentPrompt("technique" as AgentKey, context, extraKnowledge);

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), AGENT_TIMEOUT_MS)
    );

    const call = claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 3000,
      system: systemPrompt,
      messages: [{ role: "user", content: PROMPT }],
    });

    const response = await Promise.race([call, timeout]);
    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    logUsage({
      startupId,
      userId,
      model: response.model,
      endpoint: "fill-roadmap",
      inputTokens: response.usage?.input_tokens ?? 0,
      outputTokens: response.usage?.output_tokens ?? 0,
    });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Reponse IA invalide" }, { status: 500 });

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(jsonrepair(jsonMatch[0]));
    } catch {
      try { parsed = JSON.parse(jsonMatch[0]); }
      catch { return Response.json({ error: "Impossible de parser la reponse IA" }, { status: 500 }); }
    }

    return Response.json({
      objectives: parsed.objectives,
      actors: parsed.actors,
      features: parsed.features,
    });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
