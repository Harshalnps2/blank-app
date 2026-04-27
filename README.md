# Newborn Night Shift Copilot

Mobile-first PWA that helps exhausted newborn caregivers log overnight feeds, diapers, sleep,
and soothing — and produces a clear handoff summary for the next caregiver.

> Caregiver-support software. **Not medical advice.**

## Read these first
- [`AGENTS.md`](./AGENTS.md) — operating rules for contributors (human or AI)
- [`docs/product-principles.md`](./docs/product-principles.md)
- [`docs/mvp-scope.md`](./docs/mvp-scope.md)
- [`docs/non-goals.md`](./docs/non-goals.md)

## Stack
Next.js (App Router), TypeScript, Tailwind, Supabase (Postgres), Zod, Vitest, Playwright,
ESLint, Prettier.

## Local setup
```bash
npm install
cp .env.example .env.local   # then fill in Supabase values
npm run dev
```

## Scripts
| Script              | What it does                       |
| ------------------- | ---------------------------------- |
| `npm run dev`       | Next.js dev server                 |
| `npm run build`     | Production build                   |
| `npm run lint`      | ESLint                             |
| `npm run typecheck` | `tsc --noEmit`                     |
| `npm test`          | Vitest unit + component tests      |
| `npm run e2e`       | Playwright end-to-end tests        |
| `npm run format`    | Prettier write                     |
