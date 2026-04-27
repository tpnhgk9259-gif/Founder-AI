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

type AgentAssignment = { key: AgentKey; fields: string };

const AGENT_ASSIGNMENTS: AgentAssignment[] = [
  {
    key: "strategie",
    fields: `Remplis ces champs pour un Pitch Deck Serie A :
- problem_title, stat1_value, stat1_label, stat2_value, stat2_label, stat3_value, stat3_label
- quote_text, quote_source
- solution_title, pillar1_title, pillar1_desc, pillar2_title, pillar2_desc, pillar3_title, pillar3_desc
- comp_title, criteria1..criteria5, comp1_name, comp1_scores, comp2_name, comp2_scores, comp3_name, comp3_scores, our_scores
- advantage1, advantage1_desc, advantage2, advantage2_desc
- moat_title, moat1_title, moat1_desc, moat2_title, moat2_desc, moat3_title, moat3_desc, moat_synthesis
- exit_title, exit_timeline, acquirer1_name, acquirer1_rationale, acquirer2_name, acquirer2_rationale, acquirer3_name, acquirer3_rationale
- comparable1_name, comparable1_multiple, comparable2_name, comparable2_multiple, exit_valuation_target`,
  },
  {
    key: "vente",
    fields: `Remplis ces champs pour un Pitch Deck Serie A :
- tam_value, tam_label, sam_value, sam_label, som_value, som_label, market_growth, market_drivers
- traction_title, chart_label, chart_period, chart_m1..chart_m6, chart_v1..chart_v6
- retention_m1, retention_m3, retention_m6, growth_rate, nb_clients, arr
- gtm_title, channel1_name, channel1_desc, channel1_metrics, channel2_name, channel2_desc, channel2_metrics
- channel3_name, channel3_desc, channel3_metrics, gtm_proof
- cases_title, case1_name, case1_quote, case1_impact, case2_name, case2_quote, case2_impact, case3_name, case3_quote, case3_impact`,
  },
  {
    key: "finance",
    fields: `Remplis ces champs pour un Pitch Deck Serie A :
- ue_title, cac_value, ltv_value, ltv_cac_ratio, payback_period, gross_margin, arpu, churn_rate, expansion_revenue
- bm_title, plan1_name, plan1_price, plan1_desc, plan2_name, plan2_price, plan2_desc, plan3_name, plan3_price, plan3_desc, revenue_mix
- funds_title, fund_total, fund1_pct, fund1_amount, fund1_label, fund2_pct, fund2_amount, fund2_label
- fund3_pct, fund3_amount, fund3_label, fund4_pct, fund4_amount, fund4_label, fund5_pct, fund5_amount, fund5_label
- proj_title, breakeven_year
- year1_revenue, year1_costs, year1_ebitda, year2_revenue, year2_costs, year2_ebitda
- year3_revenue, year3_costs, year3_ebitda, year4_revenue, year4_costs, year4_ebitda
- year5_revenue, year5_costs, year5_ebitda, year6_revenue, year6_costs, year6_ebitda
- year7_revenue, year7_costs, year7_ebitda`,
  },
  {
    key: "technique",
    fields: `Remplis ces champs pour un Pitch Deck Serie A :
- product_title, feature1_title, feature1_desc, feature2_title, feature2_desc, feature3_title, feature3_desc, feature4_title, feature4_desc
- ms1_quarter, ms1_title, ms1_note, ms2_quarter, ms2_title, ms2_note
- ms3_quarter, ms3_title, ms3_note, ms4_quarter, ms4_title, ms4_note
- ms5_quarter, ms5_title, ms5_note, ms6_quarter, ms6_title, ms6_note`,
  },
  {
    key: "operations",
    fields: `Remplis ces champs pour un Pitch Deck Serie A :
- startupName, tagline, stage (ex: "Serie A · 5 M€")
- member1_name, member1_role, member2_name, member2_role, member3_name, member3_role, member4_name, member4_role
- hire1_role, hire1_quarter, hire2_role, hire2_quarter, hire3_role, hire3_quarter
- contact_name, contact_role, contact_email, contact_phone, contact_location
- contact_cta, contact_subtitle, closing_date, min_ticket`,
  },
];

async function runAgent(
  assignment: AgentAssignment,
  context: string | null,
  userContext: Record<string, string>,
): Promise<{ values: Record<string, string>; inputTokens: number; outputTokens: number }> {
  const chunks = await retrieveRelevantChunks(assignment.key, "pitch deck serie A").catch(() => null);
  const extraKnowledge = chunks?.join("\n\n") ?? null;
  const systemPrompt = buildCodirAgentPrompt(assignment.key, context, extraKnowledge);

  const userCtxStr = Object.keys(userContext).length > 0
    ? `\n\nLe CEO a deja rempli ces champs (ne les modifie pas, aligne-toi dessus) :\n${JSON.stringify(userContext, null, 2)}`
    : "";

  const userPrompt = `Tu remplis un Pitch Deck Serie A pour une levee de fonds.

${assignment.fields}${userCtxStr}

Reponds UNIQUEMENT avec un objet JSON valide (sans markdown, sans backticks).
Sois concret, chiffre, adapte au contexte reel. Titres courts et impactants.
Pour les scores concurrence (comp1_scores etc.) : format "2,1,3,2,1" (1 a 3 par critere).
Pour les projections financieres : utilise des valeurs en k€ ou M€.`;

  const response = await claude.messages.create({
    model: MODELS.CHAT,
    max_tokens: 3000,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });

  const rawText = response.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("");

  const jsonMatch = rawText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) return { values: {}, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 };

  let values: Record<string, string>;
  try { values = JSON.parse(jsonrepair(jsonMatch[0])); }
  catch { try { values = JSON.parse(jsonMatch[0]); } catch { values = {}; } }

  return { values, inputTokens: response.usage?.input_tokens ?? 0, outputTokens: response.usage?.output_tokens ?? 0 };
}

export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifie" }, { status: 401 });

  const { startupId, userContext } = await req.json();
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Acces refuse" }, { status: 403 });

  return streamWithHeartbeat(async (send) => {
    const context = await getStartupDescription(startupId).catch(() => null);
    const filledByUser: Record<string, string> = userContext ?? {};

    const results = await Promise.allSettled(
      AGENT_ASSIGNMENTS.map((a) => runAgent(a, context, filledByUser))
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
      startupId, userId, model: MODELS.CHAT, endpoint: "fill-pitch-deck-serie-a",
      inputTokens: totalInput, outputTokens: totalOutput,
    });

    send(JSON.stringify({ values: mergedValues }));
  });
}
