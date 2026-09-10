-- Applied to production as Supabase migration 20260910081336
-- Lock down sensitive SECURITY DEFINER functions while preserving intentional public deal-token RPCs.

revoke execute on function public.plan_rohilla_daily_growth_v2() from public, anon, authenticated;
grant execute on function public.plan_rohilla_daily_growth_v2() to service_role;

revoke execute on function public.create_cross_state_deal_room(uuid,text,text,text,uuid,text,text) from public, anon;
grant execute on function public.create_cross_state_deal_room(uuid,text,text,text,uuid,text,text) to authenticated, service_role;

revoke execute on function public.get_deal_room_by_id(uuid) from public, anon;
grant execute on function public.get_deal_room_by_id(uuid) to authenticated, service_role;
