-- Performance-only RLS optimisation: cache stable auth.uid() once per statement.
-- Policy roles, actions and row-authorization semantics are unchanged.

alter policy "admin_manage_push_subscriptions" on public.admin_push_subscriptions
using (is_admin() and admin_user_id = (select auth.uid()))
with check (is_admin() and admin_user_id = (select auth.uid()));

alter policy "automation_jobs_own_insert" on public.automation_jobs
with check (
  created_by = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid())
      and p.active = true
      and (
        (p.role='dealer' and automation_jobs.actor_role='dealer')
        or (p.role='partner' and automation_jobs.actor_role='partner')
        or (p.role in ('admin','staff') and automation_jobs.actor_role in ('admin','staff'))
      )
  )
);

alter policy "automation_jobs_own_read" on public.automation_jobs
using (created_by = (select auth.uid()));

alter policy "automation_jobs_own_update" on public.automation_jobs
using (created_by = (select auth.uid()) and status in ('draft','queued','needs_connection','needs_approval'))
with check (created_by = (select auth.uid()));

alter policy "deal_messages_participant_insert" on public.deal_room_messages
with check (
  sender_user_id = (select auth.uid())
  and exists (
    select 1 from public.deal_room_participants p
    where p.room_id = deal_room_messages.room_id
      and p.user_id = (select auth.uid())
      and p.active = true
  )
);

alter policy "deal_messages_participant_read" on public.deal_room_messages
using (
  exists (
    select 1 from public.deal_room_participants p
    where p.room_id = deal_room_messages.room_id
      and p.user_id = (select auth.uid())
      and p.active = true
  )
);

alter policy "deal_participants_self_read" on public.deal_room_participants
using (user_id = (select auth.uid()) and active = true);

alter policy "deal_tasks_participant_read" on public.deal_room_tasks
using (
  exists (
    select 1 from public.deal_room_participants p
    where p.room_id = deal_room_tasks.room_id
      and p.user_id = (select auth.uid())
      and p.active = true
  )
);

alter policy "deal_rooms_participant_read" on public.deal_rooms
using (
  exists (
    select 1 from public.deal_room_participants p
    where p.room_id = deal_rooms.id
      and p.user_id = (select auth.uid())
      and p.active = true
  )
);

alter policy "partner_read_assigned_leads" on public.leads
using (partner_id = (select auth.uid()));

alter policy "dealer_read_own_new_vehicle_offers" on public.new_vehicle_offers
using (
  dealer_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role='dealer' and p.active=true
  )
);

alter policy "dealer_submit_own_new_vehicle_offers" on public.new_vehicle_offers
with check (
  dealer_id = (select auth.uid())
  and exists (
    select 1 from public.profiles p
    where p.id = (select auth.uid()) and p.role='dealer' and p.active=true
  )
  and exists (
    select 1 from public.leads l
    where l.id = new_vehicle_offers.lead_id
      and l.new_or_used='new'
      and coalesce(l.status,'new') not in ('closed','lost')
  )
);

alter policy "dealer_update_own_new_vehicle_offers" on public.new_vehicle_offers
using (dealer_id = (select auth.uid()))
with check (dealer_id = (select auth.uid()));

alter policy "public_pending_partner_profile_insert" on public.profiles
with check (id = (select auth.uid()) and role in ('dealer','partner') and active=false);

alter policy "public_profiles_self" on public.profiles
using (id = (select auth.uid()));

alter policy "staff_insert_vehicle_events" on public.vehicle_events
with check (is_staff() or (is_partner() and actor_id = (select auth.uid())));

alter policy "dealer_own_photos_select" on public.vehicle_photos
using (
  exists (
    select 1 from public.vehicles v
    where v.id = vehicle_photos.vehicle_id
      and v.partner_id = (select auth.uid())
  )
);

alter policy "dealer_insert_own_vehicle_private" on public.vehicle_private
with check (
  exists (
    select 1
    from public.vehicles v
    join public.profiles p on p.id = (select auth.uid())
    where v.id = vehicle_private.id
      and v.partner_id = (select auth.uid())
      and p.role='dealer'
      and p.active=true
  )
);

alter policy "dealer_read_own_vehicle_private" on public.vehicle_private
using (
  exists (
    select 1
    from public.vehicles v
    join public.profiles p on p.id = (select auth.uid())
    where v.id = vehicle_private.id
      and v.partner_id = (select auth.uid())
      and p.role='dealer'
      and p.active=true
  )
);

alter policy "dealer_update_own_vehicle_private" on public.vehicle_private
using (
  exists (
    select 1
    from public.vehicles v
    join public.profiles p on p.id = (select auth.uid())
    where v.id = vehicle_private.id
      and v.partner_id = (select auth.uid())
      and p.role='dealer'
      and p.active=true
  )
)
with check (
  exists (
    select 1
    from public.vehicles v
    join public.profiles p on p.id = (select auth.uid())
    where v.id = vehicle_private.id
      and v.partner_id = (select auth.uid())
      and p.role='dealer'
      and p.active=true
  )
);

alter policy "users read own verification orders" on public.vehicle_verification_orders
using (requested_by = (select auth.uid()));

alter policy "dealer_own_vehicles_insert" on public.vehicles
with check (partner_id = (select auth.uid()) and status='draft');

alter policy "dealer_own_vehicles_select" on public.vehicles
using (partner_id = (select auth.uid()));

alter policy "dealer_own_vehicles_update" on public.vehicles
using (partner_id = (select auth.uid()))
with check (partner_id = (select auth.uid()) and status='draft');
