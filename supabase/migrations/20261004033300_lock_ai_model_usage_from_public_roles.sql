-- ai_model_usage is written only by the server (service role). Public roles get no direct access.
revoke all on public.ai_model_usage from anon, authenticated;
