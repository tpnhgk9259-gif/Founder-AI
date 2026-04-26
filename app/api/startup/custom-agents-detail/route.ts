import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const startupId = req.nextUrl.searchParams.get("startupId");
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const allowed = await userOwnsStartup(userId, startupId);
  if (!allowed) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const supabase = createServerClient();

  // Get assigned custom agent IDs
  const { data: assignments } = await supabase
    .from("startup_custom_agents")
    .select("custom_agent_id")
    .eq("startup_id", startupId);

  if (!assignments?.length) return Response.json({ agents: [] });

  const agentIds = assignments.map((a) => a.custom_agent_id);

  // Fetch agent details with priority_domains
  const { data: agents } = await supabase
    .from("custom_agents")
    .select("id, name, emoji, role, priority_domains")
    .in("id", agentIds);

  return Response.json({ agents: agents ?? [] });
}
