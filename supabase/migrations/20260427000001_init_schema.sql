-- =============================================================================
-- Newborn Night Shift Copilot - initial schema
-- =============================================================================
-- Tables:
--   users               - mirrors auth.users so FKs can target a public table
--   caregiver_profiles  - caregiver-specific profile data
--   babies              - the baby being cared for
--   baby_caregivers     - many-to-many membership (which caregiver can see which baby)
--   night_shifts        - a logical "shift" (one caregiver, one baby, one window)
--   care_events         - feed | diaper | sleep | soothing | note
--   handoff_summaries   - generated summary text shared between caregivers
--   audit_logs          - append-only record of mutations
-- =============================================================================

create extension if not exists "pgcrypto";

-- -----------------------------------------------------------------------------
-- users (mirror of auth.users)
-- -----------------------------------------------------------------------------
create table public.users (
  id          uuid primary key references auth.users (id) on delete cascade,
  email       text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, email)
  values (new.id, new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_auth_user();

-- -----------------------------------------------------------------------------
-- caregiver_profiles
-- -----------------------------------------------------------------------------
create table public.caregiver_profiles (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null unique references public.users (id) on delete cascade,
  display_name  text,
  timezone      text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- babies
-- -----------------------------------------------------------------------------
create table public.babies (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  birth_date  date,
  created_by  uuid not null references public.users (id) on delete restrict,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  deleted_at  timestamptz
);
create index babies_created_by_idx on public.babies (created_by);

-- -----------------------------------------------------------------------------
-- baby_caregivers (membership)
-- -----------------------------------------------------------------------------
create type public.caregiver_role as enum ('owner', 'caregiver');

create table public.baby_caregivers (
  baby_id       uuid not null references public.babies (id) on delete cascade,
  user_id       uuid not null references public.users (id) on delete cascade,
  role          public.caregiver_role not null default 'caregiver',
  invited_by    uuid references public.users (id),
  accepted_at   timestamptz,
  created_at    timestamptz not null default now(),
  primary key (baby_id, user_id)
);
create index baby_caregivers_user_idx on public.baby_caregivers (user_id);

-- -----------------------------------------------------------------------------
-- night_shifts
-- -----------------------------------------------------------------------------
create table public.night_shifts (
  id            uuid primary key default gen_random_uuid(),
  baby_id       uuid not null references public.babies (id) on delete cascade,
  caregiver_id  uuid not null references public.users (id) on delete restrict,
  started_at    timestamptz not null default now(),
  ended_at      timestamptz,
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz
);
create index night_shifts_baby_idx on public.night_shifts (baby_id, started_at desc);
create index night_shifts_caregiver_idx on public.night_shifts (caregiver_id, started_at desc);

-- -----------------------------------------------------------------------------
-- care_events
-- -----------------------------------------------------------------------------
create type public.care_event_type as enum ('feed', 'diaper', 'sleep', 'soothing', 'note');
create type public.care_event_source as enum ('manual', 'ai_parsed', 'system');

create table public.care_events (
  id                uuid primary key default gen_random_uuid(),
  baby_id           uuid not null references public.babies (id) on delete cascade,
  caregiver_id      uuid not null references public.users (id) on delete restrict,
  night_shift_id    uuid references public.night_shifts (id) on delete set null,
  event_type        public.care_event_type not null,
  started_at        timestamptz not null,
  ended_at          timestamptz,
  duration_seconds  integer,
  metadata_json     jsonb not null default '{}'::jsonb,
  source            public.care_event_source not null default 'manual',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  deleted_at        timestamptz,
  constraint care_events_duration_nonneg
    check (duration_seconds is null or duration_seconds >= 0),
  constraint care_events_end_after_start
    check (ended_at is null or ended_at >= started_at)
);
create index care_events_baby_started_idx
  on public.care_events (baby_id, started_at desc)
  where deleted_at is null;
create index care_events_shift_idx
  on public.care_events (night_shift_id, started_at desc)
  where deleted_at is null;

-- -----------------------------------------------------------------------------
-- handoff_summaries
-- -----------------------------------------------------------------------------
create table public.handoff_summaries (
  id              uuid primary key default gen_random_uuid(),
  baby_id         uuid not null references public.babies (id) on delete cascade,
  night_shift_id  uuid references public.night_shifts (id) on delete set null,
  generated_by    uuid not null references public.users (id) on delete restrict,
  summary_text    text not null,
  share_token     text unique,
  shared_at       timestamptz,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);
create index handoff_summaries_baby_idx on public.handoff_summaries (baby_id, created_at desc);

-- -----------------------------------------------------------------------------
-- audit_logs
-- -----------------------------------------------------------------------------
create type public.audit_action as enum ('insert', 'update', 'delete', 'soft_delete', 'restore');

create table public.audit_logs (
  id          bigserial primary key,
  actor_id    uuid references public.users (id),
  table_name  text not null,
  row_id      uuid not null,
  action      public.audit_action not null,
  diff        jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index audit_logs_actor_idx on public.audit_logs (actor_id, created_at desc);
create index audit_logs_row_idx on public.audit_logs (table_name, row_id, created_at desc);

-- -----------------------------------------------------------------------------
-- updated_at triggers
-- -----------------------------------------------------------------------------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger users_touch_updated_at
  before update on public.users
  for each row execute function public.touch_updated_at();

create trigger caregiver_profiles_touch_updated_at
  before update on public.caregiver_profiles
  for each row execute function public.touch_updated_at();

create trigger babies_touch_updated_at
  before update on public.babies
  for each row execute function public.touch_updated_at();

create trigger night_shifts_touch_updated_at
  before update on public.night_shifts
  for each row execute function public.touch_updated_at();

create trigger care_events_touch_updated_at
  before update on public.care_events
  for each row execute function public.touch_updated_at();

create trigger handoff_summaries_touch_updated_at
  before update on public.handoff_summaries
  for each row execute function public.touch_updated_at();

-- -----------------------------------------------------------------------------
-- baby ownership bootstrap: when a baby is created, the creator becomes owner
-- -----------------------------------------------------------------------------
create or replace function public.bootstrap_baby_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.baby_caregivers (baby_id, user_id, role, accepted_at)
  values (new.id, new.created_by, 'owner', now())
  on conflict (baby_id, user_id) do nothing;
  return new;
end;
$$;

create trigger babies_bootstrap_ownership
  after insert on public.babies
  for each row execute function public.bootstrap_baby_ownership();
