import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";

// Tarifs Anthropic ($ par million de tokens) — approximatifs
const PRICING: Record<string, { input: number; output: number }> = {
  "claude-sonnet-4-6":  { input: 3, output: 15 },
  "claude-haiku-4-5":   { input: 0.25, output: 1.25 },
  "claude-opus-4-6":    { input: 15, output: 75 },
};

function estimateCost(model: string, inputTokens: number, outputTokens: number): number {
  // Chercher le pricing le plus proche
  const key = Object.keys(PRICING).find((k) => model.includes(k.replace("claude-", ""))) ?? Object.keys(PRICING)[0];
  const p = PRICING[key] ?? PRICING["claude-sonnet-4-6"];
  return (inputTokens * p.input + outputTokens * p.output) / 1_000_000;
}

export async function GET() {
  const viewer = await getRouteUser();
  if (!viewer) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return NextResponse.json({ error: "Accès refusé" }, { status: 403 });

  const supabase = createServerClient();

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [
    { count: totalUsers },
    { count: totalStartups },
    { count: totalPartners },
    { count: messagesTotal },
    { count: messagesToday },
    { count: messages7d },
    { count: messages30d },
    { count: codirTotal },
    { count: codir30d },
    { data: usageLogs },
    { data: agentActivity },
    { data: topStartups },
    { data: recentSignups },
  ] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("startups").select("id", { count: "exact", head: true }),
    supabase.from("partners").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", todayStart),
    supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", sevenDaysAgo),
    supabase.from("messages").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    supabase.from("codir_sessions").select("id", { count: "exact", head: true }),
    supabase.from("codir_sessions").select("id", { count: "exact", head: true }).gte("created_at", thirtyDaysAgo),
    // Usage logs pour les coûts (30 derniers jours)
    supabase.from("api_usage_log").select("model, input_tokens, output_tokens, endpoint, created_at").gte("created_at", thirtyDaysAgo).order("created_at", { ascending: false }).limit(5000),
    // Activité par agent (30 jours)
    supabase.from("conversations").select("agent_key, messages(id)").limit(100),
    // Top startups par messages (30 jours)
    supabase.from("messages").select("conversation_id, conversations(startup_id, startups(name))").gte("created_at", thirtyDaysAgo).limit(2000),
    // Inscriptions récentes
    supabase.from("users").select("id, email, created_at").order("created_at", { ascending: false }).limit(10),
  ]);

  // Calculer les coûts par endpoint et par modèle
  const costByEndpoint: Record<string, { tokens: number; cost: number; count: number }> = {};
  const costByModel: Record<string, { input: number; output: number; cost: number }> = {};
  let totalCost = 0;

  for (const log of usageLogs ?? []) {
    const cost = estimateCost(log.model, log.input_tokens, log.output_tokens);
    totalCost += cost;

    // Par endpoint
    if (!costByEndpoint[log.endpoint]) costByEndpoint[log.endpoint] = { tokens: 0, cost: 0, count: 0 };
    costByEndpoint[log.endpoint].tokens += log.input_tokens + log.output_tokens;
    costByEndpoint[log.endpoint].cost += cost;
    costByEndpoint[log.endpoint].count += 1;

    // Par modèle
    const modelShort = log.model.replace("claude-", "").split("-202")[0];
    if (!costByModel[modelShort]) costByModel[modelShort] = { input: 0, output: 0, cost: 0 };
    costByModel[modelShort].input += log.input_tokens;
    costByModel[modelShort].output += log.output_tokens;
    costByModel[modelShort].cost += cost;
  }

  // Activité par agent
  const agentCounts: Record<string, number> = {};
  for (const conv of agentActivity ?? []) {
    const msgCount = Array.isArray(conv.messages) ? conv.messages.length : 0;
    agentCounts[conv.agent_key] = (agentCounts[conv.agent_key] ?? 0) + msgCount;
  }

  // Top startups
  const startupCounts: Record<string, { name: string; count: number }> = {};
  for (const msg of topStartups ?? []) {
    const conv = msg.conversations as unknown as { startup_id: string; startups: { name: string } | null } | null;
    if (!conv?.startup_id) continue;
    if (!startupCounts[conv.startup_id]) startupCounts[conv.startup_id] = { name: conv.startups?.name ?? conv.startup_id.slice(0, 8), count: 0 };
    startupCounts[conv.startup_id].count += 1;
  }
  const topStartupsList = Object.values(startupCounts).sort((a, b) => b.count - a.count).slice(0, 10);

  return NextResponse.json({
    overview: {
      totalUsers: totalUsers ?? 0,
      totalStartups: totalStartups ?? 0,
      totalPartners: totalPartners ?? 0,
      messagesTotal: messagesTotal ?? 0,
      messagesToday: messagesToday ?? 0,
      messages7d: messages7d ?? 0,
      messages30d: messages30d ?? 0,
      codirTotal: codirTotal ?? 0,
      codir30d: codir30d ?? 0,
    },
    costs: {
      total30d: Math.round(totalCost * 100) / 100,
      byEndpoint: costByEndpoint,
      byModel: costByModel,
      callCount: usageLogs?.length ?? 0,
    },
    agentActivity: agentCounts,
    topStartups: topStartupsList,
    recentSignups: recentSignups ?? [],
  });
}
