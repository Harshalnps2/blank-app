import { describe, it, expect } from "vitest";
import { logCareEventIntentSchema } from "@/lib/schemas";

describe("logCareEventIntentSchema", () => {
  it("accepts a breast feed intent", () => {
    expect(
      logCareEventIntentSchema.safeParse({
        type: "feed",
        metadata: { method: "breast", side: "left" },
      }).success,
    ).toBe(true);
  });

  it("accepts a bottle feed intent with full metadata", () => {
    expect(
      logCareEventIntentSchema.safeParse({
        type: "feed",
        metadata: { method: "bottle", amount: 60, unit: "oz", milk_type: "formula" },
      }).success,
    ).toBe(true);
  });

  it("rejects a bottle feed intent without amount", () => {
    expect(
      logCareEventIntentSchema.safeParse({
        type: "feed",
        metadata: { method: "bottle", unit: "ml", milk_type: "formula" },
      }).success,
    ).toBe(false);
  });

  it("accepts each diaper contents value", () => {
    for (const contents of ["wet", "dirty", "both", "dry"] as const) {
      expect(
        logCareEventIntentSchema.safeParse({ type: "diaper", metadata: { contents } }).success,
      ).toBe(true);
    }
  });

  it("accepts a sleep start with no metadata", () => {
    expect(
      logCareEventIntentSchema.safeParse({ type: "sleep", metadata: {} }).success,
    ).toBe(true);
  });

  it("accepts a soothing intent for the new techniques", () => {
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
      expect(
        logCareEventIntentSchema.safeParse({ type: "soothing", metadata: { technique } })
          .success,
      ).toBe(true);
    }
  });

  it("rejects a note intent with empty text", () => {
    expect(
      logCareEventIntentSchema.safeParse({ type: "note", metadata: { text: "  " } }).success,
    ).toBe(false);
  });

  it("rejects an unknown type", () => {
    expect(
      logCareEventIntentSchema.safeParse({ type: "vitamin", metadata: {} }).success,
    ).toBe(false);
  });
});
