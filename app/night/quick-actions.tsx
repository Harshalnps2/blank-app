"use client";

import type { SheetKind } from "./log-sheet";

interface Action {
  kind: SheetKind;
  label: string;
  hint: string;
}

const ACTIONS: Action[] = [
  { kind: "feed", label: "Feed", hint: "Breast or bottle" },
  { kind: "diaper", label: "Diaper", hint: "Wet · dirty · both · dry" },
  { kind: "sleep", label: "Sleep", hint: "Start a sleep" },
  { kind: "soothing", label: "Soothing", hint: "What helped" },
];

interface Props {
  onTap: (kind: SheetKind) => void;
  disabled?: boolean;
}

export function QuickActions({ onTap, disabled }: Props) {
  return (
    <section aria-label="Quick log" className="flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        {ACTIONS.map((action) => (
          <button
            key={action.kind}
            type="button"
            disabled={disabled}
            onClick={() => onTap(action.kind)}
            data-testid={`quick-action-${action.kind}`}
            className="flex min-h-[96px] flex-col items-start justify-end gap-1 rounded-2xl border border-night-border bg-night-surface p-4 text-left transition-colors hover:border-night-accent active:bg-night-accent/10 disabled:opacity-60"
          >
            <span className="text-lg font-semibold text-night-text">{action.label}</span>
            <span className="text-xs text-night-muted">{action.hint}</span>
          </button>
        ))}
      </div>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onTap("note")}
        data-testid="quick-action-note"
        className="flex min-h-[64px] items-center justify-center rounded-2xl border border-dashed border-night-border bg-transparent px-4 text-base text-night-text transition-colors hover:border-night-accent disabled:opacity-60"
      >
        + Note
      </button>
    </section>
  );
}
