-- Keep unpublished vehicle media private while preserving the existing public
-- vehicle-photos bucket for reviewed/published inventory.

alter table public.vehicle_photos
  add column if not exists storage_bucket text not null default 'vehicle-photos';

comment on column public.vehicle_photos.storage_bucket is
  'Storage bucket containing this media object. Draft media uses vehicle-draft-photos; public inventory uses vehicle-photos.';

alter table public.vehicle_photos
  drop constraint if exists vehicle_photos_storage_bucket_check;

alter table public.vehicle_photos
  add constraint vehicle_photos_storage_bucket_check
  check (storage_bucket in ('vehicle-photos','vehicle-draft-photos'));

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'vehicle-draft-photos',
  'vehicle-draft-photos',
  false,
  20971520,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']::text[]
)
on conflict (id) do update
set public=false,
    file_size_limit=excluded.file_size_limit,
    allowed_mime_types=excluded.allowed_mime_types;

-- Draft objects are never readable by anonymous/public visitors.
drop policy if exists "admin_manage_vehicle_draft_photos" on storage.objects;
create policy "admin_manage_vehicle_draft_photos"
on storage.objects
for all
to authenticated
using (bucket_id='vehicle-draft-photos' and (select public.is_admin()))
with check (bucket_id='vehicle-draft-photos' and (select public.is_admin()));

drop policy if exists "dealer_insert_own_vehicle_draft_photos" on storage.objects;
create policy "dealer_insert_own_vehicle_draft_photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id='vehicle-draft-photos'
  and exists (
    select 1 from public.profiles p
    where p.id=(select auth.uid()) and p.role='dealer' and p.active=true
  )
  and exists (
    select 1 from public.vehicles v
    where v.id::text=split_part(storage.objects.name,'/',1)
      and v.partner_id=(select auth.uid())
      and v.status='draft'
  )
);

drop policy if exists "dealer_read_own_vehicle_draft_photos" on storage.objects;
create policy "dealer_read_own_vehicle_draft_photos"
on storage.objects
for select
to authenticated
using (
  bucket_id='vehicle-draft-photos'
  and exists (
    select 1 from public.vehicles v
    where v.id::text=split_part(storage.objects.name,'/',1)
      and v.partner_id=(select auth.uid())
      and v.status='draft'
  )
);

drop policy if exists "dealer_delete_own_vehicle_draft_photos" on storage.objects;
create policy "dealer_delete_own_vehicle_draft_photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id='vehicle-draft-photos'
  and exists (
    select 1 from public.vehicles v
    where v.id::text=split_part(storage.objects.name,'/',1)
      and v.partner_id=(select auth.uid())
      and v.status='draft'
  )
);

create or replace function public.prevent_publish_with_private_draft_media()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  if new.status='published' and old.status is distinct from 'published' and exists (
    select 1 from public.vehicle_photos vp
    where vp.vehicle_id=new.id and vp.storage_bucket='vehicle-draft-photos'
  ) then
    raise exception 'Private draft photos must be promoted before publication.'
      using errcode='23514';
  end if;
  return new;
end;
$$;

revoke all on function public.prevent_publish_with_private_draft_media() from public, anon, authenticated;

drop trigger if exists trg_prevent_publish_with_private_draft_media on public.vehicles;
create trigger trg_prevent_publish_with_private_draft_media
before update of status on public.vehicles
for each row
execute function public.prevent_publish_with_private_draft_media();
