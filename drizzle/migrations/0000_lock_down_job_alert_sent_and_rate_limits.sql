-- job_alert_sent: rows are written only by the backend digest job (service_role).
-- Users may read their own send history, so keep SELECT but remove write grants.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.job_alert_sent FROM authenticated;
REVOKE ALL ON public.job_alert_sent FROM anon;
GRANT SELECT ON public.job_alert_sent TO authenticated;
GRANT ALL ON public.job_alert_sent TO service_role;

-- rate_limits: server-only counters. No client role may touch them; RLS stays on
-- with no policies so the table is fail-closed even if a grant is added later.
REVOKE ALL ON public.rate_limits FROM anon, authenticated;
GRANT ALL ON public.rate_limits TO service_role;

ALTER TABLE public.job_alert_sent ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Explicit deny-all policies make the intent unambiguous for future reviewers.
DROP POLICY IF EXISTS "No client writes to job alert history" ON public.job_alert_sent;
CREATE POLICY "No client writes to job alert history"
ON public.job_alert_sent
FOR ALL
TO authenticated
USING (false)
WITH CHECK (false);

DROP POLICY IF EXISTS "Rate limits are server-only" ON public.rate_limits;
CREATE POLICY "Rate limits are server-only"
ON public.rate_limits
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);