import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSupabaseSession } from "@/lib/supabase/middleware";

const PUBLIC_PATHS = new Set<string>(["/", "/login"]);
const PROTECTED_PATHS = ["/onboarding", "/night", "/handoff"];

export async function middleware(request: NextRequest) {
  const { response, userId } = await updateSupabaseSession(request);
  const { pathname } = request.nextUrl;

  // Logged-in users hitting /login: send them onward to the app shell.
  if (userId && pathname === "/login") {
    return NextResponse.redirect(new URL("/onboarding", request.url));
  }

  // Logged-out users hitting protected routes: send them to /login with a
  // `next` param so we can return them to where they were going.
  const isProtected = PROTECTED_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );
  if (!userId && isProtected) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Pass-through for known public paths and any non-app routes (api, _next, ...)
  void PUBLIC_PATHS;
  return response;
}

export const config = {
  // Skip Next.js internals, static assets, and the e2e mock route handler.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|e2e-mock/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
