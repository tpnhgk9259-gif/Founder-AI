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

  // Supprimer la startup liée
  await supabase.from("startups").delete().eq("user_id", userId);

  // Supprimer le profil utilisateur
  await supabase.from("users").delete().eq("id", userId);

  // Supprimer le compte auth
  const { error } = await supabase.auth.admin.deleteUser(userId);
  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true });
}
