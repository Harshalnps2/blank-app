import type { Page } from "@playwright/test";

const TEST_OTP = "123456";

/**
 * Drives a fresh caregiver through sign-in + onboarding so logging tests
 * start on /night with a baby ready to log against. Uses a unique email
 * per call so each test gets its own server-side baby in the e2e mock.
 */
export async function signInAndOnboard(
  page: Page,
  options: { babyName?: string } = {},
): Promise<{ email: string; babyName: string }> {
  const id = Math.random().toString(36).slice(2, 10);
  const email = `caregiver-${id}@example.com`;
  const babyName = options.babyName ?? `Baby-${id}`;

  await page.goto("/login?next=/onboarding");
  await page.getByLabel(/email/i).fill(email);
  await page.getByRole("button", { name: /send sign-in code/i }).click();
  await page.getByLabel(/sign-in code/i).fill(TEST_OTP);
  await page.getByRole("button", { name: /verify and continue/i }).click();

  await page.waitForURL(/\/onboarding$/);
  await page.getByLabel(/baby name/i).fill(babyName);
  await page.getByText("Combo", { exact: true }).click();
  await page.getByRole("button", { name: /save and start tracking/i }).click();

  await page.waitForURL(/\/night$/);
  return { email, babyName };
}
