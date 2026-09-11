-- Phase 1 of business-application identity hardening.
--
-- This migration is intentionally backward compatible with the currently deployed
-- client. Existing clients continue to create application rows directly. Only
-- signups carrying application_source='trusted_signup_v2' are auto-recorded by
-- the trusted auth.users trigger, so this migration can safely land before the
-- matching frontend deployment.

create unique index if not exists dealer_applications_one_per_applicant_uidx
  on public.dealer_applications(applicant_user_id)
  where applicant_user_id is not null;

create unique index if not exists collaboration_requests_one_per_applicant_uidx
  on public.collaboration_requests(applicant_user_id)
  where applicant_user_id is not null;

create or replace function public.handle_network_signup()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text;
  trusted_application boolean;
  applicant_name text;
  applicant_phone text;
  applicant_business text;
  applicant_address text;
  applicant_city text;
  applicant_services text;
  applicant_message text;
  applicant_inventory_count integer;
begin
  requested_role := coalesce(new.raw_user_meta_data->>'network_role','');
  trusted_application := coalesce(new.raw_user_meta_data->>'application_source','') = 'trusted_signup_v2';
  applicant_name := nullif(new.raw_user_meta_data->>'name','');
  applicant_phone := nullif(new.raw_user_meta_data->>'phone','');
  applicant_business := nullif(new.raw_user_meta_data->>'business_name','');
  applicant_address := nullif(new.raw_user_meta_data->>'address','');
  applicant_city := nullif(new.raw_user_meta_data->>'city','');
  applicant_services := nullif(new.raw_user_meta_data->>'service_categories','');
  applicant_message := nullif(new.raw_user_meta_data->>'application_message','');

  begin
    applicant_inventory_count := nullif(new.raw_user_meta_data->>'inventory_count','')::integer;
  exception when invalid_text_representation or numeric_value_out_of_range then
    applicant_inventory_count := null;
  end;

  if requested_role in ('dealer','partner') then
    insert into public.profiles(id, role, name, phone, active, business_name, address, service_categories, city)
    values(
      new.id,
      requested_role,
      applicant_name,
      applicant_phone,
      false,
      applicant_business,
      applicant_address,
      applicant_services,
      applicant_city
    )
    on conflict (id) do nothing;
  end if;

  if trusted_application and requested_role = 'dealer' then
    insert into public.dealer_applications(
      applicant_user_id,
      business_name,
      contact_name,
      mobile,
      city,
      address,
      inventory_count,
      services,
      message,
      status
    )
    values(
      new.id,
      applicant_business,
      applicant_name,
      applicant_phone,
      applicant_city,
      applicant_address,
      applicant_inventory_count,
      applicant_services,
      applicant_message,
      'new'
    )
    on conflict (applicant_user_id) where applicant_user_id is not null do nothing;
  elsif trusted_application and requested_role = 'partner' then
    insert into public.collaboration_requests(
      applicant_user_id,
      request_type,
      business_name,
      contact,
      category,
      city,
      message,
      status
    )
    values(
      new.id,
      'partner',
      applicant_business,
      concat_ws(' • ', applicant_name, applicant_phone),
      applicant_services,
      applicant_city,
      applicant_message,
      'new'
    )
    on conflict (applicant_user_id) where applicant_user_id is not null do nothing;
  end if;

  return new;
end;
$$;

revoke all on function public.handle_network_signup() from public, anon, authenticated;
