import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";

const VALID_PLANS = ["starter", "growth", "scale"];

export async function PATCH(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  // Vérifier super admin
  const supabase = createServerClient();
  const { data: admin } = await supabase
    .from("users")
    .select("email")
    .eq("id", userId)
    .maybeSingle();

  const superAdmins = (process.env.SUPER_ADMIN_EMAILS ?? "").split(",").map((e) => e.trim().toLowerCase());
  if (!admin || !superAdmins.includes(admin.email.toLowerCase())) {
    return Response.json({ error: "Accès refusé" }, { status: 403 });
  }

  const { targetUserId, plan } = await req.json();
  if (!targetUserId || !plan) return Response.json({ error: "targetUserId et plan requis" }, { status: 400 });
  if (!VALID_PLANS.includes(plan)) return Response.json({ error: `Plan invalide. Valeurs : ${VALID_PLANS.join(", ")}` }, { status: 400 });

  // Mettre à jour le plan de l'utilisateur
  const { error: userError } = await supabase
    .from("users")
    .update({ plan })
    .eq("id", targetUserId);

  if (userError) return Response.json({ error: userError.message }, { status: 500 });

  // Mettre à jour la license_config de la startup associée
  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("user_id", targetUserId)
    .maybeSingle();

  if (startup) {
    const { PLAN_PRESETS } = await import("@/lib/licenses");
    const preset = PLAN_PRESETS[plan as keyof typeof PLAN_PRESETS];
    if (preset) {
      await supabase
        .from("startups")
        .update({ license_config: preset })
        .eq("id", startup.id);
    }
  }

  return Response.json({ ok: true, plan });
}
