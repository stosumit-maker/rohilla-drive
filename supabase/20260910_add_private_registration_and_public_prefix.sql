alter table public.vehicles
  add column if not exists registration_prefix text;

alter table public.vehicle_private
  add column if not exists registration_number text,
  add column if not exists registration_source text,
  add column if not exists registration_verified boolean not null default false,
  add column if not exists rc_snapshot jsonb not null default '{}'::jsonb;

comment on column public.vehicles.registration_prefix is 'Public-safe registration prefix only, for example HR01 or DL01. Never store the full registration number here.';
comment on column public.vehicle_private.registration_number is 'Full vehicle registration number. Private portal data only.';
comment on column public.vehicle_private.registration_source is 'How the registration number was obtained, such as photo_ocr, rc_ocr or manual.';
comment on column public.vehicle_private.registration_verified is 'Whether an administrator has independently verified the full registration number.';
comment on column public.vehicle_private.rc_snapshot is 'Structured non-sensitive vehicle facts extracted from an RC image; do not store raw OCR text or personal address data.';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname='vehicles_registration_prefix_format'
  ) then
    alter table public.vehicles
      add constraint vehicles_registration_prefix_format
      check (registration_prefix is null or registration_prefix ~ '^(?:[A-Z]{2}[0-9]{1,2}|[0-9]{2}BH)$');
  end if;
end $$;
