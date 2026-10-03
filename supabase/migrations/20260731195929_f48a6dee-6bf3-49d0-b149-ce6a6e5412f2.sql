ALTER TABLE public.job_alerts
  ADD COLUMN IF NOT EXISTS salary_range text,
  ADD COLUMN IF NOT EXISTS last_jobs jsonb,
  ADD COLUMN IF NOT EXISTS last_job_count integer NOT NULL DEFAULT 0;