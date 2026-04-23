import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { getStartupDescription } from "@/lib/orchestrator";
import { logUsage } from "@/lib/usage";
import type Anthropic from "@anthropic-ai/sdk";

const BM_PROMPTS: Record<string, string> = {
  saas: `Génère des hypothèses réalistes pour un Business Plan SaaS Seed.
Retourne un JSON avec exactement ces clés :
- price_starter (number, €/mois), mix_starter (number, % en décimal 0-1), price_pro, mix_pro, price_premium, mix_premium
- annual_pct (number, % engagement annuel en décimal)
- new_clients_y1, new_clients_y2, new_clients_y3 (number, nouveaux clients/mois)
- churn_y1, churn_y2, churn_y3 (number, % churn mensuel en décimal)
- cac_y1, cac_y2, cac_y3 (number, € CAC)
- cost_hosting, cost_api, cost_support (number, €/client/mois)
- cost_payment_pct (number, % en décimal)`,

  marketplace: `Génère des hypothèses réalistes pour un Business Plan Marketplace Seed.
Retourne un JSON avec exactement ces clés :
- tx_y1, tx_y2, tx_y3 (number, transactions/mois)
- basket_y1, basket_y2, basket_y3 (number, panier moyen €)
- take_y1, take_y2, take_y3 (number, % commission en décimal)
- suppliers_y1 (number, offreurs inscrits Y1)
- buyers_y1 (number, demandeurs actifs Y1)
- rebuy_y1 (number, % réachat en décimal)
- cac_supply, cac_demand (number, € CAC)
- payment_pct (number, % frais paiement en décimal)`,

  deeptech: `Génère des hypothèses réalistes pour un Business Plan DeepTech Seed.
Retourne un JSON avec exactement ces clés :
- units_y4, units_y5, units_y6 (number, unités livrées)
- price_y4, price_y5, price_y6 (number, prix/unité €)
- maint_pct (number, % maintenance en décimal)
- rd_staff_y1, rd_staff_y2, rd_staff_y3 (number, € personnel R&D/an)
- funding_founders, funding_ba, funding_seed (number, €)`,

  medtech: `Génère des hypothèses réalistes pour un Business Plan MedTech Seed.
Retourne un JSON avec exactement ces clés :
- dm_y4, dm_y5 (number, dispositifs vendus)
- dm_price_y4, dm_price_y5 (number, prix DM €)
- patients_y4, patients_y5 (number, patients sous monitoring)
- consumable_price (number, €/patient/mois)
- rd_staff_y1 (number, € personnel R&D Y1)
- clinical_y2, clinical_y3 (number, € études cliniques)
- funding_founders, funding_seed (number, €)`,

  services: `Génère des hypothèses réalistes pour un Business Plan Services/Conseil Seed.
Retourne un JSON avec exactement ces clés :
- consultants_y1, consultants_y2, consultants_y3 (number, ETP)
- occupation_y1, occupation_y2, occupation_y3 (number, % taux occupation en décimal)
- tjm_y1, tjm_y2, tjm_y3 (number, € TJM)
- basket_y1 (number, € panier moyen mission)
- rebuy_y1 (number, % récurrence en décimal)
- new_clients_y1 (number, nouveaux clients/an)
- cac_y1 (number, € CAC)
- subcontract_pct (number, % sous-traitance en décimal)`,
};

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { startupId, businessModel } = await req.json();
  if (!startupId || !businessModel || !BM_PROMPTS[businessModel]) {
    return Response.json({ error: "startupId et businessModel requis" }, { status: 400 });
  }

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const startupContext = await getStartupDescription(startupId).catch(() => null);

  const systemPrompt = `Tu es Sam, Directeur Financier expert en modélisation de business plans pour startups early-stage.
${startupContext ? `\n## Contexte de la startup\n${startupContext}` : ""}

## Règles
- Adapte tes hypothèses au contexte réel de la startup (secteur, stade, taille).
- Sois réaliste et conservateur — c'est un Seed, pas une Series B.
- Les pourcentages doivent être en décimal (0.05 pour 5%, pas 5).
- Les montants en euros sans décimales pour les gros montants.
- Réponds UNIQUEMENT avec le JSON demandé, sans markdown, sans explication.`;

  try {
    const response = await claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: BM_PROMPTS[businessModel] }],
    });

    const text = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    logUsage({ startupId, userId, model: response.model, endpoint: "fill-bp-seed", inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 });

    // Parser le JSON (tolérant aux backticks markdown)
    const cleaned = text.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    const hypotheses = JSON.parse(cleaned);

    return Response.json({ hypotheses });
  } catch (err) {
    console.error("[fill-bp-seed] Erreur :", err);
    return Response.json({ error: "Erreur lors de la génération des hypothèses." }, { status: 500 });
  }
}
