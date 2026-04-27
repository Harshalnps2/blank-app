"use client";

import { useState } from "react";
import type { LogCareEventIntent } from "@/lib/schemas";

interface Props {
  onSubmit: (intent: LogCareEventIntent) => void;
}

export function NoteForm({ onSubmit }: Props) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) {
      setError("Add a note before saving.");
      return;
    }
    onSubmit({ type: "note", metadata: { text: trimmed } });
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-4"
    >
      <label className="flex flex-col gap-2">
        <span className="text-sm text-night-muted">Note</span>
        <textarea
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          rows={4}
          maxLength={280}
          autoFocus
          data-testid="note-text"
          aria-invalid={error ? true : undefined}
          placeholder="e.g. seemed fussier than usual after feed"
          className="rounded-2xl border border-night-border bg-night-surface px-4 py-3 text-base text-night-text placeholder:text-night-muted focus:border-night-accent focus:outline-none"
        />
        <span className="self-end text-xs text-night-muted">{text.length}/280</span>
      </label>
      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}
      <button
        type="submit"
        data-testid="note-submit"
        className="rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg"
      >
        Save note
      </button>
    </form>
  );
}
