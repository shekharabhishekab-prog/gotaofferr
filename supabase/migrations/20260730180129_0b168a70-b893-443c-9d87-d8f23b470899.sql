CREATE TABLE public.job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL,
  location text,
  remote_only boolean NOT NULL DEFAULT false,
  experience text,
  extra_filters text,
  send_hour_utc integer NOT NULL DEFAULT 3 CHECK (send_hour_utc BETWEEN 0 AND 23),
  enabled boolean NOT NULL DEFAULT true,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_job_alerts_user_id ON public.job_alerts(user_id);
CREATE INDEX idx_job_alerts_enabled_hour ON public.job_alerts(enabled, send_hour_utc);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_alerts TO authenticated;
GRANT ALL ON public.job_alerts TO service_role;
ALTER TABLE public.job_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job alerts" ON public.job_alerts FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own job alerts" ON public.job_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own job alerts" ON public.job_alerts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own job alerts" ON public.job_alerts FOR DELETE TO authenticated USING (auth.uid() = user_id);

CREATE TABLE public.job_alert_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.job_alerts(id) ON DELETE CASCADE,
  job_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_id, job_url)
);

CREATE INDEX idx_job_alert_sent_alert ON public.job_alert_sent(alert_id);

GRANT SELECT ON public.job_alert_sent TO authenticated;
GRANT ALL ON public.job_alert_sent TO service_role;
ALTER TABLE public.job_alert_sent ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view sent history for their own alerts" ON public.job_alert_sent FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.job_alerts a WHERE a.id = alert_id AND a.user_id = auth.uid()));

CREATE OR REPLACE FUNCTION public.set_job_alerts_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER trg_job_alerts_updated_at BEFORE UPDATE ON public.job_alerts
FOR EACH ROW EXECUTE FUNCTION public.set_job_alerts_updated_at();