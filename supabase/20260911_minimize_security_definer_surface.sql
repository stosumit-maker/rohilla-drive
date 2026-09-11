-- Reduce SECURITY DEFINER exposure for functions that can safely operate under
-- the caller's existing RLS permissions. Functions that intentionally bridge
-- protected tables (public deal-room token RPCs, partner masked-data RPCs,
-- admin allowlist checks and push/vault access) remain SECURITY DEFINER.

ALTER FUNCTION public.can_dealer_upload_vehicle_photo(uuid) SECURITY INVOKER;

ALTER FUNCTION public.create_cross_state_deal_room(uuid,text,text,text,uuid,text,text) SECURITY INVOKER;
ALTER FUNCTION public.get_deal_room_by_id(uuid) SECURITY INVOKER;

-- This function previously forced row_security=off. Under caller security it must
-- use normal RLS to inspect only the caller's own profile.
ALTER FUNCTION public.is_admin_manager() RESET row_security;
ALTER FUNCTION public.is_admin_manager() SECURITY INVOKER;

ALTER FUNCTION public.is_partner() SECURITY INVOKER;
ALTER FUNCTION public.is_staff() SECURITY INVOKER;
