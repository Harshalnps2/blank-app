/**
 * Tiny formatting helpers tuned for the night dashboard.
 *
 * No internationalization, no localization — the MVP ships English-only.
 * `now()` is parameterized so callers (and tests) can pin time.
 */

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

export function formatTimeAgo(when: string | Date, now: Date = new Date()): string {
  const past = typeof when === "string" ? new Date(when) : when;
  const diff = Math.max(0, now.getTime() - past.getTime());

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const m = Math.round(diff / MINUTE);
    return `${m}m ago`;
  }
  if (diff < DAY) {
    const h = Math.floor(diff / HOUR);
    const m = Math.round((diff % HOUR) / MINUTE);
    return m === 0 ? `${h}h ago` : `${h}h ${m}m ago`;
  }
  const d = Math.floor(diff / DAY);
  return `${d}d ago`;
}

export function formatDuration(milliseconds: number): string {
  const ms = Math.max(0, milliseconds);
  if (ms < MINUTE) return "<1m";
  if (ms < HOUR) {
    const m = Math.round(ms / MINUTE);
    return `${m}m`;
  }
  const h = Math.floor(ms / HOUR);
  const m = Math.round((ms % HOUR) / MINUTE);
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

export function formatBabyAge(birthDate: string | null, now: Date = new Date()): string {
  if (!birthDate) return "newborn";
  const birth = new Date(`${birthDate}T00:00:00`);
  if (Number.isNaN(birth.getTime())) return "newborn";

  const ms = now.getTime() - birth.getTime();
  if (ms < DAY) return "today";
  if (ms < WEEK) {
    const d = Math.floor(ms / DAY);
    return d === 1 ? "1 day old" : `${d} days old`;
  }
  if (ms < 8 * WEEK) {
    const w = Math.floor(ms / WEEK);
    const d = Math.floor((ms % WEEK) / DAY);
    if (d === 0) return w === 1 ? "1 week" : `${w} weeks`;
    return `${w}w ${d}d`;
  }
  // Roughly months by averaging 30.44 days; close enough for an age label.
  const months = Math.floor(ms / (30.44 * DAY));
  return months === 1 ? "1 month" : `${months} months`;
}

export function formatClockTime(when: string | Date): string {
  const date = typeof when === "string" ? new Date(when) : when;
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}
