-- Consolidate overlapping permissive RLS policies without changing effective access.
-- Goal: preserve the OR-semantics of the existing policies while reducing repeated
-- policy evaluation for authenticated requests. Anonymous public-read/create flows
-- remain explicitly available only where they already existed.

-- automation_jobs
DROP POLICY IF EXISTS automation_jobs_admin_all ON public.automation_jobs;
DROP POLICY IF EXISTS automation_jobs_own_insert ON public.automation_jobs;
DROP POLICY IF EXISTS automation_jobs_own_read ON public.automation_jobs;
DROP POLICY IF EXISTS automation_jobs_own_update ON public.automation_jobs;
CREATE POLICY automation_jobs_select ON public.automation_jobs FOR SELECT TO authenticated
USING (is_admin() OR created_by = (select auth.uid()));
CREATE POLICY automation_jobs_insert ON public.automation_jobs FOR INSERT TO authenticated
WITH CHECK (
  is_admin()
  OR (
    created_by = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid())
        AND p.active = true
        AND (
          (p.role = 'dealer' AND automation_jobs.actor_role = 'dealer')
          OR (p.role = 'partner' AND automation_jobs.actor_role = 'partner')
          OR (p.role IN ('admin','staff') AND automation_jobs.actor_role IN ('admin','staff'))
        )
    )
  )
);
CREATE POLICY automation_jobs_update ON public.automation_jobs FOR UPDATE TO authenticated
USING (
  is_admin()
  OR (created_by = (select auth.uid()) AND status IN ('draft','queued','needs_connection','needs_approval'))
)
WITH CHECK (is_admin() OR created_by = (select auth.uid()));
CREATE POLICY automation_jobs_delete ON public.automation_jobs FOR DELETE TO authenticated
USING (is_admin());

-- collaboration_requests
DROP POLICY IF EXISTS admin_manage_collab ON public.collaboration_requests;
DROP POLICY IF EXISTS public_create_collab ON public.collaboration_requests;
CREATE POLICY collaboration_requests_select ON public.collaboration_requests FOR SELECT TO authenticated
USING (is_admin());
CREATE POLICY collaboration_requests_insert ON public.collaboration_requests FOR INSERT TO authenticated
WITH CHECK (is_admin() OR (applicant_user_id = (select auth.uid()) AND status = 'new'));
CREATE POLICY collaboration_requests_update ON public.collaboration_requests FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY collaboration_requests_delete ON public.collaboration_requests FOR DELETE TO authenticated
USING (is_admin());

-- dealer_applications
DROP POLICY IF EXISTS admin_manage_dealer_applications ON public.dealer_applications;
DROP POLICY IF EXISTS public_create_dealer_application ON public.dealer_applications;
CREATE POLICY dealer_applications_select ON public.dealer_applications FOR SELECT TO authenticated
USING (is_admin());
CREATE POLICY dealer_applications_insert ON public.dealer_applications FOR INSERT TO authenticated
WITH CHECK (is_admin() OR (applicant_user_id = (select auth.uid()) AND status = 'new'));
CREATE POLICY dealer_applications_update ON public.dealer_applications FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY dealer_applications_delete ON public.dealer_applications FOR DELETE TO authenticated
USING (is_admin());

-- deal_room_messages
DROP POLICY IF EXISTS deal_messages_admin_all ON public.deal_room_messages;
DROP POLICY IF EXISTS deal_messages_participant_insert ON public.deal_room_messages;
DROP POLICY IF EXISTS deal_messages_participant_read ON public.deal_room_messages;
CREATE POLICY deal_room_messages_select ON public.deal_room_messages FOR SELECT TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.deal_room_participants p
    WHERE p.room_id = deal_room_messages.room_id
      AND p.user_id = (select auth.uid())
      AND p.active = true
  )
);
CREATE POLICY deal_room_messages_insert ON public.deal_room_messages FOR INSERT TO authenticated
WITH CHECK (
  is_admin()
  OR (
    sender_user_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.deal_room_participants p
      WHERE p.room_id = deal_room_messages.room_id
        AND p.user_id = (select auth.uid())
        AND p.active = true
    )
  )
);
CREATE POLICY deal_room_messages_update ON public.deal_room_messages FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY deal_room_messages_delete ON public.deal_room_messages FOR DELETE TO authenticated
USING (is_admin());

