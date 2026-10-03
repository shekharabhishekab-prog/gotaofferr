CREATE TABLE IF NOT EXISTS public.rate_limits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket text NOT NULL,
  identifier text NOT NULL,
  window_start timestamptz NOT NULL,
  count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (bucket, identifier, window_start)
);

GRANT ALL ON public.rate_limits TO service_role;
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

CREATE INDEX IF NOT EXISTS rate_limits_window_idx ON public.rate_limits (window_start);

CREATE OR REPLACE FUNCTION public.bump_rate_limit(_bucket text, _identifier text, _window_start timestamptz)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_count integer;
BEGIN
  INSERT INTO public.rate_limits (bucket, identifier, window_start, count)
  VALUES (_bucket, _identifier, _window_start, 1)
  ON CONFLICT (bucket, identifier, window_start)
  DO UPDATE SET count = public.rate_limits.count + 1
  RETURNING count INTO new_count;

  DELETE FROM public.rate_limits WHERE window_start < now() - interval '1 day';

  RETURN new_count;
END;
$$;

REVOKE ALL ON FUNCTION public.bump_rate_limit(text, text, timestamptz) FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.bump_rate_limit(text, text, timestamptz) TO service_role;

DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
CREATE POLICY "Users can view own subscription" ON public.subscriptions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Service role can manage subscriptions" ON public.subscriptions
  FOR ALL TO service_role USING (true) WITH CHECK (true);