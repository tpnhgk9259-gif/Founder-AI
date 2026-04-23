import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { partnerId, active, max_custom_agents } = await req.json();
  if (!partnerId) {
    return Response.json({ error: "partnerId requis" }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (typeof active === "boolean") updates.active = active;
  if (typeof max_custom_agents === "number") updates.max_custom_agents = Math.max(0, Math.min(20, max_custom_agents));

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: "Aucune modification" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("partners")
    .update(updates)
    .eq("id", partnerId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  logAudit({
    userId: viewer.id,
    action: "admin.license_update",
    entityType: "partner",
    entityId: partnerId,
    metadata: updates,
  });

  return Response.json({ ok: true });
}
