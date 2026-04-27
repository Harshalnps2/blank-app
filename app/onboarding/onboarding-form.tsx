"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { createBabyProfile, type OnboardingState } from "./actions";

const initialState: OnboardingState = {};

const FEEDING_METHODS: { value: "breast" | "bottle" | "combo" | "unknown"; label: string }[] = [
  { value: "breast", label: "Breast" },
  { value: "bottle", label: "Bottle" },
  { value: "combo", label: "Combo" },
  { value: "unknown", label: "Not sure yet" },
];

export function OnboardingForm({ defaultBirthDate }: { defaultBirthDate: string }) {
  const [state, action] = useActionState(createBabyProfile, initialState);

  return (
    <form action={action} className="flex flex-col gap-6" noValidate>
      <label className="flex flex-col gap-2">
        <span className="text-sm text-night-muted">Baby name (or nickname)</span>
        <input
          type="text"
          name="name"
          required
          maxLength={80}
          autoFocus
          autoComplete="off"
          aria-invalid={state.fieldErrors?.name ? true : undefined}
          aria-describedby={state.fieldErrors?.name ? "name-error" : undefined}
          className="rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-lg text-night-text placeholder:text-night-muted focus:border-night-accent focus:outline-none"
          placeholder="e.g. Juniper"
        />
        {state.fieldErrors?.name ? (
          <span id="name-error" role="alert" className="text-sm text-red-300">
            {state.fieldErrors.name}
          </span>
        ) : null}
      </label>

      <label className="flex flex-col gap-2">
        <span className="text-sm text-night-muted">Date of birth</span>
        <input
          type="date"
          name="birth_date"
          required
          defaultValue={defaultBirthDate}
          max={defaultBirthDate}
          aria-invalid={state.fieldErrors?.birth_date ? true : undefined}
          aria-describedby={state.fieldErrors?.birth_date ? "dob-error" : undefined}
          className="rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-lg text-night-text focus:border-night-accent focus:outline-none"
        />
        {state.fieldErrors?.birth_date ? (
          <span id="dob-error" role="alert" className="text-sm text-red-300">
            {state.fieldErrors.birth_date}
          </span>
        ) : null}
      </label>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-sm text-night-muted">Feeding method</legend>
        <div role="radiogroup" className="grid grid-cols-2 gap-3">
          {FEEDING_METHODS.map((option, index) => (
            <label
              key={option.value}
              className="flex min-h-[64px] cursor-pointer items-center justify-center rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-base text-night-text transition-colors has-[:checked]:border-night-accent has-[:checked]:bg-night-accent/10"
            >
              <input
                type="radio"
                name="feeding_method"
                value={option.value}
                defaultChecked={index === 0}
                className="sr-only"
                required
              />
              <span>{option.label}</span>
            </label>
          ))}
        </div>
        {state.fieldErrors?.feeding_method ? (
          <span role="alert" className="text-sm text-red-300">
            {state.fieldErrors.feeding_method}
          </span>
        ) : null}
      </fieldset>

      {state.formError ? (
        <p role="alert" className="rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
          {state.formError}
        </p>
      ) : null}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      aria-busy={pending}
      className="rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg transition-opacity disabled:cursor-progress disabled:opacity-60"
    >
      {pending ? "Saving…" : "Save and start tracking"}
    </button>
  );
}
