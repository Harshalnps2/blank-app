import { describe, it, expect } from "vitest";
import { babyProfileInputSchema, emailSchema, otpTokenSchema } from "@/lib/schemas";

describe("babyProfileInputSchema", () => {
  it("accepts a complete profile", () => {
    const result = babyProfileInputSchema.safeParse({
      name: "Juniper",
      birth_date: "2026-04-01",
      feeding_method: "combo",
    });
    expect(result.success).toBe(true);
  });

  it("trims whitespace from name", () => {
    const result = babyProfileInputSchema.parse({
      name: "   Juniper   ",
      birth_date: "2026-04-01",
      feeding_method: "breast",
    });
    expect(result.name).toBe("Juniper");
  });

  it("rejects an empty name", () => {
    const result = babyProfileInputSchema.safeParse({
      name: "   ",
      birth_date: "2026-04-01",
      feeding_method: "breast",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a malformed birth_date", () => {
    const result = babyProfileInputSchema.safeParse({
      name: "Juniper",
      birth_date: "tomorrow",
      feeding_method: "breast",
    });
    expect(result.success).toBe(false);
  });

  it("rejects unknown feeding_method values", () => {
    const result = babyProfileInputSchema.safeParse({
      name: "Juniper",
      birth_date: "2026-04-01",
      feeding_method: "formula",
    });
    expect(result.success).toBe(false);
  });
});

describe("emailSchema", () => {
  it("normalizes email to lowercase + trimmed", () => {
    expect(emailSchema.parse("  Caregiver@Example.COM ")).toBe("caregiver@example.com");
  });

  it("rejects non-emails", () => {
    expect(emailSchema.safeParse("not-an-email").success).toBe(false);
  });
});

describe("otpTokenSchema", () => {
  it("accepts a 6-digit code", () => {
    expect(otpTokenSchema.safeParse("123456").success).toBe(true);
  });

  it("rejects shorter / non-numeric codes", () => {
    expect(otpTokenSchema.safeParse("12345").success).toBe(false);
    expect(otpTokenSchema.safeParse("12345a").success).toBe(false);
    expect(otpTokenSchema.safeParse("1234567").success).toBe(false);
  });
});
