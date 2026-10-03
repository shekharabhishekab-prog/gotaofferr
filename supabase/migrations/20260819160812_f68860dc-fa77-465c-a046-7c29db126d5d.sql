ALTER TABLE public.tailor_runs ADD COLUMN IF NOT EXISTS label text;
GRANT UPDATE, DELETE ON public.tailor_runs TO authenticated;

DO $$ BEGIN
  CREATE POLICY "Users can update their own runs" ON public.tailor_runs
    FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Users can delete their own runs" ON public.tailor_runs
    FOR DELETE TO authenticated USING (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.job_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  company text NOT NULL,
  role text NOT NULL,
  job_url text,
  location text,
  stage text NOT NULL DEFAULT 'saved' CHECK (stage IN ('saved','applied','interview','offer','rejected')),
  notes text,
  applied_at date,
  next_action_at date,
  tailor_run_id uuid REFERENCES public.tailor_runs(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS job_applications_user_idx
  ON public.job_applications (user_id, updated_at DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.job_applications TO authenticated;
GRANT ALL ON public.job_applications TO service_role;
REVOKE ALL ON public.job_applications FROM anon;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Users manage their own applications" ON public.job_applications
    FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

DROP TRIGGER IF EXISTS update_job_applications_updated_at ON public.job_applications;
CREATE TRIGGER update_job_applications_updated_at
  BEFORE UPDATE ON public.job_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();