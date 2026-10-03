REVOKE ALL ON FUNCTION public.topup_balance(uuid, public.topup_kind) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.topup_balance(uuid, public.topup_kind) TO service_role;