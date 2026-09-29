create or replace function public.is_admin_identity()
returns boolean
language sql
stable
security definer
set search_path = 'public'
set row_security = 'off'
as $function$
  select exists(
    select 1
    from public.profiles p
    join public.admin_allowlist a on a.phone = p.phone
    where p.id = auth.uid()
      and p.role in ('owner','admin')
      and p.active = true
      and a.active = true
  );
$function$;

revoke all on function public.is_admin_identity() from public;
grant execute on function public.is_admin_identity() to authenticated;

comment on function public.is_admin_identity() is
'Checks whether the current authenticated user is an active allowlisted admin before MFA. Sensitive admin authorization still uses public.is_admin(), which requires AAL2.';
