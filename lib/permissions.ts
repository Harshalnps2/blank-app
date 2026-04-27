/**
 * Caregiver permission helpers.
 *
 * These mirror the RLS policies in
 * `supabase/migrations/20260427000002_rls_policies.sql`. The Postgres policies
 * are the source of truth — these helpers exist so application code can make
 * the same decisions before issuing a query (e.g. to render a friendly error
 * instead of letting RLS reject silently) and so the rules are testable
 * without standing up a Postgres instance.
 *
 * If you change the RLS in SQL, change these helpers in the same PR.
 */

import type { CaregiverRole } from "./database.types";

export interface CaregiverMembership {
  babyId: string;
  userId: string;
  role: CaregiverRole;
  /** Null until the caregiver has accepted the invitation. */
  acceptedAt: string | null;
}

function findMembership(
  memberships: readonly CaregiverMembership[],
  babyId: string,
  userId: string,
): CaregiverMembership | undefined {
  return memberships.find((m) => m.babyId === babyId && m.userId === userId);
}

/**
 * True iff the user has an *accepted* membership on the baby. Mirrors
 * `public.is_baby_caregiver`.
 */
export function canAccessBaby(
  memberships: readonly CaregiverMembership[],
  babyId: string,
  userId: string,
): boolean {
  const m = findMembership(memberships, babyId, userId);
  return Boolean(m && m.acceptedAt);
}

/**
 * True iff the user is the *owner* of the baby. Mirrors `public.is_baby_owner`.
 */
export function isBabyOwner(
  memberships: readonly CaregiverMembership[],
  babyId: string,
  userId: string,
): boolean {
  const m = findMembership(memberships, babyId, userId);
  return Boolean(m && m.acceptedAt && m.role === "owner");
}

/**
 * Care events: only an accepted caregiver can read them, and only the original
 * recording caregiver can update or delete them.
 */
export function canReadCareEvents(
  memberships: readonly CaregiverMembership[],
  babyId: string,
  userId: string,
): boolean {
  return canAccessBaby(memberships, babyId, userId);
}

export function canRecordCareEvent(
  memberships: readonly CaregiverMembership[],
  babyId: string,
  userId: string,
): boolean {
  return canAccessBaby(memberships, babyId, userId);
}

export function canMutateCareEvent(
  memberships: readonly CaregiverMembership[],
  babyId: string,
  recordingCaregiverId: string,
  userId: string,
): boolean {
  return canAccessBaby(memberships, babyId, userId) && recordingCaregiverId === userId;
}
