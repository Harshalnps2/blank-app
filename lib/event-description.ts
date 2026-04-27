/**
 * One-line, plain-language descriptions of care events. Used in the
 * dashboard summary cards, timeline, and confirmation toasts so the same
 * wording appears everywhere a caregiver sees an event.
 */

import type { CareEventsRow } from "./database.types";
import type {
  DiaperMetadata,
  FeedMetadata,
  NoteMetadata,
  SleepMetadata,
  SoothingMetadata,
} from "./schemas";

const SOOTHING_LABELS: Record<SoothingMetadata["technique"], string> = {
  rocking: "Rocking",
  burping: "Burping",
  swaddle: "Swaddle",
  pacifier: "Pacifier",
  white_noise: "White noise",
  diaper_check: "Diaper check",
  feeding_attempt: "Feeding attempt",
  skin_to_skin: "Skin-to-skin",
  other: "Other",
};

const SLEEP_LOCATION_LABELS: Record<NonNullable<SleepMetadata["location"]>, string> = {
  bassinet: "bassinet",
  crib: "crib",
  contact: "contact",
  stroller: "stroller",
  carrier: "carrier",
  other: "other",
};

const DIAPER_LABELS: Record<DiaperMetadata["contents"], string> = {
  wet: "Wet",
  dirty: "Dirty",
  both: "Wet + dirty",
  dry: "Dry",
};

export function describeFeed(meta: FeedMetadata): string {
  if (meta.method === "breast") {
    const side =
      meta.side === "both" ? "both sides" : meta.side === "left" ? "left side" : "right side";
    if (meta.duration_minutes != null) {
      return `Breast · ${side} · ${meta.duration_minutes}m`;
    }
    return `Breast · ${side}`;
  }
  return `Bottle · ${meta.amount}${meta.unit} · ${meta.milk_type.replace("_", " ")}`;
}

export function describeDiaper(meta: DiaperMetadata): string {
  return DIAPER_LABELS[meta.contents];
}

export function describeSoothing(meta: SoothingMetadata): string {
  return SOOTHING_LABELS[meta.technique];
}

export function describeSleep(meta: SleepMetadata): string {
  if (meta.location) return `Sleep · ${SLEEP_LOCATION_LABELS[meta.location]}`;
  return "Sleep";
}

export function describeNote(meta: NoteMetadata): string {
  return meta.text;
}

export function describeEvent(event: CareEventsRow): string {
  const meta = (event.metadata_json ?? {}) as Record<string, unknown>;
  switch (event.event_type) {
    case "feed":
      return describeFeed(meta as unknown as FeedMetadata);
    case "diaper":
      return describeDiaper(meta as unknown as DiaperMetadata);
    case "sleep":
      return describeSleep(meta as unknown as SleepMetadata);
    case "soothing":
      return describeSoothing(meta as unknown as SoothingMetadata);
    case "note":
      return describeNote(meta as unknown as NoteMetadata);
  }
}

export function eventTypeLabel(type: CareEventsRow["event_type"]): string {
  switch (type) {
    case "feed":
      return "Feed";
    case "diaper":
      return "Diaper";
    case "sleep":
      return "Sleep";
    case "soothing":
      return "Soothing";
    case "note":
      return "Note";
  }
}
