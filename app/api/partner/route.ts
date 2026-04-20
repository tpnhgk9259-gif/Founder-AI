import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";
import { normalizeLicenseConfig } from "@/lib/licenses";

/** GET /api/partner — retourne le partner dont l'user connecté est admin + ses membres */
export async function GET(req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const supabase = createServerClient();

  // Trouver le partner où l'user est admin
  const { data: membership } = await supabase
    .from("partner_members")
    .select("partner_id, role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();

  if (!membership) return Response.json({ partner: null, members: [] });

  const { data: partner } = await supabase
    .from("partners")
    .select("*")
    .eq("id", membership.partner_id)
    .single();

  if (!partner) return Response.json({ partner: null, members: [] });

  // Membres du portefeuille
  const { data: rawMembers } = await supabase
    .from("partner_members")
    .select("id, email, role, user_id, invited_at, granted_plan")
    .eq("partner_id", membership.partner_id)
    .order("invited_at", { ascending: false });

  // Enrichir avec les startups de chaque membre
  const userIds = (rawMembers ?? [])
    .filter((m) => m.user_id)
    .map((m) => m.user_id as string);

  const { data: startups } =
    userIds.length > 0
      ? await supabase
          .from("startups")
          .select("id, name, user_id")
          .in("user_id", userIds)
      : { data: [] };

  const startupByUserId = Object.fromEntries(
    (startups ?? []).map((s) => [s.user_id, { id: s.id, name: s.name }])
  );

  const members = (rawMembers ?? []).map((m) => ({
    ...m,
    startup: m.user_id ? (startupByUserId[m.user_id] ?? null) : null,
  }));

  return Response.json({
    partner: {
      ...partner,
      license_config: normalizeLicenseConfig(partner.license_config),
    },
    members,
  });
}

/** POST /api/partner — crée un nouveau partner et ajoute l'user comme admin */
export async function POST(req: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return Response.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { name, type } = await req.json();
    if (!name?.trim()) {
      return Response.json({ error: "name requis" }, { status: 400 });
    }

    const supabase = createServerClient();

    // Vérifier que l'user n'est pas déjà admin d'un partner
    const { data: existing } = await supabase
      .from("partner_members")
      .select("partner_id")
      .eq("user_id", userId)
      .eq("role", "admin")
      .maybeSingle();

    if (existing) {
      return Response.json({ error: "Vous avez déjà un espace partenaire" }, { status: 409 });
    }

    let { data: user } = await supabase
      .from("users")
      .select("email")
      .eq("id", userId)
      .maybeSingle();

    if (!user) {
      const { data: authData, error: authLookupErr } =
        await supabase.auth.admin.getUserById(userId);
      const au = authData.user;
      const authEmail = au?.email?.trim();
      if (authLookupErr || !au || !authEmail) {
        return Response.json(
          { error: "Utilisateur introuvable (pas de ligne users ni email Auth)." },
          { status: 404 }
        );
      }
      const meta = (au.user_metadata ?? {}) as Record<string, unknown>;
      const firstName =
        typeof meta.first_name === "string"
          ? meta.first_name
          : typeof meta.full_name === "string"
            ? String(meta.full_name).split(/\s+/)[0] || "Utilisateur"
            : "Utilisateur";
      const lastName =
        typeof meta.last_name === "string"
          ? meta.last_name
          : typeof meta.full_name === "string"
            ? String(meta.full_name).split(/\s+/).slice(1).join(" ") || "Partenaire"
            : "Partenaire";
      const { error: syncErr } = await supabase.from("users").insert({
        id: userId,
        email: authEmail.toLowerCase(),
        first_name: firstName,
        last_name: lastName,
      });
      if (syncErr) {
        if (syncErr.code === "23505") {
          const { data: again } = await supabase
            .from("users")
            .select("email")
            .eq("id", userId)
            .maybeSingle();
          if (again) user = again;
        }
        if (!user) {
          return Response.json(
            {
              error:
                "Impossible de créer la ligne profil « users ». Vérifiez SUPABASE_SERVICE_ROLE_KEY et la migration « users ».",
              details: syncErr.message,
            },
            { status: 500 }
          );
        }
      } else {
        user = { email: authEmail.toLowerCase() };
      }
    }

    if (!user?.email) {
      return Response.json({ error: "Email profil manquant." }, { status: 500 });
    }

    const { data: partner, error: partnerErr } = await supabase
      .from("partners")
      .insert({ name: name.trim(), type: type ?? "incubator" })
      .select()
      .single();

    if (partnerErr || !partner) {
      return Response.json(
        { error: partnerErr?.message ?? "Erreur création partner" },
        { status: 500 }
      );
    }

    const { error: memberErr } = await supabase.from("partner_members").insert({
      partner_id: partner.id,
      user_id: userId,
      email: user.email,
      role: "admin",
    });

    if (memberErr) {
      await supabase.from("partners").delete().eq("id", partner.id);
      return Response.json(
        { error: memberErr.message ?? "Erreur lors de l'ajout admin partenaire." },
        { status: 500 }
      );
    }

    return Response.json({ partner });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 503 });
  }
}
