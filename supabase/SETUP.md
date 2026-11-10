# Supabase setup — Farol Infantil

1. Enable Lovable Cloud for this project and open its Supabase SQL editor.
2. For a new Supabase project, apply every file in `migrations/` in filename order:
   - `20261109220000_lovable_cloud_core.sql`
   - `20261110160000_privacy_and_audit_controls.sql`
   - `20261110180000_farol_infantil_schema_rls.sql`
   For a project where the first two migrations have already been applied, apply only the third migration. It is a forward migration and preserves existing records; do not run it before the earlier migrations.
3. Configure `VITE_SUPABASE_URL` and the publishable/anon key from the Cloud project as build environment variables. For local development, copy `.env.example` to `.env.local`; never add a service-role key to the frontend.
4. Configure Auth email confirmation, password policy, redirect URLs, and SMTP in the Cloud dashboard before inviting real users.
5. Registration creates an unapproved profile. A trusted administrator must verify the user's identity and activate the profile through an administrative workflow before case access is granted. Do not approve users based only on self-reported registration/region.
6. Enable backups, point-in-time recovery, monitoring, and a retention policy appropriate for sensitive child-protection records before production use.
7. Test the complete migration chain on a separate development Supabase project and verify its policies and RPCs before applying it to any production project. The migration files in this repository have not been executed against a live Supabase project.

## Current database model

The migrations define these persisted tables and relationships:

- `profiles`: one-to-one with `auth.users`; stores staff identity, role, approval, and council region.
- `cases`: regional case records assigned to a profile. Child/family names are stored encrypted; direct browser reads of the table are revoked.
- `case_timeline`: append-only events belonging to a case and optionally attributed to a profile.
- `case_access_grants`: temporary, expiring cross-region access grants for an individual case.
- `shifts`: regional shifts with counselor and optional approved replacement profile references.
- `public_reports`: anonymous intake records with regional triage attribution; only the submit and generic-status RPCs are public.
- `audit_events`: append-only access and action history, optionally linked to a case and actor.
- `case_change_signals`: non-sensitive region-scoped realtime invalidation signals; it contains no case details.

The PostgreSQL enums are `council_region`, `app_role`, `case_risk`, `case_status`, `public_report_status`, and `shift_period`. `support_need` remains a checked text value to match the current RPC/API contract. Protective measures and official-communication metadata are persisted in the existing case JSON/timeline fields; the current frontend does not use separate relational tables for them.

RLS denies public access to staff and case tables. Approved staff can access cases through scoped security-definer RPCs; sensitive names are decrypted only by `get_case_sensitive_data`, which records an audit event. Anonymous submission is limited to `submit_public_report`; `get_public_report_status` exposes only a generic status. Staff can read and triage only their approved region's incoming reports. Realtime case updates contain region-only signals, not case rows.

The case/report RPCs used by the current frontend are `submit_public_report`, `get_public_report_status`, `get_authorized_cases`, `get_case_sensitive_data`, `create_case`, `update_case_status`, `add_case_protective_measure`, `update_case_protective_measure`, and `get_cmdca_report_summary`.

The education hub, synthetic analytics, local hash-chain demonstration, offline checklist, and council directory are static/local prototype features and do not currently persist to Supabase. No tables for them are created until the frontend has a real, approved persistence workflow.

## Initial administrator approval

There is no self-service administrator bootstrap. After the first trusted operator has registered and verified their email/identity, use the Cloud SQL editor with an authorized project administrator to inspect the profile and approve that exact UUID. For example:

```sql
select id, email, full_name, employee_registration, council_region, role, approved_at
from public.profiles
where email = 'verified-operator@example.org';

update public.profiles
set role = 'admin',
    council_region = 'central',
    approved_at = now()
where id = 'REPLACE-WITH-VERIFIED-PROFILE-UUID'
  and approved_at is null
returning id, email, role, council_region, approved_at;
```

Replace both example values only after independently verifying the operator. Approve subsequent staff only after checking their identity, council assignment, and role. Never expose this approval operation through a public client or ship a service-role key to the browser.

The six region enum values map to Cuiabá's regional councils: north/CPA, south/Pedra 90, east/Planalto, west/Santa Izabel, central/Dom Aquino, and rural/districts.

Public submissions go through the `submit_public_report` RPC. Anonymous users cannot select or enumerate reports; staff can read only reports for their approved region. Public tracking should use the opaque protocol with `get_public_report_status` and must never expose case details or internal investigation stages.

`audit_events` is append-only at the database layer for application roles. It is not a substitute for provider-level audit logs, immutable backups, or a formally approved records-retention policy.
