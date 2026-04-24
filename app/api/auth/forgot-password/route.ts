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

  const { data, error } = await supabase.auth.admin.generateLink({
    type: "recovery",
    email: email.trim().toLowerCase(),
  });

  if (error || !data?.properties?.action_link) {
    return Response.json({ ok: true });
  }

  // Extraire le token du lien Supabase et construire notre propre URL
  // Le action_link ressemble à : https://xxx.supabase.co/auth/v1/verify?token=xxx&type=recovery&redirect_to=...
  // On garde le lien Supabase tel quel mais on force le redirect_to
  const actionUrl = new URL(data.properties.action_link);
  actionUrl.searchParams.set("redirect_to", `${BASE_URL}/reset-password`);
  const cleanLink = actionUrl.toString();

  try {
    await sendPasswordResetEmail(email.trim().toLowerCase(), cleanLink);
  } catch (err) {
    console.error("[forgot-password] Erreur envoi email:", err);
  }

  return Response.json({ ok: true });
}
