-- Structured service-provider workflow: quote -> customer approval -> appointment
-- -> work in progress -> private completion proof -> completion.

alter table public.service_requests
  add column if not exists partner_quote_amount numeric,
  add column if not exists partner_quote_notes text,
  add column if not exists quote_submitted_at timestamptz,
  add column if not exists customer_approval_status text not null default 'pending',
  add column if not exists customer_approved_at timestamptz,
  add column if not exists appointment_at timestamptz,
  add column if not exists partner_eta text,
  add column if not exists work_notes text,
  add column if not exists work_started_at timestamptz,
  add column if not exists completion_notes text,
  add column if not exists completion_photo_paths text[] not null default '{}'::text[],
  add column if not exists completed_at timestamptz;

alter table public.service_requests
  drop constraint if exists service_requests_customer_approval_status_check;
alter table public.service_requests
  add constraint service_requests_customer_approval_status_check
  check (customer_approval_status in ('pending','approved','declined'));

alter table public.service_requests
  drop constraint if exists service_requests_partner_quote_amount_check;
alter table public.service_requests
  add constraint service_requests_partner_quote_amount_check
  check (partner_quote_amount is null or partner_quote_amount >= 0);

insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values (
  'service-job-photos',
  'service-job-photos',
  false,
  10485760,
  array['image/jpeg','image/png','image/webp','image/heic','image/heif']::text[]
)
on conflict (id) do update
set public=false,
    file_size_limit=excluded.file_size_limit,
    allowed_mime_types=excluded.allowed_mime_types;

drop policy if exists "admin_manage_service_job_photos" on storage.objects;
create policy "admin_manage_service_job_photos"
on storage.objects
for all
to authenticated
using (bucket_id='service-job-photos' and (select public.is_admin()))
with check (bucket_id='service-job-photos' and (select public.is_admin()));

drop policy if exists "partner_insert_own_service_job_photos" on storage.objects;
create policy "partner_insert_own_service_job_photos"
on storage.objects
for insert
to authenticated
with check (
  bucket_id='service-job-photos'
  and exists (
    select 1 from public.profiles p
    where p.id=(select auth.uid()) and p.role='partner' and p.active=true
  )
  and exists (
    select 1 from public.service_requests sr
    where sr.id::text=split_part(storage.objects.name,'/',1)
      and sr.assigned_partner_id=(select auth.uid())
      and sr.status in ('approved','scheduled','in_progress')
  )
);

drop policy if exists "partner_read_own_service_job_photos" on storage.objects;
create policy "partner_read_own_service_job_photos"
on storage.objects
for select
to authenticated
using (
  bucket_id='service-job-photos'
  and exists (
    select 1 from public.service_requests sr
    where sr.id::text=split_part(storage.objects.name,'/',1)
      and sr.assigned_partner_id=(select auth.uid())
  )
);

drop policy if exists "partner_delete_own_service_job_photos" on storage.objects;
create policy "partner_delete_own_service_job_photos"
on storage.objects
for delete
to authenticated
using (
  bucket_id='service-job-photos'
  and exists (
    select 1 from public.service_requests sr
    where sr.id::text=split_part(storage.objects.name,'/',1)
      and sr.assigned_partner_id=(select auth.uid())
      and sr.status <> 'completed'
  )
);

-- Recreate the partner request reader with workflow fields while keeping the
-- customer phone protected from the service provider.
drop function if exists public.get_partner_service_requests();
create function public.get_partner_service_requests()
returns table(
 id uuid,
 customer_name text,
 customer_phone text,
 category text,
 vehicle_location text,
 customer_location text,
 details text,
 preferred_time text,
 status text,
 created_at timestamptz,
 vehicle_brand text,
 vehicle_model text,
 vehicle_variant text,
 vehicle_year integer,
 partner_quote_amount numeric,
 partner_quote_notes text,
 quote_submitted_at timestamptz,
 customer_approval_status text,
 appointment_at timestamptz,
 partner_eta text,
 work_notes text,
 work_started_at timestamptz,
 completion_notes text,
 completion_photo_paths text[],
 completed_at timestamptz
)
language sql
security definer
set search_path=public
set row_security=off
as $$
 select sr.id,
        sr.customer_name,
        'Protected'::text as customer_phone,
        sr.category,sr.vehicle_location,sr.customer_location,sr.details,sr.preferred_time,sr.status,sr.created_at,
        v.brand,v.model,v.variant,v.year,
        sr.partner_quote_amount,sr.partner_quote_notes,sr.quote_submitted_at,
        sr.customer_approval_status,sr.appointment_at,sr.partner_eta,
        sr.work_notes,sr.work_started_at,sr.completion_notes,sr.completion_photo_paths,sr.completed_at
 from public.service_requests sr
 left join public.vehicles v on v.id=sr.vehicle_id
 join public.profiles p on p.id=auth.uid()
 where sr.assigned_partner_id=auth.uid() and p.role='partner' and p.active=true
 order by sr.created_at desc;
