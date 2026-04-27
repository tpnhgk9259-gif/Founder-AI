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

// ── Template-specific field assignments per agent ───────────────────────

type Template = "standard" | "deeptech" | "medtech";

const AGENT_FIELDS: Record<Template, Record<string, { agent: AgentKey; fields: string }>> = {
  standard: {
    strategie: {
      agent: "strategie",
      fields: `Remplis ces champs (stratégie, positionnement, concurrence) :
- problem_title, stat1_value, stat1_label, stat2_value, stat2_label, quote_text, quote_source
- solution_title, pillar1_title, pillar1_desc, pillar2_title, pillar2_desc, pillar3_title, pillar3_desc
- comp_title, criteria1..criteria5, comp1_name, comp1_scores, comp2_name, comp2_scores, comp3_name, comp3_scores, our_scores
- advantage1, advantage1_desc, advantage2, advantage2_desc, advantage3, advantage3_desc`,
    },
    vente: {
      agent: "vente",
      fields: `Remplis ces champs (marché, traction, go-to-market) :
- tam_value, tam_label, sam_value, sam_label, som_value, som_label
- market_metric1_label, market_metric1_value, market_metric2_label, market_metric2_value
- traction_title, chart_label, chart_period, chart_m1..chart_m6, chart_v1..chart_v6
- kpi1_value, kpi1_label, kpi2_value, kpi2_label, kpi3_value, kpi3_label, kpi4_value, kpi4_label`,
    },
    finance: {
      agent: "finance",
      fields: `Remplis ces champs (business model, unit economics, financement) :
- bm_title, plan1_name, plan1_price, plan1_desc, plan2_name, plan2_price, plan2_desc
- plan3_name, plan3_price, plan3_desc, plan4_name, plan4_price, plan4_desc
- cac_value, ltv_value, ltv_cac_ratio, cogs_value
- funds_title, fund1_pct, fund1_amount, fund1_label, fund2_pct, fund2_amount, fund2_label
- fund3_pct, fund3_amount, fund3_label, fund4_pct, fund4_amount, fund4_label`,
    },
    technique: {
      agent: "technique",
      fields: `Remplis ces champs (produit, features, roadmap technique) :
- product_title, feature1_title, feature1_desc, feature2_title, feature2_desc
- feature3_title, feature3_desc, feature4_title, feature4_desc, feature5_title, feature5_desc
- ms1_quarter, ms1_title, ms1_note, ms2_quarter, ms2_title, ms2_note
- ms3_quarter, ms3_title, ms3_note, ms4_quarter, ms4_title, ms4_note
- ms5_quarter, ms5_title, ms5_note, ms6_quarter, ms6_title, ms6_note`,
    },
    operations: {
      agent: "operations",
      fields: `Remplis ces champs (équipe, identité, contact) :
- startupName, tagline, stage
- member1_name, member1_role, member2_name, member2_role, member3_name, member3_role
- advisor1, advisor2
- contact_name, contact_role, contact_email, contact_phone, contact_location
- contact_cta, contact_subtitle, closing_date, min_ticket`,
    },
  },
  deeptech: {
    strategie: {
      agent: "strategie",
      fields: `Remplis ces champs (stratégie deeptech, positionnement, concurrence) :
- problem_title, stat1_value, stat1_label, stat2_value, stat2_label, quote_text, quote_source
- solution_title, pillar1_title, pillar1_desc, pillar2_title, pillar2_desc, pillar3_title, pillar3_desc
- comp_title, criteria1..criteria5 (critères techniques pertinents pour la deeptech), comp1_name, comp1_scores, comp2_name, comp2_scores, comp3_name, comp3_scores, our_scores
- advantage1, advantage1_desc, advantage2, advantage2_desc, advantage3, advantage3_desc`,
    },
    vente: {
      agent: "vente",
      fields: `Remplis ces champs (marché deeptech, adoption) :
- tam_value, tam_label, sam_value, sam_label, som_value, som_label
- market_metric1_label, market_metric1_value, market_metric2_label, market_metric2_value`,
    },
    finance: {
      agent: "finance",
      fields: `Remplis ces champs (business model deeptech : licence, vente directe, co-développement ; financement dont grants) :
- bm_title, plan1_name, plan1_price, plan1_desc, plan2_name, plan2_price, plan2_desc
- plan3_name, plan3_price, plan3_desc, plan4_name, plan4_price, plan4_desc
- cac_value, ltv_value, ltv_cac_ratio, cogs_value
- funds_title, fund1_pct, fund1_amount, fund1_label, fund2_pct, fund2_amount, fund2_label
- fund3_pct, fund3_amount, fund3_label, fund4_pct, fund4_amount, fund4_label`,
    },
    technique: {
      agent: "technique",
      fields: `Remplis ces champs (technologie, IP, produit, validation scientifique, roadmap R&D) :
- tech_title, trl_current, trl_target, tech_desc, patent1, patent2, patent3, pub1, pub2
- tech_diff1, tech_diff2, tech_diff3
- validation_title, val_kpi1_value, val_kpi1_label, val_kpi2_value, val_kpi2_label
- val_kpi3_value, val_kpi3_label, val_kpi4_value, val_kpi4_label
- partner_acad1, partner_acad2, partner_indus1, partner_indus2
- product_title, feature1_title, feature1_desc, feature2_title, feature2_desc, feature3_title, feature3_desc
- roadmap_rd_title, rd1_quarter, rd1_title, rd1_note, rd1_trl, rd2_quarter, rd2_title, rd2_note, rd2_trl
- rd3_quarter, rd3_title, rd3_note, rd3_trl, rd4_quarter, rd4_title, rd4_note, rd4_trl
- grant1, grant2, grant3`,
    },
    operations: {
      agent: "operations",
      fields: `Remplis ces champs (équipe deeptech, identité, contact) :
- startupName, tagline (axée technologie de rupture), stage
- member1_name, member1_role (profils PhD/recherche), member2_name, member2_role, member3_name, member3_role
- advisor1 (académique), advisor2 (industriel)
- contact_name, contact_role, contact_email, contact_phone, contact_location
- contact_cta (orienté fonds deeptech), contact_subtitle, closing_date, min_ticket`,
    },
  },
  medtech: {
    strategie: {
      agent: "strategie",
      fields: `Remplis ces champs (stratégie medtech, positionnement, concurrence) :
- problem_title (problème clinique), stat1_value, stat1_label (données épidémiologiques), stat2_value, stat2_label
- quote_text (citation d'un clinicien/KOL), quote_source
- solution_title, pillar1_title, pillar1_desc, pillar2_title, pillar2_desc, pillar3_title, pillar3_desc
- comp_title, criteria1..criteria5 (critères cliniques/réglementaires), comp1_name, comp1_scores, comp2_name, comp2_scores, comp3_name, comp3_scores, our_scores
- advantage1, advantage1_desc, advantage2, advantage2_desc, advantage3, advantage3_desc`,
    },
    vente: {
      agent: "vente",
      fields: `Remplis ces champs (marché medtech, accès au marché hospitalier) :
- tam_value, tam_label, sam_value, sam_label, som_value, som_label
- market_metric1_label, market_metric1_value, market_metric2_label, market_metric2_value`,
    },
    finance: {
      agent: "finance",
      fields: `Remplis ces champs (business model medtech : vente DM + consommables + maintenance ; financement) :
- bm_title, plan1_name, plan1_price, plan1_desc, plan2_name, plan2_price, plan2_desc
- plan3_name, plan3_price, plan3_desc, plan4_name, plan4_price, plan4_desc
- cac_value, ltv_value, ltv_cac_ratio, cogs_value
- funds_title, fund1_pct, fund1_amount, fund1_label, fund2_pct, fund2_amount, fund2_label
- fund3_pct, fund3_amount, fund3_label, fund4_pct, fund4_amount, fund4_label`,
    },
    technique: {
      agent: "technique",
      fields: `Remplis ces champs (dispositif médical, validation clinique, réglementaire, produit, roadmap) :
- pma_title, dm_class, dm_type, feature1_title, feature1_desc, feature2_title, feature2_desc, feature3_title, feature3_desc
- remb_strategy, price_hospital, price_remb
- clin_title, clin_phase, clin_design, clin_kpi1_value, clin_kpi1_label, clin_kpi2_value, clin_kpi2_label
- clin_kpi3_value, clin_kpi3_label, kol1, kol2, kol3
- reg_title, reg_pathway, reg_class_eu, reg_class_us
- reg_step1_date, reg_step1_label, reg_step1_status, reg_step2_date, reg_step2_label, reg_step2_status
- reg_step3_date, reg_step3_label, reg_step3_status, reg_step4_date, reg_step4_label, reg_step4_status
- reg_notified_body, reg_cro
- product_title, feature1_title, feature1_desc, feature2_title, feature2_desc, feature3_title, feature3_desc
- rr1_quarter, rr1_title, rr1_note, rr2_quarter, rr2_title, rr2_note
- rr3_quarter, rr3_title, rr3_note, rr4_quarter, rr4_title, rr4_note
- rr5_quarter, rr5_title, rr5_note, rr6_quarter, rr6_title, rr6_note`,
    },
    operations: {
      agent: "operations",
      fields: `Remplis ces champs (équipe medtech, identité, contact) :
- startupName, tagline (axée impact patient), stage
- member1_name, member1_role (profil clinicien/chirurgien), member2_name, member2_role (ingénieur DM), member3_name, member3_role
- advisor1 (KOL médical), advisor2 (expert réglementaire)
- contact_name, contact_role, contact_email, contact_phone, contact_location
- contact_cta (orienté fonds medtech/healthtech), contact_subtitle, closing_date, min_ticket`,
    },
  },
};

