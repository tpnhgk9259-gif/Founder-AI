import { createServerClient as createSSRClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createServerClient } from "@/lib/supabase";

export async function getAuthenticatedUserId(): Promise<string | null> {
  const cookieStore = await cookies();
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

  if (error || !user) return null;
  return user.id;
}

/**
 * Vérifie si l'utilisateur a accès à la startup (via startup_members ou legacy user_id).
 * Retourne le rôle si accès, null sinon.
 */
export async function getStartupRole(
  userId: string,
  startupId: string
): Promise<"owner" | "editor" | "viewer" | null> {
  const supabase = createServerClient();

  // Checker startup_members d'abord
  const { data: member } = await supabase
    .from("startup_members")
    .select("role")
    .eq("startup_id", startupId)
    .eq("user_id", userId)
    .maybeSingle();

  if (member) return member.role as "owner" | "editor" | "viewer";

  // Fallback legacy : startups.user_id (pour la transition)
  const { data: legacy } = await supabase
    .from("startups")
    .select("id")
    .eq("id", startupId)
    .eq("user_id", userId)
    .maybeSingle();

  return legacy ? "owner" : null;
}

/**
 * Backward-compatible : vérifie si l'utilisateur a au moins un accès (tout rôle).
 */
export async function userOwnsStartup(
  userId: string,
  startupId: string
): Promise<boolean> {
  const role = await getStartupRole(userId, startupId);
  return role !== null;
}

/**
 * Vérifie que l'utilisateur est owner de la startup.
 */
export async function userIsStartupOwner(
  userId: string,
  startupId: string
): Promise<boolean> {
  const role = await getStartupRole(userId, startupId);
  return role === "owner";
}

/**
 * Vérifie que l'utilisateur peut éditer (owner ou editor).
 */
export async function userCanEditStartup(
  userId: string,
  startupId: string
): Promise<boolean> {
  const role = await getStartupRole(userId, startupId);
  return role === "owner" || role === "editor";
}
