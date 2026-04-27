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

export const maxDuration = 60;
const AGENT_TIMEOUT_MS = 50_000;

const PROMPT = `Tu es un expert en strategie et defensibilite de startup. A partir du contexte, analyse les barrieres a l'entree de cette startup.

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) :

{
  "sections": {
    "ip": "Liste des elements de propriete intellectuelle (brevets, marques, secrets, licences). Sois specifique.",
    "network_effects": "Effets reseau identifies ou constructibles. Comment la valeur augmente avec l'usage.",
    "switching_costs": "Ce qui rend le depart douloureux pour les clients. Integrations, donnees, habitudes.",
    "data_advantage": "Donnees proprietaires, modeles entraines, datasets uniques. Feedback loops.",
    "economies_scale": "Avantages de cout qui augmentent avec le volume. Infra, nego, brand, equipe."
  },
  "scores": {
    "ip": { "current": 3, "target18m": 4 },
    "network_effects": { "current": 2, "target18m": 4 },
    "switching_costs": { "current": 2, "target18m": 3 },
    "data_advantage": { "current": 3, "target18m": 5 },
    "economies_scale": { "current": 1, "target18m": 3 }
  },
  "synthesis": "En 2-3 phrases, pourquoi un concurrent ne peut pas reproduire cet avantage en moins de 18 mois."
}

Regles :
- Scores de 1 (faible/inexistant) a 5 (tres fort/inattaquable)
- Sois honnete : si une barriere est faible, note-la faible et explique comment la renforcer
- Le target 18 mois doit etre ambitieux mais realiste
- Chaque section doit contenir 2-5 elements concrets et specifiques
- La synthese doit etre percutante (c'est ce que lit l'investisseur en premier)
- Adapte au contexte reel de la startup : pas de barrieres generiques`;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifie" }, { status: 401 });

  const { startupId } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Acces refuse" }, { status: 403 });

  const context = await getStartupDescription(startupId).catch(() => null);

  // Maya (strategie) pour les barrieres + Leo (technique) pour l'IP
  const [chunksStrat, chunksTech] = await Promise.all([
    retrieveRelevantChunks("strategie", "barrieres entree defensibilite moat IP").catch(() => null),
    retrieveRelevantChunks("technique", "propriete intellectuelle brevets donnees").catch(() => null),
  ]);
  const extraKnowledge = [...(chunksStrat ?? []), ...(chunksTech ?? [])].join("\n\n") || null;
  const systemPrompt = buildCodirAgentPrompt("strategie" as AgentKey, context, extraKnowledge);

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), AGENT_TIMEOUT_MS)
    );

    const call = claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 2500,
      system: systemPrompt,
      messages: [{ role: "user", content: PROMPT }],
    });

    const response = await Promise.race([call, timeout]);
    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    logUsage({
      startupId, userId, model: response.model, endpoint: "fill-barrieres",
      inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0,
    });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Reponse IA invalide" }, { status: 500 });

    let parsed: Record<string, unknown>;
    try { parsed = JSON.parse(jsonrepair(jsonMatch[0])); }
    catch { try { parsed = JSON.parse(jsonMatch[0]); } catch { return Response.json({ error: "Parse error" }, { status: 500 }); } }

    return Response.json({ data: parsed });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
