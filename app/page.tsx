import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

const navLinks = [
  {
    href: "/onboarding",
    title: "Onboarding",
    description: "Set up baby and caregivers.",
  },
  {
    href: "/night",
    title: "Night Dashboard",
    description: "One-tap logging for feeds, diapers, sleep, and soothing.",
  },
  {
    href: "/handoff",
    title: "Handoff Summary",
    description: "Share a clear summary with the next caregiver.",
  },
];

export default async function HomePage() {
  const user = await getCurrentUser().catch(() => null);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-5 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-night-muted">MVP</p>
        <h1 className="text-3xl font-semibold leading-tight">Newborn Night Shift Copilot</h1>
        <p className="text-night-muted">
          Capture must be faster than memory. Log feeds, diapers, sleep, and soothing — then hand
          off the night clearly.
        </p>
      </header>

      {!user ? (
        <Link
          href="/login"
          className="flex items-center justify-center rounded-2xl bg-night-accent px-5 py-4 text-base font-medium text-night-bg"
        >
          Sign in to get started
        </Link>
      ) : null}

      <nav aria-label="Primary" className="flex flex-col gap-3">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col gap-1 rounded-2xl border border-night-border bg-night-surface p-5 transition-colors hover:border-night-accent focus:outline-none focus-visible:border-night-accent"
          >
            <span className="text-lg font-medium">{link.title}</span>
            <span className="text-sm text-night-muted">{link.description}</span>
          </Link>
        ))}
      </nav>

      <footer className="mt-auto text-xs text-night-muted">
        Caregiver-support software. Not medical advice.
      </footer>
    </main>
  );
}
