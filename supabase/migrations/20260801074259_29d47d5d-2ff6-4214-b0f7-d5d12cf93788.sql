DO $$
DECLARE
  existing_job record;
  repaired_command text;
BEGIN
  SELECT jobid, schedule, command
  INTO existing_job
  FROM cron.job
  WHERE jobname = 'tailorcv-daily-job-alerts'
  LIMIT 1;

  IF existing_job.jobid IS NULL THEN
    RAISE EXCEPTION 'Daily job alert schedule was not found';
  END IF;

  repaired_command := replace(existing_job.command, 'extensions.http_post(', 'net.http_post(');

  IF repaired_command = existing_job.command THEN
    RAISE EXCEPTION 'Daily job alert command did not contain the expected broken HTTP call';
  END IF;

  PERFORM cron.unschedule(existing_job.jobid);
  PERFORM cron.schedule(
    'tailorcv-daily-job-alerts',
    existing_job.schedule,
    repaired_command
  );
END
$$;