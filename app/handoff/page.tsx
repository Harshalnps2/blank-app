import { redirect } from "next/navigation";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveBabyForUser } from "@/lib/repositories/babies";

export const dynamic = "force-dynamic";

export default async function HandoffPage() {
  const user = await requireUser("/handoff");
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
      <h1 className="text-2xl font-semibold">Handoff Summary</h1>
      <p className="text-night-muted">
        A plain-language summary of the night will live here. Logged events for {baby.name} will
        appear once logging ships.
      </p>
    </main>
  );
}
