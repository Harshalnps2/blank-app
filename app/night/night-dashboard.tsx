"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { CareEventsRow } from "@/lib/database.types";
import type { ActiveBaby } from "@/lib/repositories/babies";
import { formatBabyAge } from "@/lib/format";
import type { LogCareEventIntent } from "@/lib/schemas";
import { logCareEvent, endActiveSleep } from "./actions";
import { LogSheet, type SheetKind } from "./log-sheet";
import { QuickActions } from "./quick-actions";
import { SleepStatus } from "./sleep-status";
import { SummaryCards } from "./summary-cards";
import { Timeline } from "./timeline";
import { Toast } from "./toast";

interface Props {
  baby: ActiveBaby;
  initialEvents: CareEventsRow[];
}

type ToastState = { tone: "success" | "error"; text: string } | null;

export function NightDashboard({ baby, initialEvents }: Props) {
  const [events, setEvents] = useState<CareEventsRow[]>(initialEvents);
  const [openSheet, setOpenSheet] = useState<SheetKind | null>(null);
  const [toast, setToast] = useState<ToastState>(null);
  const [isPending, startTransition] = useTransition();
  const optimisticCounter = useRef(0);

  // Re-render the relative-time labels every minute so "1m ago" doesn't
  // get stuck.
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 60_000);
    return () => window.clearInterval(id);
  }, []);
  void tick;

  const lastFeed = useMemo(() => events.find((e) => e.event_type === "feed") ?? null, [events]);
  const lastDiaper = useMemo(
    () => events.find((e) => e.event_type === "diaper") ?? null,
    [events],
  );
  const currentSleep = useMemo(
    () => events.find((e) => e.event_type === "sleep" && e.ended_at == null) ?? null,
    [events],
  );

  const showToast = useCallback((next: ToastState) => {
    setToast(next);
    if (next) {
      window.setTimeout(() => {
        setToast((current) => (current === next ? null : current));
      }, 2500);
    }
  }, []);

  const submitLog = useCallback(
    (intent: LogCareEventIntent) => {
      const optimisticId = `optimistic-${optimisticCounter.current++}`;
      const startedAt = intent.started_at ?? new Date().toISOString();
      const optimisticRow: CareEventsRow = {
        id: optimisticId,
        baby_id: baby.id,
        caregiver_id: baby.created_by,
        night_shift_id: null,
        event_type: intent.type,
        started_at: startedAt,
        ended_at: null,
        duration_seconds: null,
        metadata_json: intent.metadata as CareEventsRow["metadata_json"],
        source: "manual",
        created_at: startedAt,
        updated_at: startedAt,
        deleted_at: null,
      };

      setEvents((prev) => [optimisticRow, ...prev]);
      setOpenSheet(null);

      startTransition(async () => {
        const result = await logCareEvent(intent);
        if (result.ok) {
          setEvents((prev) => [
            result.event,
            ...prev.filter((e) => e.id !== optimisticId),
          ]);
          showToast({ tone: "success", text: "Saved" });
        } else {
          setEvents((prev) => prev.filter((e) => e.id !== optimisticId));
          showToast({ tone: "error", text: result.error });
        }
      });
    },
    [baby.created_by, baby.id, showToast],
  );

  const endSleep = useCallback(() => {
    if (!currentSleep) return;
    const id = currentSleep.id;
    const endedAt = new Date().toISOString();

    setEvents((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ended_at: endedAt } : e)),
    );

    startTransition(async () => {
      const result = await endActiveSleep(id);
      if (result.ok) {
        setEvents((prev) => prev.map((e) => (e.id === id ? result.event : e)));
        showToast({ tone: "success", text: "Sleep ended" });
      } else {
        setEvents((prev) =>
          prev.map((e) => (e.id === id ? { ...e, ended_at: null } : e)),
        );
        showToast({ tone: "error", text: result.error });
      }
    });
  }, [currentSleep, showToast]);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-5 px-4 py-6">
      <header className="flex items-center justify-between">
        <Link href="/" className="text-sm text-night-muted hover:text-night-accent">
          ← Home
        </Link>
        <Link
          href="/handoff"
          className="text-sm font-medium text-night-accent"
        >
          Handoff →
        </Link>
      </header>

      <section aria-labelledby="baby-heading" className="space-y-1">
        <p className="text-xs uppercase tracking-widest text-night-muted">Tracking</p>
        <h1 id="baby-heading" className="text-3xl font-semibold leading-tight">
          {baby.name}
        </h1>
        <p className="text-sm text-night-muted">{formatBabyAge(baby.birth_date)}</p>
      </section>

      <SleepStatus
        sleep={currentSleep}
        onEnd={endSleep}
        disabled={isPending}
        onStart={() => setOpenSheet("sleep")}
      />

      <SummaryCards lastFeed={lastFeed} lastDiaper={lastDiaper} />

      <QuickActions onTap={(kind) => setOpenSheet(kind)} disabled={isPending} />

      <Timeline events={events} />

      <LogSheet
        kind={openSheet}
        onClose={() => setOpenSheet(null)}
        onSubmit={submitLog}
      />

      <Toast toast={toast} />

      <footer className="mt-6 text-xs text-night-muted">
        Caregiver-support software. Not medical advice.
      </footer>
    </main>
  );
}