// ── Template detection from business_model ──────────────────────────────

function detectTemplate(businessModel: string | null | undefined, explicit?: string): Template {
  if (explicit === "deeptech" || explicit === "medtech") return explicit;
  if (!businessModel) return (explicit as Template) || "standard";
  const bm = businessModel.toLowerCase();
  if (bm.includes("medtech") || bm.includes("médical") || bm.includes("medical") || bm.includes("dispositif") || bm.includes("dm ") || bm.includes("healthtech") || bm.includes("biotech clinique")) return "medtech";
  if (bm.includes("deeptech") || bm.includes("deep tech") || bm.includes("hardware") || bm.includes("biotech") || bm.includes("matéri") || bm.includes("énergie") || bm.includes("quantique") || bm.includes("semi-conducteur") || bm.includes("spatial")) return "deeptech";
  return (explicit as Template) || "standard";
}

// ── Domain → agent key mapping (which standard agent handles which domain) ──

const DOMAIN_TO_AGENT: Record<string, AgentKey> = {
  strategy: "strategie",
  market: "vente",
  product: "technique",
  finance: "finance",
  operations: "operations",
  technology: "technique",
  regulatory: "technique",
  clinical: "technique",
};

// ── Fetch custom agents with priority for a startup ─────────────────────

type CustomAgentOverride = {
  id: string;
  name: string;
  system_prompt: string;
  priority_domains: string[];
  partner_id: string;
};

