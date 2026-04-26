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
    fields: `Tu remplis la section "Marché cible" d'un document de positionnement (Obviously Awesome, April Dunford).

Remplis ce champ :
- target_market : Décris l'ICP (Ideal Customer Profile) et les early adopters. Inclus : titre/fonction du décideur, taille d'entreprise, secteur, budget typique, nombre d'entreprises dans le marché cible, et pourquoi ces clients valorisent le plus la proposition de valeur.

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks).`,
  },
];

async function runAgentFill(
  agentKey: AgentKey,
  fieldsInstruction: string,
  startupDescription: string | null,
): Promise<{ values: Record<string, string>; inputTokens: number; outputTokens: number }> {
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

  let values: Record<string, string>;
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

    const mergedValues: Record<string, string> = {};
    let totalInput = 0;
    let totalOutput = 0;

    results.forEach((result) => {
      if (result.status === "fulfilled") {
        Object.assign(mergedValues, result.value.values);
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

    return Response.json({ values: mergedValues });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
