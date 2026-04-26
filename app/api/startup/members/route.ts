import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId, userOwnsStartup, userIsStartupOwner } from "@/lib/auth";

// GET — lister les membres d'une startup
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const startupId = req.nextUrl.searchParams.get("startupId");
  if (!startupId) return Response.json({ error: "startupId requis" }, { status: 400 });

  const hasAccess = await userOwnsStartup(userId, startupId);
  if (!hasAccess) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const supabase = createServerClient();
  const { data: members } = await supabase
    .from("startup_members")
    .select("id, user_id, email, role, invited_at, joined_at")
    .eq("startup_id", startupId)
    .order("joined_at", { ascending: true, nullsFirst: false });

  return Response.json({ members: members ?? [] });
}

// PUT — changer le rôle d'un membre (owner uniquement)
export async function PUT(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const { startupId, memberId, role } = await req.json();
  if (!startupId || !memberId || !role) return Response.json({ error: "Champs requis" }, { status: 400 });
  if (!["editor", "viewer"].includes(role)) return Response.json({ error: "Rôle invalide" }, { status: 400 });

  const isOwner = await userIsStartupOwner(userId, startupId);
  if (!isOwner) return Response.json({ error: "Seul l'owner peut modifier les rôles" }, { status: 403 });

  const supabase = createServerClient();

  // Empêcher de modifier le rôle de l'owner
  const { data: target } = await supabase
    .from("startup_members")
    .select("role")
    .eq("id", memberId)
    .eq("startup_id", startupId)
    .maybeSingle();

  if (!target) return Response.json({ error: "Membre non trouvé" }, { status: 404 });
  if (target.role === "owner") return Response.json({ error: "Impossible de modifier le rôle de l'owner" }, { status: 400 });

  const { error } = await supabase
    .from("startup_members")
    .update({ role })
    .eq("id", memberId)
    .eq("startup_id", startupId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}

// DELETE — retirer un membre (owner, ou le membre lui-même)
export async function DELETE(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const startupId = req.nextUrl.searchParams.get("startupId");
  const memberId = req.nextUrl.searchParams.get("memberId");
  if (!startupId || !memberId) return Response.json({ error: "Champs requis" }, { status: 400 });

  const supabase = createServerClient();

  // Vérifier que le membre existe
  const { data: target } = await supabase
    .from("startup_members")
    .select("id, user_id, role")
    .eq("id", memberId)
    .eq("startup_id", startupId)
    .maybeSingle();

  if (!target) return Response.json({ error: "Membre non trouvé" }, { status: 404 });
  if (target.role === "owner") return Response.json({ error: "Impossible de retirer l'owner" }, { status: 400 });

  // Soit l'owner, soit le membre lui-même
  const isOwner = await userIsStartupOwner(userId, startupId);
  const isSelf = target.user_id === userId;
  if (!isOwner && !isSelf) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { error } = await supabase
    .from("startup_members")
    .delete()
    .eq("id", memberId);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ ok: true });
}