-- deal_room_participants
DROP POLICY IF EXISTS deal_participants_admin_all ON public.deal_room_participants;
DROP POLICY IF EXISTS deal_participants_self_read ON public.deal_room_participants;
CREATE POLICY deal_room_participants_select ON public.deal_room_participants FOR SELECT TO authenticated
USING (is_admin() OR (user_id = (select auth.uid()) AND active = true));
CREATE POLICY deal_room_participants_insert ON public.deal_room_participants FOR INSERT TO authenticated
WITH CHECK (is_admin());
CREATE POLICY deal_room_participants_update ON public.deal_room_participants FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY deal_room_participants_delete ON public.deal_room_participants FOR DELETE TO authenticated
USING (is_admin());

-- deal_room_tasks
DROP POLICY IF EXISTS deal_tasks_admin_all ON public.deal_room_tasks;
DROP POLICY IF EXISTS deal_tasks_participant_read ON public.deal_room_tasks;
CREATE POLICY deal_room_tasks_select ON public.deal_room_tasks FOR SELECT TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.deal_room_participants p
    WHERE p.room_id = deal_room_tasks.room_id
      AND p.user_id = (select auth.uid())
      AND p.active = true
  )
);
CREATE POLICY deal_room_tasks_insert ON public.deal_room_tasks FOR INSERT TO authenticated
WITH CHECK (is_admin());
CREATE POLICY deal_room_tasks_update ON public.deal_room_tasks FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY deal_room_tasks_delete ON public.deal_room_tasks FOR DELETE TO authenticated
USING (is_admin());

-- deal_rooms
DROP POLICY IF EXISTS deal_rooms_admin_all ON public.deal_rooms;
DROP POLICY IF EXISTS deal_rooms_participant_read ON public.deal_rooms;
CREATE POLICY deal_rooms_select ON public.deal_rooms FOR SELECT TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.deal_room_participants p
    WHERE p.room_id = deal_rooms.id
      AND p.user_id = (select auth.uid())
      AND p.active = true
  )
);
CREATE POLICY deal_rooms_insert ON public.deal_rooms FOR INSERT TO authenticated
WITH CHECK (is_admin());
CREATE POLICY deal_rooms_update ON public.deal_rooms FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY deal_rooms_delete ON public.deal_rooms FOR DELETE TO authenticated
USING (is_admin());

-- leads: combine staff and assigned-partner reads only; public lead creation remains unchanged.
DROP POLICY IF EXISTS partner_read_assigned_leads ON public.leads;
DROP POLICY IF EXISTS staff_read_leads ON public.leads;
CREATE POLICY leads_authenticated_select ON public.leads FOR SELECT TO authenticated
USING (is_staff() OR partner_id = (select auth.uid()));

-- new_vehicle_offers
DROP POLICY IF EXISTS admin_manage_new_vehicle_offers ON public.new_vehicle_offers;
DROP POLICY IF EXISTS dealer_submit_own_new_vehicle_offers ON public.new_vehicle_offers;
DROP POLICY IF EXISTS dealer_read_own_new_vehicle_offers ON public.new_vehicle_offers;
DROP POLICY IF EXISTS dealer_update_own_new_vehicle_offers ON public.new_vehicle_offers;
CREATE POLICY new_vehicle_offers_select ON public.new_vehicle_offers FOR SELECT TO authenticated
USING (
  is_admin()
  OR (
    dealer_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'dealer' AND p.active = true
    )
  )
);
CREATE POLICY new_vehicle_offers_insert ON public.new_vehicle_offers FOR INSERT TO authenticated
WITH CHECK (
  is_admin()
  OR (
    dealer_id = (select auth.uid())
    AND EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = (select auth.uid()) AND p.role = 'dealer' AND p.active = true
    )
    AND EXISTS (
      SELECT 1 FROM public.leads l
      WHERE l.id = new_vehicle_offers.lead_id
        AND l.new_or_used = 'new'
        AND COALESCE(l.status,'new') NOT IN ('closed','lost')
    )
  )
);
CREATE POLICY new_vehicle_offers_update ON public.new_vehicle_offers FOR UPDATE TO authenticated
USING (is_admin() OR dealer_id = (select auth.uid()))
WITH CHECK (is_admin() OR dealer_id = (select auth.uid()));
CREATE POLICY new_vehicle_offers_delete ON public.new_vehicle_offers FOR DELETE TO authenticated
USING (is_admin());

