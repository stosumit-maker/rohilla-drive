-- ROHILLA DRIVE: future-ready multi-vehicle inventory extension
-- Safe/idempotent migration: preserves all existing vehicle records.
alter table public.vehicles add column if not exists vehicle_type text not null default 'car';
alter table public.vehicles add column if not exists body_type text;
alter table public.vehicles add column if not exists registration_class text;
alter table public.vehicles add column if not exists engine_cc integer;
alter table public.vehicles add column if not exists transmission text;
alter table public.vehicles add column if not exists seating_capacity integer;
alter table public.vehicles add column if not exists payload_kg integer;
alter table public.vehicles add column if not exists gross_vehicle_weight_kg integer;
alter table public.vehicles add column if not exists axle_count integer;
alter table public.vehicles add column if not exists permit_type text;
alter table public.vehicles add column if not exists fitness_valid_till date;
alter table public.vehicles add column if not exists battery_kwh numeric;
alter table public.vehicles add column if not exists range_km integer;
alter table public.vehicles add column if not exists metadata jsonb not null default '{}'::jsonb;
create index if not exists vehicles_vehicle_type_idx on public.vehicles(vehicle_type);
comment on column public.vehicles.vehicle_type is 'car, two_wheeler, commercial, tractor, fleet_vehicle, ev or other';
