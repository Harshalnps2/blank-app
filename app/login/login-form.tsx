"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";
import { emailSchema, otpTokenSchema } from "@/lib/schemas";

type Step =
  | { kind: "request"; error: string | null; pending: boolean }
  | { kind: "verify"; email: string; error: string | null; pending: boolean };

const initial: Step = { kind: "request", error: null, pending: false };

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [step, setStep] = useState<Step>(initial);

  async function onRequest(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const parsed = emailSchema.safeParse(formData.get("email"));
    if (!parsed.success) {
      setStep({
        kind: "request",
        error: parsed.error.issues[0]?.message ?? "Invalid email.",
        pending: false,
      });
      return;
    }

    setStep({ kind: "request", error: null, pending: true });
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithOtp({
      email: parsed.data,
      options: { shouldCreateUser: true },
    });

    if (error) {
      setStep({
        kind: "request",
        error: "We couldn't send the code. Try again in a moment.",
        pending: false,
      });
      return;
    }

    setStep({ kind: "verify", email: parsed.data, error: null, pending: false });
  }

  async function onVerify(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (step.kind !== "verify") return;

    const formData = new FormData(event.currentTarget);
    const tokenInput = formData.get("token");
    const parsed = otpTokenSchema.safeParse(tokenInput);
    if (!parsed.success) {
      setStep({
        ...step,
        error: parsed.error.issues[0]?.message ?? "Invalid code.",
        pending: false,
      });
      return;
    }

    setStep({ ...step, error: null, pending: true });
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.verifyOtp({
      email: step.email,
      token: parsed.data,
      type: "email",
    });

    if (error) {
      setStep({
        ...step,
        error: "That code didn't match. Check your email and try again.",
        pending: false,
      });
      return;
    }

    router.replace(next);
    router.refresh();
  }

  if (step.kind === "verify") {
    return (
      <form onSubmit={onVerify} className="flex flex-col gap-4" noValidate aria-label="Verify code">
        <p className="text-sm text-night-muted">
          We sent a 6-digit code to <span className="text-night-text">{step.email}</span>.
        </p>
        <label className="flex flex-col gap-2">
          <span className="text-sm text-night-muted">Sign-in code</span>
          <input
            type="text"
            name="token"
            required
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{6}"
            maxLength={6}
            autoFocus
            placeholder="123456"
            aria-invalid={step.error ? true : undefined}
            aria-describedby={step.error ? "token-error" : undefined}
            className="rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-center font-mono text-2xl tracking-widest text-night-text placeholder:text-night-muted focus:border-night-accent focus:outline-none"
          />
        </label>
        {step.error ? (
          <p id="token-error" role="alert" className="text-sm text-red-300">
            {step.error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={step.pending}
          aria-busy={step.pending}
          className="rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg transition-opacity disabled:cursor-progress disabled:opacity-60"
        >
          {step.pending ? "Verifying…" : "Verify and continue"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={onRequest} className="flex flex-col gap-4" noValidate aria-label="Sign in">
      <label className="flex flex-col gap-2">
        <span className="text-sm text-night-muted">Email</span>
        <input
          type="email"
          name="email"
          required
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          autoCorrect="off"
          spellCheck={false}
          autoFocus
          placeholder="you@example.com"
          aria-invalid={step.error ? true : undefined}
          aria-describedby={step.error ? "email-error" : undefined}
          className="rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-lg text-night-text placeholder:text-night-muted focus:border-night-accent focus:outline-none"
        />
      </label>
      {step.error ? (
        <p id="email-error" role="alert" className="text-sm text-red-300">
          {step.error}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={step.pending}
        aria-busy={step.pending}
        className="rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg transition-opacity disabled:cursor-progress disabled:opacity-60"
      >
        {step.pending ? "Sending…" : "Send sign-in code"}
      </button>
      <p className="text-xs text-night-muted">
        We&apos;ll email you a 6-digit code. No passwords.
      </p>
    </form>
  );
}
