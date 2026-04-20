import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";

const PARTNER_TYPES = new Set([
  "incubator",
  "studio",
  "fund",
  "accelerator",
  "other",
]);

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function POST(req: NextRequest) {
  let body: {
    email: string;
    phone: string;
    password: string;
    firstName: string;
    lastName: string;
    organizationName: string;
    organizationType: string;
  };

  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  const {
    email,
    phone,
    password,
    firstName,
    lastName,
    organizationName,
    organizationType,
  } = body;

  if (!email || !phone?.trim() || !password || !firstName || !lastName || !organizationName?.trim()) {
    return Response.json(
      { error: "Tous les champs obligatoires doivent être remplis." },
      { status: 400 }
    );
  }

  if (password.length < 8) {
    return Response.json(
      { error: "Le mot de passe doit contenir au moins 8 caractères." },
      { status: 400 }
    );
  }

  const normalizedPhone = phone.trim();
  if (normalizedPhone.length < 6) {
    return Response.json(
      { error: "Le numéro de téléphone semble invalide." },
      { status: 400 }
    );
  }

  const type = PARTNER_TYPES.has(organizationType) ? organizationType : "incubator";

  const supabase = createServerClient();

  const withDetails = (msg: string | undefined) =>
    msg ? ({ details: msg } as const) : {};

  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password,
      email_confirm: true,
      app_metadata: { account_type: "partner_admin" },
      user_metadata: {
        phone: normalizedPhone,
        organization_name: organizationName.trim(),
      },
    });

  if (authError || !authData.user) {
    const message =
      authError?.message === "User already registered"
        ? "Un compte existe déjà avec cet email."
        : (authError?.message ?? "Erreur lors de la création du compte.");
    return Response.json({ error: message }, { status: 400 });
  }

  const userId = authData.user.id;
  const normalizedEmail = email.trim().toLowerCase();
  const commercialEmail = process.env.PARTNER_SIGNUP_NOTIFICATION_EMAIL;

  async function cleanup() {
    await supabase.auth.admin.deleteUser(userId);
  }

  const { error: userError } = await supabase.from("users").insert({
    id: userId,
    email: normalizedEmail,
    first_name: firstName.trim(),
    last_name: lastName.trim(),
  });

  if (userError) {
    console.error("[partner-signup] users insert:", userError);
    await cleanup();
    if (userError.code === "23505") {
      return Response.json(
        { error: "Un compte existe déjà avec cet email." },
        { status: 409 }
      );
    }
    return Response.json(
      {
        error: "Erreur lors de la création du profil.",
        ...withDetails(userError.message),
      },
      { status: 500 }
    );
  }

  const { data: partner, error: partnerErr } = await supabase
    .from("partners")
    .insert({ name: organizationName.trim(), type })
    .select("id")
    .single();

  if (partnerErr || !partner) {
    console.error("[partner-signup] partners insert:", partnerErr);
    await cleanup();
    return Response.json(
      {
        error:
          partnerErr?.message?.includes("partners") ||
          partnerErr?.message?.includes("schema cache")
            ? "Table « partners » absente ou inaccessible. Exécutez la migration Supabase add_partners.sql sur votre projet."
            : "Erreur lors de la création de l'organisation partenaire.",
        ...withDetails(partnerErr?.message),
      },
      { status: 500 }
    );
  }

  const { error: memberErr } = await supabase.from("partner_members").insert({
    partner_id: partner.id,
    user_id: userId,
    email: normalizedEmail,
    role: "admin",
  });

  if (memberErr) {
    console.error("[partner-signup] partner_members insert:", memberErr);
    await supabase.from("partners").delete().eq("id", partner.id);
    await cleanup();
    return Response.json(
      {
        error:
          memberErr.message?.includes("partner_members") ||
          memberErr.message?.includes("schema cache")
            ? "Table « partner_members » absente ou inaccessible. Exécutez la migration Supabase add_partners.sql."
            : "Erreur lors de l'association du compte à l'organisation.",
        ...withDetails(memberErr.message),
      },
      { status: 500 }
    );
  }

  if (commercialEmail && process.env.RESEND_API_KEY) {
    const fromEmail = process.env.PARTNER_SIGNUP_FROM_EMAIL ?? "FounderAI <noreply@founderai.app>";
    const html = `
      <h2>Nouvelle demande partenaire</h2>
      <p>Une nouvelle demande de creation de compte partenaire a ete soumise.</p>
      <ul>
        <li><strong>Organisation :</strong> ${escapeHtml(organizationName.trim())}</li>
        <li><strong>Type :</strong> ${escapeHtml(type)}</li>
        <li><strong>Contact :</strong> ${escapeHtml(firstName.trim())} ${escapeHtml(lastName.trim())}</li>
        <li><strong>Email :</strong> ${escapeHtml(normalizedEmail)}</li>
        <li><strong>Telephone :</strong> ${escapeHtml(normalizedPhone)}</li>
      </ul>
      <p>Partner ID: ${escapeHtml(partner.id)}</p>
    `;

    const mailResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [commercialEmail],
        subject: "Nouvelle demande partenaire FounderAI",
        html,
      }),
    });

    if (!mailResponse.ok) {
      const details = await mailResponse.text().catch(() => "");
      console.error("[partner-signup] resend send:", details || mailResponse.statusText);
    }
  }

  return Response.json({ partnerId: partner.id });
}
