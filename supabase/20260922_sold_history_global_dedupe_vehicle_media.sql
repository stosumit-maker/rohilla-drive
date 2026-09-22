-- Sold history, cross-surface duplicate protection and conditional customer media.
alter table public.vehicles
  add column if not exists inventory_owner_type text not null default 'rohilla_inventory',
  add column if not exists sale_outcome text,
  add column if not exists sold_at timestamptz,
  add column if not exists sold_notes text,
  add column if not exists registration_fingerprint text;

do $$ begin
  if not exists (select 1 from pg_constraint where conname='vehicles_inventory_owner_type_check') then
    alter table public.vehicles add constraint vehicles_inventory_owner_type_check
      check (inventory_owner_type in ('rohilla_inventory','dealer_inventory','customer_vehicle','external_vehicle'));
  end if;
  if not exists (select 1 from pg_constraint where conname='vehicles_sale_outcome_check') then
    alter table public.vehicles add constraint vehicles_sale_outcome_check
      check (sale_outcome is null or sale_outcome in ('sold_by_rohilla','sold_through_rohilla','sold_elsewhere','removed'));
  end if;
end $$;

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

alter table public.collaboration_requests
  add column if not exists contact_phone text;

update public.collaboration_requests c
set contact_phone=p.phone
from public.profiles p
where c.applicant_user_id=p.id
  and c.contact_phone is null
  and p.phone is not null;

create or replace function public.set_collaboration_contact_phone()
returns trigger
language plpgsql
security invoker
set search_path='public'
as $$
begin
  if new.contact_phone is null and new.applicant_user_id is not null then
    select phone into new.contact_phone from public.profiles where id=new.applicant_user_id;
  end if;
  if new.contact_phone is null then
    new.contact_phone := nullif(regexp_replace(coalesce(new.contact,''),'\D','','g'),'');
  end if;
  return new;
end;
$$;

drop trigger if exists collaboration_requests_contact_phone on public.collaboration_requests;
create trigger collaboration_requests_contact_phone
before insert or update of contact,applicant_user_id,contact_phone
on public.collaboration_requests
for each row execute function public.set_collaboration_contact_phone();

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
  created_at timestamptz not null default now(),
  constraint vehicle_media_kind_check check (media_kind in ('image','video')),
  constraint vehicle_media_category_check check (media_category in (
    'front','left_side','right_side','rear','interior','dashboard','engine','boot',
    'driver_door','passenger_door','rear_left_door','rear_right_door','walkaround','interior_video',
    'engine_video','boot_video','spin_360'
  ))
);

alter table public.vehicle_media enable row level security;
grant select on public.vehicle_media to anon,authenticated;
grant insert,update,delete on public.vehicle_media to authenticated;

drop policy if exists "vehicle_media_public_read" on public.vehicle_media;
create policy "vehicle_media_public_read" on public.vehicle_media
for select to anon,authenticated
using (exists(select 1 from public.vehicles v where v.id=vehicle_id and v.status='published'));

drop policy if exists "vehicle_media_admin_write" on public.vehicle_media;
create policy "vehicle_media_admin_write" on public.vehicle_media
for all to authenticated
using ((select public.is_admin()))
with check ((select public.is_admin()));

create index if not exists vehicle_media_vehicle_category_idx
  on public.vehicle_media(vehicle_id,media_category,sort_order);
