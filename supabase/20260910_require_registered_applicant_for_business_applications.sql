-- Applied to production as Supabase migration 20260910083245
-- Require business applications to reference a registered auth user and enter through the new-review state.

DROP POLICY IF EXISTS public_create_dealer_application ON public.dealer_applications;
CREATE POLICY public_create_dealer_application
ON public.dealer_applications
FOR INSERT
TO public
WITH CHECK (applicant_user_id IS NOT NULL AND status = 'new');

DROP POLICY IF EXISTS public_create_collab ON public.collaboration_requests;
CREATE POLICY public_create_collab
ON public.collaboration_requests
FOR INSERT
TO public
WITH CHECK (applicant_user_id IS NOT NULL AND status = 'new');
