import { createServerClient as createSSRClient } from "@supabase/ssr";
import { createServerClient } from "@/lib/supabase";
import { cookies } from "next/headers";
import { isSuperAdminEmail } from "@/lib/admin-auth";

export async function GET() {
  const cookieStore = await cookies();

  // Client SSR avec anon key pour lire la session
  const supabaseSSR = createSSRClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabaseSSR.auth.getUser();

  if (error || !user) {
    return Response.json({ error: "Non authentifié" }, { status: 401 });
  }

  const supabase = createServerClient();

  const { data: profile } = await supabase
    .from("users")
    .select("id, plan")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    return Response.json({ error: "Profil introuvable" }, { status: 404 });
  }

  const { data: startup } = await supabase
    .from("startups")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  const { data: partnerAdmin } = await supabase
    .from("partner_members")
    .select("partner_id")
    .eq("user_id", user.id)
    .eq("role", "admin")
    .maybeSingle();

  return Response.json({
    userId: user.id,
    email: user.email ?? null,
    plan: profile?.plan ?? "starter",
    startupId: startup?.id ?? null,
    partnerId: partnerAdmin?.partner_id ?? null,
    isPartnerAdmin: Boolean(partnerAdmin),
    isSuperAdmin: isSuperAdminEmail(user.email),
  });
}
