import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";
import { indexAgentKnowledge } from "@/lib/rag";
import { logAudit } from "@/lib/audit";

const VALID_AGENTS = ["strategie", "vente", "finance", "technique", "operations"] as const;
type AgentKey = (typeof VALID_AGENTS)[number];

export async function GET(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const agentKey = req.nextUrl.searchParams.get("agentKey") as AgentKey | null;

  const supabase = createServerClient();

  const partnerId = req.nextUrl.searchParams.get("partnerId") ?? null;

  if (agentKey) {
    if (!VALID_AGENTS.includes(agentKey)) {
      return Response.json({ error: "agentKey invalide" }, { status: 400 });
    }
    let query = supabase
      .from("agent_knowledge")
      .select("agent_key, content, updated_at, partner_id")
      .eq("agent_key", agentKey);
    query = partnerId ? query.eq("partner_id", partnerId) : query.is("partner_id", null);
    const { data } = await query.maybeSingle();
    return Response.json({ knowledge: data ?? { agent_key: agentKey, content: "", updated_at: null, partner_id: partnerId } });
  }

  // Retourner les connaissances (globales ou partenaire)
  let listQuery = supabase
    .from("agent_knowledge")
    .select("agent_key, content, updated_at, partner_id")
    .order("agent_key");
  listQuery = partnerId ? listQuery.eq("partner_id", partnerId) : listQuery.is("partner_id", null);
  const { data } = await listQuery;
  return Response.json({ knowledge: data ?? [] });
}

export async function PUT(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { agentKey, content, partnerId } = await req.json();
  if (!VALID_AGENTS.includes(agentKey)) {
    return Response.json({ error: "agentKey invalide" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Delete + insert (l'upsert ne marche pas sur un index COALESCE via PostgREST)
  let delQuery = supabase.from("agent_knowledge").delete().eq("agent_key", agentKey);
  if (partnerId) {
    delQuery = delQuery.eq("partner_id", partnerId);
  } else {
    delQuery = delQuery.is("partner_id", null);
  }
  await delQuery;

  const { error } = await supabase
    .from("agent_knowledge")
    .insert({
      agent_key: agentKey,
      content: content ?? "",
      partner_id: partnerId ?? null,
      updated_at: new Date().toISOString(),
    });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  logAudit({ userId: viewer.id, action: "knowledge.update", entityType: "agent_knowledge", entityId: agentKey, metadata: { contentLength: (content ?? "").length, partnerId: partnerId ?? null } });

  // Ré-indexer en arrière-plan avec le bon partnerId
  indexAgentKnowledge(agentKey, content ?? "", "admin", partnerId ?? null).catch((err) => {
    console.error(`[RAG] Échec indexation agent ${agentKey} :`, err);
  });

  return Response.json({ ok: true });
}
