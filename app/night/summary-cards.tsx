"use client";

import { useEffect, useState } from "react";
import type { CareEventsRow } from "@/lib/database.types";
import { describeDiaper, describeFeed } from "@/lib/event-description";
import { formatTimeAgo } from "@/lib/format";
import type { DiaperMetadata, FeedMetadata } from "@/lib/schemas";

interface Props {
  lastFeed: CareEventsRow | null;
  lastDiaper: CareEventsRow | null;
}

export function SummaryCards({ lastFeed, lastDiaper }: Props) {
  // Re-render every minute so "5m ago" updates without a full page reload.
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section aria-label="Recent activity" className="grid grid-cols-2 gap-3">
      <Card
        label="Last feed"
        testId="last-feed"
        primary={
          lastFeed ? describeFeed(lastFeed.metadata_json as unknown as FeedMetadata) : "No feed yet"
        }
        when={lastFeed ? formatTimeAgo(lastFeed.started_at, now) : null}
      />
      <Card
        label="Last diaper"
        testId="last-diaper"
        primary={
          lastDiaper
            ? describeDiaper(lastDiaper.metadata_json as unknown as DiaperMetadata)
            : "No diaper yet"
        }
        when={lastDiaper ? formatTimeAgo(lastDiaper.started_at, now) : null}
      />
    </section>
  );
}

function Card({
  label,
  primary,
  when,
  testId,
}: {
  label: string;
  primary: string;
  when: string | null;
  testId: string;
}) {
  return (
    <div
      data-testid={testId}
      className="flex flex-col gap-1 rounded-2xl border border-night-border bg-night-surface p-4"
    >
      <p className="text-xs uppercase tracking-widest text-night-muted">{label}</p>
      <p className="text-base font-medium text-night-text" data-testid={`${testId}-primary`}>
        {primary}
      </p>
      {when ? (
        <p className="text-xs text-night-muted" data-testid={`${testId}-when`}>
          {when}
        </p>
      ) : null}
    </div>
  );
}
