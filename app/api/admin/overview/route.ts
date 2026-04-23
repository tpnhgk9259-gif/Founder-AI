import { NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getRouteUser, isSuperAdminEmail } from "@/lib/admin-auth";

export async function GET() {
  const sessionUser = await getRouteUser();
  if (!sessionUser?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  if (!isSuperAdminEmail(sessionUser.email)) {
    return NextResponse.json({ error: "Accès réservé aux super-administrateurs." }, { status: 403 });
  }

  const supabase = createServerClient();

  const [
    { data: users, error: usersErr },
    { data: startupsRaw, error: startupsErr },
    { data: partners, error: partnersErr },
    { data: partnerMembers, error: membersErr },
  ] = await Promise.all([
    supabase
      .from("users")
      .select("id, email, first_name, last_name, plan, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("startups")
      .select("id, user_id, name, sector, stage, partner_id, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("partners")
      .select("id, name, type, active, max_custom_agents, created_at")
      .order("created_at", { ascending: false }),
    supabase
      .from("partner_members")
      .select("id, partner_id, email, role, user_id, invited_at, granted_plan")
      .order("invited_at", { ascending: false }),
  ]);

  if (usersErr) {
    return NextResponse.json(
      { error: "Lecture users impossible.", details: usersErr.message },
      { status: 500 }
    );
  }
  if (startupsErr) {
    return NextResponse.json(
      { error: "Lecture startups impossible.", details: startupsErr.message },
      { status: 500 }
    );
  }
  if (partnersErr) {
    return NextResponse.json(
      { error: "Lecture partners impossible.", details: partnersErr.message },
      { status: 500 }
    );
  }
  if (membersErr) {
    return NextResponse.json(
      { error: "Lecture partner_members impossible.", details: membersErr.message },
      { status: 500 }
    );
  }

  const userById = Object.fromEntries((users ?? []).map((u) => [u.id, u]));

  const startups = (startupsRaw ?? []).map((s) => {
    const owner = userById[s.user_id];
    return {
      ...s,
      owner_email: owner?.email ?? null,
      owner_name: owner
        ? `${owner.first_name} ${owner.last_name}`.trim()
        : null,
    };
  });

  const members = partnerMembers ?? [];
  const partnersEnriched = (partners ?? []).map((p) => ({
    ...p,
    admin_count: members.filter((m) => m.partner_id === p.id && m.role === "admin").length,
    portfolio_count: members.filter((m) => m.partner_id === p.id && m.role === "portfolio").length,
  }));

  return NextResponse.json({
    users: users ?? [],
    startups,
    partners: partnersEnriched,
    partnerMembers: members,
    generatedAt: new Date().toISOString(),
    viewerEmail: sessionUser.email,
  });
}
