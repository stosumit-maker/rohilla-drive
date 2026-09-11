-- The deal-room RPCs require table privileges that are intentionally not granted
-- directly to authenticated clients, so they must remain SECURITY DEFINER while
-- retaining their internal admin checks.
ALTER FUNCTION public.create_cross_state_deal_room(uuid,text,text,text,uuid,text,text) SECURITY DEFINER;
ALTER FUNCTION public.get_deal_room_by_id(uuid) SECURITY DEFINER;
