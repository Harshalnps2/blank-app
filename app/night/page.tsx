import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveBabyForUser } from "@/lib/repositories/babies";

export const dynamic = "force-dynamic";

export default async function NightDashboardPage() {
  const user = await requireUser("/night");
  const supabase = createSupabaseServerClient();
  const baby = await getActiveBabyForUser(supabase, user.id);

  if (!baby) {
    redirect("/onboarding");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-6 px-5 py-10">
      <Link href="/" className="text-sm text-night-muted hover:text-night-accent">
        ← Home
      </Link>
      <header className="space-y-1">
        <p className="text-sm uppercase tracking-widest text-night-muted">Night dashboard</p>
        <h1 className="text-2xl font-semibold">Tracking {baby.name}</h1>
      </header>
      <p className="text-night-muted">
        Logging is coming next. This is the placeholder you land on after onboarding.
      </p>
    </main>
  );
}
