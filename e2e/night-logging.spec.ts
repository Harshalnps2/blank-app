import { test, expect } from "@playwright/test";
import { signInAndOnboard } from "./helpers/onboarding-fixture";

test.describe("night dashboard quick logging", () => {
  test.beforeEach(async ({ context }) => {
    await context.clearCookies();
  });

  test("logs a bottle feed and shows it as the last feed", async ({ page }) => {
    await signInAndOnboard(page);

    await page.getByTestId("quick-action-feed").click();
    await page.getByTestId("feed-method-bottle").click();
    await page.getByTestId("feed-amount").fill("90");
    await page.getByTestId("feed-milk-type-formula").click();
    await page.getByTestId("feed-submit").click();

    await expect(page.getByTestId("toast")).toHaveAttribute("data-tone", "success");
    await expect(page.getByTestId("last-feed-primary")).toHaveText(/bottle.*90ml.*formula/i);
    await expect(
      page.locator('[data-testid="timeline-item"][data-event-type="feed"]').first(),
    ).toContainText(/bottle.*90ml/i);
  });

  test("logs a wet diaper in two taps and updates the last diaper card", async ({ page }) => {
    await signInAndOnboard(page);

    await page.getByTestId("quick-action-diaper").click();
    await page.getByTestId("diaper-wet").click();

    await expect(page.getByTestId("toast")).toHaveAttribute("data-tone", "success");
    await expect(page.getByTestId("last-diaper-primary")).toHaveText("Wet");
    await expect(
      page.locator('[data-testid="timeline-item"][data-event-type="diaper"]').first(),
    ).toContainText("Wet");
  });

  test("starts and ends a sleep, surfacing the running duration", async ({ page }) => {
    await signInAndOnboard(page);

    // Start via the quick action so we exercise the sheet path.
    await page.getByTestId("quick-action-sleep").click();
    await page.getByTestId("sleep-location-bassinet").click();
    await page.getByTestId("sleep-start").click();

    await expect(page.getByTestId("sleep-status")).toHaveAttribute("data-state", "sleeping");
    await expect(page.getByTestId("sleep-duration")).toBeVisible();
    await expect(
      page.locator('[data-testid="timeline-item"][data-event-type="sleep"]').first(),
    ).toContainText(/Sleep.*bassinet/i);

    await page.getByTestId("end-sleep").click();
    await expect(page.getByTestId("sleep-status")).toHaveAttribute("data-state", "awake");
    await expect(page.getByTestId("toast")).toContainText(/Sleep ended|Saved/i);
  });

  test("logs a soothing technique with a single tap", async ({ page }) => {
    await signInAndOnboard(page);

    await page.getByTestId("quick-action-soothing").click();
    await page.getByTestId("soothing-rocking").click();

    await expect(page.getByTestId("toast")).toHaveAttribute("data-tone", "success");
    await expect(
      page.locator('[data-testid="timeline-item"][data-event-type="soothing"]').first(),
    ).toContainText("Rocking");
  });

  test("logs a freeform note", async ({ page }) => {
    await signInAndOnboard(page);

    await page.getByTestId("quick-action-note").click();
    await page.getByTestId("note-text").fill("Fussy after feed");
    await page.getByTestId("note-submit").click();

    await expect(page.getByTestId("toast")).toHaveAttribute("data-tone", "success");
    await expect(
      page.locator('[data-testid="timeline-item"][data-event-type="note"]').first(),
    ).toContainText("Fussy after feed");
  });

  test("last feed and last diaper update independently as new events are logged", async ({
    page,
  }) => {
    await signInAndOnboard(page);

    // Initial empty state.
    await expect(page.getByTestId("last-feed-primary")).toHaveText("No feed yet");
    await expect(page.getByTestId("last-diaper-primary")).toHaveText("No diaper yet");

    // Log a feed, then a diaper.
    await page.getByTestId("quick-action-feed").click();
    await page.getByTestId("feed-method-breast").click();
    await page.getByTestId("feed-side-right").click();
    await page.getByTestId("feed-submit").click();
    await expect(page.getByTestId("last-feed-primary")).toContainText(/right side/i);
    await expect(page.getByTestId("last-diaper-primary")).toHaveText("No diaper yet");

    await page.getByTestId("quick-action-diaper").click();
    await page.getByTestId("diaper-dirty").click();
    await expect(page.getByTestId("last-diaper-primary")).toHaveText("Dirty");
    // Last feed should still reflect the breast feed.
    await expect(page.getByTestId("last-feed-primary")).toContainText(/right side/i);

    // Logging a second diaper should overwrite the diaper card but leave feed alone.
    await page.getByTestId("quick-action-diaper").click();
    await page.getByTestId("diaper-dry").click();
    await expect(page.getByTestId("last-diaper-primary")).toHaveText("Dry");
    await expect(page.getByTestId("last-feed-primary")).toContainText(/right side/i);
  });
});
