import { test, expect } from "@playwright/test";

/**
 * First-time onboarding end-to-end test.
 *
 * The Playwright web server runs Next.js with `NEXT_PUBLIC_SUPABASE_URL`
 * pointed at the in-process mock route at `/__e2e/supabase`. Both the
 * browser and the server-side Supabase clients hit that mock, so cookie
 * round-trips through middleware, server components, and route gating run
 * for real.
 */

const TEST_EMAIL = "newcaregiver@example.com";
const OTP_CODE = "123456";

test.describe("first-time onboarding", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("redirects unauthed users from protected routes to /login", async ({ page }) => {
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/login\?next=%2Fonboarding$/);

    await page.goto("/night");
    await expect(page).toHaveURL(/\/login\?next=%2Fnight$/);

    await page.goto("/handoff");
    await expect(page).toHaveURL(/\/login\?next=%2Fhandoff$/);
  });

  test("walks a new caregiver from sign-in through profile to night dashboard", async ({
    page,
  }) => {
    // 1. Land on /login.
    await page.goto("/login?next=/onboarding");
    await expect(
      page.getByRole("heading", { level: 1, name: /welcome to newborn night shift copilot/i }),
    ).toBeVisible();

    // 2. Submit email; mock returns 200, UI should swap to OTP step.
    await page.getByLabel(/email/i).fill(TEST_EMAIL);
    await page.getByRole("button", { name: /send sign-in code/i }).click();
    await expect(page.getByText(new RegExp(`We sent a 6-digit code to.*${TEST_EMAIL}`, "i"))).toBeVisible();

    // 3. Submit OTP; mock returns a session and supabase-js writes cookies.
    await page.getByLabel(/sign-in code/i).fill(OTP_CODE);
    await page.getByRole("button", { name: /verify and continue/i }).click();

    // 4. Land on /onboarding because we set ?next=/onboarding.
    await expect(page).toHaveURL(/\/onboarding$/);
    await expect(page.getByRole("heading", { name: /set up baby profile/i })).toBeVisible();

    // 5. Fill the baby profile.
    await page.getByLabel(/baby name/i).fill("Juniper");
    // The date input already has today's date pre-filled via defaultValue.
    await expect(page.getByLabel(/feeding method/i)).toBeVisible();
    await page.getByText("Combo", { exact: true }).click();

    // 6. Submit; server action inserts via mock; lands on /night.
    await page.getByRole("button", { name: /save and start tracking/i }).click();
    await expect(page).toHaveURL(/\/night$/);
    await expect(page.getByRole("heading", { name: /tracking juniper/i })).toBeVisible();

    // 7. Returning to /onboarding should now bounce back to /night because a
    //    baby exists.
    await page.goto("/onboarding");
    await expect(page).toHaveURL(/\/night$/);
  });

  test("shows a validation error when the email is malformed", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("not-an-email");
    await page.getByRole("button", { name: /send sign-in code/i }).click();
    await expect(page.getByRole("alert")).toContainText(/valid email/i);
  });
});
