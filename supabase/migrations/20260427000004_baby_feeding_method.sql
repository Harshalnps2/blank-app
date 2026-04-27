-- =============================================================================
-- Adds feeding_method to babies, captured during onboarding.
-- 'unknown' is the default so a baby created before this column existed
-- (or via a future flow that does not collect it) still satisfies the NOT NULL.
-- =============================================================================

create type public.feeding_method as enum ('breast', 'bottle', 'combo', 'unknown');

alter table public.babies
  add column feeding_method public.feeding_method not null default 'unknown';
