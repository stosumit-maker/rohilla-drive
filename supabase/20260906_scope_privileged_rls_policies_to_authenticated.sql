-- Scope privileged helper-based RLS policies to authenticated users only.
-- True public read/insert policies remain unchanged.

alter policy "admin_manage_collab" on public.collaboration_requests to authenticated;
alter policy "admin_manage_dealer_applications" on public.dealer_applications to authenticated;
alter policy "staff_read_leads" on public.leads to authenticated;
alter policy "staff_update_leads" on public.leads to authenticated;
alter policy "admins manage network partners" on public.network_partners to authenticated;
alter policy "admin_manage_service_requests" on public.service_requests to authenticated;
alter policy "admin_manage_social_posts" on public.social_posts to authenticated;
alter policy "admin_read_vehicle_events" on public.vehicle_events to authenticated;
alter policy "staff_insert_vehicle_events" on public.vehicle_events to authenticated;
alter policy "admin_manage_photos" on public.vehicle_photos to authenticated;
alter policy "dealer_own_photos_insert" on public.vehicle_photos to authenticated;
alter policy "admin_manage_private_vehicle_data" on public.vehicle_private to authenticated;
alter policy "admins manage verification orders" on public.vehicle_verification_orders to authenticated;
alter policy "admin_manage_vehicles" on public.vehicles to authenticated;
