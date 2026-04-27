import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "./env";

/**
 * App-wide Supabase client type.
 *
 * NOTE: We intentionally do *not* parameterize the Supabase client with our
 * `Database` generic. Our hand-written `Database` type (see
 * `lib/database.types.ts`) is authoritative for application code (Row /
 * Insert / Update shapes) and Zod schemas (see `lib/schemas.ts`) are the
 * runtime gate, which is the boundary that actually matters for safety.
 *
 * Once `supabase gen types typescript` is wired up against a live project,
 * swap in the generated `Database` type here.
 */
export type AppSupabaseClient = ReturnType<typeof createBrowserClient>;

export function createSupabaseBrowserClient(): AppSupabaseClient {
  const env = getPublicEnv();
  return createBrowserClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
