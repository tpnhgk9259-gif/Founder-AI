import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { sendPasswordResetEmail } from "@/lib/email";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL ?? "https://founderai-kappa.vercel.app";

export async function POST(req: NextRequest) {
  const { email } = await req.json();
  if (!email?.trim()) {
    return Response.json({ error: "Email requis" }, { status: 400 });
  }

  const supabase = createServerClient();

  // Générer le lien de reset via l'admin API (ne déclenche PAS l'email Supabase)
  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: email.trim().toLowerCase(),
    options: {
      redirectTo: `${BASE_URL}/reset-password`,
    },
  });

  if (error || !data?.properties?.action_link) {
    // Ne pas révéler si l'email existe ou non (sécurité)
    return Response.json({ ok: true });
  }

  // Envoyer via notre propre template Resend
  try {
    await sendPasswordResetEmail(email.trim().toLowerCase(), data.properties.action_link);
  } catch (err) {
    console.error("[forgot-password] Erreur envoi email:", err);
  }

  return Response.json({ ok: true });
}
