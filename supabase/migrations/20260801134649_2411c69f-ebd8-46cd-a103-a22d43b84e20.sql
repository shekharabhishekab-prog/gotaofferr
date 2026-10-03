SELECT cron.alter_job(
  job_id := 2,
  schedule := '*/5 * * * *',
  active := true
);