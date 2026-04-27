"use client";

import { useState } from "react";
import type { LogCareEventIntent, SleepLocation } from "@/lib/schemas";

interface Props {
  onSubmit: (intent: LogCareEventIntent) => void;
}

const LOCATIONS: { value: SleepLocation; label: string }[] = [
  { value: "bassinet", label: "Bassinet" },
  { value: "crib", label: "Crib" },
  { value: "contact", label: "Contact" },
  { value: "stroller", label: "Stroller" },
  { value: "carrier", label: "Carrier" },
  { value: "other", label: "Other" },
];

export function SleepForm({ onSubmit }: Props) {
  const [location, setLocation] = useState<SleepLocation | null>(null);

  function start() {
    const intent: LogCareEventIntent = {
      type: "sleep",
      metadata: location ? { location } : {},
    };
    onSubmit(intent);
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-night-muted">Where? (optional)</p>
      <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Sleep location">
        {LOCATIONS.map((opt) => {
          const active = location === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setLocation(active ? null : opt.value)}
              data-testid={`sleep-location-${opt.value}`}
              aria-pressed={active}
              className={`min-h-[56px] rounded-2xl border px-2 text-sm transition-colors ${
                active
                  ? "border-night-accent bg-night-accent/10 text-night-text"
                  : "border-night-border bg-night-surface text-night-muted"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
      <button
        type="button"
        onClick={start}
        data-testid="sleep-start"
        className="rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg"
      >
        Start sleep
      </button>
    </div>
  );
}
