import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";
import type { AgentKey } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startupId = searchParams.get("startupId");
  const agentKey = searchParams.get("agentKey") as AgentKey | null;
  const days = Math.min(parseInt(searchParams.get("days") ?? "7", 10), 90);

  if (!startupId || !agentKey) {
    return Response.json({ error: "startupId et agentKey requis" }, { status: 400 });
  }

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const supabase = createServerClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("id")
    .eq("startup_id", startupId)
    .eq("agent_key", agentKey)
    .maybeSingle();

  if (!conv) return Response.json({ messages: [] });

  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data: rows } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("conversation_id", conv.id)
    .gte("created_at", since.toISOString())
    .order("created_at", { ascending: true });

  const messages = (rows ?? []).map((r) => ({
    from: r.role === "user" ? "user" : "agent",
    text: r.content as string,
    createdAt: r.created_at as string,
  }));

  return Response.json({ messages });
}
