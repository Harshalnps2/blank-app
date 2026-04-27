/**
 * Care events repository.
 *
 * Thin wrapper over the Supabase JS client that:
 *   - validates input with Zod
 *   - filters out soft-deleted rows from reads by default
 *   - performs soft-deletes by setting `deleted_at = now()` instead of `delete`
 *
 * Authorization is enforced by Postgres RLS — these functions assume the
 * Supabase client is authenticated as the acting user.
 */

import type { AppSupabaseClient } from "../supabase";
import type { CareEventsRow, CareEventType } from "../database.types";
import {
  careEventInputSchema,
  careEventUpdateSchema,
  type CareEventInput,
  type CareEventUpdateInput,
} from "../schemas";

const TABLE = "care_events" as const;

export interface ListCareEventsOptions {
  babyId: string;
  nightShiftId?: string;
  eventType?: CareEventType;
  /** ISO timestamp; events with started_at >= this are returned. */
  since?: string;
  /** Default 100. */
  limit?: number;
  /** Default false. Soft-deleted rows are hidden unless this is true. */
  includeDeleted?: boolean;
}

export async function createCareEvent(
  client: AppSupabaseClient,
  input: CareEventInput,
): Promise<CareEventsRow> {
  const parsed = careEventInputSchema.parse(input);
  const insert = {
    baby_id: parsed.baby_id,
    caregiver_id: parsed.caregiver_id,
    night_shift_id: parsed.night_shift_id ?? null,
    event_type: parsed.event_type,
    started_at: parsed.started_at,
    ended_at: parsed.ended_at ?? null,
    duration_seconds: parsed.duration_seconds ?? null,
    metadata_json: (parsed.metadata_json ?? {}) as CareEventsRow["metadata_json"],
    source: parsed.source ?? "manual",
  };

  const { data, error } = await client.from(TABLE).insert(insert).select().single();
  if (error) throw error;
  return data as CareEventsRow;
}

export async function getCareEvent(
  client: AppSupabaseClient,
  id: string,
): Promise<CareEventsRow | null> {
  const { data, error } = await client
    .from(TABLE)
    .select("*")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw error;
  return (data as CareEventsRow | null) ?? null;
}

export async function listCareEvents(
  client: AppSupabaseClient,
  options: ListCareEventsOptions,
): Promise<CareEventsRow[]> {
  let query = client
    .from(TABLE)
    .select("*")
    .eq("baby_id", options.babyId)
    .order("started_at", { ascending: false })
    .limit(options.limit ?? 100);

  if (!options.includeDeleted) {
    query = query.is("deleted_at", null);
  }
  if (options.nightShiftId) {
    query = query.eq("night_shift_id", options.nightShiftId);
  }
  if (options.eventType) {
    query = query.eq("event_type", options.eventType);
  }
  if (options.since) {
    query = query.gte("started_at", options.since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CareEventsRow[];
}

export async function updateCareEvent(
  client: AppSupabaseClient,
  id: string,
  patch: CareEventUpdateInput,
): Promise<CareEventsRow> {
  const parsed = careEventUpdateSchema.parse(patch);
  const update: Record<string, unknown> = { ...parsed };
  if (parsed.metadata_json !== undefined) {
    update.metadata_json = parsed.metadata_json;
  }

  const { data, error } = await client
    .from(TABLE)
    .update(update)
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  if (error) throw error;
  return data as CareEventsRow;
}

export async function softDeleteCareEvent(
  client: AppSupabaseClient,
  id: string,
): Promise<CareEventsRow> {
  const { data, error } = await client
    .from(TABLE)
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", id)
    .is("deleted_at", null)
    .select()
    .single();
  if (error) throw error;
  return data as CareEventsRow;
}

export async function restoreCareEvent(
  client: AppSupabaseClient,
  id: string,
): Promise<CareEventsRow> {
  const { data, error } = await client
    .from(TABLE)
    .update({ deleted_at: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as CareEventsRow;
}
