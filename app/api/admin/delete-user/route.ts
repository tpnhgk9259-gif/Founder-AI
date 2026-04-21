import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";

export async function DELETE(req: NextRequest) {
  const supabase = createServerClient();

  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  let userId: string;
  try {
    const body = await req.json();
    userId = body.userId;
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  if (!userId) return Response.json({ error: "userId requis" }, { status: 400 });

  // Récupérer les startups liées pour cascade manuelle
  const { data: startups } = await supabase.from("startups").select("id").eq("user_id", userId);
  const startupIds = startups?.map((s) => s.id) ?? [];

  if (startupIds.length > 0) {
    // Supprimer les données liées aux startups (conversations → messages → summaries, codir, usage)
    const { data: convos } = await supabase.from("conversations").select("id").in("startup_id", startupIds);
    const convoIds = convos?.map((c) => c.id) ?? [];
    if (convoIds.length > 0) {
      await supabase.from("conversation_summaries").delete().in("conversation_id", convoIds);
      await supabase.from("messages").delete().in("conversation_id", convoIds);
      await supabase.from("conversations").delete().in("id", convoIds);
    }
    await supabase.from("codir_sessions").delete().in("startup_id", startupIds);
    await supabase.from("api_usage_log").delete().in("startup_id", startupIds);
    await supabase.from("startups").delete().in("id", startupIds);
  }

  // Supprimer les éventuelles entrées partner_members
  await supabase.from("partner_members").delete().eq("user_id", userId);

  // Supprimer le profil utilisateur
  await supabase.from("users").delete().eq("id", userId);

  // Supprimer le compte auth
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
