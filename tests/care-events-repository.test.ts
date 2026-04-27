import { describe, it, expect } from "vitest";
import {
  createCareEvent,
  getCareEvent,
  listCareEvents,
  softDeleteCareEvent,
  updateCareEvent,
} from "@/lib/repositories/care-events";
import type { CareEventsRow } from "@/lib/database.types";
import { createMockSupabase } from "./helpers/supabase-mock";

const BABY = "00000000-0000-0000-0000-00000000aaaa";
const CAREGIVER = "00000000-0000-0000-0000-0000000a0000";
const EVENT_ID = "00000000-0000-0000-0000-000000000010";

function row(overrides: Partial<CareEventsRow> = {}): CareEventsRow {
  return {
    id: EVENT_ID,
    baby_id: BABY,
    caregiver_id: CAREGIVER,
    night_shift_id: null,
    event_type: "feed",
    started_at: "2026-01-01T03:00:00.000Z",
    ended_at: null,
    duration_seconds: null,
    metadata_json: { method: "bottle", amount: 90, unit: "ml", milk_type: "breastmilk" },
    source: "manual",
    created_at: "2026-01-01T03:00:00.000Z",
    updated_at: "2026-01-01T03:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("createCareEvent", () => {
  it("validates input then inserts with defaults applied", async () => {
    const expected = row();
    const supabase = createMockSupabase({ data: expected, error: null });

    const result = await createCareEvent(supabase.client, {
      baby_id: BABY,
      caregiver_id: CAREGIVER,
      event_type: "feed",
      started_at: "2026-01-01T03:00:00.000Z",
      metadata_json: { method: "bottle", amount: 90, unit: "ml", milk_type: "breastmilk" },
    });

    expect(result).toEqual(expected);
    expect(supabase.from).toHaveBeenCalledWith("care_events");
    expect(supabase.builder.insert).toHaveBeenCalledTimes(1);
    const insertArg = supabase.builder.insert.mock.calls[0][0];
    expect(insertArg.source).toBe("manual");
    expect(insertArg.night_shift_id).toBeNull();
    expect(insertArg.duration_seconds).toBeNull();
    expect(insertArg.metadata_json).toEqual({
      method: "bottle",
      amount: 90,
      unit: "ml",
      milk_type: "breastmilk",
    });
  });

  it("rejects invalid input before touching Supabase", async () => {
    const supabase = createMockSupabase<CareEventsRow>({ data: null, error: null });

    await expect(
      createCareEvent(supabase.client, {
        baby_id: "not-a-uuid",
        caregiver_id: CAREGIVER,
        event_type: "feed",
        started_at: "2026-01-01T03:00:00.000Z",
        metadata_json: { method: "bottle", amount: 90, unit: "ml", milk_type: "breastmilk" },
      }),
    ).rejects.toThrow();

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("propagates Supabase errors", async () => {
    const supabase = createMockSupabase<CareEventsRow>({
      data: null,
      error: { message: "boom" },
    });

    await expect(
      createCareEvent(supabase.client, {
        baby_id: BABY,
        caregiver_id: CAREGIVER,
        event_type: "feed",
        started_at: "2026-01-01T03:00:00.000Z",
        metadata_json: { method: "bottle", amount: 90, unit: "ml", milk_type: "breastmilk" },
      }),
    ).rejects.toMatchObject({ message: "boom" });
  });
});

describe("getCareEvent", () => {
  it("filters out soft-deleted rows", async () => {
    const supabase = createMockSupabase({ data: row(), error: null });
    await getCareEvent(supabase.client, EVENT_ID);
    expect(supabase.builder.eq).toHaveBeenCalledWith("id", EVENT_ID);
    expect(supabase.builder.is).toHaveBeenCalledWith("deleted_at", null);
  });
});

describe("listCareEvents", () => {
  it("scopes by baby and hides deleted by default", async () => {
    const supabase = createMockSupabase({ data: [row()], error: null });
    await listCareEvents(supabase.client, { babyId: BABY });

    expect(supabase.builder.eq).toHaveBeenCalledWith("baby_id", BABY);
    expect(supabase.builder.is).toHaveBeenCalledWith("deleted_at", null);
    expect(supabase.builder.order).toHaveBeenCalledWith("started_at", { ascending: false });
  });

  it("applies optional filters", async () => {
    const supabase = createMockSupabase({ data: [], error: null });
    await listCareEvents(supabase.client, {
      babyId: BABY,
      eventType: "diaper",
      since: "2026-01-01T00:00:00.000Z",
      includeDeleted: true,
    });
    expect(supabase.builder.eq).toHaveBeenCalledWith("event_type", "diaper");
    expect(supabase.builder.gte).toHaveBeenCalledWith(
      "started_at",
      "2026-01-01T00:00:00.000Z",
    );
    // includeDeleted: true => no `is("deleted_at", null)` call
    const isCalls = supabase.builder.is.mock.calls.map((c) => c[0]);
    expect(isCalls).not.toContain("deleted_at");
  });
});

describe("updateCareEvent", () => {
  it("validates the patch and only updates non-deleted rows", async () => {
    const supabase = createMockSupabase({ data: row({ duration_seconds: 600 }), error: null });
    const patch = { duration_seconds: 600 };

    await updateCareEvent(supabase.client, EVENT_ID, patch);

    expect(supabase.builder.update).toHaveBeenCalledWith(expect.objectContaining(patch));
    expect(supabase.builder.eq).toHaveBeenCalledWith("id", EVENT_ID);
    expect(supabase.builder.is).toHaveBeenCalledWith("deleted_at", null);
  });

  it("rejects unknown patch fields", async () => {
    const supabase = createMockSupabase<CareEventsRow>({ data: null, error: null });
    await expect(
      updateCareEvent(supabase.client, EVENT_ID, {
        baby_id: BABY,
      } as never),
    ).rejects.toThrow();
    expect(supabase.builder.update).not.toHaveBeenCalled();
  });
});

describe("softDeleteCareEvent", () => {
  it("sets deleted_at instead of issuing a hard delete", async () => {
    const supabase = createMockSupabase({
      data: row({ deleted_at: "2026-01-02T00:00:00.000Z" }),
      error: null,
    });
    await softDeleteCareEvent(supabase.client, EVENT_ID);

    expect(supabase.builder.delete).not.toHaveBeenCalled();
    expect(supabase.builder.update).toHaveBeenCalledTimes(1);
    const arg = supabase.builder.update.mock.calls[0][0] as { deleted_at: string };
    expect(typeof arg.deleted_at).toBe("string");
    expect(supabase.builder.eq).toHaveBeenCalledWith("id", EVENT_ID);
    expect(supabase.builder.is).toHaveBeenCalledWith("deleted_at", null);
  });
});
