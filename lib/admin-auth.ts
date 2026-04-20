import { cookies } from "next/headers";
import { createServerClient as createSSRClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";

/**
 * Liste des emails autorisés en super-admin (séparateurs : virgule, point-virgule ou saut de ligne).
 * Définir dans .env.local : SUPER_ADMIN_EMAILS=toi@domaine.com
 * Jamais exposée au client : vérification uniquement côté API routes.
 */
export function getSuperAdminEmails(): string[] {
  const raw = process.env.SUPER_ADMIN_EMAILS ?? "";
  return raw
    .split(/[,;\n]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export function isSuperAdminEmail(email: string | undefined | null): boolean {
  if (!email) return false;
  const list = getSuperAdminEmails();
  if (list.length === 0) return false;
  return list.includes(email.trim().toLowerCase());
}

/** Utilisateur Auth issu des cookies (session Next / Supabase SSR). */
export async function getRouteUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const supabase = createSSRClient(
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
  } = await supabase.auth.getUser();
  if (error || !user) return null;
  return user;
}
