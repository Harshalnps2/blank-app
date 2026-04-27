-- =============================================================================
-- Audit log triggers
-- =============================================================================
-- Fires on insert/update/delete for the mutable, caregiver-owned tables.
-- Soft-deletes (UPDATE that sets deleted_at) are recorded as 'soft_delete'.
-- =============================================================================

create or replace function public.write_audit_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_action public.audit_action;
  v_row_id uuid;
  v_diff   jsonb;
begin
  if (tg_op = 'INSERT') then
    v_action := 'insert';
    v_row_id := (new).id;
    v_diff   := to_jsonb(new);
  elsif (tg_op = 'DELETE') then
    v_action := 'delete';
    v_row_id := (old).id;
    v_diff   := to_jsonb(old);
  else -- UPDATE
    v_row_id := (new).id;
    v_diff   := jsonb_build_object('old', to_jsonb(old), 'new', to_jsonb(new));
    if (to_jsonb(old) ? 'deleted_at')
       and (old).deleted_at is null
       and (new).deleted_at is not null then
      v_action := 'soft_delete';
    elsif (to_jsonb(old) ? 'deleted_at')
       and (old).deleted_at is not null
       and (new).deleted_at is null then
      v_action := 'restore';
    else
      v_action := 'update';
    end if;
  end if;

  insert into public.audit_logs (actor_id, table_name, row_id, action, diff)
  values (auth.uid(), tg_table_name, v_row_id, v_action, v_diff);

  return coalesce(new, old);
end;
$$;

create trigger babies_audit
  after insert or update or delete on public.babies
  for each row execute function public.write_audit_log();

create trigger night_shifts_audit
  after insert or update or delete on public.night_shifts
  for each row execute function public.write_audit_log();

create trigger care_events_audit
  after insert or update or delete on public.care_events
  for each row execute function public.write_audit_log();

create trigger handoff_summaries_audit
  after insert or update or delete on public.handoff_summaries
  for each row execute function public.write_audit_log();
