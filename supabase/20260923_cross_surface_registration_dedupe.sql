-- Cross-surface registration dedupe and private seller registration capture.
-- Applied to production as Supabase migration 20260923022859.

alter table public.leads
  add column if not exists vehicle_registration_number text;

comment on column public.leads.vehicle_registration_number is
  'Private full registration captured from seller intake. Never expose publicly; use registration_prefix for public display.';

create or replace function public.prevent_vehicle_open_seller_duplicate()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
begin
  if new.registration_fingerprint is not null
     and new.status in ('draft','published')
     and exists (
       select 1 from public.leads l
       where l.vehicle_registration_fingerprint = new.registration_fingerprint
         and l.enquiry_type = 'sell_vehicle'
         and coalesce(l.status,'new') in ('new','contacted','qualified')
     ) then
    raise exception 'REGISTRATION_ALREADY_SUBMITTED_FOR_SALE'
      using errcode = '23505';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_vehicle_open_seller_duplicate() from public, anon, authenticated;

drop trigger if exists vehicles_cross_surface_registration_dedupe on public.vehicles;
create trigger vehicles_cross_surface_registration_dedupe
before insert or update of registration_fingerprint,status
on public.vehicles
for each row execute function public.prevent_vehicle_open_seller_duplicate();

create or replace function public.prevent_sell_lead_active_vehicle_duplicate()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
begin
  if new.vehicle_registration_fingerprint is not null
     and new.enquiry_type = 'sell_vehicle'
     and coalesce(new.status,'new') in ('new','contacted','qualified')
     and exists (
       select 1 from public.vehicles v
       where v.registration_fingerprint = new.vehicle_registration_fingerprint
         and v.status in ('draft','published')
     ) then
    raise exception 'REGISTRATION_ALREADY_ACTIVE_IN_INVENTORY'
      using errcode = '23505';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_sell_lead_active_vehicle_duplicate() from public, anon, authenticated;

drop trigger if exists leads_cross_surface_registration_dedupe on public.leads;
create trigger leads_cross_surface_registration_dedupe
before insert or update of vehicle_registration_fingerprint,status,enquiry_type
on public.leads
for each row execute function public.prevent_sell_lead_active_vehicle_duplicate();
