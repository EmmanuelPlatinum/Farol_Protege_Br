create schema if not exists vault;
create extension if not exists supabase_vault with schema vault;

do $$
begin
  if not exists (
    select 1
    from vault.decrypted_secrets
    where name = 'farol_case_data_encryption_key'
  ) then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'hex'),
      'farol_case_data_encryption_key',
      'Encryption key for minor and family names in Farol Infantil cases'
    );
  end if;
end
$$;

create or replace function public.case_data_encryption_key()
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  encryption_key text;
begin
  select secret.decrypted_secret
  into encryption_key
  from vault.decrypted_secrets secret
  where secret.name = 'farol_case_data_encryption_key'
  limit 1;

  if encryption_key is null then
    raise exception 'A chave de criptografia dos dados do caso não está configurada.';
  end if;
  return encryption_key;
end
$$;

revoke all on function public.case_data_encryption_key() from public, anon, authenticated;

alter table public.cases
  add column child_name_ciphertext bytea,
  add column family_name_ciphertext bytea;

update public.cases
set child_name_ciphertext = extensions.pgp_sym_encrypt(
      child_name,
      public.case_data_encryption_key()
    ),
    family_name_ciphertext = extensions.pgp_sym_encrypt(
      family_name,
      public.case_data_encryption_key()
    ),
    child_name = '',
    family_name = '';

alter table public.cases
  alter column child_name_ciphertext set not null,
  alter column family_name_ciphertext set not null;

create or replace function public.encrypt_case_personal_data()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  encryption_key text := public.case_data_encryption_key();
begin
  if tg_op = 'INSERT' then
    if nullif(trim(new.child_name), '') is null then
      raise exception 'O nome da criança ou adolescente é obrigatório.';
    end if;

    new.child_name_ciphertext := extensions.pgp_sym_encrypt(new.child_name, encryption_key);
    new.family_name_ciphertext := extensions.pgp_sym_encrypt(coalesce(new.family_name, ''), encryption_key);
  else
    if new.child_name is distinct from old.child_name and nullif(trim(new.child_name), '') is not null then
      new.child_name_ciphertext := extensions.pgp_sym_encrypt(new.child_name, encryption_key);
    end if;
    if new.family_name is distinct from old.family_name then
      new.family_name_ciphertext := extensions.pgp_sym_encrypt(coalesce(new.family_name, ''), encryption_key);
    end if;
    new.child_name_ciphertext := coalesce(new.child_name_ciphertext, old.child_name_ciphertext);
    new.family_name_ciphertext := coalesce(new.family_name_ciphertext, old.family_name_ciphertext);
  end if;

  new.child_name := '';
  new.family_name := '';
  return new;
end
$$;

create trigger cases_encrypt_personal_data
before insert or update of child_name, family_name, child_name_ciphertext, family_name_ciphertext
on public.cases
for each row execute function public.encrypt_case_personal_data();

create or replace function public.audit_case_access(target_case_id uuid)
returns boolean
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not public.can_access_case(target_case_id) then
    return false;
  end if;

  insert into public.audit_events (case_id, actor_user_id, action, summary)
  values (target_case_id, (select auth.uid()), 'case_viewed', 'Caso acessado por usuário autorizado.');
  return true;
end
$$;

revoke all on function public.audit_case_access(uuid) from public, anon, authenticated;

create or replace function public.record_case_view(p_case_id uuid)
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
    or (select public.current_profile_role()) is null
    or not public.audit_case_access(p_case_id) then
    raise exception 'Caso não encontrado ou sem acesso.' using errcode = '42501';
  end if;
end
$$;

revoke all on function public.record_case_view(uuid) from public, anon;
grant execute on function public.record_case_view(uuid) to authenticated;

drop policy "Cases readable in approved region or by case grant" on public.cases;
create policy "Case reads require approved access"
on public.cases for select to authenticated
using (public.can_access_case(id));

