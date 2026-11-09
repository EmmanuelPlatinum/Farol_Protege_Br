# Lovable Cloud setup

1. Enable Lovable Cloud for this project and open its Supabase SQL editor.
2. Apply `migrations/20261109220000_lovable_cloud_core.sql`.
3. Configure `VITE_SUPABASE_URL` and the publishable/anon key from the Cloud project as build environment variables. For local development, copy `.env.example` to `.env.local`; never add a service-role key to the frontend.
4. Configure Auth email confirmation, password policy, redirect URLs, and SMTP in the Cloud dashboard before inviting real users.
5. Registration creates an unapproved profile. A trusted administrator must verify the user's identity and activate the profile through an administrative workflow before case access is granted. Do not approve users based only on self-reported registration/region.
6. Enable backups, point-in-time recovery, monitoring, and a retention policy appropriate for sensitive child-protection records before production use.

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

Public submissions go through the `submit_public_report` RPC. Anonymous users cannot select or enumerate reports; staff can read only reports for their approved region. Public tracking should use the opaque protocol with `get_public_report_status` and must never expose case details.

`audit_events` is append-only at the database layer for application roles. It is not a substitute for provider-level audit logs, immutable backups, or a formally approved records-retention policy.
