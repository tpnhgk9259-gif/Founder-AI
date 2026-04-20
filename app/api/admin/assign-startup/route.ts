import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";

export async function PATCH(req: Request) {
  const sessionUser = await getRouteUser();
  if (!sessionUser?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!isSuperAdminEmail(sessionUser.email)) {
    return NextResponse.json({ error: "Accès réservé aux super-administrateurs." }, { status: 403 });
  }

  let body: { startupId: string; partnerId: string | null };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  if (!body.startupId) {
    return NextResponse.json({ error: "startupId est requis" }, { status: 400 });
  }

  const supabase = createServerClient();
  const { error } = await supabase
    .from("startups")
    .update({ partner_id: body.partnerId ?? null })
    .eq("id", body.startupId);

  if (error) {
    return NextResponse.json({ error: "Mise à jour impossible.", details: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
