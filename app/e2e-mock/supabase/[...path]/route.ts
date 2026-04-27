/**
 * In-process Supabase mock for end-to-end tests.
 *
 * This handler is wired up only when `NEXT_PUBLIC_E2E_MOCK === "true"`.
 * Outside of that, every method returns 404 so the route is effectively
 * non-existent in production. The Playwright config sets the env var and
 * points NEXT_PUBLIC_SUPABASE_URL at this route, so both the browser
 * client and the server-side client send their requests here.
 *
 * Only the endpoints that the onboarding flow touches are implemented:
 *   POST /auth/v1/otp              — request a magic code
 *   POST /auth/v1/verify           — exchange the code for a session
 *   POST /auth/v1/token            — refresh the session
 *   GET  /auth/v1/user             — verify a bearer token
 *   POST /auth/v1/logout           — sign out
 *   GET  /rest/v1/baby_caregivers  — read first active baby for user
 *   POST /rest/v1/babies           — insert a baby
 *
 * The state lives in module-scope, so it persists for the lifetime of the
 * Next.js server process. That's the right scope for `playwright test`.
 */

import { NextResponse, type NextRequest } from "next/server";
import { randomUUID } from "node:crypto";

const ENABLED = process.env.NEXT_PUBLIC_E2E_MOCK === "true";

interface Session {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  expires_at: number;
  token_type: "bearer";
  user: User;
}

interface User {
  id: string;
  email: string;
  aud: string;
  role: string;
  email_confirmed_at: string;
  app_metadata: Record<string, unknown>;
  user_metadata: Record<string, unknown>;
  identities: unknown[];
  created_at: string;
  updated_at: string;
}

interface Baby {
  id: string;
  user_id: string;
  name: string;
  birth_date: string;
  feeding_method: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const sessionsByToken = new Map<string, Session>();
const usersByEmail = new Map<string, User>();
const babiesByUser = new Map<string, Baby>();

function makeUser(email: string): User {
  const existing = usersByEmail.get(email);
  if (existing) return existing;
  const now = new Date().toISOString();
  const user: User = {
    id: randomUUID(),
    email,
    aud: "authenticated",
    role: "authenticated",
    email_confirmed_at: now,
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: {},
    identities: [],
    created_at: now,
    updated_at: now,
  };
  usersByEmail.set(email, user);
  return user;
}

function makeSession(user: User): Session {
  const session: Session = {
    access_token: `mock-access-${randomUUID()}`,
    refresh_token: `mock-refresh-${randomUUID()}`,
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: "bearer",
    user,
  };
  sessionsByToken.set(session.access_token, session);
  return session;
}

function bearerSession(req: NextRequest): Session | null {
  const auth = req.headers.get("authorization") ?? "";
  if (!auth.toLowerCase().startsWith("bearer ")) return null;
  const token = auth.slice(7).trim();
  return sessionsByToken.get(token) ?? null;
}

async function readJson(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    return (await req.json()) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function disabled(): NextResponse {
  return new NextResponse("Not Found", { status: 404 });
}

async function handle(req: NextRequest, ctx: { params: { path?: string[] } }): Promise<NextResponse> {
  if (!ENABLED) return disabled();
  const path = "/" + (ctx.params.path ?? []).join("/");
  const method = req.method;

  // -------- Auth ----------------------------------------------------------
  if (path === "/auth/v1/otp" && method === "POST") {
    return NextResponse.json({});
  }

  if (path === "/auth/v1/verify" && method === "POST") {
    const body = await readJson(req);
    const email = String(body.email ?? "");
    if (!email) return NextResponse.json({ error: "missing_email" }, { status: 400 });
    const session = makeSession(makeUser(email));
    return NextResponse.json(session);
  }

  if (path === "/auth/v1/token" && method === "POST") {
    // Refresh — issue a new session. Realistic enough for happy-path tests.
    const body = await readJson(req);
    const email = String(body.email ?? "test@example.com");
    return NextResponse.json(makeSession(makeUser(email)));
  }

  if (path === "/auth/v1/user" && method === "GET") {
    const session = bearerSession(req);
    if (!session) return NextResponse.json({ message: "invalid token" }, { status: 401 });
    return NextResponse.json(session.user);
  }

  if (path === "/auth/v1/logout" && method === "POST") {
    const session = bearerSession(req);
    if (session) sessionsByToken.delete(session.access_token);
    return NextResponse.json({});
  }

  // -------- REST ----------------------------------------------------------
  if (path === "/rest/v1/baby_caregivers" && method === "GET") {
    const session = bearerSession(req);
    if (!session) return NextResponse.json([], { status: 200 });
    const baby = babiesByUser.get(session.user.id);
    if (!baby || baby.deleted_at) {
      // PostgREST returns null for `.maybeSingle()` when no rows match.
      return new NextResponse("null", {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }
    return NextResponse.json({
      baby: {
        id: baby.id,
        name: baby.name,
        birth_date: baby.birth_date,
        feeding_method: baby.feeding_method,
        created_by: baby.created_by,
        deleted_at: null,
      },
    });
  }

  if (path === "/rest/v1/babies" && method === "POST") {
    const session = bearerSession(req);
    if (!session) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const body = await readJson(req);
    const now = new Date().toISOString();
    const baby: Baby = {
      id: randomUUID(),
      user_id: session.user.id,
      name: String(body.name ?? ""),
      birth_date: String(body.birth_date ?? ""),
      feeding_method: String(body.feeding_method ?? "unknown"),
      created_by: session.user.id,
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    babiesByUser.set(session.user.id, baby);
    return NextResponse.json(baby, { status: 201 });
  }

  // Unknown endpoints — return an empty success rather than a network error,
  // so missing mocks fail visibly via assertion, not via a confusing 500.
  return NextResponse.json([]);
}

export const GET = handle;
export const POST = handle;
export const PATCH = handle;
export const DELETE = handle;
export const PUT = handle;
