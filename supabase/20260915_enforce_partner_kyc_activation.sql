-- Prevent any code path from activating a partner before KYC is verified.
create or replace function public.enforce_partner_kyc_before_activation()
returns trigger
language plpgsql
set search_path=public
as $$
begin
  if new.role='partner' and coalesce(new.active,false)=true and coalesce(new.kyc_status,'not_submitted')<>'verified' then
    raise exception 'Partner KYC must be verified before activation';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_enforce_partner_kyc_before_activation on public.profiles;
create trigger trg_enforce_partner_kyc_before_activation
before insert or update of role,active,kyc_status on public.profiles
for each row execute function public.enforce_partner_kyc_before_activation();
