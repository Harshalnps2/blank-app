import { LoginForm } from "./login-form";

interface PageProps {
  searchParams?: { next?: string };
}

const sanitizeNext = (raw: string | undefined): string => {
  if (!raw) return "/onboarding";
  if (!raw.startsWith("/") || raw.startsWith("//")) return "/onboarding";
  return raw;
};

export default function LoginPage({ searchParams }: PageProps) {
  const next = sanitizeNext(searchParams?.next);

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col gap-8 px-5 py-10">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-widest text-night-muted">Sign in</p>
        <h1 className="text-2xl font-semibold leading-tight">
          Welcome to Newborn Night Shift Copilot
        </h1>
        <p className="text-sm text-night-muted">
          Enter your email to sign in or create an account.
        </p>
      </header>

      <LoginForm next={next} />

      <footer className="mt-auto text-xs text-night-muted">
        Caregiver-support software. Not medical advice.
      </footer>
    </main>
  );
}
