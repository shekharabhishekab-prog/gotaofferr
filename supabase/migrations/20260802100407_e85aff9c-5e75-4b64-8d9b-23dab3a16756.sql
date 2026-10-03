CREATE TABLE public.anonymous_tailor_uses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  device_hash text NOT NULL UNIQUE,
  ip_hash text,
  used_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT ALL ON public.anonymous_tailor_uses TO service_role;
ALTER TABLE public.anonymous_tailor_uses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages anonymous tailor uses"
  ON public.anonymous_tailor_uses FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX idx_anonymous_tailor_uses_ip_hash ON public.anonymous_tailor_uses (ip_hash);

CREATE TABLE public.captured_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  source text NOT NULL DEFAULT 'anonymous_tailor',
  device_hash text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (email, source)
);

GRANT ALL ON public.captured_emails TO service_role;
ALTER TABLE public.captured_emails ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages captured emails"
  ON public.captured_emails FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$
LANGUAGE plpgsql SET search_path = public;

REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_updated_at_column() TO service_role;

CREATE TRIGGER update_anonymous_tailor_uses_updated_at
  BEFORE UPDATE ON public.anonymous_tailor_uses
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_captured_emails_updated_at
  BEFORE UPDATE ON public.captured_emails
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();