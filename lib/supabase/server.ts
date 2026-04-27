import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { getPublicEnv } from "../env";

/**
 * Server-side Supabase client bound to the current request's cookies.
 *
 * Use this from Server Components, Route Handlers, and Server Actions. The
 * cookie `set` calls may throw inside a Server Component (Next.js disallows
 * setting cookies during render); we swallow those because the middleware
 * is responsible for keeping the session fresh, and the server-component
 * read path only needs to *read* cookies.
 */
export function createSupabaseServerClient() {
  const env = getPublicEnv();
  const cookieStore = cookies();

  return createServerClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component render. Safe to ignore — the
          // middleware refreshes the session on the next request.
        }
      },
    },
  });
}
