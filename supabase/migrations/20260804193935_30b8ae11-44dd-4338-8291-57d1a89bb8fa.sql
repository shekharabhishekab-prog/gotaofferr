CREATE TYPE public.topup_kind AS ENUM ('tailor', 'job_search', 'job_alert');

CREATE TABLE public.credit_topups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind public.topup_kind NOT NULL,
  pack_id text NOT NULL,
  credits integer NOT NULL CHECK (credits > 0),
  remaining integer NOT NULL DEFAULT 0 CHECK (remaining >= 0),
  status text NOT NULL DEFAULT 'pending',
  currency text NOT NULL,
  amount numeric NOT NULL,
  razorpay_order_id text UNIQUE,
  razorpay_payment_id text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.credit_topups TO authenticated;
GRANT ALL ON public.credit_topups TO service_role;

ALTER TABLE public.credit_topups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own top-ups"
  ON public.credit_topups FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Service role manages top-ups"
  ON public.credit_topups FOR ALL TO service_role
  USING (true) WITH CHECK (true);

CREATE INDEX idx_credit_topups_user_kind ON public.credit_topups (user_id, kind, status);

CREATE TRIGGER update_credit_topups_updated_at
  BEFORE UPDATE ON public.credit_topups
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Atomically spends one paid, unexpired top-up credit of the given kind.
CREATE OR REPLACE FUNCTION public.consume_topup_credit(_user_id uuid, _kind public.topup_kind)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target uuid;
BEGIN
  SELECT id INTO target
  FROM public.credit_topups
  WHERE user_id = _user_id
    AND kind = _kind
    AND status = 'paid'
    AND remaining > 0
    AND (expires_at IS NULL OR expires_at > now())
  ORDER BY expires_at NULLS LAST, created_at
  FOR UPDATE SKIP LOCKED
  LIMIT 1;

  IF target IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.credit_topups SET remaining = remaining - 1 WHERE id = target;
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.consume_topup_credit(uuid, public.topup_kind) FROM public;
GRANT EXECUTE ON FUNCTION public.consume_topup_credit(uuid, public.topup_kind) TO service_role;

CREATE OR REPLACE FUNCTION public.topup_balance(_user_id uuid, _kind public.topup_kind)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(SUM(remaining), 0)::int
  FROM public.credit_topups
  WHERE user_id = _user_id
    AND kind = _kind
    AND status = 'paid'
    AND remaining > 0
    AND (expires_at IS NULL OR expires_at > now());
$$;

GRANT EXECUTE ON FUNCTION public.topup_balance(uuid, public.topup_kind) TO authenticated, service_role;