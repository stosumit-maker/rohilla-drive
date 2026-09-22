-- Sold history, cross-surface duplicate protection and conditional customer media.
alter table public.vehicles
  add column if not exists inventory_owner_type text not null default 'rohilla_inventory',
  add column if not exists sale_outcome text,
  add column if not exists sold_at timestamptz,
  add column if not exists sold_notes text,
  add column if not exists registration_fingerprint text;

create unique index if not exists vehicles_active_registration_fingerprint_uidx
  on public.vehicles (registration_fingerprint)
  where registration_fingerprint is not null and status in ('draft','published');

alter table public.leads
  add column if not exists vehicle_registration_fingerprint text,
  add column if not exists registration_prefix text;

create unique index if not exists leads_open_sell_vehicle_registration_uidx
  on public.leads (vehicle_registration_fingerprint)
  where vehicle_registration_fingerprint is not null
    and enquiry_type='sell_vehicle'
    and status in ('new','contacted','qualified');

create unique index if not exists social_posts_one_active_per_vehicle_platform_uidx
  on public.social_posts (vehicle_id,platform)
  where vehicle_id is not null and status in ('queued','published');

create unique index if not exists dealer_applications_business_mobile_uidx
  on public.dealer_applications (
    lower(regexp_replace(coalesce(business_name,''),'\s+','','g')),
    regexp_replace(coalesce(mobile,''),'\D','','g')
  )
  where status in ('new','reviewing','approved')
    and nullif(regexp_replace(coalesce(mobile,''),'\D','','g'),'') is not null;

alter table public.collaboration_requests add column if not exists contact_phone text;

create unique index if not exists collaboration_requests_business_phone_uidx
  on public.collaboration_requests (
    lower(regexp_replace(coalesce(business_name,''),'\s+','','g')),
    regexp_replace(coalesce(contact_phone,''),'\D','','g')
  )
  where status in ('new','reviewing','approved')
    and nullif(regexp_replace(coalesce(contact_phone,''),'\D','','g'),'') is not null;

create table if not exists public.vehicle_media (
  id uuid primary key default gen_random_uuid(),
  vehicle_id uuid not null references public.vehicles(id) on delete cascade,
  media_kind text not null,
  media_category text not null,
  url text not null,
  path text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);
