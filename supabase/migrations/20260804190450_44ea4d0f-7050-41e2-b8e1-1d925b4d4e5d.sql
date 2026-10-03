CREATE TABLE public.job_search_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role text,
  location text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX job_search_runs_user_created_idx ON public.job_search_runs (user_id, created_at DESC);

GRANT SELECT, INSERT ON public.job_search_runs TO authenticated;
GRANT ALL ON public.job_search_runs TO service_role;

ALTER TABLE public.job_search_runs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own job searches"
ON public.job_search_runs FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can record their own job searches"
ON public.job_search_runs FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);