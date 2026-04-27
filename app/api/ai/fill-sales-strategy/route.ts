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

const PROMPT = `Tu es un expert commercial B2B. A partir du contexte de la startup, genere une strategie de vente complete.

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks) contenant :

{
  "value_props": [
    { "segment": "Nom du segment", "message": "Message commercial principal pour ce segment" }
  ],
  "channels": [
    { "name": "Nom du canal", "description": "Comment on l'utilise", "cost": "Cout estime", "volume": "Volume de leads attendu" }
  ],
  "funnel": [
    { "name": "Prospect", "conversion": "100%" },
    { "name": "Qualifie", "conversion": "60%" },
    { "name": "Demo", "conversion": "40%" },
    { "name": "Offre envoyee", "conversion": "25%" },
    { "name": "Closing", "conversion": "" }
  ],
  "cycle_duration": "X jours",
  "pricing_model": "Modele tarifaire (ex: SaaS par siege, usage-based...)",
  "pricing_detail": "Starter : XX EUR/mois\\nGrowth : XX EUR/mois\\nScale : XX EUR/mois",
  "targets": [
    { "quarter": "T2 26", "deals": "X deals", "mrr": "Xk MRR", "avgDeal": "X EUR" },
    { "quarter": "T3 26", "deals": "X deals", "mrr": "Xk MRR", "avgDeal": "X EUR" },
    { "quarter": "T4 26", "deals": "X deals", "mrr": "Xk MRR", "avgDeal": "X EUR" }
  ],
  "stack": "CRM : ...\\nEnrichissement : ...\\nSequences : ...\\nScoring : ..."
}

Regles :
- 2-3 value props par segment cible reel de la startup
- 3-4 canaux d'acquisition adaptes au modele (B2B, B2C, marketplace...)
- Funnel realiste avec taux de conversion coherents pour du early-stage
- Cycle de vente adapte au type de produit et au panier moyen
- Pricing concret, chiffre, aligne avec la valeur delivree
- Targets ambitieux mais atteignables pour une startup seed
- Stack pragmatique (outils gratuits/abordables pour commencer)
- Tout doit etre specifique au contexte de la startup, jamais generique`;

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifie" }, { status: 401 });

  const { startupId } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Acces refuse" }, { status: 403 });

  const context = await getStartupDescription(startupId).catch(() => null);
  const chunks = await retrieveRelevantChunks("vente", "strategie commerciale acquisition canaux pricing").catch(() => null);
  const extraKnowledge = chunks?.join("\n\n") ?? null;
  const systemPrompt = buildCodirAgentPrompt("vente" as AgentKey, context, extraKnowledge);

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
      startupId, userId, model: response.model, endpoint: "fill-sales-strategy",
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
