# AGENTS.md

Operating guide for any human or AI agent contributing to **Newborn Night Shift Copilot**.

## What this product is
A mobile-first PWA that helps exhausted newborn caregivers log overnight feeds, diapers, sleep,
and soothing attempts, then create a clear caregiver handoff summary.

## What this product is not
- It is **not** a medical device.
- It is **not** a sleep training program, cry analyzer, camera monitor, or device hub.
- It does **not** sell or recommend products.
- It does **not** diagnose, treat, or advise on medical conditions.

## Product principles (read these first)
1. **Capture must be faster than memory.** One-handed, low-light, sleep-deprived users.
2. **Caregiver-support, not medical diagnosis.** No medical advice, ever.
3. **AI must never invent medical information.** When AI lands, it explains logged events in
   plain language. It does not interpret symptoms.
4. **Validate real overnight usage before adding features.** Inspired-style discovery: is the
   product valuable, usable, feasible, viable?
5. **Quick logging and handoff before AI copilot.** Earn the right to add AI by first proving the
   manual flow is loved.

See `docs/product-principles.md`, `docs/mvp-scope.md`, and `docs/non-goals.md` for the binding
versions of the above.

## Tech stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **Backend / auth / db:** Supabase (Postgres)
- **Validation:** Zod
- **Unit tests:** Vitest + Testing Library
- **E2E tests:** Playwright
- **Lint / format:** ESLint + Prettier

## Repository layout
```
app/                Next.js routes (App Router)
  page.tsx          Homepage with links to onboarding / night / handoff
  onboarding/       Caregiver + baby setup
  night/            Overnight logging dashboard
  handoff/          Handoff summary
lib/                Shared client-safe utilities (env, supabase, zod schemas)
tests/              Vitest unit + component tests
e2e/                Playwright tests
docs/               Product docs (principles, scope, non-goals)
```

## Coding standards
- TypeScript `strict` is on. Do not weaken it. Do not introduce `any` to silence the compiler.
- Validate every external input (URL params, form data, Supabase rows being trusted as domain
  objects, fetch responses) with a Zod schema in `lib/schemas.ts`.
- Server components by default. Add `"use client"` only when interactivity requires it.
- Tailwind classes only — no ad-hoc CSS files outside `app/globals.css`.
- Filenames: kebab-case for routes, PascalCase for React components, camelCase for helpers.
- Keep files small. If a route handler grows past ~150 lines, split it.
- No comments restating what code already says. Comments explain **why**, not **what**.
- No dead code, no commented-out blocks, no `// TODO` without an owner and a linked issue.

## UX standards
- Tap targets ≥ 44px. The global stylesheet enforces a floor on `button` / `a`.
- Dark, low-contrast-friendly palette by default. Bright flashes are not allowed.
- Primary actions are reachable with one thumb.
- Logging an event is at most two taps from the night dashboard.

## Testing expectations
- Every new schema gets a Vitest test covering at least one valid and one invalid case.
- Every new page gets a Vitest render test asserting key copy and links.
- Every new user-visible flow gets a Playwright e2e covering the happy path.
- Run before pushing:
  ```bash
  npm run lint
  npm run typecheck
  npm test
  ```
- Run `npm run e2e` when changing routes or layout. CI may run a subset.

## Safety constraints (non-negotiable)
- Do not add features that diagnose, recommend treatment, or characterize a baby's condition.
- Do not add cry detection, sleep training, camera/audio monitoring, device integrations, social
  / community features, or product recommendations. See `docs/non-goals.md`.
- Any AI-generated copy must be clearly labeled and must include a "not medical advice"
  disclaimer in the same surface.
- Never log PII to third parties. Supabase is the system of record.
- Never ship a screen that lets a user type a symptom and get an AI answer.

## Working agreement for AI agents
- Stay inside `docs/mvp-scope.md`. If a request expands scope, push back and ask.
- Prefer editing existing files over creating new ones.
- Run `npm run lint && npm run typecheck && npm test` before declaring work done. Report any
  failures verbatim.
- Do not invent data, schemas, or APIs. If something isn't in the repo or the docs, ask.
