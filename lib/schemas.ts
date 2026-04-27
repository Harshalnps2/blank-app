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

export const feedMetadataSchema = z
  .object({
    method: z.enum(["breast", "bottle"]),
    side: z.enum(["left", "right"]).optional(),
    amount_ml: z.number().int().nonnegative().max(500).optional(),
  })
  .strict();

export const diaperMetadataSchema = z
  .object({
    contents: z.enum(["wet", "dirty", "both"]),
  })
  .strict();

export const sleepMetadataSchema = z
  .object({
    location: z.enum(["bassinet", "crib", "contact", "other"]).optional(),
  })
  .strict();

export const soothingMetadataSchema = z
  .object({
    technique: z.enum(["rocking", "shushing", "swaddle", "pacifier", "walking", "other"]),
  })
  .strict();

export const noteMetadataSchema = z
  .object({
    text: z.string().min(1).max(280),
  })
  .strict();

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
