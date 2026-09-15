-- Private KYC document workflow for partner applicants and approved partners.
alter table public.profiles
  add column if not exists kyc_status text not null default 'not_submitted',
  add column if not exists kyc_review_notes text,
  add column if not exists kyc_submitted_at timestamptz,
  add column if not exists kyc_verified_at timestamptz;

alter table public.profiles drop constraint if exists profiles_kyc_status_check;
alter table public.profiles add constraint profiles_kyc_status_check
  check (kyc_status in ('not_submitted','submitted','needs_changes','verified'));

create table if not exists public.partner_kyc_documents (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  document_type text not null,
  document_label text,
  storage_path text not null unique,
  status text not null default 'pending',
  review_notes text,
  expires_on date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.partner_kyc_documents drop constraint if exists partner_kyc_documents_status_check;
alter table public.partner_kyc_documents add constraint partner_kyc_documents_status_check check (status in ('pending','verified','rejected'));
create index if not exists idx_partner_kyc_documents_profile on public.partner_kyc_documents(profile_id,created_at desc);

alter table public.partner_kyc_documents enable row level security;
drop policy if exists "partner_read_own_kyc" on public.partner_kyc_documents;
create policy "partner_read_own_kyc" on public.partner_kyc_documents for select to authenticated
using (profile_id=(select auth.uid()) or (select public.is_admin()));
drop policy if exists "partner_insert_own_kyc" on public.partner_kyc_documents;
create policy "partner_insert_own_kyc" on public.partner_kyc_documents for insert to authenticated
with check (profile_id=(select auth.uid()) and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='partner'));
drop policy if exists "partner_delete_unverified_own_kyc" on public.partner_kyc_documents;
create policy "partner_delete_unverified_own_kyc" on public.partner_kyc_documents for delete to authenticated
using ((profile_id=(select auth.uid()) and status<>'verified') or (select public.is_admin()));
drop policy if exists "admin_update_partner_kyc" on public.partner_kyc_documents;
create policy "admin_update_partner_kyc" on public.partner_kyc_documents for update to authenticated
using ((select public.is_admin())) with check ((select public.is_admin()));

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('partner-kyc-documents','partner-kyc-documents',false,10485760,array['application/pdf','image/jpeg','image/png','image/webp','image/heic','image/heif']::text[])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "partner_upload_own_kyc_files" on storage.objects;
create policy "partner_upload_own_kyc_files" on storage.objects for insert to authenticated
with check(bucket_id='partner-kyc-documents' and split_part(name,'/',1)=(select auth.uid())::text and exists(select 1 from public.profiles p where p.id=(select auth.uid()) and p.role='partner'));
drop policy if exists "partner_read_own_kyc_files" on storage.objects;
create policy "partner_read_own_kyc_files" on storage.objects for select to authenticated
using(bucket_id='partner-kyc-documents' and (split_part(name,'/',1)=(select auth.uid())::text or (select public.is_admin())));
drop policy if exists "partner_delete_unverified_kyc_files" on storage.objects;
create policy "partner_delete_unverified_kyc_files" on storage.objects for delete to authenticated
using(bucket_id='partner-kyc-documents' and (select public.is_admin() or exists(select 1 from public.partner_kyc_documents d where d.storage_path=name and d.profile_id=(select auth.uid()) and d.status<>'verified')));
drop policy if exists "admin_manage_partner_kyc_files" on storage.objects;
create policy "admin_manage_partner_kyc_files" on storage.objects for all to authenticated
using(bucket_id='partner-kyc-documents' and (select public.is_admin()))
with check(bucket_id='partner-kyc-documents' and (select public.is_admin()));

create or replace function public.submit_partner_kyc()
returns boolean language plpgsql security definer set search_path=public set row_security=off as $$
begin
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='partner') then raise exception 'Partner profile required'; end if;
 if (select count(*) from public.partner_kyc_documents d where d.profile_id=auth.uid()) < 2 then raise exception 'Upload at least two KYC documents before submission'; end if;
 update public.profiles set kyc_status='submitted',kyc_submitted_at=now(),kyc_review_notes=null where id=auth.uid();
 return found;
end;$$;
revoke all on function public.submit_partner_kyc() from public,anon;
grant execute on function public.submit_partner_kyc() to authenticated;
