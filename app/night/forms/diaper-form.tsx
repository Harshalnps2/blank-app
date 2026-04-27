"use client";

import { useState } from "react";
import type { DiaperContents, LogCareEventIntent } from "@/lib/schemas";

interface Props {
  onSubmit: (intent: LogCareEventIntent) => void;
}

const OPTIONS: { value: DiaperContents; label: string }[] = [
  { value: "wet", label: "Wet" },
  { value: "dirty", label: "Dirty" },
  { value: "both", label: "Both" },
  { value: "dry", label: "Dry" },
];

export function DiaperForm({ onSubmit }: Props) {
  const [note, setNote] = useState("");

  function log(contents: DiaperContents) {
    const intent: LogCareEventIntent = {
      type: "diaper",
      metadata: {
        contents,
        ...(note.trim() ? { note: note.trim() } : {}),
      },
    };
    onSubmit(intent);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-3" role="group" aria-label="Diaper contents">
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => log(opt.value)}
            data-testid={`diaper-${opt.value}`}
            className="flex min-h-[80px] items-center justify-center rounded-2xl border border-night-border bg-night-surface px-4 text-lg font-medium text-night-text transition-colors hover:border-night-accent active:bg-night-accent/15"
          >
            {opt.label}
          </button>
        ))}
      </div>
      <details className="rounded-2xl border border-night-border bg-night-surface p-4">
        <summary className="cursor-pointer text-sm text-night-muted">
          Add a quick note (optional)
        </summary>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={280}
          rows={2}
          data-testid="diaper-note"
          placeholder="e.g. mild diaper rash"
          className="mt-3 w-full rounded-xl border border-night-border bg-night-bg px-3 py-2 text-base text-night-text placeholder:text-night-muted focus:border-night-accent focus:outline-none"
        />
      </details>
    </div>
  );
}
