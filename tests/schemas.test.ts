import { describe, it, expect } from "vitest";
import { careEventInputSchema, careEventUpdateSchema } from "@/lib/schemas";

const baseFeed = {
  baby_id: "00000000-0000-0000-0000-000000000001",
  caregiver_id: "00000000-0000-0000-0000-000000000002",
  event_type: "feed" as const,
  started_at: "2026-01-01T03:00:00.000Z",
};

describe("careEventInputSchema", () => {
  it("accepts a valid bottle feed event", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      metadata_json: { method: "bottle", amount: 90, unit: "ml", milk_type: "breastmilk" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid breast feed event with side + duration", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      metadata_json: { method: "breast", side: "left", duration_minutes: 12 },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid diaper event", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "diaper",
      metadata_json: { contents: "wet" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid soothing event", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "soothing",
      metadata_json: { technique: "rocking" },
    });
    expect(result.success).toBe(true);
  });

  it("accepts a valid note event", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "note",
      metadata_json: { text: "fussy after feed" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects an unknown event type", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "vitamin" as unknown as "feed",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a bottle feed event with non-positive amount", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      metadata_json: { method: "bottle", amount: 0, unit: "ml", milk_type: "formula" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a bottle feed event missing milk_type", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      metadata_json: { method: "bottle", amount: 60, unit: "oz" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a feed event with unknown metadata field", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      metadata_json: { method: "bottle", amount: 60, unit: "ml", milk_type: "formula", weight_oz: 7 },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a diaper event with missing contents", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "diaper",
      metadata_json: {},
    });
    expect(result.success).toBe(false);
  });

  it("accepts a diaper event with contents=dry", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "diaper",
      metadata_json: { contents: "dry" },
    });
    expect(result.success).toBe(true);
  });

  it("rejects a soothing event with unknown technique", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "soothing",
      metadata_json: { technique: "white-noise-machine" },
    });
    expect(result.success).toBe(false);
  });

  it("accepts new soothing techniques (white_noise, skin_to_skin, ...)", () => {
    for (const technique of [
      "rocking",
      "burping",
      "swaddle",
      "pacifier",
      "white_noise",
      "diaper_check",
      "feeding_attempt",
      "skin_to_skin",
      "other",
    ] as const) {
      const result = careEventInputSchema.safeParse({
        ...baseFeed,
        event_type: "soothing",
        metadata_json: { technique },
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects a note event with empty text", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "note",
      metadata_json: { text: "" },
    });
    expect(result.success).toBe(false);
  });

  it("rejects a note event longer than 280 chars", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "note",
      metadata_json: { text: "x".repeat(281) },
    });
    expect(result.success).toBe(false);
  });

  it("rejects ended_at before started_at", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      event_type: "sleep",
      ended_at: "2026-01-01T02:00:00.000Z",
      metadata_json: {},
    });
    expect(result.success).toBe(false);
  });

  it("rejects a non-uuid baby_id", () => {
    const result = careEventInputSchema.safeParse({
      ...baseFeed,
      baby_id: "not-a-uuid",
      metadata_json: { method: "bottle" },
    });
    expect(result.success).toBe(false);
  });
});

describe("careEventUpdateSchema", () => {
  it("accepts a partial patch", () => {
    const result = careEventUpdateSchema.safeParse({
      ended_at: "2026-01-01T04:00:00.000Z",
      duration_seconds: 600,
    });
    expect(result.success).toBe(true);
  });

  it("rejects unknown fields", () => {
    const result = careEventUpdateSchema.safeParse({
      baby_id: "00000000-0000-0000-0000-000000000001",
    });
    expect(result.success).toBe(false);
  });
});
