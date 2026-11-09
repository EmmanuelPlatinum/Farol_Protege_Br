create extension if not exists pgcrypto with schema extensions;

create type public.council_region as enum (
  'north',
  'south',
  'east',
  'west',
  'central',
  'rural'
);

create type public.app_role as enum (
  'counselor',
  'coordinator',
  'admin',
  'prosecutor',
  'juvenile_court'
);

create type public.case_risk as enum ('critical', 'high', 'routine');
create type public.case_status as enum ('open', 'urgent', 'closed');
create type public.public_report_status as enum (
  'received',
  'screening',
  'visit_scheduled',
  'visit_completed',
  'referred_network',
  'referred_mp',
  'protective_action'
);

create table public.profiles (
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

create table public.cases (
  id uuid primary key default gen_random_uuid(),
  protocol text not null unique default (
    'CT-' || to_char(now() at time zone 'utc', 'YYYY') || '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 12))
  ),
  council_region public.council_region not null,
  assigned_counselor uuid references public.profiles (id) on delete set null,
  family_name text not null default '',
  child_name text not null,
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

create table public.case_timeline (
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

create table public.case_access_grants (
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

create table public.shifts (
  id uuid primary key default gen_random_uuid(),
  council_region public.council_region not null,
  shift_date date not null,
  shift_period text not null check (shift_period in ('day', 'night', 'weekend')),
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
    (replacement_reason is not null and replacement_approved_at is not null and replacement_approved_by is not null)
  )
);

create table public.public_reports (
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

create table public.audit_events (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references public.cases (id) on delete set null,
  actor_user_id uuid references public.profiles (id) on delete set null,
  action text not null,
  summary text not null,
  occurred_at timestamptz not null default now(),
  client_metadata jsonb not null default '{}'::jsonb
);

create index cases_region_status_idx on public.cases (council_region, status, created_at desc);
create index timeline_case_time_idx on public.case_timeline (case_id, occurred_at desc);
create index shifts_region_date_idx on public.shifts (council_region, shift_date);
create unique index shifts_region_date_period_uidx
  on public.shifts (council_region, shift_date, shift_period);
create index public_reports_region_status_idx on public.public_reports (council_region, status, created_at desc);
create index audit_events_case_time_idx on public.audit_events (case_id, occurred_at desc);

create or replace function public.current_profile_region()
returns public.council_region
language sql
stable
security definer
set search_path = ''
as $$
  select p.council_region
  from public.profiles p
  where p.id = (select auth.uid())
    and p.approved_at is not null
$$;

create or replace function public.current_profile_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  where p.id = (select auth.uid())
    and p.approved_at is not null
$$;

create or replace function public.is_approved_council_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = (select auth.uid())
      and p.approved_at is not null
      and p.role in ('counselor', 'coordinator', 'admin')
      and p.council_region is not null
  )
$$;

create or replace function public.can_access_case(target_case_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.cases c
    join public.profiles p on p.id = (select auth.uid())
    where c.id = target_case_id
      and p.approved_at is not null
      and (
        (p.role in ('counselor', 'coordinator', 'admin') and p.council_region = c.council_region)
        or exists (
          select 1
          from public.case_access_grants g
          where g.case_id = c.id
            and g.user_id = p.id
            and g.revoked_at is null
            and g.expires_at > now()
        )
      )
  )
$$;

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end
$$;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, employee_registration, council_region)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Aguardando identificação'),
    new.email,
    nullif(trim(new.raw_user_meta_data ->> 'employee_registration'), ''),
    case new.raw_user_meta_data ->> 'council_region'
      when 'north' then 'north'::public.council_region
      when 'south' then 'south'::public.council_region
      when 'east' then 'east'::public.council_region
      when 'west' then 'west'::public.council_region
      when 'central' then 'central'::public.council_region
      when 'rural' then 'rural'::public.council_region
      else null
    end
  );
  return new;
end
$$;

create trigger auth_user_profile_created
after insert on auth.users
for each row execute function public.create_profile_for_new_user();

create trigger profiles_touch_updated_at before update on public.profiles
for each row execute function public.touch_updated_at();
create trigger cases_touch_updated_at before update on public.cases
for each row execute function public.touch_updated_at();
create trigger shifts_touch_updated_at before update on public.shifts
for each row execute function public.touch_updated_at();

create or replace function public.record_new_case()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.case_timeline (
    case_id, actor_user_id, event_type, title, details
  ) values (
    new.id,
    (select auth.uid()),
    'case_created',
    'Caso aberto',
    'Cadastro registrado no Conselho Tutelar.'
  );
  return new;
end
$$;

create trigger cases_record_created
after insert on public.cases
for each row execute function public.record_new_case();

create or replace function public.update_case_status(
  p_case_id uuid,
  p_status public.case_status
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  old_status public.case_status;
begin
  select c.status into old_status
  from public.cases c
  where c.id = p_case_id
  for update;
  if not found then
    raise exception 'Caso não encontrado ou sem acesso.' using errcode = 'P0002';
  end if;
  if old_status = p_status then
    return;
  end if;

  update public.cases set status = p_status where id = p_case_id;
  insert into public.case_timeline (
    case_id, actor_user_id, event_type, title, details
  ) values (
    p_case_id,
    (select auth.uid()),
    'status_changed',
    'Status do caso alterado',
    old_status::text || ' → ' || p_status::text
  );
  insert into public.audit_events (case_id, actor_user_id, action, summary)
  values (
    p_case_id,
    (select auth.uid()),
    'case_status_changed',
    old_status::text || ' → ' || p_status::text
  );
end
$$;

create or replace function public.submit_public_report(
  p_council_region public.council_region,
  p_violation_type text,
  p_approximate_area text,
  p_support_need text,
  p_description text
)
returns table (protocol text, created_at timestamptz)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created public.public_reports;
begin
  if p_violation_type is null or char_length(trim(p_violation_type)) not between 2 and 200 then
    raise exception 'Tipo de violação inválido.' using errcode = '22023';
  end if;
  if p_approximate_area is not null and char_length(p_approximate_area) > 200 then
    raise exception 'Região aproximada excede o limite.' using errcode = '22023';
  end if;
  if p_description is null or char_length(trim(p_description)) not between 5 and 5000 then
    raise exception 'Descrição inválida.' using errcode = '22023';
  end if;
  if coalesce(p_support_need, 'unknown') not in ('confirmed', 'suspected', 'none', 'unknown') then
    raise exception 'Indicador de apoio inválido.' using errcode = '22023';
  end if;

  insert into public.public_reports (
    council_region, violation_type, approximate_area, support_need, description
  ) values (
    p_council_region,
    trim(p_violation_type),
    coalesce(trim(p_approximate_area), ''),
    coalesce(p_support_need, 'unknown'),
    trim(p_description)
  )
  returning * into created;

  return query select created.protocol, created.created_at;
end
$$;

create or replace function public.get_public_report_status(p_protocol text)
returns table (
  protocol text,
  status public.public_report_status,
  created_at timestamptz,
  triaged_at timestamptz
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.protocol, r.status, r.created_at, r.triaged_at
  from public.public_reports r
  where r.protocol = upper(trim(p_protocol))
$$;

revoke all on function public.submit_public_report(public.council_region, text, text, text, text) from public;
grant execute on function public.submit_public_report(public.council_region, text, text, text, text) to anon, authenticated;
revoke all on function public.get_public_report_status(text) from public;
grant execute on function public.get_public_report_status(text) to anon, authenticated;
revoke all on function public.current_profile_region() from public;
revoke all on function public.current_profile_role() from public;
revoke all on function public.is_approved_council_staff() from public;
revoke all on function public.can_access_case(uuid) from public;
grant execute on function public.current_profile_region() to authenticated;
grant execute on function public.current_profile_role() to authenticated;
grant execute on function public.is_approved_council_staff() to authenticated;
grant execute on function public.can_access_case(uuid) to authenticated;
revoke all on function public.update_case_status(uuid, public.case_status) from public;
grant execute on function public.update_case_status(uuid, public.case_status) to authenticated;

alter table public.profiles enable row level security;
alter table public.cases enable row level security;
alter table public.case_timeline enable row level security;
alter table public.case_access_grants enable row level security;
alter table public.shifts enable row level security;
alter table public.public_reports enable row level security;
alter table public.audit_events enable row level security;

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

create policy "Cases readable in approved region or by case grant"
on public.cases for select to authenticated
using (public.can_access_case(id));

create policy "Regional staff may create cases"
on public.cases for insert to authenticated
with check (
  public.is_approved_council_staff()
  and council_region = (select public.current_profile_region())
  and assigned_counselor is not distinct from (select auth.uid())
);

create policy "Regional staff may update cases"
on public.cases for update to authenticated
using (
  public.can_access_case(id)
  and (select public.current_profile_role()) in ('counselor', 'coordinator', 'admin')
)
with check (public.can_access_case(id));

revoke all on public.cases from public, anon, authenticated;
grant select, insert, update on public.cases to authenticated;

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
grant select, insert on public.case_timeline to authenticated;

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

create policy "Regional administrators manage temporary case grants"
on public.case_access_grants for all to authenticated
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
  and granted_by = (select auth.uid())
  and exists (
    select 1 from public.cases c
    where c.id = case_id and c.council_region = (select public.current_profile_region())
  )
);

revoke all on public.case_access_grants from public, anon, authenticated;
grant select, insert, update, delete on public.case_access_grants to authenticated;

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
  and council_region = (select public.current_profile_region())
)
with check (
  public.is_approved_council_staff()
  and council_region = (select public.current_profile_region())
  and triaged_by = (select auth.uid())
);

revoke all on public.public_reports from public, anon, authenticated;
grant select on public.public_reports to authenticated;
grant update (status, triaged_at, triaged_by) on public.public_reports to authenticated;

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
);

revoke all on public.audit_events from public, anon, authenticated;
grant select, insert on public.audit_events to authenticated;

create or replace function public.prevent_audit_mutation()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  raise exception 'Eventos de auditoria são append-only.';
end
$$;

create trigger audit_events_immutable
before update or delete on public.audit_events
for each row execute function public.prevent_audit_mutation();

alter publication supabase_realtime add table public.public_reports;
alter publication supabase_realtime add table public.cases;
alter publication supabase_realtime add table public.shifts;
alter publication supabase_realtime add table public.audit_events;
