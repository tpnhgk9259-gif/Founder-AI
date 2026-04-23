import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";
import { normalizeLicenseConfig } from "@/lib/licenses";
import { sendPartnerInviteEmail } from "@/lib/email";

type GrantPlan = "starter" | "growth" | "scale";

async function ensurePlanAllowance(
  partnerId: string,
  plan: GrantPlan,
  supabase: ReturnType<typeof createServerClient>,
  excludingMemberId?: string
) {
  const { data: partner } = await supabase
    .from("partners")
    .select("license_config")
    .eq("id", partnerId)
    .maybeSingle();
  const license = normalizeLicenseConfig(partner?.license_config);
  const allowance = license.portfolio_plan_allowances[plan];

  let query = supabase
    .from("partner_members")
    .select("id", { count: "exact", head: true })
    .eq("partner_id", partnerId)
    .eq("role", "portfolio")
    .eq("granted_plan", plan);

  if (excludingMemberId) {
    query = query.neq("id", excludingMemberId);
  }

  const { count } = await query;
  return (count ?? 0) < allowance;
}

/** POST /api/partner/members — ajoute une startup au portefeuille par email */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { partnerId, email, grantedPlan } = await req.json();
    const validPlans: GrantPlan[] = ["starter", "growth", "scale"];
    const plan: GrantPlan = validPlans.includes(grantedPlan) ? grantedPlan : "starter";
    if (!partnerId || !email?.trim()) {
      return Response.json({ error: "partnerId et email requis" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Vérifier admin
    const { data: membership } = await supabase
      .from("partner_members")
      .select("id")
      .eq("partner_id", partnerId)
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!membership) return Response.json({ error: "Accès refusé" }, { status: 403 });

    const hasSeat = await ensurePlanAllowance(partnerId, plan, supabase);
    if (!hasSeat) {
      return Response.json(
        { error: `Quota atteint pour le plan ${plan}. Ajustez votre licence partenaire.` },
        { status: 409 }
      );
    }

    // Chercher si l'email correspond à un user existant
    const { data: existingUser } = await supabase
      .from("users")
      .select("id")
      .eq("email", email.trim().toLowerCase())
      .maybeSingle();

    // Insérer le membre (UNIQUE sur partner_id+email → ignore les doublons)
    const { data: member, error } = await supabase
      .from("partner_members")
      .insert({
        partner_id: partnerId,
        user_id: existingUser?.id ?? null,
        email: email.trim().toLowerCase(),
        role: "portfolio",
        granted_plan: plan,
      })
      .select()
      .single();

    if (error) {
      if (error.code === "23505") {
        return Response.json({ error: "Cet email est déjà dans le portefeuille" }, { status: 409 });
      }
      return Response.json({ error: error.message }, { status: 500 });
    }

    // Si l'user a une startup, la lier au partner
    if (existingUser) {
      await supabase
        .from("users")
        .update({ plan })
        .eq("id", existingUser.id);

      await supabase
        .from("startups")
        .update({ partner_id: partnerId })
        .eq("user_id", existingUser.id);

      const { data: startup } = await supabase
        .from("startups")
        .select("id, name")
        .eq("user_id", existingUser.id)
        .maybeSingle();

      return Response.json({ member: { ...member, startup: startup ?? null } });
    }

    // Envoyer l'email d'invitation
    const { data: partnerData } = await supabase.from("partners").select("name").eq("id", partnerId).maybeSingle();
    if (partnerData?.name) {
      sendPartnerInviteEmail(email.trim().toLowerCase(), partnerData.name, plan).catch((err) => console.error("[email] invitation:", err));
    }

    return Response.json({ member: { ...member, startup: null } });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}

/** DELETE /api/partner/members?partnerId=xxx&memberId=xxx */
export async function DELETE(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const partnerId = req.nextUrl.searchParams.get("partnerId");
    const memberId = req.nextUrl.searchParams.get("memberId");

    if (!partnerId || !memberId) {
      return Response.json({ error: "partnerId et memberId requis" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Vérifier admin
    const { data: admin } = await supabase
      .from("partner_members")
      .select("id")
      .eq("partner_id", partnerId)
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (!admin) return Response.json({ error: "Accès refusé" }, { status: 403 });

    // Récupérer le membre pour détacher sa startup
    const { data: target } = await supabase
      .from("partner_members")
      .select("user_id")
      .eq("id", memberId)
      .maybeSingle();

    if (target?.user_id) {
      await supabase
        .from("startups")
        .update({ partner_id: null })
        .eq("user_id", target.user_id)
        .eq("partner_id", partnerId);
    }

    const { error } = await supabase
      .from("partner_members")
      .delete()
      .eq("id", memberId)
      .eq("partner_id", partnerId);

    if (error) return Response.json({ error: error.message }, { status: 500 });

    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}

/** PATCH /api/partner/members — change le plan accordé à une startup du portefeuille */
export async function PATCH(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { partnerId, memberId, grantedPlan } = await req.json();
    const validPlans: GrantPlan[] = ["starter", "growth", "scale"];
    const plan: GrantPlan = validPlans.includes(grantedPlan) ? grantedPlan : "starter";
    if (!partnerId || !memberId) {
      return Response.json({ error: "partnerId et memberId requis" }, { status: 400 });
    }

    const supabase = createServerClient();
    const { data: admin } = await supabase
      .from("partner_members")
      .select("id")
      .eq("partner_id", partnerId)
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();
    if (!admin) return Response.json({ error: "Accès refusé" }, { status: 403 });

    const { data: member } = await supabase
      .from("partner_members")
      .select("id, user_id, role")
      .eq("id", memberId)
      .eq("partner_id", partnerId)
      .maybeSingle();
    if (!member || member.role !== "portfolio") {
      return Response.json({ error: "Membre portefeuille introuvable" }, { status: 404 });
    }

    const hasSeat = await ensurePlanAllowance(partnerId, plan, supabase, memberId);
    if (!hasSeat) {
      return Response.json(
        { error: `Quota atteint pour le plan ${plan}. Ajustez votre licence partenaire.` },
        { status: 409 }
      );
    }

    const { error } = await supabase
      .from("partner_members")
      .update({ granted_plan: plan })
      .eq("id", memberId)
      .eq("partner_id", partnerId);
    if (error) return Response.json({ error: error.message }, { status: 500 });

    if (member.user_id) {
      await supabase.from("users").update({ plan }).eq("id", member.user_id);
    }

    return Response.json({ ok: true, granted_plan: plan });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}
