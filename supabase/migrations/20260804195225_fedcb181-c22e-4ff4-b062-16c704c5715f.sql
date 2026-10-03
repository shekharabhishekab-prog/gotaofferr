REVOKE ALL ON FUNCTION public.consume_topup_credit(uuid, public.topup_kind) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.consume_topup_credit(uuid, public.topup_kind) TO service_role;

REVOKE ALL ON FUNCTION public.set_job_alerts_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_job_alerts_updated_at() TO service_role;