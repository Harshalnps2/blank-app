"use client";

import { useState } from "react";
import type {
  BottleUnit,
  BreastSide,
  LogCareEventIntent,
  MilkType,
} from "@/lib/schemas";

interface Props {
  onSubmit: (intent: LogCareEventIntent) => void;
}

type Method = "breast" | "bottle";

export function FeedForm({ onSubmit }: Props) {
  const [method, setMethod] = useState<Method>("breast");
  const [side, setSide] = useState<BreastSide>("left");
  const [duration, setDuration] = useState<string>("");
  const [amount, setAmount] = useState<string>("");
  const [unit, setUnit] = useState<BottleUnit>("ml");
  const [milkType, setMilkType] = useState<MilkType>("breastmilk");
  const [error, setError] = useState<string | null>(null);

  function submit() {
    if (method === "breast") {
      const intent: LogCareEventIntent = {
        type: "feed",
        metadata: {
          method: "breast",
          side,
          ...(duration ? { duration_minutes: Number(duration) } : {}),
        },
      };
      onSubmit(intent);
      return;
    }

    const amountNum = Number(amount);
    if (!amount || Number.isNaN(amountNum) || amountNum <= 0) {
      setError("Enter the amount.");
      return;
    }
    const intent: LogCareEventIntent = {
      type: "feed",
      metadata: {
        method: "bottle",
        amount: amountNum,
        unit,
        milk_type: milkType,
      },
    };
    onSubmit(intent);
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex flex-col gap-5"
    >
      <SegmentedControl<Method>
        legend="Method"
        value={method}
        onChange={setMethod}
        options={[
          { value: "breast", label: "Breast" },
          { value: "bottle", label: "Bottle" },
        ]}
        testId="feed-method"
      />

      {method === "breast" ? (
        <>
          <SegmentedControl<BreastSide>
            legend="Side"
            value={side}
            onChange={setSide}
            options={[
              { value: "left", label: "Left" },
              { value: "right", label: "Right" },
              { value: "both", label: "Both" },
            ]}
            testId="feed-side"
          />
          <label className="flex flex-col gap-2">
            <span className="text-sm text-night-muted">Duration (minutes, optional)</span>
            <input
              type="number"
              inputMode="numeric"
              min={0}
              max={240}
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              data-testid="feed-duration"
              className="rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-lg text-night-text focus:border-night-accent focus:outline-none"
              placeholder="e.g. 12"
            />
          </label>
        </>
      ) : (
        <>
          <label className="flex flex-col gap-2">
            <span className="text-sm text-night-muted">Amount</span>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                data-testid="feed-amount"
                autoFocus
                className="flex-1 rounded-2xl border border-night-border bg-night-surface px-4 py-4 text-lg text-night-text focus:border-night-accent focus:outline-none"
                placeholder="e.g. 90"
              />
              <SegmentedControl<BottleUnit>
                legend="Unit"
                hideLegend
                value={unit}
                onChange={setUnit}
                options={[
                  { value: "ml", label: "ml" },
                  { value: "oz", label: "oz" },
                ]}
                testId="feed-unit"
                compact
              />
            </div>
          </label>

          <SegmentedControl<MilkType>
            legend="Milk type"
            value={milkType}
            onChange={setMilkType}
            options={[
              { value: "breastmilk", label: "Breastmilk" },
              { value: "formula", label: "Formula" },
              { value: "donor", label: "Donor" },
            ]}
            testId="feed-milk-type"
          />
        </>
      )}

      {error ? (
        <p role="alert" className="text-sm text-red-300">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        data-testid="feed-submit"
        className="rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg"
      >
        Save feed
      </button>
    </form>
  );
}

interface OptionType<T extends string> {
  value: T;
  label: string;
}

function SegmentedControl<T extends string>({
  legend,
  hideLegend,
  value,
  onChange,
  options,
  testId,
  compact,
}: {
  legend: string;
  hideLegend?: boolean;
  value: T;
  onChange: (v: T) => void;
  options: OptionType<T>[];
  testId: string;
  compact?: boolean;
}) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className={hideLegend ? "sr-only" : "text-sm text-night-muted"}>{legend}</legend>
      <div className={`flex gap-2 ${compact ? "" : "w-full"}`} role="radiogroup">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <label
              key={opt.value}
              className={`flex min-h-[56px] flex-1 cursor-pointer items-center justify-center rounded-2xl border px-3 text-base transition-colors ${
                active
                  ? "border-night-accent bg-night-accent/10 text-night-text"
                  : "border-night-border bg-night-surface text-night-muted"
              }`}
            >
              <input
                type="radio"
                name={testId}
                value={opt.value}
                checked={active}
                onChange={() => onChange(opt.value)}
                className="sr-only"
                data-testid={`${testId}-${opt.value}`}
              />
              <span>{opt.label}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
