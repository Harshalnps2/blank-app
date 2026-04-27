"use server";

import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveBabyForUser } from "@/lib/repositories/babies";
import {
  createCareEvent,
  updateCareEvent,
} from "@/lib/repositories/care-events";
import {
  logCareEventIntentSchema,
  type LogCareEventIntent,
} from "@/lib/schemas";
import type { CareEventsRow } from "@/lib/database.types";

export type LogCareEventResult =
  | { ok: true; event: CareEventsRow }
  | { ok: false; error: string };

export async function logCareEvent(
  intent: LogCareEventIntent,
): Promise<LogCareEventResult> {
  const parsed = logCareEventIntentSchema.safeParse(intent);
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid event payload.",
    };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're signed out. Sign in to log events." };

  const baby = await getActiveBabyForUser(supabase, user.id);
  if (!baby) return { ok: false, error: "No baby profile found." };

  try {
    const event = await createCareEvent(supabase, {
      baby_id: baby.id,
      caregiver_id: user.id,
      event_type: parsed.data.type,
      started_at: parsed.data.started_at ?? new Date().toISOString(),
      metadata_json: parsed.data.metadata,
    });
    revalidatePath("/night");
    revalidatePath("/handoff");
    return { ok: true, event };
  } catch {
    return { ok: false, error: "Couldn't save. Try again." };
  }
}

export type EndSleepResult =
  | { ok: true; event: CareEventsRow }
  | { ok: false; error: string };

export async function endActiveSleep(eventId: string): Promise<EndSleepResult> {
  if (!/^[0-9a-f-]{36}$/i.test(eventId)) {
    return { ok: false, error: "Invalid sleep event id." };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "You're signed out. Sign in to end this sleep." };

  try {
    const updated = await updateCareEvent(supabase, eventId, {
      ended_at: new Date().toISOString(),
    });
    revalidatePath("/night");
    revalidatePath("/handoff");
    return { ok: true, event: updated };
  } catch {
    return { ok: false, error: "Couldn't end sleep. Try again." };
  }
}