async function getCustomAgentOverrides(startupId: string): Promise<CustomAgentOverride[]> {
  const { createServerClient } = await import("@/lib/supabase");
  const supabase = createServerClient();

  // Get assigned custom agents for this startup
  const { data: assignments } = await supabase
    .from("startup_custom_agents")
    .select("custom_agent_id")
    .eq("startup_id", startupId);

  if (!assignments?.length) return [];

  const agentIds = assignments.map((a) => a.custom_agent_id);
  const { data: agents } = await supabase
    .from("custom_agents")
    .select("id, name, system_prompt, priority_domains, partner_id")
    .in("id", agentIds)
    .not("priority_domains", "eq", "{}");

  return (agents ?? []) as CustomAgentOverride[];
}

// ── Agent call ──────────────────────────────────────────────────────────

export const maxDuration = 60;
const AGENT_TIMEOUT_MS = 50_000;

async function runAgentFill(
  agentKey: AgentKey | string,
  fieldsInstruction: string,
  template: Template,
  startupDescription: string | null,
  startupId: string,
  customSystemPrompt?: string,
  customPartnerId?: string,
): Promise<{ values: Record<string, string>; inputTokens: number; outputTokens: number; model: string }> {
  let systemPrompt: string;

  if (customSystemPrompt) {
    // Custom agent: use its own system prompt + startup context
    const chunks = await retrieveRelevantChunks(agentKey, `pitch deck ${template}`, 5, customPartnerId ?? null).catch(() => null);
    const extraKnowledge = chunks?.join("\n\n") ?? null;
    systemPrompt = buildCodirAgentPrompt(agentKey as AgentKey, startupDescription, extraKnowledge, customSystemPrompt);
  } else {
    const chunks = await retrieveRelevantChunks(agentKey, `pitch deck ${template}`).catch(() => null);
    const extraKnowledge = chunks?.join("\n\n") ?? null;
    systemPrompt = buildCodirAgentPrompt(agentKey as AgentKey, startupDescription, extraKnowledge);
  }

  const templateLabel = template === "deeptech" ? "Deeptech" : template === "medtech" ? "Dispositif médical" : "Standard";

  const userPrompt = `Tu participes au remplissage automatique d'un Pitch Deck "${templateLabel}" pour cette startup.

${fieldsInstruction}

Réponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks).
Chaque clé = un champ du formulaire. Chaque valeur = texte concret, chiffré, adapté au contexte réel de la startup.
Ne laisse AUCUN placeholder générique si tu as des informations.
Pour les scores de concurrence (comp1_scores, etc.), utilise le format "2,1,3,2,1" (notes de 1 à 3 séparées par virgules, une par critère).
Sois concret, percutant et chiffré. Les titres doivent être courts et impactants (max 60-80 caractères).`;

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout agent ${agentKey}`)), AGENT_TIMEOUT_MS)
  );

  const call = claude.messages.create({
    model: MODELS.CHAT,
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const response = await Promise.race([call, timeout]);
  const rawText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { values: {}, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0, model: response.model };

  let values: Record<string, string>;
  try {
    values = JSON.parse(jsonrepair(jsonMatch[0]));
  } catch {
    try { values = JSON.parse(jsonMatch[0]); }
    catch { values = {}; }
  }

  return {
    values,
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
    model: response.model,
  };
}

// ── Main route ──────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { startupId, template: explicitTemplate } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Accès refusé" }, { status: 403 });

  // Fetch startup context + detect template
  const context = await getStartupDescription(startupId).catch(() => null);

  // Detect template from business_model if not explicitly provided
  let template: Template = explicitTemplate || "standard";
  try {
    const { createServerClient } = await import("@/lib/supabase");
    const supabase = createServerClient();
    const { data } = await supabase.from("startups").select("business_model").eq("id", startupId).single();
    if (data?.business_model) {
      template = detectTemplate(data.business_model, explicitTemplate);
    }
  } catch { /* keep explicit template */ }

  const agentAssignments = { ...AGENT_FIELDS[template] };

  // Fetch custom agent overrides for this startup
  const customOverrides = await getCustomAgentOverrides(startupId).catch(() => []);

  // Build override map: domain → custom agent
  const domainOverrides: Record<string, CustomAgentOverride> = {};
  for (const ca of customOverrides) {
    for (const domain of ca.priority_domains) {
      domainOverrides[domain] = ca;
    }
  }

  // Map domains to agent assignment keys
  const DOMAIN_TO_ASSIGNMENT_KEY: Record<string, string[]> = {
    strategy: ["strategie"],
    market: ["vente"],
    product: ["technique"],
    finance: ["finance"],
    operations: ["operations"],
    technology: ["technique"],
    regulatory: ["technique"],
    clinical: ["technique"],
  };

  try {
    // Build dispatch list: standard agents + custom overrides
    type DispatchEntry = {
      key: string;
      fields: string;
      customPrompt?: string;
      customPartnerId?: string;
    };

    const dispatches: DispatchEntry[] = [];
    const overriddenKeys = new Set<string>();

    // First, add custom agent dispatches for overridden domains
    for (const [domain, customAgent] of Object.entries(domainOverrides)) {
      const assignmentKeys = DOMAIN_TO_ASSIGNMENT_KEY[domain] ?? [];
      for (const aKey of assignmentKeys) {
        if (agentAssignments[aKey] && !overriddenKeys.has(aKey)) {
          overriddenKeys.add(aKey);
          dispatches.push({
            key: `custom_${customAgent.id}`,
            fields: agentAssignments[aKey].fields,
            customPrompt: customAgent.system_prompt,
            customPartnerId: customAgent.partner_id,
          });
        }
      }
    }

    // Then, add remaining standard agents
    for (const [aKey, assignment] of Object.entries(agentAssignments)) {
      if (!overriddenKeys.has(aKey)) {
        dispatches.push({ key: aKey, fields: assignment.fields });
      }
    }

    // Phase 1: Dispatch parallèle (mode CODIR)
    const results = await Promise.allSettled(
      dispatches.map((d) =>
        runAgentFill(d.key, d.fields, template, context, startupId, d.customPrompt, d.customPartnerId)
      )
    );

    // Merge all agent results
    const mergedValues: Record<string, string> = {};
    let totalInput = 0;
    let totalOutput = 0;

    results.forEach((result, i) => {
      if (result.status === "fulfilled") {
        Object.assign(mergedValues, result.value.values);
        totalInput += result.value.inputTokens;
        totalOutput += result.value.outputTokens;
      } else {
        console.error(`Agent ${dispatches[i].key} failed:`, result.reason);
      }
    });

    // Log total usage
    logUsage({
      startupId,
      userId,
      model: MODELS.CHAT,
      endpoint: "fill-pitch-deck-codir",
      inputTokens: totalInput,
      outputTokens: totalOutput,
    });

    if (Object.keys(mergedValues).length === 0) {
      return Response.json({ error: "Aucun agent n'a pu générer de contenu" }, { status: 500 });
    }

    return Response.json({ values: mergedValues });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
