# Product Principles

These are the binding rules for what we build, in priority order. When in conflict, the
higher-numbered principle yields to the lower one.

## 1. Capture must be faster than memory
A sleep-deprived caregiver at 3am has seconds, not minutes. Every screen, every interaction, and
every default is judged against the question: *can a half-asleep person do this with one thumb,
in the dark, without thinking?*

Concrete rules:
- Logging an event takes at most two taps from the night dashboard.
- No required text input to log a feed, diaper, sleep, or soothing.
- Default values (timestamp = now, last-used method, last-used side) are pre-filled.
- The UI works with the phone held in either hand.
- Dark, low-glare palette by default. No bright flashes.

## 2. Caregiver-support software, not medical diagnosis
We are a notebook with structure, not a clinician. We help caregivers remember and communicate
what happened. We do not interpret what it means medically.

Concrete rules:
- No symptom checkers.
- No "is this normal?" features.
- No personalized health recommendations.
- Every AI surface includes a "not medical advice" disclaimer.
- Anything that looks like medical guidance is rejected in code review.

## 3. AI must never invent medical advice
When AI features eventually ship, they will summarize and translate the user's own logged
events. They will not introduce facts the user did not provide.

Concrete rules:
- AI output is always grounded in the user's logged events.
- AI never names conditions, recommends treatment, or judges whether something is a problem.
- AI surfaces always cite which logged events they drew from.
- A failure mode of "AI hallucinated a recommendation" is treated as a Sev 1 bug.

## 4. Validate real overnight usage before building advanced features
We are following Inspired-style discovery: is the product **valuable, usable, feasible, and
viable?** We do not build the next feature until the current one has been used by real
caregivers across real nights.

Concrete rules:
- Each feature has an explicit hypothesis and a way to know if it failed.
- We measure: nights logged, events per night, handoff summaries shared, return usage.
- We do not ship a feature whose only justification is "it would be cool."

## 5. Prioritize quick logging and handoff before AI copilot
The manual flow must be loved before AI is introduced. AI cannot rescue a clunky logger.

Concrete rules:
- AI features are gated behind a working, validated manual flow.
- The roadmap order is: log → handoff → AI explanation of own events.
- If quick logging is not loved, AI is not the answer.

## 6. One-handed, low-light, sleep-deprived use is the design constraint
Every visual and interaction choice is judged against this user, not a well-rested designer
reviewing in daylight.

Concrete rules:
- Minimum tap target: 44px.
- Body text minimum: 16px.
- No modal dialogs that require precise dismissal.
- No animations longer than 200ms on the critical logging path.
