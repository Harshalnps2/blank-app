"use client";

import type { LogCareEventIntent, SoothingTechnique } from "@/lib/schemas";

interface Props {
  onSubmit: (intent: LogCareEventIntent) => void;
}

const TECHNIQUES: { value: SoothingTechnique; label: string }[] = [
  { value: "rocking", label: "Rocking" },
  { value: "burping", label: "Burping" },
  { value: "swaddle", label: "Swaddle" },
  { value: "pacifier", label: "Pacifier" },
  { value: "white_noise", label: "White noise" },
  { value: "diaper_check", label: "Diaper check" },
  { value: "feeding_attempt", label: "Feeding attempt" },
  { value: "skin_to_skin", label: "Skin-to-skin" },
  { value: "other", label: "Other" },
];

export function SoothingForm({ onSubmit }: Props) {
  function log(technique: SoothingTechnique) {
    const intent: LogCareEventIntent = {
      type: "soothing",
      metadata: { technique },
    };
    onSubmit(intent);
  }

  return (
    <div
      className="grid grid-cols-3 gap-2"
      role="group"
      aria-label="Soothing technique"
    >
      {TECHNIQUES.map((t) => (
        <button
          key={t.value}
          type="button"
          onClick={() => log(t.value)}
          data-testid={`soothing-${t.value}`}
          className="flex min-h-[80px] items-center justify-center rounded-2xl border border-night-border bg-night-surface px-2 text-center text-sm font-medium text-night-text transition-colors hover:border-night-accent active:bg-night-accent/15"
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
