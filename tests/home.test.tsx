import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import HomePage from "@/app/page";

describe("HomePage", () => {
  it("shows the product name", () => {
    render(<HomePage />);
    expect(
      screen.getByRole("heading", { level: 1, name: /newborn night shift copilot/i }),
    ).toBeInTheDocument();
  });

  it("links to onboarding, night dashboard, and handoff", () => {
    render(<HomePage />);
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

  it("includes the not-medical-advice disclaimer", () => {
    render(<HomePage />);
    expect(screen.getByText(/not medical advice/i)).toBeInTheDocument();
  });
});
