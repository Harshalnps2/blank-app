"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { babyProfileInputSchema } from "@/lib/schemas";
import { createBabyForUser } from "@/lib/repositories/babies";

export interface OnboardingState {
  fieldErrors?: Partial<Record<"name" | "birth_date" | "feeding_method", string>>;
  formError?: string;
}

const EMPTY: OnboardingState = {};

export async function createBabyProfile(
  _prev: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const parsed = babyProfileInputSchema.safeParse({
    name: formData.get("name"),
    birth_date: formData.get("birth_date"),
    feeding_method: formData.get("feeding_method"),
  });

  if (!parsed.success) {
    const fieldErrors: NonNullable<OnboardingState["fieldErrors"]> = {};
    for (const issue of parsed.error.issues) {
      const field = issue.path[0];
      if (field === "name" || field === "birth_date" || field === "feeding_method") {
        fieldErrors[field] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const supabase = createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login?next=/onboarding");
  }

  try {
    await createBabyForUser(supabase, user.id, parsed.data);
  } catch {
    return {
      formError: "We couldn't save the profile. Please try again in a moment.",
    };
  }

  redirect("/night");
  // Unreachable; kept so the function's return type is preserved for the Action contract.
  return EMPTY;
}
