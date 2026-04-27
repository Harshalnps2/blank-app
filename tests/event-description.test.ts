import { describe, it, expect } from "vitest";
import {
  describeDiaper,
  describeEvent,
  describeFeed,
  describeNote,
  describeSleep,
  describeSoothing,
  eventTypeLabel,
} from "@/lib/event-description";
import type { CareEventsRow } from "@/lib/database.types";

describe("describeFeed", () => {
  it("formats a breast feed with side only", () => {
    expect(describeFeed({ method: "breast", side: "right" })).toBe("Breast · right side");
  });

  it("formats a breast feed with side + duration", () => {
    expect(describeFeed({ method: "breast", side: "both", duration_minutes: 15 })).toBe(
      "Breast · both sides · 15m",
    );
  });

  it("formats a bottle feed with milk type", () => {
    expect(
      describeFeed({ method: "bottle", amount: 90, unit: "ml", milk_type: "breastmilk" }),
    ).toBe("Bottle · 90ml · breastmilk");
  });
});

describe("describeDiaper", () => {
  it("labels each contents value", () => {
    expect(describeDiaper({ contents: "wet" })).toBe("Wet");
    expect(describeDiaper({ contents: "dirty" })).toBe("Dirty");
    expect(describeDiaper({ contents: "both" })).toBe("Wet + dirty");
    expect(describeDiaper({ contents: "dry" })).toBe("Dry");
  });
});

describe("describeSoothing", () => {
  it("uses friendly labels", () => {
    expect(describeSoothing({ technique: "rocking" })).toBe("Rocking");
    expect(describeSoothing({ technique: "white_noise" })).toBe("White noise");
    expect(describeSoothing({ technique: "skin_to_skin" })).toBe("Skin-to-skin");
  });
});

describe("describeSleep + describeNote", () => {
  it("includes location when present", () => {
    expect(describeSleep({ location: "bassinet" })).toBe("Sleep · bassinet");
    expect(describeSleep({})).toBe("Sleep");
  });

  it("returns the note text", () => {
    expect(describeNote({ text: "fussy" })).toBe("fussy");
  });
});

describe("describeEvent", () => {
  it("dispatches based on event_type", () => {
    const row: CareEventsRow = {
      id: "x",
      baby_id: "x",
      caregiver_id: "x",
      night_shift_id: null,
      event_type: "diaper",
      started_at: "2026-01-01T00:00:00Z",
      ended_at: null,
      duration_seconds: null,
      metadata_json: { contents: "dry" },
      source: "manual",
      created_at: "x",
      updated_at: "x",
      deleted_at: null,
    };
    expect(describeEvent(row)).toBe("Dry");
  });
});

describe("eventTypeLabel", () => {
  it("returns capitalized labels", () => {
    expect(eventTypeLabel("feed")).toBe("Feed");
    expect(eventTypeLabel("diaper")).toBe("Diaper");
    expect(eventTypeLabel("sleep")).toBe("Sleep");
    expect(eventTypeLabel("soothing")).toBe("Soothing");
    expect(eventTypeLabel("note")).toBe("Note");
  });
});
