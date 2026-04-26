import { NextRequest } from "next/server";
import { createServerClient } from "@/lib/supabase";
import { getAuthenticatedUserId } from "@/lib/auth";

// GET — lister les startups dont l'utilisateur est membre
export async function GET(_req: NextRequest) {
  const userId = await getAuthenticatedUserId();
  if (!userId) return Response.json({ error: "Non authentifié" }, { status: 401 });

  const supabase = createServerClient();

  // Via startup_members
  const { data: memberships } = await supabase
    .from("startup_members")
    .select("startup_id, role, joined_at")
    .eq("user_id", userId)
    .not("joined_at", "is", null);

  if (!memberships?.length) {
    // Fallback legacy : startups.user_id
    const { data: legacy } = await supabase
      .from("startups")
      .select("id, name, sector, stage")
      .eq("user_id", userId);

    return Response.json({
      startups: (legacy ?? []).map((s) => ({ ...s, role: "owner" })),
    });
  }

  const startupIds = memberships.map((m) => m.startup_id);
  const { data: startups } = await supabase
    .from("startups")
    .select("id, name, sector, stage")
    .in("id", startupIds);

  const result = (startups ?? []).map((s) => {
    const membership = memberships.find((m) => m.startup_id === s.id);
    return { ...s, role: membership?.role ?? "viewer" };
  });

  return Response.json({ startups: result });
}
