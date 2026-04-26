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

// Maya (stratégie) remplit les alternatives, attributs, valeur, catégorie, statement
// Alex (vente) remplit le marché cible

const AGENT_PROMPTS: { key: AgentKey; fields: string }[] = [
  {
    key: "strategie",
    fields: `Tu remplis un document de positionnement basé sur le framework "Obviously Awesome" d'April Dunford.

Remplis ces champs :
- competitive_alternatives : Liste les 3-5 alternatives réelles que les clients utilisent aujourd'hui (concurrents, solutions bricolées, statu quo). Sois spécifique au secteur.
- unique_attributes : Liste les 3-5 fonctionnalités ou capacités que cette startup a et que les alternatives n'ont PAS. Factuel et différenciant.
- value : Pour chaque attribut unique, traduis en bénéfice mesurable pour le client. Chiffre quand possible.
- market_category : Définis la catégorie de marché optimale (existante, adjacente ou nouvelle). Explique le contexte qui rend la valeur évidente. Propose un "référent connu" si pertinent.
- positioning_statement : Synthèse en 2-3 phrases format : "Pour [cible] qui [besoin], [produit] est [catégorie] qui [valeur]. Contrairement à [alternatives], nous [différenciation]."

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks).`,
  },
  {
    key: "vente",
    fields: `Tu remplis les sections "Marché cible" et "Segmentation" d'un document de positionnement (Obviously Awesome + Disciplined Entrepreneurship).

Remplis ces champs dans un objet JSON :
- target_market : Décris l'ICP (Ideal Customer Profile) et les early adopters. Inclus : titre/fonction du décideur, taille d'entreprise, secteur, budget typique, nombre d'entreprises dans le marché cible.
- beachhead_plan : Plan d'attaque pour dominer le meilleur segment en 12-18 mois (3-5 actions concrètes).
- segments : Un TABLEAU JSON de 5-6 segments de marché potentiels. Chaque segment est un objet avec :
  - name : nom du segment (ex: "PME industrie 50-200 pers.")
  - urgency : note de 1 à 5 (urgence du besoin pour ce segment)
  - accessibility : note de 1 à 5 (facilité d'acquisition, réseaux existants)
  - potential : note de 1 à 5 (taille du gain, revenus, stratégie)
  - competition : note de 1 à 5 (1 = très concurrentiel, 5 = océan bleu, peu de concurrents)

Le segment avec le score le plus élevé (/20) devrait être le marché d'ancrage.

Exemple de format :
{
  "target_market": "...",
  "beachhead_plan": "1. ...\n2. ...",
  "segments": [
    {"name": "PME industrie", "urgency": 5, "accessibility": 4, "potential": 3, "competition": 4},
    {"name": "Grands comptes pharma", "urgency": 3, "accessibility": 2, "potential": 5, "competition": 2}
  ]
}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks).`,
  },
];

async function runAgentFill(
  agentKey: AgentKey,
  fieldsInstruction: string,
  startupDescription: string | null,
): Promise<{ values: Record<string, unknown>; inputTokens: number; outputTokens: number }> {
  const chunks = await retrieveRelevantChunks(agentKey, "positionnement concurrence marché").catch(() => null);
  const extraKnowledge = chunks?.join("\n\n") ?? null;
  const systemPrompt = buildCodirAgentPrompt(agentKey, startupDescription, extraKnowledge);

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout ${agentKey}`)), AGENT_TIMEOUT_MS)
  );

  const call = claude.messages.create({
    model: MODELS.CHAT,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: fieldsInstruction }],
  });

  const response = await Promise.race([call, timeout]);
  const rawText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { values: {}, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 };

  let values: Record<string, unknown>;
  try {
    values = JSON.parse(jsonrepair(jsonMatch[0]));
  } catch {
    try { values = JSON.parse(jsonMatch[0]); }
    catch { values = {}; }
  }

  return { values, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 };
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { startupId } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const context = await getStartupDescription(startupId).catch(() => null);

  try {
    // Dispatch parallèle : Maya (stratégie) + Alex (vente)
    const results = await Promise.allSettled(
      AGENT_PROMPTS.map((ap) => runAgentFill(ap.key, ap.fields, context))
    );

    const mergedValues: Record<string, unknown> = {};
    let totalInput = 0;
    let totalOutput = 0;

    let extractedSegments: unknown[] | null = null;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        const vals = { ...result.value.values };
        // Extract segments array if present
        if (Array.isArray(vals.segments)) {
          extractedSegments = vals.segments as unknown[];
          delete vals.segments;
        } else if (typeof vals.segments === "string") {
          try { extractedSegments = JSON.parse(vals.segments as string); } catch { /* ignore */ }
          delete vals.segments;
        }
        Object.assign(mergedValues, vals);
        totalInput += result.value.inputTokens;
        totalOutput += result.value.outputTokens;
      }
    });

    logUsage({
      startupId,
      userId,
      model: MODELS.CHAT,
      endpoint: "fill-positioning",
      inputTokens: totalInput,
      outputTokens: totalOutput,
    });

    return Response.json({ values: mergedValues, segments: extractedSegments });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
