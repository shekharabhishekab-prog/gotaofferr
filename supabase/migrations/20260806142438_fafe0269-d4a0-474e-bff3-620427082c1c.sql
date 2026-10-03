-- Defense in depth: no anonymous (signed-out) direct table access anywhere.
REVOKE ALL ON public.profiles FROM anon;
REVOKE ALL ON public.subscriptions FROM anon;
REVOKE ALL ON public.tailor_runs FROM anon;
REVOKE ALL ON public.job_alerts FROM anon;
REVOKE ALL ON public.job_alert_sent FROM anon;
REVOKE ALL ON public.job_search_runs FROM anon;
REVOKE ALL ON public.credit_topups FROM anon;
REVOKE ALL ON public.captured_emails FROM anon;
REVOKE ALL ON public.anonymous_tailor_uses FROM anon;
REVOKE ALL ON public.user_roles FROM anon;
REVOKE ALL ON public.rate_limits FROM anon;

-- Sensitive/system-owned tables: not reachable by end users at all.
REVOKE ALL ON public.captured_emails FROM authenticated;
REVOKE ALL ON public.anonymous_tailor_uses FROM authenticated;
REVOKE ALL ON public.rate_limits FROM authenticated;

-- Users can only read their own roles; never modify them.
REVOKE INSERT, UPDATE, DELETE ON public.user_roles FROM authenticated;
-- Subscription and top-up state is written only by verified payment webhooks.
REVOKE INSERT, UPDATE, DELETE ON public.subscriptions FROM authenticated;
REVOKE INSERT, UPDATE, DELETE ON public.credit_topups FROM authenticated;

GRANT ALL ON public.rate_limits TO service_role;
GRANT ALL ON public.captured_emails TO service_role;
GRANT ALL ON public.anonymous_tailor_uses TO service_role;

-- Documented intent: rate_limits is only touched by SECURITY DEFINER functions.
COMMENT ON TABLE public.rate_limits IS 'System table. RLS on with no policies by design: only SECURITY DEFINER functions (bump_rate_limit) and service_role may access it.';