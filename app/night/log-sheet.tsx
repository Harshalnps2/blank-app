"use client";

import { useEffect, useRef } from "react";
import type { LogCareEventIntent } from "@/lib/schemas";
import { DiaperForm } from "./forms/diaper-form";
import { FeedForm } from "./forms/feed-form";
import { NoteForm } from "./forms/note-form";
import { SleepForm } from "./forms/sleep-form";
import { SoothingForm } from "./forms/soothing-form";

export type SheetKind = "feed" | "diaper" | "sleep" | "soothing" | "note";

const TITLES: Record<SheetKind, string> = {
  feed: "Log a feed",
  diaper: "Log a diaper",
  sleep: "Start a sleep",
  soothing: "Log soothing",
  note: "Add a note",
};

interface Props {
  kind: SheetKind | null;
  onClose: () => void;
  onSubmit: (intent: LogCareEventIntent) => void;
}

export function LogSheet({ kind, onClose, onSubmit }: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!kind) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    dialogRef.current?.focus();
    return () => window.removeEventListener("keydown", onKey);
  }, [kind, onClose]);

  if (!kind) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={TITLES[kind]}
      data-testid={`log-sheet-${kind}`}
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/60 sm:items-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-t-3xl border border-night-border bg-night-bg p-5 sm:rounded-3xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">{TITLES[kind]}</h2>
          <button
            type="button"
            onClick={onClose}
            data-testid="log-sheet-close"
            aria-label="Close"
            className="rounded-full border border-night-border px-3 py-1 text-sm text-night-muted hover:text-night-text"
          >
            Cancel
          </button>
        </div>

        {kind === "feed" ? <FeedForm onSubmit={onSubmit} /> : null}
        {kind === "diaper" ? <DiaperForm onSubmit={onSubmit} /> : null}
        {kind === "sleep" ? <SleepForm onSubmit={onSubmit} /> : null}
        {kind === "soothing" ? <SoothingForm onSubmit={onSubmit} /> : null}
        {kind === "note" ? <NoteForm onSubmit={onSubmit} /> : null}
      </div>
    </div>
  );
}
