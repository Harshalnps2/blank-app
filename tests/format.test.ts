import { describe, it, expect } from "vitest";
import { formatBabyAge, formatDuration, formatTimeAgo, formatClockTime } from "@/lib/format";

describe("formatTimeAgo", () => {
  const now = new Date("2026-04-27T12:00:00Z");

  it("returns 'just now' under a minute", () => {
    expect(formatTimeAgo(new Date("2026-04-27T11:59:30Z"), now)).toBe("just now");
  });

  it("returns Nm ago under an hour", () => {
    expect(formatTimeAgo(new Date("2026-04-27T11:48:00Z"), now)).toBe("12m ago");
  });

  it("returns Hh Mm ago when over an hour", () => {
    expect(formatTimeAgo(new Date("2026-04-27T10:30:00Z"), now)).toBe("1h 30m ago");
  });

  it("returns Hh ago when minutes round to zero", () => {
    expect(formatTimeAgo(new Date("2026-04-27T09:00:00Z"), now)).toBe("3h ago");
  });

  it("returns Nd ago for >= 1 day", () => {
    expect(formatTimeAgo(new Date("2026-04-25T12:00:00Z"), now)).toBe("2d ago");
  });
});

describe("formatDuration", () => {
  it("under a minute is <1m", () => {
    expect(formatDuration(15_000)).toBe("<1m");
  });
  it("rounds minutes", () => {
    expect(formatDuration(7 * 60_000)).toBe("7m");
  });
  it("formats hours and minutes", () => {
    expect(formatDuration(2 * 3_600_000 + 5 * 60_000)).toBe("2h 5m");
  });
});

describe("formatBabyAge", () => {
  const now = new Date("2026-04-27T12:00:00Z");

  it("today on day zero", () => {
    expect(formatBabyAge("2026-04-27", now)).toBe("today");
  });

  it("days during week 1", () => {
    expect(formatBabyAge("2026-04-25", now)).toBe("2 days old");
  });

  it("weeks under 8 weeks", () => {
    expect(formatBabyAge("2026-04-06", now)).toBe("3 weeks");
  });

  it("months when older", () => {
    expect(formatBabyAge("2026-01-01", now)).toMatch(/months?$/);
  });

  it("falls back to 'newborn' on missing or bad input", () => {
    expect(formatBabyAge(null, now)).toBe("newborn");
    expect(formatBabyAge("not-a-date", now)).toBe("newborn");
  });
});

describe("formatClockTime", () => {
  it("returns a time string", () => {
    const result = formatClockTime(new Date("2026-04-27T03:42:00"));
    expect(result).toMatch(/3:42/);
  });
});
