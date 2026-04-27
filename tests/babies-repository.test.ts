import { describe, it, expect } from "vitest";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createBabyForUser, getActiveBabyForUser } from "@/lib/repositories/babies";
import type { BabiesRow } from "@/lib/database.types";
import { createMockSupabase } from "./helpers/supabase-mock";

const USER_ID = "00000000-0000-0000-0000-0000000a0000";

function babyRow(overrides: Partial<BabiesRow> = {}): BabiesRow {
  return {
    id: "00000000-0000-0000-0000-00000000aaaa",
    name: "Juniper",
    birth_date: "2026-04-01",
    feeding_method: "combo",
    created_by: USER_ID,
    created_at: "2026-04-27T00:00:00.000Z",
    updated_at: "2026-04-27T00:00:00.000Z",
    deleted_at: null,
    ...overrides,
  };
}

describe("createBabyForUser", () => {
  it("validates input then inserts with the user's id as creator", async () => {
    const expected = babyRow();
    const supabase = createMockSupabase({ data: expected, error: null });

    const result = await createBabyForUser(supabase.client as unknown as SupabaseClient, USER_ID, {
      name: "Juniper",
      birth_date: "2026-04-01",
      feeding_method: "combo",
    });

    expect(result).toEqual(expected);
    expect(supabase.from).toHaveBeenCalledWith("babies");
    const insertArg = supabase.builder.insert.mock.calls[0][0];
    expect(insertArg).toEqual({
      name: "Juniper",
      birth_date: "2026-04-01",
      feeding_method: "combo",
      created_by: USER_ID,
    });
  });

  it("rejects invalid input before touching Supabase", async () => {
    const supabase = createMockSupabase<BabiesRow>({ data: null, error: null });

    await expect(
      createBabyForUser(supabase.client as unknown as SupabaseClient, USER_ID, {
        name: "",
        birth_date: "2026-04-01",
        feeding_method: "combo",
      }),
    ).rejects.toThrow();

    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects an invalid feeding_method", async () => {
    const supabase = createMockSupabase<BabiesRow>({ data: null, error: null });
    await expect(
      createBabyForUser(supabase.client as unknown as SupabaseClient, USER_ID, {
        name: "Juniper",
        birth_date: "2026-04-01",
        feeding_method: "formula" as never,
      }),
    ).rejects.toThrow();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("rejects a malformed birth_date", async () => {
    const supabase = createMockSupabase<BabiesRow>({ data: null, error: null });
    await expect(
      createBabyForUser(supabase.client as unknown as SupabaseClient, USER_ID, {
        name: "Juniper",
        birth_date: "April 1 2026",
        feeding_method: "combo",
      }),
    ).rejects.toThrow();
    expect(supabase.from).not.toHaveBeenCalled();
  });
});

describe("getActiveBabyForUser", () => {
  it("returns null when there is no membership row", async () => {
    const supabase = createMockSupabase({ data: null, error: null });
    const result = await getActiveBabyForUser(
      supabase.client as unknown as SupabaseClient,
      USER_ID,
    );
    expect(result).toBeNull();
  });

  it("returns the joined baby when present and not soft-deleted", async () => {
    const baby = babyRow();
    const supabase = createMockSupabase({ data: { baby }, error: null });
    const result = await getActiveBabyForUser(
      supabase.client as unknown as SupabaseClient,
      USER_ID,
    );
    expect(result).toEqual({
      id: baby.id,
      name: baby.name,
      birth_date: baby.birth_date,
      feeding_method: baby.feeding_method,
      created_by: baby.created_by,
    });
  });

  it("treats a soft-deleted baby as no active baby", async () => {
    const baby = babyRow({ deleted_at: "2026-04-28T00:00:00.000Z" });
    const supabase = createMockSupabase({ data: { baby }, error: null });
    const result = await getActiveBabyForUser(
      supabase.client as unknown as SupabaseClient,
      USER_ID,
    );
    expect(result).toBeNull();
  });
});
