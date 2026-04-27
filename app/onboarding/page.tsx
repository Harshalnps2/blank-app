import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveBabyForUser } from "@/lib/repositories/babies";
import { OnboardingForm } from "./onboarding-form";

export const dynamic = "force-dynamic";

function todayInISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  const supabase = createSupabaseServerClient();
  const existing = await getActiveBabyForUser(supabase, user.id);

  // If onboarding is already complete, skip ahead. The middleware also handles
  // this for direct navigations, but a returning user could deep-link here.
  if (existing) {
    redirect("/night");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-5 py-10">
      <header className="space-y-2">
        <Link href="/" className="text-sm text-night-muted hover:text-night-accent">
          ← Home
        </Link>
        <h1 className="text-2xl font-semibold leading-tight">Set up baby profile</h1>
        <p className="text-sm text-night-muted">
          One quick setup. You can edit anything later.
        </p>
      </header>

      <OnboardingForm defaultBirthDate={todayInISODate()} />

      <footer className="mt-auto text-xs text-night-muted">
        Caregiver-support software. Not medical advice.
      </footer>
    </main>
  );
}
