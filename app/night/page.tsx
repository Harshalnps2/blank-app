import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getActiveBabyForUser } from "@/lib/repositories/babies";
import { listCareEvents } from "@/lib/repositories/care-events";
import { NightDashboard } from "./night-dashboard";

export const dynamic = "force-dynamic";

export default async function NightDashboardPage() {
  const user = await requireUser("/night");
  const supabase = createSupabaseServerClient();
  const baby = await getActiveBabyForUser(supabase, user.id);

  if (!baby) {
    redirect("/onboarding");
  }

  // Pull a generous slice; the timeline shows up to 50 and the dashboard
  // derives "last feed" / "last diaper" / current sleep from the same list.
  const events = await listCareEvents(supabase, { babyId: baby.id, limit: 100 }).catch(
    () => [],
  );

  return <NightDashboard baby={baby} initialEvents={events} />;
}
