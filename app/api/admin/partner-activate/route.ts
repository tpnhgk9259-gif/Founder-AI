import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";
import { logAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest) {
  const viewer = await getRouteUser();
  if (!viewer) return Response.json({ error: "Non authentifié" }, { status: 401 });
  if (!isSuperAdminEmail(viewer.email)) return Response.json({ error: "Accès refusé" }, { status: 403 });

  const { partnerId, active } = await req.json();
  if (!partnerId || typeof active !== "boolean") {
    return Response.json({ error: "partnerId et active (boolean) requis" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("partners")
    .update({ active })
    .eq("id", partnerId);

  if (error) return Response.json({ error: error.message }, { status: 500 });

  logAudit({
    userId: viewer.id,
    action: "admin.license_update",
    entityType: "partner",
    entityId: partnerId,
    metadata: { active },
  });

  return Response.json({ ok: true });
}