$$;
revoke all on function public.get_partner_service_requests() from public, anon;
grant execute on function public.get_partner_service_requests() to authenticated;

create or replace function public.submit_partner_service_quote(p_request_id uuid,p_amount numeric,p_notes text default null)
returns boolean
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
begin
 if p_amount is null or p_amount < 0 then raise exception 'Valid quote amount required'; end if;
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='partner' and p.active=true) then raise exception 'Partner access required'; end if;
 update public.service_requests
 set partner_quote_amount=p_amount,
     partner_quote_notes=nullif(trim(coalesce(p_notes,'')),''),
     quote_submitted_at=now(),
     customer_approval_status='pending',
     customer_approved_at=null,
     status='quote_submitted',
     updated_at=now()
 where id=p_request_id and assigned_partner_id=auth.uid() and status in ('assigned','accepted','quote_submitted');
 return found;
end;
$$;
revoke all on function public.submit_partner_service_quote(uuid,numeric,text) from public, anon;
grant execute on function public.submit_partner_service_quote(uuid,numeric,text) to authenticated;

create or replace function public.schedule_partner_service_request(p_request_id uuid,p_appointment_at timestamptz,p_eta text default null)
returns boolean
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
begin
 if p_appointment_at is null then raise exception 'Appointment time required'; end if;
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='partner' and p.active=true) then raise exception 'Partner access required'; end if;
 update public.service_requests
 set appointment_at=p_appointment_at,
     partner_eta=nullif(trim(coalesce(p_eta,'')),''),
     status='scheduled',
     updated_at=now()
 where id=p_request_id and assigned_partner_id=auth.uid()
   and customer_approval_status='approved'
   and status in ('approved','scheduled');
 return found;
end;
$$;
revoke all on function public.schedule_partner_service_request(uuid,timestamptz,text) from public, anon;
grant execute on function public.schedule_partner_service_request(uuid,timestamptz,text) to authenticated;

create or replace function public.start_partner_service_work(p_request_id uuid,p_notes text default null)
returns boolean
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
begin
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='partner' and p.active=true) then raise exception 'Partner access required'; end if;
 update public.service_requests
 set work_notes=nullif(trim(coalesce(p_notes,'')),''),
     work_started_at=coalesce(work_started_at,now()),
     status='in_progress',
     updated_at=now()
 where id=p_request_id and assigned_partner_id=auth.uid()
   and customer_approval_status='approved'
   and status='scheduled';
 return found;
end;
$$;
revoke all on function public.start_partner_service_work(uuid,text) from public, anon;
grant execute on function public.start_partner_service_work(uuid,text) to authenticated;

create or replace function public.complete_partner_service_work(p_request_id uuid,p_notes text,p_photo_paths text[] default '{}'::text[])
returns boolean
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
begin
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='partner' and p.active=true) then raise exception 'Partner access required'; end if;
 if exists(select 1 from unnest(coalesce(p_photo_paths,'{}'::text[])) x where split_part(x,'/',1)<>p_request_id::text) then raise exception 'Invalid completion photo path'; end if;
 update public.service_requests
 set completion_notes=nullif(trim(coalesce(p_notes,'')),''),
     completion_photo_paths=coalesce(p_photo_paths,'{}'::text[]),
     completed_at=now(),
     status='completed',
     updated_at=now()
 where id=p_request_id and assigned_partner_id=auth.uid()
   and customer_approval_status='approved'
   and status='in_progress';
 return found;
end;
$$;
revoke all on function public.complete_partner_service_work(uuid,text,text[]) from public, anon;
grant execute on function public.complete_partner_service_work(uuid,text,text[]) to authenticated;

-- Keep cancellation available but prevent bypassing the structured workflow via
-- the legacy generic status RPC.
create or replace function public.update_partner_service_request_status(p_request_id uuid,p_status text)
returns boolean
language plpgsql
security definer
set search_path=public
set row_security=off
as $$
begin
 if p_status <> 'cancelled' then raise exception 'Use the structured service workflow'; end if;
 if not exists(select 1 from public.profiles p where p.id=auth.uid() and p.role='partner' and p.active=true) then raise exception 'Partner access required'; end if;
 update public.service_requests
 set status='cancelled',updated_at=now()
 where id=p_request_id and assigned_partner_id=auth.uid() and status<>'completed';
 return found;
end;
$$;
revoke all on function public.update_partner_service_request_status(uuid,text) from public, anon;
grant execute on function public.update_partner_service_request_status(uuid,text) to authenticated;
