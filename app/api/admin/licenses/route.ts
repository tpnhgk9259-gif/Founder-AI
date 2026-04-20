import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";
import { normalizeLicenseConfig } from "@/lib/licenses";

export async function GET() {
  const sessionUser = await getRouteUser();
  if (!sessionUser?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!isSuperAdminEmail(sessionUser.email)) {
    return NextResponse.json({ error: "Accès réservé aux super-administrateurs." }, { status: 403 });
  }

  const supabase = createServerClient();
  const [{ data: partners, error: partnersErr }, { data: startups, error: startupsErr }] =
    await Promise.all([
      supabase.from("partners").select("id, name, license_config").order("name", { ascending: true }),
      supabase
        .from("startups")
        .select("id, name, partner_id, license_config")
        .order("created_at", { ascending: false }),
    ]);

  if (partnersErr || startupsErr) {
    const details = partnersErr?.message ?? startupsErr?.message ?? "unknown error";
    return NextResponse.json(
      {
        error:
          "Lecture des licences impossible. Vérifiez que la migration de licence est appliquée (colonnes license_config).",
        details,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    partners: (partners ?? []).map((p) => ({
      ...p,
      license_config: normalizeLicenseConfig(p.license_config),
    })),
    startups: (startups ?? []).map((s) => ({
      ...s,
      license_config: normalizeLicenseConfig(s.license_config),
    })),
  });
}

export async function PUT(req: Request) {
  const sessionUser = await getRouteUser();
  if (!sessionUser?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!isSuperAdminEmail(sessionUser.email)) {
    return NextResponse.json({ error: "Accès réservé aux super-administrateurs." }, { status: 403 });
  }

  let body: {
    targetType: "partner" | "startup";
    targetId: string;
    license: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Corps de requête invalide" }, { status: 400 });
  }

  if (!body.targetType || !body.targetId) {
    return NextResponse.json({ error: "targetType et targetId sont requis" }, { status: 400 });
  }

  const table = body.targetType === "partner" ? "partners" : "startups";
  const license = normalizeLicenseConfig(body.license);
  const supabase = createServerClient();
  const { error } = await supabase
    .from(table)
    .update({ license_config: license, updated_at: new Date().toISOString() })
    .eq("id", body.targetId);

  if (error) {
    return NextResponse.json(
      {
        error:
          "Mise à jour impossible. Vérifiez que la migration de licence est appliquée (colonnes license_config).",
        details: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, license });
}
