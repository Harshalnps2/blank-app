import { test, expect } from "@playwright/test";

test("homepage shows product name and primary nav links", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { level: 1, name: /newborn night shift copilot/i }),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: /onboarding/i })).toHaveAttribute(
    "href",
    "/onboarding",
  );
  await expect(page.getByRole("link", { name: /night dashboard/i })).toHaveAttribute(
    "href",
    "/night",
  );
  await expect(page.getByRole("link", { name: /handoff summary/i })).toHaveAttribute(
    "href",
    "/handoff",
  );
});
