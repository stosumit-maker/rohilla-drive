-- Non-destructive covering indexes for foreign keys reported by the Supabase performance advisor.

create index if not exists deal_room_messages_sender_user_id_idx
  on public.deal_room_messages(sender_user_id);

create index if not exists deal_room_participants_user_id_idx
  on public.deal_room_participants(user_id);

create index if not exists deal_room_tasks_partner_id_idx
  on public.deal_room_tasks(partner_id);

create index if not exists deal_rooms_created_by_idx
  on public.deal_rooms(created_by);

create index if not exists deal_rooms_vehicle_id_idx
  on public.deal_rooms(vehicle_id);

create index if not exists platform_connections_updated_by_idx
  on public.platform_connections(updated_by);

create index if not exists revenue_events_counterparty_id_idx
  on public.revenue_events(counterparty_id);

create index if not exists revenue_events_created_by_idx
  on public.revenue_events(created_by);

create index if not exists social_posts_requested_by_idx
  on public.social_posts(requested_by);
