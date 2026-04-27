import { vi, type Mock } from "vitest";
import type { AppSupabaseClient } from "@/lib/supabase";

/**
 * Minimal mock of the chained `client.from(...).insert(...).select().single()`
 * shape used by the care-events repository.
 *
 * Each builder method is its OWN `vi.fn()` so call counts and assertions
 * don't collide across methods. Every method returns the builder itself
 * (so chains of any length resolve), and the builder is thenable so
 * `await query` resolves to the configured `{ data, error }` result.
 */
export interface MockBuilder {
  insert: Mock;
  update: Mock;
  delete: Mock;
  select: Mock;
  eq: Mock;
  gte: Mock;
  is: Mock;
  order: Mock;
  limit: Mock;
  single: Mock;
  maybeSingle: Mock;
  then: Mock;
}

export interface MockSupabase {
  client: AppSupabaseClient;
  from: Mock;
  builder: MockBuilder;
}

interface Result<T> {
  data: T | null;
  error: { message: string } | null;
}

export function createMockSupabase<T>(result: Result<T>): MockSupabase {
  const builder = {} as MockBuilder;

  const chain = (): MockBuilder => builder;

  builder.insert = vi.fn(chain);
  builder.update = vi.fn(chain);
  builder.delete = vi.fn(chain);
  builder.select = vi.fn(chain);
  builder.eq = vi.fn(chain);
  builder.gte = vi.fn(chain);
  builder.is = vi.fn(chain);
  builder.order = vi.fn(chain);
  builder.limit = vi.fn(chain);

  builder.single = vi.fn(() => Promise.resolve(result));
  builder.maybeSingle = vi.fn(() => Promise.resolve(result));

  // Make the builder thenable so awaiting it (without a terminal call) works.
  builder.then = vi.fn(
    (resolve: (value: Result<T>) => unknown, reject?: (reason: unknown) => unknown) =>
      Promise.resolve(result).then(resolve, reject),
  );

  const from = vi.fn(() => builder);

  const client = { from } as unknown as AppSupabaseClient;

  return { client, from, builder };
}
