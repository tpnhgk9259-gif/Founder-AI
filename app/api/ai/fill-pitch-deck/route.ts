import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { getStartupDescription } from "@/lib/orchestrator";
import { logUsage } from "@/lib/usage";
import { jsonrepair } from "jsonrepair";
import type Anthropic from "@anthropic-ai/sdk";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { startupId } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const context = await getStartupDescription(startupId).catch(() => null);

  const prompt = `Tu es un expert en pitch deck pour startups early-stage. À partir du contexte ci-dessous, génère le contenu complet d'un Pitch Deck Seed de 12 slides.

${context ? `Contexte startup :\n${context}` : "Aucun contexte disponible — génère un exemple réaliste."}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks). Les clés correspondent aux 12 slides :

{
  "startupName": "Nom de la startup",
  "tagline": "Accroche percutante en 1-2 phrases",
  "stage": "Stade et montant recherché (ex: Seed · 800 k€)",

  "problem_title": "Titre du problème (question ou affirmation forte, max 80 chars)",
  "stat1_value": "Valeur stat 1 (ex: 73%)",
  "stat1_label": "Description stat 1 (max 15 mots)",
  "stat2_value": "Valeur stat 2",
  "stat2_label": "Description stat 2",
  "quote_text": "Citation d'un utilisateur ou prospect entre guillemets",
  "quote_source": "Nom, titre de la personne citée",

  "solution_title": "Titre de la solution (max 60 chars)",
  "pillar1_title": "Étape 1 (1-2 mots)", "pillar1_desc": "Description étape 1 (2 phrases)",
  "pillar2_title": "Étape 2", "pillar2_desc": "Description étape 2",
  "pillar3_title": "Étape 3", "pillar3_desc": "Description étape 3",

  "tam_value": "X Md€ ou M€", "tam_label": "Description TAM",
  "sam_value": "X M€", "sam_label": "Description SAM",
  "som_value": "X M€", "som_label": "Description SOM (objectif 3 ans)",
  "market_metric1_label": "Métrique marché 1 label", "market_metric1_value": "Valeur",
  "market_metric2_label": "Métrique marché 2 label", "market_metric2_value": "Valeur",

  "product_title": "Titre slide produit (max 60 chars)",
  "product_headline": "Chiffre accroche du produit",
  "feature1_title": "Feature 1 titre", "feature1_desc": "Feature 1 desc",
  "feature2_title": "Feature 2 titre", "feature2_desc": "Feature 2 desc",
  "feature3_title": "Feature 3 titre", "feature3_desc": "Feature 3 desc",

  "traction_title": "Titre traction (résultat concret, max 60 chars)",
  "kpi1_value": "KPI 1 valeur", "kpi1_label": "KPI 1 label",
  "kpi2_value": "KPI 2 valeur", "kpi2_label": "KPI 2 label",
  "kpi3_value": "KPI 3 valeur", "kpi3_label": "KPI 3 label",
  "kpi4_value": "KPI 4 valeur", "kpi4_label": "KPI 4 label",

  "bm_title": "Titre business model (max 50 chars)",
  "plan1_name": "Offre 1 nom", "plan1_price": "Prix 1", "plan1_desc": "Description courte",
  "plan2_name": "Offre 2 nom", "plan2_price": "Prix 2", "plan2_desc": "Description courte",
  "plan3_name": "Offre 3 nom", "plan3_price": "Prix 3", "plan3_desc": "Description courte",
  "cac_value": "CAC en €", "ltv_value": "LTV en €", "ltv_cac_ratio": "Ratio X:1", "cogs_value": "COGS en %",

  "comp_title": "Titre concurrence (max 50 chars)",
  "comp1_name": "Concurrent 1", "comp1_position": "Faiblesse",
  "comp2_name": "Concurrent 2", "comp2_position": "Faiblesse",
  "comp3_name": "Concurrent 3", "comp3_position": "Faiblesse",
  "advantage1": "Avantage 1 titre", "advantage1_desc": "Description courte",
  "advantage2": "Avantage 2 titre", "advantage2_desc": "Description courte",

  "member1_name": "Fondateur 1 nom", "member1_role": "Rôle + background",
  "member2_name": "Fondateur 2 nom", "member2_role": "Rôle + background",
  "member3_name": "Fondateur 3 nom", "member3_role": "Rôle + background",
  "advisor1": "Advisor 1 (nom + org)", "advisor2": "Advisor 2 (nom + org)",

  "funds_title": "Montant + durée runway (ex: 800 k€ pour 18 mois)",
  "fund1_pct": "X %", "fund1_amount": "X k€", "fund1_label": "Poste 1",
  "fund2_pct": "X %", "fund2_amount": "X k€", "fund2_label": "Poste 2",
  "fund3_pct": "X %", "fund3_amount": "X k€", "fund3_label": "Poste 3",
  "fund4_pct": "X %", "fund4_amount": "X k€", "fund4_label": "Poste 4",

  "ms1_quarter": "T1 26", "ms1_title": "Milestone 1", "ms1_note": "Détail",
  "ms2_quarter": "T2 26", "ms2_title": "Milestone 2", "ms2_note": "Détail",
  "ms3_quarter": "T3 26", "ms3_title": "Milestone 3", "ms3_note": "Détail",
  "ms4_quarter": "T4 26", "ms4_title": "Milestone 4", "ms4_note": "Détail",

  "contact_name": "Nom du CEO", "contact_role": "CEO",
  "contact_email": "email@startup.com", "contact_phone": "+33 6 XX XX XX XX",
  "contact_location": "Adresse",
  "contact_cta": "Message pour les investisseurs (ce qu'on cherche)",
  "closing_date": "Date de closing visée", "min_ticket": "Ticket minimum"
}

Adapte TOUTES les valeurs au contexte réel de la startup. Ne laisse aucun placeholder générique si tu as des informations. Sois concret et chiffré.`;

  try {
    const response = await claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 4000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content
      .filter((b): b is Anthropic.TextBlock => b.type === "text")
      .map((b) => b.text)
      .join("");

    logUsage({ startupId, userId, model: response.model, endpoint: "fill-pitch-deck", inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 });

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return Response.json({ error: "Réponse IA invalide" }, { status: 500 });

    let values: Record<string, string>;
    try {
      values = JSON.parse(jsonrepair(jsonMatch[0]));
    } catch {
      try { values = JSON.parse(jsonMatch[0]); }
      catch { return Response.json({ error: "Impossible de parser la réponse IA" }, { status: 500 }); }
    }

    return Response.json({ values });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
