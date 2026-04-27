-- =============================================================================
-- Row-level security: caregivers can only access babies they are authorized for
-- =============================================================================

-- Helper: is the current user an authorized (accepted) caregiver for a baby?
create or replace function public.is_baby_caregiver(target_baby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.baby_caregivers bc
    where bc.baby_id = target_baby_id
      and bc.user_id = auth.uid()
      and bc.accepted_at is not null
  );
$$;

create or replace function public.is_baby_owner(target_baby_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.baby_caregivers bc
    where bc.baby_id = target_baby_id
      and bc.user_id = auth.uid()
      and bc.role = 'owner'
      and bc.accepted_at is not null
  );
$$;

-- Enable RLS on every public table
alter table public.users               enable row level security;
alter table public.caregiver_profiles  enable row level security;
alter table public.babies              enable row level security;
alter table public.baby_caregivers     enable row level security;
alter table public.night_shifts        enable row level security;
alter table public.care_events         enable row level security;
alter table public.handoff_summaries   enable row level security;
alter table public.audit_logs          enable row level security;

-- -----------------------------------------------------------------------------
-- users: each user can read & update only their own row
-- -----------------------------------------------------------------------------
create policy users_self_select on public.users
  for select using (id = auth.uid());

create policy users_self_update on public.users
  for update using (id = auth.uid()) with check (id = auth.uid());

-- -----------------------------------------------------------------------------
-- caregiver_profiles: self only
-- -----------------------------------------------------------------------------
create policy caregiver_profiles_self_select on public.caregiver_profiles
  for select using (user_id = auth.uid());

create policy caregiver_profiles_self_insert on public.caregiver_profiles
  for insert with check (user_id = auth.uid());

create policy caregiver_profiles_self_update on public.caregiver_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- babies: visible only to authorized caregivers
-- -----------------------------------------------------------------------------
create policy babies_member_select on public.babies
  for select using (public.is_baby_caregiver(id));

create policy babies_self_create on public.babies
  for insert with check (created_by = auth.uid());

create policy babies_owner_update on public.babies
  for update using (public.is_baby_owner(id)) with check (public.is_baby_owner(id));

create policy babies_owner_delete on public.babies
  for delete using (public.is_baby_owner(id));

-- -----------------------------------------------------------------------------
-- baby_caregivers: visible to members of the same baby; owners manage
-- -----------------------------------------------------------------------------
create policy baby_caregivers_member_select on public.baby_caregivers
  for select using (
    user_id = auth.uid() or public.is_baby_caregiver(baby_id)
  );

create policy baby_caregivers_owner_insert on public.baby_caregivers
  for insert with check (public.is_baby_owner(baby_id));

create policy baby_caregivers_owner_update on public.baby_caregivers
  for update using (public.is_baby_owner(baby_id))
  with check (public.is_baby_owner(baby_id));

create policy baby_caregivers_owner_delete on public.baby_caregivers
  for delete using (public.is_baby_owner(baby_id));

-- A caregiver can accept their own invitation (set accepted_at on their row)
create policy baby_caregivers_self_accept on public.baby_caregivers
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- night_shifts: members of the baby
-- -----------------------------------------------------------------------------
create policy night_shifts_member_select on public.night_shifts
  for select using (public.is_baby_caregiver(baby_id));

create policy night_shifts_member_insert on public.night_shifts
  for insert with check (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  );

create policy night_shifts_caregiver_update on public.night_shifts
  for update using (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  ) with check (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  );

create policy night_shifts_caregiver_delete on public.night_shifts
  for delete using (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- care_events: members of the baby; only the recording caregiver can mutate
-- -----------------------------------------------------------------------------
create policy care_events_member_select on public.care_events
  for select using (public.is_baby_caregiver(baby_id));

create policy care_events_member_insert on public.care_events
  for insert with check (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  );

create policy care_events_caregiver_update on public.care_events
  for update using (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  ) with check (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  );

create policy care_events_caregiver_delete on public.care_events
  for delete using (
    public.is_baby_caregiver(baby_id) and caregiver_id = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- handoff_summaries: members of the baby
-- -----------------------------------------------------------------------------
create policy handoff_summaries_member_select on public.handoff_summaries
  for select using (public.is_baby_caregiver(baby_id));

create policy handoff_summaries_member_insert on public.handoff_summaries
  for insert with check (
    public.is_baby_caregiver(baby_id) and generated_by = auth.uid()
  );

create policy handoff_summaries_author_update on public.handoff_summaries
  for update using (
    public.is_baby_caregiver(baby_id) and generated_by = auth.uid()
  ) with check (
    public.is_baby_caregiver(baby_id) and generated_by = auth.uid()
  );

create policy handoff_summaries_author_delete on public.handoff_summaries
  for delete using (
    public.is_baby_caregiver(baby_id) and generated_by = auth.uid()
  );

-- -----------------------------------------------------------------------------
-- audit_logs: read your own actions; inserts done by SECURITY DEFINER triggers
-- -----------------------------------------------------------------------------
create policy audit_logs_self_select on public.audit_logs
  for select using (actor_id = auth.uid());
