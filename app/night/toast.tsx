"use client";

interface Props {
  toast: { tone: "success" | "error"; text: string } | null;
}

export function Toast({ toast }: Props) {
  if (!toast) return null;
  const tone =
    toast.tone === "success"
      ? "border-night-accent/50 bg-night-accent/15 text-night-text"
      : "border-red-500/50 bg-red-500/10 text-red-200";

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="toast"
      data-tone={toast.tone}
      className={`pointer-events-none fixed inset-x-4 bottom-6 z-50 mx-auto max-w-md rounded-2xl border px-4 py-3 text-center text-sm font-medium shadow-lg ${tone}`}
    >
      {toast.text}
    </div>
  );
}
