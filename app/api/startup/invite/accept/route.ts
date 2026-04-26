import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";

// POST — accepter une invitation (utilisateur connecté + token)
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return Response.json({ error: "Token requis" }, { status: 400 });

  const supabase = createServerClient();

  // Trouver l'invitation
  const { data: invite } = await supabase
    .from("startup_members")
    .select("id, startup_id, email, joined_at")
    .eq("invite_token", token)
    .maybeSingle();

  if (!invite) return Response.json({ error: "Invitation invalide ou expirée" }, { status: 404 });
  if (invite.joined_at) return Response.json({ error: "Invitation déjà acceptée" }, { status: 400 });

  // Vérifier que l'email correspond
  const { data: user } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  if (!user || user.email.toLowerCase() !== invite.email.toLowerCase()) {
    return Response.json({ error: "L'email de votre compte ne correspond pas à l'invitation" }, { status: 403 });
  }

  // Accepter l'invitation
  const { error } = await supabase
    .from("startup_members")
    .update({
      user_id: userId,
      joined_at: new Date().toISOString(),
      invite_token: null,
    })
    .eq("id", invite.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  return Response.json({ ok: true, startupId: invite.startup_id });
}
