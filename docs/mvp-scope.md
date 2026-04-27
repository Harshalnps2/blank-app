# MVP Scope

The MVP exists to answer one question: **does a structured overnight logger plus a clear
handoff summary save real caregivers real time and reduce real friction?**

If the answer is yes, we earn the right to build more. If not, we change course before adding
AI.

## In scope

### 1. Onboarding
- Create an account (Supabase auth).
- Create a baby (name, birth date).
- Add up to two co-caregivers by email.

### 2. Night dashboard
- One-tap logging for:
  - Feed (breast or bottle, optional amount in ml)
  - Diaper (wet, dirty, both)
  - Sleep (start, end)
  - Soothing (technique selected from a fixed list)
  - Note (free-text up to 280 chars)
- Default timestamps to "now."
- Most recent events visible without scrolling.
- Edit or delete the most recent event of each type.

### 3. Handoff summary
- Shareable plain-language summary of the last shift.
- Counts and timing of feeds, diapers, sleep blocks, and soothing attempts.
- The most recent free-text notes.
- Export as text (copy to clipboard) and as a shareable link to the next caregiver.

### 4. Foundations
- Mobile-first PWA shell.
- Dark, low-light-friendly default theme.
- Supabase Postgres schema with row-level security tying babies to authorized caregivers.
- Audit log for any data mutation.

## Success criteria for the MVP

| Metric                                  | Target                       |
| --------------------------------------- | ---------------------------- |
| Median time to log an event             | ≤ 4 seconds                  |
| Caregivers who log ≥ 3 nights in week 1 | ≥ 50% of activated accounts  |
| Caregivers who share ≥ 1 handoff        | ≥ 40% of activated accounts  |
| Self-reported "would miss it if gone"   | ≥ 40% (Sean Ellis-style)     |

If we miss these, we change the manual flow before adding anything new.

## Explicitly deferred (post-MVP)
- AI handoff narrative generation.
- AI explanation of patterns in the user's own events.
- Multi-baby households.
- Pediatrician sharing.
- Web/desktop layouts beyond mobile-first responsive.
- Internationalization beyond English.

## Out of scope forever
See `docs/non-goals.md`.
