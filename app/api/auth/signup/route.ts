import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendWelcomeEmail } from "@/lib/email";
import { PLAN_PRESETS } from "@/lib/licenses";
import type { PlanKey } from "@/lib/licenses";

export async function POST(req: NextRequest) {
  let body: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    startupName: string;
    plan?: PlanKey;
    agents?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const { email, password, firstName, lastName, startupName, plan, agents } = body;
  const planKey: PlanKey = plan && plan in PLAN_PRESETS ? plan : "starter";
  const preset = PLAN_PRESETS[planKey];

  // Appliquer les agents choisis si fournis, sinon utiliser le preset
  const validAgents = ["strategie", "vente", "finance", "technique", "codir"];
  const chosenAgents = Array.isArray(agents) && agents.length > 0
    ? agents.filter((a) => validAgents.includes(a))
    : preset.available_agents;

  const licenseConfig = { ...preset, available_agents: chosenAgents as typeof preset.available_agents };
  const normalizedEmail = email.trim().toLowerCase();

  if (!email || !password || !firstName || !lastName) {
    return Response.json({ error: "Champs requis manquants" }, { status: 400 });
  }

  const supabase = createServerClient();

  // 1. Créer l'utilisateur auth (email confirmé immédiatement)
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
    });

  if (authError || !authData.user) {
    const message =
      authError?.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : (authError?.message ?? "Erreur lors de la création du compte.");
    return Response.json({ error: message }, { status: 400 });
  }

  const userId = authData.user.id;

  const { data: partnerInvite } = await supabase
    .from("partner_members")
    .select("partner_id, granted_plan, invited_at")
    .eq("email", normalizedEmail)
    .eq("role", "portfolio")
    .order("invited_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  // 2. Insérer dans la table users
  const effectivePlan = partnerInvite ? "starter" : planKey;
  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    email: normalizedEmail,
    first_name: firstName,
    last_name: lastName,
    plan: effectivePlan,
  });

  if (userError) {
    await supabase.auth.admin.deleteUser(userId);
    return Response.json({ error: "Erreur lors de la création du profil." }, { status: 500 });
  }

  // 3. Créer une startup avec la licence correspondant au plan
  const { data: startup, error: startupError } = await supabase
    .from("startups")
    .insert({
      user_id: userId,
      name: startupName || null,
      partner_id: partnerInvite?.partner_id ?? null,
      license_config: licenseConfig,
    })
    .select("id")
    .single();

  if (startupError || !startup) {
    await supabase.auth.admin.deleteUser(userId);
    return Response.json({ error: "Erreur lors de la création de la startup." }, { status: 500 });
  }

  if (partnerInvite?.partner_id) {
    await supabase
      .from("partner_members")
      .update({ user_id: userId })
      .eq("partner_id", partnerInvite.partner_id)
      .eq("email", normalizedEmail)
      .eq("role", "portfolio");
  }

  // 4. Envoyer l'email de bienvenue (non bloquant)
  sendWelcomeEmail(normalizedEmail, firstName).catch((err) => console.error("[email] welcome failed:", err));

  return Response.json({ startupId: startup.id });
}
