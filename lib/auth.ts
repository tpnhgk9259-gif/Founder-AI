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

export async function userOwnsStartup(
  userId: string,
  startupId: string
): Promise<boolean> {
  const supabase = createServerClient();
  const { data } = await supabase
    .from("startups")
    .select("id")
    .eq("id", startupId)
    .eq("user_id", userId)
    .maybeSingle();

  return Boolean(data);
}
