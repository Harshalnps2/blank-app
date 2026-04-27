"use client";

import { useEffect, useState } from "react";
import type { CareEventsRow } from "@/lib/database.types";
import { formatDuration } from "@/lib/format";

interface Props {
  sleep: CareEventsRow | null;
  onEnd: () => void;
  onStart: () => void;
  disabled?: boolean;
}

export function SleepStatus({ sleep, onEnd, onStart, disabled }: Props) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => window.clearInterval(id);
  }, []);

  if (sleep) {
    const since = new Date(sleep.started_at).getTime();
    return (
      <section
        aria-label="Current sleep"
        data-testid="sleep-status"
        data-state="sleeping"
        className="flex items-center justify-between gap-3 rounded-2xl border border-night-accent/40 bg-night-accent/10 p-4"
      >
        <div>
          <p className="text-xs uppercase tracking-widest text-night-accent">Sleeping</p>
          <p className="text-lg font-medium" data-testid="sleep-duration">
            {formatDuration(now - since)}
          </p>
        </div>
        <button
          type="button"
          onClick={onEnd}
          disabled={disabled}
          data-testid="end-sleep"
          className="rounded-2xl bg-night-accent px-4 py-3 text-sm font-medium text-night-bg disabled:opacity-60"
        >
          End sleep
        </button>
      </section>
    );
  }

  return (
    <section
      aria-label="Current sleep"
      data-testid="sleep-status"
      data-state="awake"
      className="flex items-center justify-between gap-3 rounded-2xl border border-night-border bg-night-surface p-4"
    >
      <div>
        <p className="text-xs uppercase tracking-widest text-night-muted">Awake</p>
        <p className="text-sm text-night-muted">No active sleep</p>
      </div>
      <button
        type="button"
        onClick={onStart}
        disabled={disabled}
        data-testid="start-sleep"
        className="rounded-2xl border border-night-accent px-4 py-3 text-sm font-medium text-night-accent disabled:opacity-60"
      >
        Start sleep
      </button>
    </section>
  );
}
