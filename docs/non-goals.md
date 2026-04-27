# Non-Goals

These are out of scope for the MVP **and** the foreseeable roadmap. They are listed here so
that no contributor (human or AI) wastes time proposing or building them, and so that scope
creep is easy to identify in review.

## Medical / clinical
- **No medical diagnosis.** We do not tell users what a symptom means.
- **No symptom checker.** We do not accept symptom input and produce a possible-cause list.
- **No "is this normal?" assessments** of feed amounts, sleep duration, diaper output, weight,
  temperature, or anything else.
- **No personalized health recommendations.** We do not advise on diet, schedule, medication,
  supplements, or sleep environment.
- **No interpretation of pediatric guidelines.** We do not surface AAP / WHO / NHS recommendations
  as advice. We may link to them as external reading only if specifically scoped.

## Sleep / behavior
- **No sleep training.** No Ferber, no extinction, no graduated check-ins, no schedules.
- **No "drowsy but awake" coaching** or any behaviorist guidance.

## Sensing / monitoring
- **No cry detection.** We do not classify cries.
- **No camera monitoring.** We do not access the camera.
- **No audio monitoring.** We do not record or analyze ambient audio.
- **No wearable integrations** (Owlet, Nanit, Snoo, Apple Health, Google Fit, etc.) in the MVP.

## Commerce / community
- **No product recommendations.** No bottle, formula, swaddle, monitor, or mattress suggestions.
- **No affiliate links.** No e-commerce.
- **No community / forum / social features.** No comment threads, no group chats, no sharing
  beyond direct caregiver handoff.

## AI behavior (when AI eventually ships)
- AI does **not** invent medical information.
- AI does **not** name conditions.
- AI does **not** recommend treatment, schedules, or products.
- AI **only** summarizes or rephrases events the user logged. Every AI surface carries a
  "not medical advice" disclaimer.

## Why this list exists
A list of non-goals is more useful than a list of goals when the risk of the wrong feature is
high. For this product, the wrong feature isn't just useless — it can mislead an exhausted
parent at 3am. Defaulting to "no" keeps us honest.
