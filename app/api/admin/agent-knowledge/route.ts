import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";
import { indexAgentKnowledge } from "@/lib/rag";
import { logAudit } from "@/lib/audit";

const VALID_AGENTS = ["strategie", "vente", "finance", "technique"] as const;
type AgentKey = (typeof VALID_AGENTS)[number];

export async function GET(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const agentKey = req.nextUrl.searchParams.get("agentKey") as AgentKey | null;

  const supabase = createServerClient();

  if (agentKey) {
    if (!VALID_AGENTS.includes(agentKey)) {
      return Response.json({ error: "agentKey invalide" }, { status: 400 });
    }
    const { data } = await supabase
      .from("agent_knowledge")
      .select("agent_key, content, updated_at")
      .eq("agent_key", agentKey)
      .single();
    return Response.json({ knowledge: data ?? { agent_key: agentKey, content: "", updated_at: null } });
  }

  // Retourner toutes les connaissances
  const { data } = await supabase
    .from("agent_knowledge")
    .select("agent_key, content, updated_at")
    .order("agent_key");
  return Response.json({ knowledge: data ?? [] });
}

export async function PUT(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { agentKey, content } = await req.json();
  if (!VALID_AGENTS.includes(agentKey)) {
    return Response.json({ error: "agentKey invalide" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("agent_knowledge")
    .upsert({ agent_key: agentKey, content: content ?? "", updated_at: new Date().toISOString() });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  logAudit({ userId: viewer.id, action: "knowledge.update", entityType: "agent_knowledge", entityId: agentKey, metadata: { contentLength: (content ?? "").length } });

  // Ré-indexer en arrière-plan (fire-and-forget) — ne pas bloquer la réponse admin
  indexAgentKnowledge(agentKey, content ?? "", "admin").catch((err) => {
    console.error(`[RAG] Échec indexation agent ${agentKey} :`, err);
  });

  return Response.json({ ok: true });
}
