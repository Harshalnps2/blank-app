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

interface CareEvent {
  id: string;
  baby_id: string;
  caregiver_id: string;
  night_shift_id: string | null;
  event_type: "feed" | "diaper" | "sleep" | "soothing" | "note";
  started_at: string;
  ended_at: string | null;
  duration_seconds: number | null;
  metadata_json: Record<string, unknown>;
  source: "manual" | "ai_parsed" | "system";
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

const sessionsByToken = new Map<string, Session>();
const usersByEmail = new Map<string, User>();
const babiesByUser = new Map<string, Baby>();
const careEvents: CareEvent[] = [];

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

const SINGLE_OBJECT_ACCEPT = "application/vnd.pgrst.object+json";

function wantsSingleObject(req: NextRequest): boolean {
  const accept = req.headers.get("accept") ?? "";
  return accept.includes(SINGLE_OBJECT_ACCEPT);
}

function respondSingle(
  req: NextRequest,
  event: CareEvent | null,
  status = 200,
): NextResponse {
  if (wantsSingleObject(req)) {
    if (event == null) return new NextResponse("null", { status, headers: jsonHeaders });
    return new NextResponse(JSON.stringify(event), { status, headers: jsonHeaders });
  }
  return NextResponse.json(event ? [event] : [], { status });
}

function respondMaybeSingle(req: NextRequest, events: CareEvent[]): NextResponse {
  if (wantsSingleObject(req)) {
    return new NextResponse(JSON.stringify(events[0] ?? null), {
      status: 200,
      headers: jsonHeaders,
    });
  }
  return NextResponse.json(events, { status: 200 });
}

const jsonHeaders = { "content-type": "application/json" } as const;

function filterCareEvents(rows: CareEvent[], params: URLSearchParams): CareEvent[] {
  let out = rows;
  for (const [key, raw] of params.entries()) {
    if (key === "select" || key === "order" || key === "limit" || key === "offset") continue;
    if (raw.startsWith("eq.")) {
      const v = raw.slice(3);
      out = out.filter((row) => String((row as unknown as Record<string, unknown>)[key]) === v);
    } else if (raw === "is.null") {
      out = out.filter((row) => (row as unknown as Record<string, unknown>)[key] == null);
    } else if (raw === "not.is.null") {
      out = out.filter((row) => (row as unknown as Record<string, unknown>)[key] != null);
    } else if (raw.startsWith("gte.")) {
      const v = raw.slice(4);
      out = out.filter(
        (row) => String((row as unknown as Record<string, unknown>)[key] ?? "") >= v,
      );
    }
  }
  return out;
}

function orderCareEvents(rows: CareEvent[], params: URLSearchParams): CareEvent[] {
  const order = params.get("order");
  if (!order) return rows;
  const [field, direction = "asc"] = order.split(".");
  const sorted = [...rows].sort((a, b) => {
    const av = String((a as unknown as Record<string, unknown>)[field] ?? "");
    const bv = String((b as unknown as Record<string, unknown>)[field] ?? "");
    return av < bv ? -1 : av > bv ? 1 : 0;
  });
  if (direction === "desc") sorted.reverse();
  return sorted;
}

function limitCareEvents(rows: CareEvent[], params: URLSearchParams): CareEvent[] {
  const limit = params.get("limit");
  if (!limit) return rows;
  const n = Number(limit);
  return Number.isFinite(n) ? rows.slice(0, n) : rows;
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

  // -------- Care events ---------------------------------------------------
  if (path === "/rest/v1/care_events" && method === "GET") {
    const session = bearerSession(req);
    if (!session) return NextResponse.json([], { status: 200 });
    const url = new URL(req.url);
    const filtered = filterCareEvents(careEvents, url.searchParams);
    const ordered = orderCareEvents(filtered, url.searchParams);
    const limited = limitCareEvents(ordered, url.searchParams);
    return respondMaybeSingle(req, limited);
  }

  if (path === "/rest/v1/care_events" && method === "POST") {
    const session = bearerSession(req);
    if (!session) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const body = await readJson(req);
    const now = new Date().toISOString();
    const event: CareEvent = {
      id: randomUUID(),
      baby_id: String(body.baby_id ?? ""),
      caregiver_id: String(body.caregiver_id ?? session.user.id),
      night_shift_id: (body.night_shift_id as string | null) ?? null,
      event_type: body.event_type as CareEvent["event_type"],
      started_at: String(body.started_at ?? now),
      ended_at: (body.ended_at as string | null) ?? null,
      duration_seconds: (body.duration_seconds as number | null) ?? null,
      metadata_json: (body.metadata_json as Record<string, unknown>) ?? {},
      source: (body.source as CareEvent["source"]) ?? "manual",
      created_at: now,
      updated_at: now,
      deleted_at: null,
    };
    careEvents.push(event);
    return respondSingle(req, event, 201);
  }

  if (path === "/rest/v1/care_events" && method === "PATCH") {
    const session = bearerSession(req);
    if (!session) return NextResponse.json({ message: "unauthorized" }, { status: 401 });
    const body = await readJson(req);
    const url = new URL(req.url);
    const targets = filterCareEvents(careEvents, url.searchParams);
    const now = new Date().toISOString();
    const updated: CareEvent[] = [];
    for (const target of targets) {
      const idx = careEvents.indexOf(target);
      if (idx === -1) continue;
      const next: CareEvent = { ...target };
      for (const [k, v] of Object.entries(body)) {
        (next as unknown as Record<string, unknown>)[k] = v;
      }
      next.updated_at = now;
      careEvents[idx] = next;
      updated.push(next);
    }
    return respondSingle(req, updated[0] ?? null, 200);
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
