-- ProNet anonymous job alerts (owner-approved 2026-10-15). ADDITIVE ONLY:
-- two new tables, no changes to existing tables, no data touched.
-- Apply via the Supabase SQL editor (agent has no DDL credentials).

CREATE TABLE public.pronet_job_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,                 -- encrypted at rest (field-crypto)
  role text NOT NULL,                  -- encrypted
  location text,
  remote_only boolean NOT NULL DEFAULT false,
  experience text,
  salary_range text,
  extra_filters text,
  local_hour integer NOT NULL DEFAULT 8 CHECK (local_hour BETWEEN 0 AND 23),
  timezone text NOT NULL DEFAULT 'Asia/Kolkata',
  enabled boolean NOT NULL DEFAULT true,
  emails_sent integer NOT NULL DEFAULT 0,
  last_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_pronet_job_alerts_enabled ON public.pronet_job_alerts(enabled) WHERE enabled;
CREATE INDEX idx_pronet_job_alerts_email ON public.pronet_job_alerts(email);

CREATE TABLE public.pronet_job_alert_sent (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_id uuid NOT NULL REFERENCES public.pronet_job_alerts(id) ON DELETE CASCADE,
  job_url text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (alert_id, job_url)
);

CREATE INDEX idx_pronet_job_alert_sent_alert ON public.pronet_job_alert_sent(alert_id);

-- Worker-only tables: no client access at all.
GRANT ALL ON public.pronet_job_alerts TO service_role;
GRANT ALL ON public.pronet_job_alert_sent TO service_role;
ALTER TABLE public.pronet_job_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pronet_job_alert_sent ENABLE ROW LEVEL SECURITY;