create or replace function public.get_authorized_cases()
returns table (
  id uuid,
  protocol text,
  council_region public.council_region,
  assigned_counselor uuid,
  child_age smallint,
  violation_type text,
  support_need text,
  risk public.case_risk,
  status public.case_status,
  address text,
  description text,
  protective_measures jsonb,
  created_at timestamptz,
  updated_at timestamptz,
  case_timeline jsonb
)
language plpgsql
volatile
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
    or (select public.current_profile_role()) is null
    or (select public.current_profile_region()) is null then
    raise exception 'Perfil sem autorização ativa para consultar casos.' using errcode = '42501';
  end if;

  return query
  select c.id,
    c.protocol,
    c.council_region,
    c.assigned_counselor,
    c.child_age,
    c.violation_type,
    c.support_need,
    c.risk,
    c.status,
    c.address,
    c.description,
    c.protective_measures,
    c.created_at,
    c.updated_at,
    coalesce(
      (
        select jsonb_agg(
          jsonb_build_object(
            'title', timeline.title,
            'details', timeline.details,
            'event_type', timeline.event_type,
            'metadata', timeline.metadata,
            'occurred_at', timeline.occurred_at
          )
          order by timeline.occurred_at
        )
        from public.case_timeline timeline
        where timeline.case_id = c.id
      ),
      '[]'::jsonb
    )
  from public.cases c
  where c.council_region = (select public.current_profile_region())
    and public.audit_case_access(c.id)
  order by c.created_at desc;
end
$$;

revoke all on function public.get_authorized_cases() from public, anon;
grant execute on function public.get_authorized_cases() to authenticated;

