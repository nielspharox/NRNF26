-- ============================================================
-- NO RISK NO FUN 2026 — ONBEWAAKTE LIVE-SYNC via pg_cron
-- ------------------------------------------------------------
-- Roept elke minuut de edge function (slug 'swift-function') aan met
-- {"mode":"sync"}. De functie checkt ZELF of er een WK-wedstrijd live is
-- (kickoff<=nu, <3u, geen uitslag); zo niet, stopt 'ie meteen zonder een
-- football-data call te verbruiken. Bij live wedstrijden: uitslagen ophalen,
-- scores/result wegschrijven, bracket doorschuiven, streaks/dagwinsten herrekenen.
--
-- Draait server-side → werkt ook als niemand de app open heeft.
-- De anon key hieronder is publiek (staat ook in index.html); de gateway eist
-- 'm als apikey-header. Beveilig 'mode:sync' eventueel met een CRON_SECRET (zie onder).
-- ============================================================

-- Eenmalig: extensies aan (in Supabase meestal al beschikbaar).
create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Oude job opruimen (bij herhaald draaien van dit script).
select cron.unschedule('fd-live-sync') where exists (select 1 from cron.job where jobname = 'fd-live-sync');

-- Elke minuut triggeren.
select cron.schedule(
  'fd-live-sync',
  '* * * * *',
  $$
    select net.http_post(
      url     := 'https://soonpwnwrvxmariaqdfb.supabase.co/functions/v1/swift-function',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25wd253cnZ4bWFyaWFxZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjE1NzcsImV4cCI6MjA5NDY5NzU3N30.dFNOMuYNdtCk9Z6GrZRE-wHYua3wIIo5vDmXX4YS-k8',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25wd253cnZ4bWFyaWFxZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjE1NzcsImV4cCI6MjA5NDY5NzU3N30.dFNOMuYNdtCk9Z6GrZRE-wHYua3wIIo5vDmXX4YS-k8'
      ),
      -- Met CRON_SECRET op de functie: gebruik {"mode":"sync","secret":"<jouw_secret>"}
      body := '{"mode":"sync"}'::jsonb
    );
  $$
);

-- ── Handig ──
-- Bekijken:   select jobid, jobname, schedule, active from cron.job;
-- Logs:       select * from cron.job_run_details order by start_time desc limit 20;
-- Stoppen:    select cron.unschedule('fd-live-sync');
