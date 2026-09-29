create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = 'public'
set row_security = 'off'
as $function$
  select
    coalesce((select auth.jwt()->>'aal'), '') = 'aal2'
    and exists(
      select 1
      from public.profiles p
      join public.admin_allowlist a on a.phone = p.phone
      where p.id = auth.uid()
        and p.role in ('owner','admin')
        and p.active = true
        and a.active = true
    );
$function$;

comment on function public.is_admin() is
'Returns true only for active allowlisted owner/admin identities using an AAL2 (MFA-verified) session.';
