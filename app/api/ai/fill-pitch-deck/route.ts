import { NextRequest } from "next/server";
import { claude, MODELS } from "@/lib/claude";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import { jsonrepair } from "jsonrepair";

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { startupId } = await req.json();
  if (!startupId) {
    return Response.json({ error: "startupId requis" }, { status: 400 });
  }

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  const supabase = createServerClient();
  const { data: startup } = await supabase
    .from("startups")
    .select("name, sector, stage, business_model, description, key_kpis, recent_decisions, current_issues")
    .eq("id", startupId)
    .single();

  if (!startup) {
    return Response.json({ error: "Startup introuvable" }, { status: 404 });
  }

  const { data: conversations } = await supabase
    .from("conversations")
    .select("agent_key, messages")
    .eq("startup_id", startupId)
    .order("updated_at", { ascending: false })
    .limit(3)
    .then((r) => r)
    .catch(() => ({ data: [] as { agent_key: string; messages: unknown }[] }));

  const contextParts: string[] = [];

  if (startup.name) contextParts.push(`Nom : ${startup.name}`);
  if (startup.sector) contextParts.push(`Secteur : ${startup.sector}`);
  if (startup.stage) contextParts.push(`Stade : ${startup.stage}`);
  if (startup.business_model) contextParts.push(`Modèle économique : ${startup.business_model}`);
  if (startup.description) contextParts.push(`Description : ${startup.description}`);

  if (Array.isArray(startup.key_kpis) && startup.key_kpis.length > 0) {
    const kpis = (startup.key_kpis as { name: string; value: string }[])
      .map((k) => `${k.name}: ${k.value}`)
      .join(", ");
    contextParts.push(`KPIs : ${kpis}`);
  }

  if (Array.isArray(startup.recent_decisions) && startup.recent_decisions.length > 0) {
    const decisions = (startup.recent_decisions as { description: string }[])
      .map((d) => d.description)
      .join("; ");
    contextParts.push(`Décisions récentes : ${decisions}`);
  }

  if (Array.isArray(startup.current_issues) && startup.current_issues.length > 0) {
    const issues = (startup.current_issues as { description: string }[])
      .map((i) => i.description)
      .join("; ");
    contextParts.push(`Enjeux actuels : ${issues}`);
  }

  if (Array.isArray(conversations) && conversations.length > 0) {
    const excerpts: string[] = [];
    for (const conv of conversations) {
      const msgs = (conv.messages as { role: string; content: string }[]) ?? [];
      const relevant = msgs.slice(-4);
      if (relevant.length > 0) {
        const snippet = relevant
          .map((m) => `${m.role === "user" ? "Fondateur" : conv.agent_key}: ${m.content.slice(0, 200)}`)
          .join("\n");
        excerpts.push(snippet);
      }
    }
    if (excerpts.length > 0) {
      contextParts.push(`\nExtraits des conversations avec les agents :\n${excerpts.join("\n\n")}`);
    }
  }

  const context = contextParts.join("\n");
  const startupName = startup.name || "la startup";

  const prompt = `Tu es un expert en stratégie d'entreprise et en communication investor-facing. À partir du contexte ci-dessous sur une startup, génère le contenu complet d'un Pitch Deck Seed de 12 slides.

Contexte startup :
${context}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans balises de code, sans commentaires). L'objet doit contenir exactement ces clés :

{
  "tagline": "Accroche percutante en 1-2 phrases qui résume la valeur unique de ${startupName}",
  "problem_title": "Titre du slide problème sous forme de question ou affirmation forte",
  "stat1_value": "Valeur statistique chiffrée (ex: 73%)",
  "stat1_label": "Description courte de la statistique 1 (max 15 mots)",
  "stat2_value": "Valeur statistique chiffrée",
  "stat2_label": "Description courte de la statistique 2 (max 15 mots)",
  "stat3_value": "Valeur statistique chiffrée",
  "stat3_label": "Description courte de la statistique 3 (max 15 mots)",
  "problem_source": "Source des données (ex: Étude McKinsey 2024, n=500 entreprises)",
  "solution_title": "Titre du slide solution : bénéfice principal apporté par ${startupName}",
  "pillar1_title": "Titre du 1er pilier de la solution",
  "pillar1_desc": "Description du pilier 1 en 2-3 phrases",
  "pillar2_title": "Titre du 2ème pilier",
  "pillar2_desc": "Description du pilier 2 en 2-3 phrases",
  "pillar3_title": "Titre du 3ème pilier",
  "pillar3_desc": "Description du pilier 3 en 2-3 phrases",
  "mvp_title": "Notre MVP : [nom du produit]",
  "mvp_intro": "Phrase d'intro de la carte MVP (ex: Notre plateforme permet au client de :)",
  "mvp_bullets": "Point clé 1\nPoint clé 2\nPoint clé 3\nPoint clé 4\nPoint clé 5",
  "metric1_value": "Valeur de la métrique 1 (ex: 8-10h)",
  "metric1_label": "Description de la métrique 1 (max 10 mots)",
  "metric2_value": "Valeur de la métrique 2",
  "metric2_label": "Description de la métrique 2 (max 10 mots)",
  "bm1_title": "Titre du flux de revenus 1",
  "bm1_desc": "Description du flux 1 en 2 phrases",
  "bm2_title": "Titre du flux de revenus 2",
  "bm2_desc": "Description du flux 2 en 2 phrases",
  "bm3_title": "Titre du flux de revenus 3",
  "bm3_desc": "Description du flux 3 en 2 phrases",
  "market_size": "Taille du marché (ex: 5,1 Mds€)",
  "market_geo": "Zone géographique (ex: en Europe, mondial)",
  "market_growth": "Taux de croissance annuel CAGR (ex: 12%)",
  "market_description": "Description du marché en 3-5 phrases : contexte, tendances, opportunité",
  "tam_label": "TAM : Marché total adressable",
  "tam_value": "X Mds € ou M€",
  "sam_label": "SAM : Marché serviceable",
  "sam_value": "X M€",
  "som_label": "SOM : Marché atteignable à 3 ans",
  "som_value": "X M€",
  "early_label": "Early adopters",
  "early_value": "X clients potentiels",
  "comp_criteria": "Critère 1\nCritère 2\nCritère 3\nCritère 4\nCritère 5\nCritère 6",
  "comp1_name": "Nom du concurrent 1",
  "comp1_scores": "1,1,2,1,0,1",
  "comp2_name": "Nom du concurrent 2",
  "comp2_scores": "2,1,1,2,0,1",
  "comp3_name": "Nom du concurrent 3",
  "comp3_scores": "1,2,1,1,0,0",
  "our_scores": "3,3,3,2,3,3",
  "roadmap_q1": "Q3 2025",
  "roadmap_q2": "Q4 2025",
  "roadmap_q3": "Q1 2026",
  "roadmap_q4": "Q2 2026",
  "roadmap_rows": "Produit|MVP v0|0|0\nProduit|Beta privée|1|1\nProduit|v1.0|2|2\nMarketing|Site & SEO|0|1\nMarketing|Lancement public|2|2\nCommercial|Premiers clients|1|1\nCommercial|Scale|2|3",
  "member1_name": "Prénom Nom du CEO/fondateur principal (basé sur le contexte ou générique)",
  "member1_role": "CEO & Co-fondateur",
  "member1_bio": "Bio courte du CEO en 2-3 phrases : background, expérience pertinente",
  "member2_name": "Prénom Nom du CTO/co-fondateur",
  "member2_role": "CTO & Co-fondateur",
  "member2_bio": "Bio courte du CTO en 2-3 phrases",
  "member3_name": "Prénom Nom du 3ème membre",
  "member3_role": "CMO ou COO",
  "member3_bio": "Bio courte en 2-3 phrases",
  "funds_title": "Nous recherchons [montant]€ pour",
  "fund1": "Usage 1 des fonds (ex: 40% — Développement produit et tech)",
  "fund2": "Usage 2 des fonds (ex: 35% — Marketing et acquisition clients)",
  "fund3": "Usage 3 des fonds (ex: 25% — Recrutement et opérations)"
}

Adapte toutes les valeurs au contexte de la startup. Pour les scores de concurrence, utilise des chiffres entre 0 et 3 séparés par des virgules, avec 6 valeurs correspondant aux 6 critères. Pour roadmap_rows, utilise le format Catégorie|Label|trimestre_début|trimestre_fin (trimestres 0 à 3). Si des informations manquent, fais des hypothèses raisonnables cohérentes avec le secteur et le stade.`;

  try {
    const response = await claude.messages.create({
      model: MODELS.CHAT,
      max_tokens: 6000,
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = response.content[0]?.type === "text" ? response.content[0].text : "";

    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: "Réponse IA invalide : aucun JSON trouvé" }, { status: 500 });
    }

    let sections: Record<string, string>;
    try {
      const repaired = jsonrepair(jsonMatch[0]);
      sections = JSON.parse(repaired);
    } catch {
      try {
        sections = JSON.parse(jsonMatch[0]);
      } catch {
        return Response.json({ error: "Impossible de parser la réponse IA" }, { status: 500 });
      }
    }

    return Response.json({ sections });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
