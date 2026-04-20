import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const supabase = createServerClient();

  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const startupId = req.nextUrl.searchParams.get("startupId");
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const { data: conversations, error } = await supabase
    .from("conversations")
    .select("id, agent_key, created_at")
    .eq("startup_id", startupId)
    .order("created_at", { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });

  const result = await Promise.all(
    (conversations ?? []).map(async (conv) => {
      const { data: messages } = await supabase
        .from("messages")
        .select("id, role, content, created_at, model")
        .eq("conversation_id", conv.id)
        .order("created_at", { ascending: true });

      return { ...conv, messages: messages ?? [] };
    })
  );

  return Response.json(result);
}
