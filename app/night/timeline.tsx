"use client";

import { useEffect, useState } from "react";
import type { CareEventsRow } from "@/lib/database.types";
import { describeEvent, eventTypeLabel } from "@/lib/event-description";
import { formatTimeAgo } from "@/lib/format";

interface Props {
  events: CareEventsRow[];
}

export function Timeline({ events }: Props) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (events.length === 0) {
    return (
      <section
        aria-label="Timeline"
        data-testid="timeline"
        className="rounded-2xl border border-dashed border-night-border bg-transparent p-6 text-center text-sm text-night-muted"
      >
        Logged events will appear here.
      </section>
    );
  }

  return (
    <section aria-label="Timeline" data-testid="timeline" className="flex flex-col gap-2">
      <h2 className="text-xs uppercase tracking-widest text-night-muted">Tonight</h2>
      <ul className="flex flex-col gap-2">
        {events.slice(0, 50).map((event) => (
          <li
            key={event.id}
            data-testid="timeline-item"
            data-event-type={event.event_type}
            className="flex items-start justify-between gap-3 rounded-2xl border border-night-border bg-night-surface px-4 py-3"
          >
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-widest text-night-muted">
                {eventTypeLabel(event.event_type)}
              </p>
              <p className="break-words text-sm text-night-text">{describeEvent(event)}</p>
            </div>
            <p className="shrink-0 text-xs text-night-muted">
              {formatTimeAgo(event.started_at, now)}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