-- profiles: previous public policies were effectively authenticated-only because they
-- required auth.uid(); make that scope explicit and combine with admin access.
DROP POLICY IF EXISTS admin_profiles_manage ON public.profiles;
DROP POLICY IF EXISTS public_pending_partner_profile_insert ON public.profiles;
DROP POLICY IF EXISTS public_profiles_self ON public.profiles;
CREATE POLICY profiles_select ON public.profiles FOR SELECT TO authenticated
USING (is_admin() OR id = (select auth.uid()));
CREATE POLICY profiles_insert ON public.profiles FOR INSERT TO authenticated
WITH CHECK (
  is_admin()
  OR (id = (select auth.uid()) AND role IN ('dealer','partner') AND active = false)
);
CREATE POLICY profiles_update ON public.profiles FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY profiles_delete ON public.profiles FOR DELETE TO authenticated
USING (is_admin());

-- service_requests: preserve public creation for anonymous and authenticated callers.
DROP POLICY IF EXISTS admin_manage_service_requests ON public.service_requests;
DROP POLICY IF EXISTS public_create_service_requests ON public.service_requests;
CREATE POLICY service_requests_anon_insert ON public.service_requests FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY service_requests_authenticated_insert ON public.service_requests FOR INSERT TO authenticated
WITH CHECK (true);
CREATE POLICY service_requests_select ON public.service_requests FOR SELECT TO authenticated
USING (is_admin());
CREATE POLICY service_requests_update ON public.service_requests FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY service_requests_delete ON public.service_requests FOR DELETE TO authenticated
USING (is_admin());

-- vehicle_photos
DROP POLICY IF EXISTS admin_manage_photos ON public.vehicle_photos;
DROP POLICY IF EXISTS dealer_own_photos_insert ON public.vehicle_photos;
DROP POLICY IF EXISTS dealer_own_photos_select ON public.vehicle_photos;
DROP POLICY IF EXISTS public_photos_published ON public.vehicle_photos;
CREATE POLICY vehicle_photos_anon_select ON public.vehicle_photos FOR SELECT TO anon
USING (EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_photos.vehicle_id AND v.status = 'published'));
CREATE POLICY vehicle_photos_authenticated_select ON public.vehicle_photos FOR SELECT TO authenticated
USING (
  is_admin()
  OR EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_photos.vehicle_id AND v.partner_id = (select auth.uid()))
  OR EXISTS (SELECT 1 FROM public.vehicles v WHERE v.id = vehicle_photos.vehicle_id AND v.status = 'published')
);
CREATE POLICY vehicle_photos_insert ON public.vehicle_photos FOR INSERT TO authenticated
WITH CHECK (is_admin() OR can_dealer_upload_vehicle_photo(vehicle_id));
CREATE POLICY vehicle_photos_update ON public.vehicle_photos FOR UPDATE TO authenticated
USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY vehicle_photos_delete ON public.vehicle_photos FOR DELETE TO authenticated
USING (is_admin());

