/**
 * Babies repository.
 *
 * The `babies_bootstrap_ownership` Postgres trigger inserts a
 * `baby_caregivers` row (role = 'owner', accepted_at = now()) on the same
 * transaction the baby is created in. So creating a baby simultaneously
 * authorizes the creator as a caregiver — no second write from app code.
 *
 * Authorization is enforced by RLS; these functions assume the Supabase
 * client is authenticated as the acting user.
 */

import type { SupabaseClient } from "@supabase/supabase-js";
import { babyProfileInputSchema, type BabyProfileInput } from "../schemas";
import type { BabiesRow } from "../database.types";

export type ActiveBaby = Pick<
  BabiesRow,
  "id" | "name" | "birth_date" | "feeding_method" | "created_by"
>;

const TABLE = "babies" as const;

export async function createBabyForUser(
  client: SupabaseClient,
  userId: string,
  input: BabyProfileInput,
): Promise<BabiesRow> {
  const parsed = babyProfileInputSchema.parse(input);

  const { data, error } = await client
    .from(TABLE)
    .insert({
      name: parsed.name,
      birth_date: parsed.birth_date,
      feeding_method: parsed.feeding_method,
      created_by: userId,
    })
    .select()
    .single();

  if (error) throw error;
  return data as BabiesRow;
}

/**
 * Returns the most recent baby the user is an *accepted* caregiver for,
 * or null if they have none. Used to decide whether onboarding is complete.
 */
export async function getActiveBabyForUser(
  client: SupabaseClient,
  userId: string,
): Promise<ActiveBaby | null> {
  const { data, error } = await client
    .from("baby_caregivers")
    .select(
      `baby:babies!inner (
        id,
        name,
        birth_date,
        feeding_method,
        created_by,
        deleted_at
      )`,
    )
    .eq("user_id", userId)
    .not("accepted_at", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;

  const baby = (data as unknown as { baby: (BabiesRow & { deleted_at: string | null }) | null }).baby;
  if (!baby || baby.deleted_at) return null;

  return {
    id: baby.id,
    name: baby.name,
    birth_date: baby.birth_date,
    feeding_method: baby.feeding_method,
    created_by: baby.created_by,
  };
}

