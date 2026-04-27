import Link from "next/link";

export default function OnboardingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 py-10">
      <Link href="/" className="text-sm text-night-muted hover:text-night-accent">
        ← Home
      </Link>
      <h1 className="text-2xl font-semibold">Onboarding</h1>
      <p className="text-night-muted">
        Placeholder. Onboarding will collect baby name, birth date, and caregiver list. No medical
        intake.
      </p>
    </main>
  );
}