-- vehicle_private
DROP POLICY IF EXISTS admin_manage_private_vehicle_data ON public.vehicle_private;
DROP POLICY IF EXISTS dealer_insert_own_vehicle_private ON public.vehicle_private;
DROP POLICY IF EXISTS dealer_read_own_vehicle_private ON public.vehicle_private;
DROP POLICY IF EXISTS dealer_update_own_vehicle_private ON public.vehicle_private;
CREATE POLICY vehicle_private_select ON public.vehicle_private FOR SELECT TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.profiles p ON p.id = (select auth.uid())
    WHERE v.id = vehicle_private.id
      AND v.partner_id = (select auth.uid())
      AND p.role = 'dealer'
      AND p.active = true
  )
);
CREATE POLICY vehicle_private_insert ON public.vehicle_private FOR INSERT TO authenticated
WITH CHECK (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.profiles p ON p.id = (select auth.uid())
    WHERE v.id = vehicle_private.id
      AND v.partner_id = (select auth.uid())
      AND p.role = 'dealer'
      AND p.active = true
  )
);
CREATE POLICY vehicle_private_update ON public.vehicle_private FOR UPDATE TO authenticated
USING (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.profiles p ON p.id = (select auth.uid())
    WHERE v.id = vehicle_private.id
      AND v.partner_id = (select auth.uid())
      AND p.role = 'dealer'
      AND p.active = true
  )
)
WITH CHECK (
  is_admin()
  OR EXISTS (
    SELECT 1 FROM public.vehicles v
    JOIN public.profiles p ON p.id = (select auth.uid())
    WHERE v.id = vehicle_private.id
      AND v.partner_id = (select auth.uid())
      AND p.role = 'dealer'
      AND p.active = true
  )
);
CREATE POLICY vehicle_private_delete ON public.vehicle_private FOR DELETE TO authenticated
USING (is_admin());

-- vehicle_verification_orders: preserve public creation for anonymous/authenticated callers.
DROP POLICY IF EXISTS "admins manage verification orders" ON public.vehicle_verification_orders;
DROP POLICY IF EXISTS "public create verification orders" ON public.vehicle_verification_orders;
DROP POLICY IF EXISTS "users read own verification orders" ON public.vehicle_verification_orders;
CREATE POLICY vehicle_verification_orders_anon_insert ON public.vehicle_verification_orders FOR INSERT TO anon
WITH CHECK (true);
CREATE POLICY vehicle_verification_orders_authenticated_insert ON public.vehicle_verification_orders FOR INSERT TO authenticated
WITH CHECK (true);
CREATE POLICY vehicle_verification_orders_select ON public.vehicle_verification_orders FOR SELECT TO authenticated
USING (is_admin_manager() OR requested_by = (select auth.uid()));
CREATE POLICY vehicle_verification_orders_update ON public.vehicle_verification_orders FOR UPDATE TO authenticated
USING (is_admin_manager()) WITH CHECK (is_admin_manager());
CREATE POLICY vehicle_verification_orders_delete ON public.vehicle_verification_orders FOR DELETE TO authenticated
USING (is_admin_manager());

-- vehicles
DROP POLICY IF EXISTS admin_manage_vehicles ON public.vehicles;
DROP POLICY IF EXISTS dealer_own_vehicles_insert ON public.vehicles;
DROP POLICY IF EXISTS dealer_own_vehicles_select ON public.vehicles;
DROP POLICY IF EXISTS dealer_own_vehicles_update ON public.vehicles;
DROP POLICY IF EXISTS public_published_vehicles ON public.vehicles;
CREATE POLICY vehicles_anon_select ON public.vehicles FOR SELECT TO anon
USING (status = 'published');
CREATE POLICY vehicles_authenticated_select ON public.vehicles FOR SELECT TO authenticated
USING (is_admin() OR partner_id = (select auth.uid()) OR status = 'published');
CREATE POLICY vehicles_insert ON public.vehicles FOR INSERT TO authenticated
WITH CHECK (is_admin() OR (partner_id = (select auth.uid()) AND status = 'draft'));
CREATE POLICY vehicles_update ON public.vehicles FOR UPDATE TO authenticated
USING (is_admin() OR partner_id = (select auth.uid()))
WITH CHECK (is_admin() OR (partner_id = (select auth.uid()) AND status = 'draft'));
CREATE POLICY vehicles_delete ON public.vehicles FOR DELETE TO authenticated
USING (is_admin());
