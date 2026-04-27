import { z } from "zod";

/**
 * Domain schemas for the MVP.
 *
 * Care events ride a single `care_events` table with discriminated metadata,
 * so the Zod schema is split into:
 *   - per-type metadata schemas (validate the metadata_json blob)
 *   - a row-level input schema (what the repository accepts)
 *   - a discriminated union for typed event creation in higher-level code
 */

export const careEventTypeSchema = z.enum(["feed", "diaper", "sleep", "soothing", "note"]);
export type CareEventTypeName = z.infer<typeof careEventTypeSchema>;

export const careEventSourceSchema = z.enum(["manual", "ai_parsed", "system"]);
export type CareEventSourceName = z.infer<typeof careEventSourceSchema>;

// -----------------------------------------------------------------------------
// Metadata schemas (validate the contents of care_events.metadata_json)
// -----------------------------------------------------------------------------

export const breastSideSchema = z.enum(["left", "right", "both"]);
export type BreastSide = z.infer<typeof breastSideSchema>;

export const bottleUnitSchema = z.enum(["ml", "oz"]);
export type BottleUnit = z.infer<typeof bottleUnitSchema>;

export const milkTypeSchema = z.enum(["breastmilk", "formula", "donor"]);
export type MilkType = z.infer<typeof milkTypeSchema>;

const breastFeedMetadataSchema = z
  .object({
    method: z.literal("breast"),
    side: breastSideSchema,
    duration_minutes: z.number().int().min(0).max(240).optional(),
  })
  .strict();

const bottleFeedMetadataSchema = z
  .object({
    method: z.literal("bottle"),
    amount: z.number().positive().max(500),
    unit: bottleUnitSchema,
    milk_type: milkTypeSchema,
  })
  .strict();

export const feedMetadataSchema = z.discriminatedUnion("method", [
  breastFeedMetadataSchema,
  bottleFeedMetadataSchema,
]);
export type FeedMetadata = z.infer<typeof feedMetadataSchema>;

export const diaperContentsSchema = z.enum(["wet", "dirty", "both", "dry"]);
export type DiaperContents = z.infer<typeof diaperContentsSchema>;

export const diaperMetadataSchema = z
  .object({
    contents: diaperContentsSchema,
    note: z.string().trim().max(280).optional(),
  })
  .strict();
export type DiaperMetadata = z.infer<typeof diaperMetadataSchema>;

export const sleepLocationSchema = z.enum([
  "bassinet",
  "crib",
  "contact",
  "stroller",
  "carrier",
  "other",
]);
export type SleepLocation = z.infer<typeof sleepLocationSchema>;

export const sleepMetadataSchema = z
  .object({
    location: sleepLocationSchema.optional(),
  })
  .strict();
export type SleepMetadata = z.infer<typeof sleepMetadataSchema>;

export const soothingTechniqueSchema = z.enum([
  "rocking",
  "burping",
  "swaddle",
  "pacifier",
  "white_noise",
  "diaper_check",
  "feeding_attempt",
  "skin_to_skin",
  "other",
]);
export type SoothingTechnique = z.infer<typeof soothingTechniqueSchema>;

export const soothingMetadataSchema = z
  .object({
    technique: soothingTechniqueSchema,
  })
  .strict();
export type SoothingMetadata = z.infer<typeof soothingMetadataSchema>;

export const noteMetadataSchema = z
  .object({
    text: z.string().trim().min(1, "Add a note before saving.").max(280),
  })
  .strict();
export type NoteMetadata = z.infer<typeof noteMetadataSchema>;

// -----------------------------------------------------------------------------
// Row-level input schema (what the repository accepts)
// -----------------------------------------------------------------------------

const uuid = z.string().uuid();
const isoDateTime = z.string().datetime({ offset: true });

export const careEventInputSchema = z
  .object({
    baby_id: uuid,
    caregiver_id: uuid,
    night_shift_id: uuid.nullable().optional(),
    event_type: careEventTypeSchema,
    started_at: isoDateTime,
    ended_at: isoDateTime.nullable().optional(),
    duration_seconds: z.number().int().nonnegative().nullable().optional(),
    metadata_json: z.unknown().optional(),
    source: careEventSourceSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.ended_at && new Date(value.ended_at) < new Date(value.started_at)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["ended_at"],
        message: "ended_at must be greater than or equal to started_at",
      });
    }

    const meta = value.metadata_json ?? {};
    const validators: Record<CareEventTypeName, z.ZodTypeAny> = {
      feed: feedMetadataSchema,
      diaper: diaperMetadataSchema,
      sleep: sleepMetadataSchema,
      soothing: soothingMetadataSchema,
      note: noteMetadataSchema,
    };
    const result = validators[value.event_type].safeParse(meta);
    if (!result.success) {
      for (const issue of result.error.issues) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["metadata_json", ...issue.path],
          message: issue.message,
        });
      }
    }
  });

export type CareEventInput = z.infer<typeof careEventInputSchema>;

export const careEventUpdateSchema = z
  .object({
    night_shift_id: uuid.nullable().optional(),
    event_type: careEventTypeSchema.optional(),
    started_at: isoDateTime.optional(),
    ended_at: isoDateTime.nullable().optional(),
    duration_seconds: z.number().int().nonnegative().nullable().optional(),
    metadata_json: z.unknown().optional(),
    source: careEventSourceSchema.optional(),
  })
  .strict();

export type CareEventUpdateInput = z.infer<typeof careEventUpdateSchema>;

// -----------------------------------------------------------------------------
// Logging intents (what the night dashboard sends; the server enriches them
// with baby_id / caregiver_id and forwards to the repository).
// -----------------------------------------------------------------------------

export const logFeedIntentSchema = z.object({
  type: z.literal("feed"),
  metadata: feedMetadataSchema,
  started_at: isoDateTime.optional(),
});

export const logDiaperIntentSchema = z.object({
  type: z.literal("diaper"),
  metadata: diaperMetadataSchema,
  started_at: isoDateTime.optional(),
});

export const logSleepStartIntentSchema = z.object({
  type: z.literal("sleep"),
  metadata: sleepMetadataSchema,
  started_at: isoDateTime.optional(),
});

export const logSoothingIntentSchema = z.object({
  type: z.literal("soothing"),
  metadata: soothingMetadataSchema,
  started_at: isoDateTime.optional(),
});

export const logNoteIntentSchema = z.object({
  type: z.literal("note"),
  metadata: noteMetadataSchema,
  started_at: isoDateTime.optional(),
});

export const logCareEventIntentSchema = z.discriminatedUnion("type", [
  logFeedIntentSchema,
  logDiaperIntentSchema,
  logSleepStartIntentSchema,
  logSoothingIntentSchema,
  logNoteIntentSchema,
]);
export type LogCareEventIntent = z.infer<typeof logCareEventIntentSchema>;

// -----------------------------------------------------------------------------
// Auth + onboarding
// -----------------------------------------------------------------------------

export const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email address.");

export const otpTokenSchema = z
  .string()
  .trim()
  .regex(/^\d{6}$/, "Enter the 6-digit code from your email.");

export const feedingMethodSchema = z.enum(["breast", "bottle", "combo", "unknown"]);
export type FeedingMethodName = z.infer<typeof feedingMethodSchema>;

export const babyProfileInputSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Add a name (or nickname) for your baby.")
    .max(80, "Name is too long."),
  birth_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use the date picker to set a valid date."),
  feeding_method: feedingMethodSchema,
});

export type BabyProfileInput = z.infer<typeof babyProfileInputSchema>;
