-- Reconciles the Supabase schema with the current Farol Infantil frontend.
-- Apply after 20261109220000_lovable_cloud_core.sql and
-- 20261110160000_privacy_and_audit_controls.sql. This migration preserves data.

create extension if not exists pgcrypto with schema extensions;

do $$
begin
  create type public.council_region as enum (
    'north', 'south', 'east', 'west', 'central', 'rural'
  );
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.app_role as enum (
    'counselor', 'coordinator', 'admin', 'prosecutor', 'juvenile_court'
  );
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.case_risk as enum ('critical', 'high', 'routine');
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.case_status as enum ('open', 'urgent', 'closed');
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.public_report_status as enum (
    'received',
    'screening',
    'visit_scheduled',
    'visit_completed',
    'referred_network',
    'referred_mp',
    'protective_action'
  );
exception when duplicate_object then null;
end
$$;

do $$
begin
  create type public.shift_period as enum ('day', 'night', 'weekend');
exception when duplicate_object then null;
end
$$;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null check (char_length(full_name) between 2 and 160),
  email text not null,
  employee_registration text,
  council_region public.council_region,
  role public.app_role not null default 'counselor',
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.cases (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique default (
    'CT-' || to_char(now() at time zone 'utc', 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  ),
  council_region public.council_region not null,
  assigned_counselor uuid references public.profiles (id) on delete set null,
  child_name text not null default '',
  family_name text not null default '',
  child_name_ciphertext bytea not null,
  family_name_ciphertext bytea not null,
  child_age smallint check (child_age between 0 and 17),
  violation_type text not null,
  support_need text not null default 'unknown'
    check (support_need in ('confirmed', 'suspected', 'none', 'unknown')),
  risk public.case_risk not null default 'routine',
  status public.case_status not null default 'open',
  address text not null default '',
  description text not null default '',
  protective_measures jsonb not null default '[]'::jsonb
    check (jsonb_typeof(protective_measures) = 'array'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.case_timeline (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  actor_user_id uuid references public.profiles (id) on delete set null,
  event_type text not null,
  title text not null,
  details text not null default '',
  metadata jsonb not null default '{}'::jsonb,
  occurred_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.case_access_grants (
  id uuid primary key default gen_random_uuid(),
  case_id uuid not null references public.cases (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  granted_by uuid not null references public.profiles (id),
  reason text not null check (char_length(reason) between 10 and 1000),
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  revoked_at timestamptz,
  unique (case_id, user_id)
);

create table if not exists public.shifts (
  id uuid primary key default gen_random_uuid(),
  council_region public.council_region not null,
  shift_date date not null,
  shift_period public.shift_period not null,
  counselor_id uuid not null references public.profiles (id),
  replacement_counselor_id uuid references public.profiles (id),
  replacement_reason text,
  replacement_approved_at timestamptz,
  replacement_approved_by uuid references public.profiles (id),
  created_by uuid not null references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (
    replacement_counselor_id is null or
    (replacement_reason is not null and replacement_approved_at is not null
      and replacement_approved_by is not null)
  )
);

create table if not exists public.public_reports (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique default (
    'DEN-' || to_char(now() at time zone 'utc', 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 16))
  ),
  council_region public.council_region not null,
  violation_type text not null check (char_length(violation_type) between 2 and 200),
  approximate_area text not null default '' check (char_length(approximate_area) <= 200),
  support_need text not null default 'unknown'
    check (support_need in ('confirmed', 'suspected', 'none', 'unknown')),
  description text not null check (char_length(description) between 5 and 5000),
  status public.public_report_status not null default 'received',
  created_at timestamptz not null default now(),
  triaged_at timestamptz,
  triaged_by uuid references public.profiles (id)
);

create table if not exists public.audit_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases (id) on delete set null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  summary text not null,
  occurred_at timestamptz not null default now(),
  client_metadata jsonb not null default '{}'::jsonb
);

create table if not exists public.case_change_signals (
  id bigint generated always as identity primary key,
  council_region public.council_region not null,
  occurred_at timestamptz not null default now()
);

-- Upgrade the existing text period column without discarding shift records.
alter table public.shifts drop constraint if exists shifts_shift_period_check;
alter table public.shifts
  alter column shift_period type public.shift_period
  using shift_period::public.shift_period;

create index if not exists cases_region_status_idx
  on public.cases (council_region, status, created_at desc);
create index if not exists timeline_case_time_idx
  on public.case_timeline (case_id, occurred_at desc);
create index if not exists shifts_region_date_idx
  on public.shifts (council_region, shift_date);
create unique index if not exists shifts_region_date_period_uidx
  on public.shifts (council_region, shift_date, shift_period);
create index if not exists public_reports_region_status_idx
  on public.public_reports (council_region, status, created_at desc);
create index if not exists audit_events_case_time_idx
  on public.audit_events (case_id, occurred_at desc);
create index if not exists case_change_signals_region_time_idx
  on public.case_change_signals (council_region, occurred_at desc);

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_timeline enable row level security;
alter table public.case_access_grants enable row level security;
alter table public.shifts enable row level security;
alter table public.public_reports enable row level security;
alter table public.audit_events enable row level security;
alter table public.case_change_signals enable row level security;

-- Profile rows are provisioned by the auth.users trigger. Clients cannot
-- choose their own role, region, or approval state.
drop policy if exists "Profiles readable by self or regional administration"
  on public.profiles;
create policy "Profiles readable by self or regional administration"
on public.profiles for select to authenticated
using (
  id = (select auth.uid())
  or (
    public.is_approved_council_staff()
    and council_region = (select public.current_profile_region())
    and (select public.current_profile_role()) in ('coordinator', 'admin')
  )
);
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

-- Case rows (including ciphertext and identifying columns) are not directly
-- selectable by browser clients. Read access is through audited definer RPCs.
drop policy if exists "Cases readable in approved region or by case grant"
  on public.cases;
drop policy if exists "Case reads require approved access" on public.cases;
drop policy if exists "Regional staff may create cases" on public.cases;
drop policy if exists "Regional staff may update cases" on public.cases;
create policy "Case reads require approved access"
on public.cases for select to authenticated
using (public.can_access_case(id));
create policy "Regional staff may create cases"
on public.cases for insert to authenticated
with check (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
  and council_region = (select public.current_profile_region())
  and assigned_counselor is not distinct from (select auth.uid())
);
create policy "Regional staff may update cases"
on public.cases for update to authenticated
using (
  public.can_access_case(id)
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
  and council_region = (select public.current_profile_region())
)
with check (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
  and council_region = (select public.current_profile_region())
);
revoke all on public.cases from public, anon, authenticated;

drop policy if exists "Case timeline readable by authorized case users"
  on public.case_timeline;
drop policy if exists "Case timeline append-only for authorized case users"
  on public.case_timeline;
create policy "Case timeline readable by authorized case users"
on public.case_timeline for select to authenticated
using (public.can_access_case(case_id));
create policy "Case timeline append-only for authorized case users"
on public.case_timeline for insert to authenticated
with check (
  public.can_access_case(case_id)
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
  and actor_user_id = (select auth.uid())
);
revoke all on public.case_timeline from public, anon, authenticated;
grant insert on public.case_timeline to authenticated;

drop policy if exists "Access grants readable by grantee or regional administrator"
  on public.case_access_grants;
drop policy if exists "Regional administrators manage temporary case grants"
  on public.case_access_grants;
drop policy if exists "Regional administrators create temporary case grants"
  on public.case_access_grants;
drop policy if exists "Regional administrators update temporary case grants"
  on public.case_access_grants;
create policy "Access grants readable by grantee or regional administrator"
on public.case_access_grants for select to authenticated
using (
  user_id = (select auth.uid())
  or (
    public.is_approved_council_staff()
    and (select public.current_profile_role()) in ('coordinator', 'admin')
    and exists (
      select 1 from public.cases c
      where c.id = case_id and c.council_region = (select public.current_profile_region())
    )
  )
);
create policy "Regional administrators create temporary case grants"
on public.case_access_grants for insert to authenticated
with check (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('coordinator', 'admin')
  and granted_by = (select auth.uid())
  and exists (
    select 1 from public.cases c
    where c.id = case_id and c.council_region = (select public.current_profile_region())
  )
);
create policy "Regional administrators update temporary case grants"
on public.case_access_grants for update to authenticated
using (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('coordinator', 'admin')
  and exists (
    select 1 from public.cases c
    where c.id = case_id and c.council_region = (select public.current_profile_region())
  )
)
with check (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('coordinator', 'admin')
  and exists (
    select 1 from public.cases c
    where c.id = case_id and c.council_region = (select public.current_profile_region())
  )
);
revoke all on public.case_access_grants from public, anon, authenticated;
grant select, insert on public.case_access_grants to authenticated;
grant update (revoked_at) on public.case_access_grants to authenticated;

drop policy if exists "Regional staff may read shifts" on public.shifts;
drop policy if exists "Regional administrators manage shifts" on public.shifts;
create policy "Regional staff may read shifts"
on public.shifts for select to authenticated
using (
  public.is_approved_council_staff()
  and council_region = (select public.current_profile_region())
);
create policy "Regional administrators manage shifts"
on public.shifts for all to authenticated
using (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('coordinator', 'admin')
  and council_region = (select public.current_profile_region())
)
with check (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('coordinator', 'admin')
  and council_region = (select public.current_profile_region())
  and created_by = (select auth.uid())
);
revoke all on public.shifts from public, anon, authenticated;
grant select, insert, update, delete on public.shifts to authenticated;

drop policy if exists "Approved regional staff read incoming anonymous reports"
  on public.public_reports;
drop policy if exists "Regional staff triage incoming reports"
  on public.public_reports;
create policy "Approved regional staff read incoming anonymous reports"
on public.public_reports for select to authenticated
using (
  public.is_approved_council_staff()
  and council_region = (select public.current_profile_region())
);
create policy "Regional staff triage incoming reports"
on public.public_reports for update to authenticated
using (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
  and council_region = (select public.current_profile_region())
)
with check (
  public.is_approved_council_staff()
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
  and council_region = (select public.current_profile_region())
  and status = 'screening'
  and triaged_by = (select auth.uid())
);
revoke all on public.public_reports from public, anon, authenticated;
grant select on public.public_reports to authenticated;
grant update (status, triaged_at, triaged_by) on public.public_reports to authenticated;

drop policy if exists "Users read their own audit events" on public.audit_events;
drop policy if exists "Authenticated users append audit events" on public.audit_events;
create policy "Users read their own audit events"
on public.audit_events for select to authenticated
using (
  actor_user_id = (select auth.uid())
  or (case_id is not null and public.can_access_case(case_id))
);
create policy "Authenticated users append audit events"
on public.audit_events for insert to authenticated
with check (
  actor_user_id = (select auth.uid())
  and (select public.current_profile_role()) is not null
  and (case_id is null or public.can_access_case(case_id))
  and action in (
    'case_viewed',
    'case_sensitive_data_viewed',
    'case_viewed_unmasked',
    'csv_exported',
    'letter_generated',
    'case_status_changed',
    'protective_measure_added',
    'protective_measure_updated',
    'protective_measure_status_changed',
    'privacy_mode_disabled'
  )
);
revoke all on public.audit_events from public, anon, authenticated;
grant select, insert on public.audit_events to authenticated;

drop policy if exists "Approved regional staff receive non-sensitive case change signals"
  on public.case_change_signals;
create policy "Approved regional staff receive non-sensitive case change signals"
on public.case_change_signals for select to authenticated
using (
  public.is_approved_council_staff()
  and council_region = (select public.current_profile_region())
);
revoke all on public.case_change_signals from public, anon, authenticated;
grant select on public.case_change_signals to authenticated;

-- Public callers can submit through the validated RPC only. Tracking returns
-- only an opaque protocol and one of three generic statuses.
create or replace function public.get_public_report_status(p_protocol text)
returns table (protocol text, status text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    r.protocol,
    case
      when r.status = 'received' then 'received'
      when r.status = 'protective_action' then 'finalized'
      else 'processing'
    end
  from public.public_reports r
  where r.protocol = upper(trim(p_protocol))
$$;
revoke all on function public.get_public_report_status(text) from public;
grant execute on function public.get_public_report_status(text) to anon, authenticated;

-- Audit rows cannot be changed or deleted through application roles.
create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Eventos de auditoria são append-only.';
end
$$;
drop trigger if exists audit_events_immutable on public.audit_events;
create trigger audit_events_immutable
before update or delete on public.audit_events
for each row execute function public.prevent_audit_mutation();

-- Realtime contains only regional change signals and incoming reports; case
-- contents are fetched through authorized RPCs, not broadcast as row payloads.
do $$
begin
  alter publication supabase_realtime add table public.public_reports;
exception when duplicate_object then null;
end
$$;
do $$
begin
  alter publication supabase_realtime add table public.case_change_signals;
exception when duplicate_object then null;
end
$$;

notify pgrst, 'reload schema';