create or replace function public.create_case(
  p_child_name text,
  p_family_name text,
  p_child_age smallint,
  p_violation_type text,
  p_support_need text,
  p_risk public.case_risk,
  p_status public.case_status,
  p_address text,
  p_description text
)
returns table (
  id uuid,
  protocol text,
  council_region public.council_region,
  assigned_counselor uuid,
  child_age smallint,
  violation_type text,
  support_need text,
  risk public.case_risk,
  status public.case_status,
  address text,
  description text,
  protective_measures jsonb,
  created_at timestamptz,
  updated_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
declare
  created_case public.cases;
begin
  if not public.is_approved_council_staff()
    or (select public.current_profile_role()) not in ('counselor', 'coordinator', 'admin')
    or (select auth.uid()) is null then
    raise exception 'Perfil sem autorização ativa para criar casos.' using errcode = '42501';
  end if;

  insert into public.cases (
    council_region,
    assigned_counselor,
    family_name,
    child_name,
    child_age,
    violation_type,
    support_need,
    risk,
    status,
    address,
    description
  ) values (
    (select public.current_profile_region()),
    (select auth.uid()),
    coalesce(p_family_name, ''),
    p_child_name,
    p_child_age,
    p_violation_type,
    p_support_need,
    p_risk,
    p_status,
    coalesce(p_address, ''),
    coalesce(p_description, '')
  )
  returning * into created_case;

  return query
  select created_case.id,
    created_case.protocol,
    created_case.council_region,
    created_case.assigned_counselor,
    created_case.child_age,
    created_case.violation_type,
    created_case.support_need,
    created_case.risk,
    created_case.status,
    created_case.address,
    created_case.description,
    created_case.protective_measures,
    created_case.created_at,
    created_case.updated_at;
end
$$;

revoke all on function public.create_case(text, text, smallint, text, text, public.case_risk, public.case_status, text, text) from public, anon;
grant execute on function public.create_case(text, text, smallint, text, text, public.case_risk, public.case_status, text, text) to authenticated;

create or replace function public.get_case_sensitive_data(p_case_id uuid)
returns table (case_id uuid, child_name text, family_name text)
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  stored_case public.cases;
begin
  if (select auth.uid()) is null
    or (select public.current_profile_role()) is null
    or not public.can_access_case(p_case_id) then
    raise exception 'Acesso não autorizado aos dados identificáveis do caso.' using errcode = '42501';
  end if;

  select c.* into stored_case
  from public.cases c
  where c.id = p_case_id;
  if not found then
    raise exception 'Caso não encontrado.' using errcode = 'P0002';
  end if;

  insert into public.audit_events (case_id, actor_user_id, action, summary)
  values (p_case_id, (select auth.uid()), 'case_sensitive_data_viewed', 'Dados identificáveis visualizados por usuário autorizado.');

  return query
  select stored_case.id,
    extensions.pgp_sym_decrypt(stored_case.child_name_ciphertext, public.case_data_encryption_key()),
    extensions.pgp_sym_decrypt(stored_case.family_name_ciphertext, public.case_data_encryption_key());
end
$$;

revoke all on function public.get_case_sensitive_data(uuid) from public, anon;
grant execute on function public.get_case_sensitive_data(uuid) to authenticated;

create or replace function public.update_case_status(
  p_case_id uuid,
  p_status public.case_status
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  old_status public.case_status;
begin
  if not public.is_approved_council_staff()
    or not public.can_access_case(p_case_id)
    or (select public.current_profile_role()) not in ('counselor', 'coordinator', 'admin') then
    raise exception 'Caso não encontrado ou sem acesso.' using errcode = '42501';
  end if;

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

create or replace function public.add_case_protective_measure(
  p_case_id uuid,
  p_measure jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_measures jsonb;
begin
  if not public.is_approved_council_staff()
    or (select public.current_profile_role()) not in ('counselor', 'coordinator', 'admin')
    or not public.can_access_case(p_case_id) then
    raise exception 'Caso não encontrado ou sem acesso.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_measure) is distinct from 'object'
    or nullif(trim(p_measure ->> 'id'), '') is null
    or nullif(trim(p_measure ->> 'title'), '') is null
    or coalesce(p_measure ->> 'status', '') not in ('pending', 'in_progress', 'completed', 'breached')
    or coalesce(p_measure ->> 'deadlineDays', '') !~ '^[0-9]+$' then
    raise exception 'Dados da medida protetiva inválidos.' using errcode = '22023';
  end if;

  select c.protective_measures into current_measures
  from public.cases c
  where c.id = p_case_id
  for update;
  if not found then
    raise exception 'Caso não encontrado.' using errcode = 'P0002';
  end if;

  update public.cases as c
  set protective_measures = current_measures || jsonb_build_array(p_measure)
  where c.id = p_case_id;
  insert into public.case_timeline (case_id, actor_user_id, event_type, title, details)
  values (
    p_case_id,
    (select auth.uid()),
    'protective_measure_added',
    'Medida protetiva incluída',
    (p_measure ->> 'title') || ' · prazo de ' || (p_measure ->> 'deadlineDays') || ' dias.'
  );
  insert into public.audit_events (case_id, actor_user_id, action, summary)
  values (
    p_case_id,
    (select auth.uid()),
    'protective_measure_added',
    'Medida protetiva incluída.'
  );
  return p_measure;
end
$$;

revoke all on function public.add_case_protective_measure(uuid, jsonb) from public, anon;
grant execute on function public.add_case_protective_measure(uuid, jsonb) to authenticated;

create or replace function public.update_case_protective_measure(
  p_case_id uuid,
  p_measure_id text,
  p_changes jsonb
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_measures jsonb;
  target_measure jsonb;
  updated_measure jsonb;
  updated_measures jsonb;
  details text;
begin
  if not public.is_approved_council_staff()
    or (select public.current_profile_role()) not in ('counselor', 'coordinator', 'admin')
    or not public.can_access_case(p_case_id) then
    raise exception 'Caso não encontrado ou sem acesso.' using errcode = '42501';
  end if;
  if jsonb_typeof(p_changes) is distinct from 'object'
    or p_changes = '{}'::jsonb
    or (p_changes - 'status' - 'deadlineDays') <> '{}'::jsonb
    or (p_changes ? 'status' and coalesce(p_changes ->> 'status', '') not in ('pending', 'in_progress', 'completed', 'breached'))
    or (p_changes ? 'deadlineDays' and coalesce(p_changes ->> 'deadlineDays', '') !~ '^[0-9]+$') then
    raise exception 'Atualização da medida protetiva inválida.' using errcode = '22023';
  end if;

  select c.protective_measures into current_measures
  from public.cases c
  where c.id = p_case_id
  for update;
  if not found then
    raise exception 'Caso não encontrado.' using errcode = 'P0002';
  end if;

  select measure into target_measure
  from jsonb_array_elements(current_measures) as item(measure)
  where measure ->> 'id' = p_measure_id
  limit 1;
  if target_measure is null then
    return false;
  end if;

  updated_measure := target_measure || p_changes;
  select jsonb_agg(
    case
      when item.measure ->> 'id' = p_measure_id then updated_measure
      else item.measure
    end
    order by item.ordinality
  )
  into updated_measures
  from jsonb_array_elements(current_measures) with ordinality as item(measure, ordinality);

  update public.cases as c
  set protective_measures = coalesce(updated_measures, '[]'::jsonb)
  where c.id = p_case_id;

  details := case
    when (target_measure ->> 'status') is distinct from (updated_measure ->> 'status')
      then 'Status atualizado: ' || (updated_measure ->> 'status') || '.'
    when (target_measure ->> 'deadlineDays') is distinct from (updated_measure ->> 'deadlineDays')
      then 'Prazo atualizado para ' || (updated_measure ->> 'deadlineDays') || ' dias.'
    else 'Medida atualizada.'
  end;
  insert into public.case_timeline (case_id, actor_user_id, event_type, title, details)
  values (p_case_id, (select auth.uid()), 'protective_measure_updated', updated_measure ->> 'title', details);
  insert into public.audit_events (case_id, actor_user_id, action, summary)
  values (p_case_id, (select auth.uid()), 'protective_measure_updated', details);
  return true;
end
$$;

revoke all on function public.update_case_protective_measure(uuid, text, jsonb) from public, anon;
grant execute on function public.update_case_protective_measure(uuid, text, jsonb) to authenticated;

revoke update on public.cases from authenticated;
revoke insert on public.cases from authenticated;
revoke select on public.cases from authenticated;
revoke select on public.case_timeline from authenticated;

drop function public.get_public_report_status(text);

create function public.get_public_report_status(p_protocol text)
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

create or replace function public.cmdca_safe_category(p_category text)
returns text
language sql
immutable
set search_path = ''
as $$
  select case lower(trim(coalesce(p_category, '')))
    when 'violência doméstica' then 'Violência'
    when 'violência física ou psicológica' then 'Violência'
    when 'abuso ou exploração sexual' then 'Abuso ou exploração'
    when 'negligência' then 'Negligência ou abandono'
    when 'negligência ou abandono' then 'Negligência ou abandono'
    when 'abandono' then 'Negligência ou abandono'
    when 'evasão escolar' then 'Educação'
    when 'negativa de matrícula / falta de cuidador/mediador (aee)' then 'Educação'
    when 'trabalho infantil' then 'Trabalho infantil'
    when 'risco na internet' then 'Risco digital'
    when 'suspensão de tratamento/medicamento de alto custo' then 'Saúde'
    else 'Outras situações'
  end
$$;

revoke all on function public.cmdca_safe_category(text) from public, anon, authenticated;

create or replace function public.get_cmdca_report_summary()
returns table (
  period text,
  region text,
  category text,
  status text,
  total bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_approved_council_staff() then
    raise exception 'Acesso não autorizado ao relatório CMDCA.' using errcode = '42501';
  end if;

  insert into public.audit_events (actor_user_id, action, summary)
  values ((select auth.uid()), 'csv_exported', 'Exportação de relatório agregado do CMDCA.');

  return query
  select to_char(date_trunc('month', c.created_at), 'YYYY-MM'),
    c.council_region::text,
    public.cmdca_safe_category(c.violation_type),
    c.status::text,
    count(*)
  from public.cases c
  where c.council_region = (select public.current_profile_region())
  group by 1, 2, 3, 4
  having count(*) >= 5
  union all
  select to_char(date_trunc('month', r.created_at), 'YYYY-MM'),
    r.council_region::text,
    public.cmdca_safe_category(r.violation_type),
    case
      when r.status = 'received' then 'Recebido'
      when r.status = 'protective_action' then 'Finalizado'
      else 'Em processamento'
    end,
    count(*)
  from public.public_reports r
  where r.council_region = (select public.current_profile_region())
  group by 1, 2, 3, 4
  having count(*) >= 5;
end
$$;

revoke all on function public.get_cmdca_report_summary() from public, anon;
grant execute on function public.get_cmdca_report_summary() to authenticated;

create table public.case_change_signals (
  id bigint generated always as identity primary key,
  council_region public.council_region not null,
  occurred_at timestamptz not null default now()
);

alter table public.case_change_signals enable row level security;

create policy "Approved regional staff receive non-sensitive case change signals"
on public.case_change_signals for select to authenticated
using (
  public.is_approved_council_staff()
  and council_region = (select public.current_profile_region())
);

revoke all on public.case_change_signals from public, anon, authenticated;
grant select on public.case_change_signals to authenticated;

create or replace function public.publish_case_change_signal()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  signal_region public.council_region;
begin
  if tg_table_name = 'cases' then
    signal_region := new.council_region;
  else
    select c.council_region into signal_region
    from public.cases c
    where c.id = new.case_id;
  end if;

  if signal_region is not null then
    insert into public.case_change_signals (council_region)
    values (signal_region);
  end if;
  return new;
end
$$;

revoke all on function public.publish_case_change_signal() from public, anon, authenticated;

create trigger timeline_publish_change_signal
after insert on public.case_timeline
for each row execute function public.publish_case_change_signal();

alter publication supabase_realtime add table public.case_change_signals;

notify pgrst, 'reload schema';
