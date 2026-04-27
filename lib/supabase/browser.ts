import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "../env";

export type AppSupabaseClient = ReturnType<typeof createBrowserClient>;

/**
 * Browser-side Supabase client. Read/write the user's session from the same
 * cookies the server reads, so server components see the user immediately
 * after sign-in.
 */
export function createSupabaseBrowserClient(): AppSupabaseClient {
  const env = getPublicEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
