-- Phase 2 of business-application identity hardening.
-- Apply only after the trusted_signup_v2 frontend is live in production.
-- The auth.users trigger creates the application row server-side; direct client
-- inserts are retained only for an authenticated user inserting their own ID.

DROP POLICY IF EXISTS public_create_dealer_application ON public.dealer_applications;
CREATE POLICY public_create_dealer_application
ON public.dealer_applications
FOR INSERT
TO authenticated
WITH CHECK (
  applicant_user_id = (select auth.uid())
  AND status = 'new'
);

DROP POLICY IF EXISTS public_create_collab ON public.collaboration_requests;
CREATE POLICY public_create_collab
ON public.collaboration_requests
FOR INSERT
TO authenticated
WITH CHECK (
  applicant_user_id = (select auth.uid())
  AND status = 'new'
);
