import { defineConfig, devices } from "@playwright/test";

/**
 * For end-to-end tests we run a single Next.js process and point the
 * Supabase URL at an in-process mock route (`app/__e2e/supabase`). Both the
 * browser supabase client and the server-side client send their requests to
 * the same handler, so a real session round-trip is exercised through
 * middleware and route gating.
 *
 * The mock route only activates when `NEXT_PUBLIC_E2E_MOCK === "true"`, so
 * it cannot ship enabled in production.
 */
const E2E_BASE_URL = "http://localhost:3000";
const E2E_SUPABASE_URL = `${E2E_BASE_URL}/e2e-mock/supabase`;
const E2E_SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." +
  "eyJyb2xlIjoiYW5vbiIsImlzcyI6InN0dWIifQ." +
  "stub-signature";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: E2E_BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: {
    command: "npm run build && npm run start -- --port 3000",
    url: E2E_BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      NEXT_PUBLIC_SUPABASE_URL: E2E_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: E2E_SUPABASE_ANON_KEY,
      NEXT_PUBLIC_E2E_MOCK: "true",
    },
  },
});
