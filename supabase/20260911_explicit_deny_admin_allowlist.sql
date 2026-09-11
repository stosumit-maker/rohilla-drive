-- Keep the admin allowlist inaccessible through normal API roles while making the
-- deny-by-default intent explicit. SECURITY DEFINER owner functions that validate
-- administrators continue to read this table with owner privileges.
DROP POLICY IF EXISTS admin_allowlist_explicit_deny ON public.admin_allowlist;
CREATE POLICY admin_allowlist_explicit_deny
ON public.admin_allowlist
AS RESTRICTIVE
FOR ALL
TO public
USING (false)
WITH CHECK (false);
