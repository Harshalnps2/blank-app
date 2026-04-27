import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";

vi.mock("@/lib/auth", () => ({
  getCurrentUser: vi.fn(async () => null),
}));

import HomePage from "@/app/page";

async function renderHome() {
  // Server components return a Promise<JSX>. Resolve once and render.
  const ui = await HomePage();
  render(ui);
}

describe("HomePage", () => {
  it("shows the product name", async () => {
    await renderHome();
    expect(
      screen.getByRole("heading", { level: 1, name: /newborn night shift copilot/i }),
    ).toBeInTheDocument();
  });

  it("links to onboarding, night dashboard, and handoff", async () => {
    await renderHome();
    expect(screen.getByRole("link", { name: /onboarding/i })).toHaveAttribute(
      "href",
      "/onboarding",
    );
    expect(screen.getByRole("link", { name: /night dashboard/i })).toHaveAttribute(
      "href",
      "/night",
    );
    expect(screen.getByRole("link", { name: /handoff summary/i })).toHaveAttribute(
      "href",
      "/handoff",
    );
  });

  it("includes the not-medical-advice disclaimer", async () => {
    await renderHome();
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });

  it("shows a sign-in CTA when no user is signed in", async () => {
    await renderHome();
    expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/login");
  });
});
