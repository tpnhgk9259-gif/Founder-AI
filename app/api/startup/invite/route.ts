import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userIsStartupOwner } from "@/lib/auth";
import { getEffectiveStartupLicense } from "@/lib/licenses-server";
import { sendInviteEmail } from "@/lib/email";
import { randomUUID } from "crypto";

// POST — inviter un membre à rejoindre la startup
export async function POST(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { startupId, email, role } = await req.json();
  if (!startupId || !email?.trim()) return Response.json({ error: "startupId et email requis" }, { status: 400 });

  const memberRole = ["editor", "viewer"].includes(role) ? role : "viewer";

  const isOwner = await userIsStartupOwner(userId, startupId);
  if (!isOwner) return Response.json({ error: "Seul l'owner peut inviter des membres" }, { status: 403 });

  const supabase = createServerClient();

  // Vérifier le quota de membres selon le plan
  const license = await getEffectiveStartupLicense(startupId);
  const maxMembers = license.max_members ?? 1;
  const { count } = await supabase
    .from("startup_members")
    .select("id", { count: "exact", head: true })
    .eq("startup_id", startupId);

  if ((count ?? 0) >= maxMembers) {
    const planLabel = maxMembers === 1 ? "Starter (1 membre)" : maxMembers === 3 ? "Growth (3 membres)" : `votre plan (${maxMembers} membres)`;
    return Response.json({ error: `Limite atteinte pour ${planLabel}. Passez au plan supérieur pour inviter plus de membres.` }, { status: 403 });
  }

  // Vérifier que le membre n'est pas déjà invité
  const { data: existing } = await supabase
    .from("startup_members")
    .select("id, joined_at")
    .eq("startup_id", startupId)
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  if (existing?.joined_at) {
    return Response.json({ error: "Ce membre fait déjà partie de l'équipe" }, { status: 400 });
  }
  if (existing && !existing.joined_at) {
    return Response.json({ error: "Une invitation est déjà en attente pour cet email" }, { status: 400 });
  }

  // Vérifier si un compte existe déjà avec cet email
  const { data: existingUser } = await supabase
    .from("users")
    .select("id, email")
    .eq("email", email.trim().toLowerCase())
    .maybeSingle();

  const inviteToken = randomUUID();

  // Créer l'entrée startup_members
  const { data: member, error } = await supabase
    .from("startup_members")
    .insert({
      startup_id: startupId,
      user_id: existingUser?.id ?? null,
      email: email.trim().toLowerCase(),
      role: memberRole,
      invite_token: existingUser ? null : inviteToken, // pas de token si compte existe
      invited_by: userId,
      joined_at: existingUser ? new Date().toISOString() : null, // auto-join si compte existe
    })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });

  // Récupérer le nom de la startup pour l'email
  const { data: startup } = await supabase
    .from("startups")
    .select("name")
    .eq("id", startupId)
    .maybeSingle();

  const startupName = startup?.name || "une startup";

  // Récupérer le nom de l'inviteur
  const { data: inviter } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  // Envoyer l'email d'invitation
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://founderai-kappa.vercel.app";

  if (existingUser) {
    // Compte existant → notification simple
    sendInviteEmail(
      email.trim().toLowerCase(),
      startupName,
      inviter?.email || "un fondateur",
      memberRole,
      `${baseUrl}/connexion`
    ).catch((err) => console.error("[invite] email error:", err));
  } else {
    // Pas de compte → lien d'inscription avec token
    sendInviteEmail(
      email.trim().toLowerCase(),
      startupName,
      inviter?.email || "un fondateur",
      memberRole,
      `${baseUrl}/inscription?invite=${inviteToken}&email=${encodeURIComponent(email.trim().toLowerCase())}`
    ).catch((err) => console.error("[invite] email error:", err));
  }

  return Response.json({
    member,
    autoJoined: Boolean(existingUser),
  });
}
