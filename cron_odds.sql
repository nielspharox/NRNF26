-- ============================================================
-- NO RISK NO FUN 2026 — GEPLANDE ODDS-FETCH via pg_cron
-- ------------------------------------------------------------
-- Roept dezelfde edge function (slug 'swift-function') aan met {"mode":"odds"}.
-- De functie bevriest odds PER WEDSTRIJD op ~exact 48u vóór aftrap (niet per ronde —
-- KO-rondes overlappen: de 1e R32-wedstrijd start ~17u ná de laatste groepswedstrijd,
-- dus de R32-teams zijn 48u vóór die wedstrijd nog onbekend):
--   • een wedstrijd telt mee zodra die binnen 48u start, geen uitslag heeft, geen
--     warmup is (the-odds-api dekt geen friendlies) en BEKENDE teams heeft
--     (placeholders '1st Group A'/'Winner M73'/'Best 3rd …' worden overgeslagen);
--   • bevriezen = verse odds ophalen + freeze-guard 'odds_frozen_m<id>' zetten. Daarna
--     wordt die wedstrijd nooit meer overschreven → odds liggen vast, gelijk voor
--     iedereen (de scoring rekent op de match-odds = exact deze 48u-odds);
--   • KO-duels komen pas in beeld zodra hun teams bekend zijn (placeholders → skip);
--   • uitstel: een bevroren wedstrijd die weer >48u weg schuift wordt ontdooid
--     (freeze-guard weg) en bevriest opnieuw op het nieuwe 48u-moment;
--   • één call vult meteen ÁLLE op dat moment geliste, niet-bevroren wedstrijden;
--   • bookmaker nog geen markt? niet bevriezen, throttled retry (max 1 call/30 min via
--     'odds_fetch_lock') i.p.v. elke minuut → geen credit-verbranding;
--   • niets te bevriezen → geen externe call → 0 credits.
-- 1 fetch = 1 the-odds-api credit (markten×regio's = h2h×eu = 1).
--
-- Free plan = 500 credits/maand. Verwacht verbruik: ~1 fetch per cluster wedstrijden
-- dat z'n 48u-moment passeert (gelijktijdige aftrappen delen één call) → enkele
-- tientallen over het hele toernooi, gesplitst over juni+juli → ruim binnen budget.
--
-- Draait server-side → werkt ook als niemand de app open heeft.
-- Anon key hieronder is publiek (staat ook in index.html) en wordt door de gateway
-- als apikey-header geëist. Optioneel: beveilig met CRON_SECRET (zie onder).
-- ============================================================

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- ── 1) Terugkerende freeze-check: ELKE MINUUT ──────────────────
-- Bevriest elke wedstrijd op ~exact 48u vóór aftrap (eerste minuut ná de 48u-grens).
-- Doet niets (0 credits) zolang er niets binnen 48u staat met bekende teams. Op het
-- 48u-moment: 1 /odds-call (verse odds) + freeze-guard. Bookmaker nog geen markt? Dan
-- throttled retry (max 1 call/30 min), niet elke minuut → geen credit-verbranding.
select cron.unschedule('odds-auto') where exists (select 1 from cron.job where jobname = 'odds-auto');
select cron.schedule(
  'odds-auto',
  '* * * * *',
  $$
    select net.http_post(
      url     := 'https://soonpwnwrvxmariaqdfb.supabase.co/functions/v1/swift-function',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25wd253cnZ4bWFyaWFxZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjE1NzcsImV4cCI6MjA5NDY5NzU3N30.dFNOMuYNdtCk9Z6GrZRE-wHYua3wIIo5vDmXX4YS-k8',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25wd253cnZ4bWFyaWFxZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjE1NzcsImV4cCI6MjA5NDY5NzU3N30.dFNOMuYNdtCk9Z6GrZRE-wHYua3wIIo5vDmXX4YS-k8'
      ),
      -- Met CRON_SECRET op de functie: {"mode":"odds","secret":"<jouw_secret>"}
      body := '{"mode":"odds"}'::jsonb
    );
  $$
);

-- ── 2) TEST vanavond 8 juni 21:00 (Amsterdam = CEST = UTC+2 → 19:00 UTC) ──
-- force=true → negeert de 48u-check + guard en haalt NU echt odds op (bewijst de
-- pijplijn). Zet GEEN guard-flag, dus de echte 48u-fetch van group R1 (9 juni)
-- draait daarna gewoon normaal door.
-- LET OP: deze expressie vuurt elk jaar op 8 juni 19:00 UTC. Na de test opruimen
-- met:  select cron.unschedule('odds-test-tonight');
select cron.unschedule('odds-test-tonight') where exists (select 1 from cron.job where jobname = 'odds-test-tonight');
select cron.schedule(
  'odds-test-tonight',
  '0 19 8 6 *',
  $$
    select net.http_post(
      url     := 'https://soonpwnwrvxmariaqdfb.supabase.co/functions/v1/swift-function',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'apikey', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25wd253cnZ4bWFyaWFxZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjE1NzcsImV4cCI6MjA5NDY5NzU3N30.dFNOMuYNdtCk9Z6GrZRE-wHYua3wIIo5vDmXX4YS-k8',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNvb25wd253cnZ4bWFyaWFxZGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMjE1NzcsImV4cCI6MjA5NDY5NzU3N30.dFNOMuYNdtCk9Z6GrZRE-wHYua3wIIo5vDmXX4YS-k8'
      ),
      body := '{"mode":"odds","force":true}'::jsonb
    );
  $$
);

-- ── Handig ──
-- Bekijken:   select jobid, jobname, schedule, active from cron.job;
-- Logs:       select * from cron.job_run_details order by start_time desc limit 20;
-- Guard-flags: select * from settings where key like 'odds_fetched_%';
-- Reset ronde: delete from settings where key = 'odds_fetched_group-1';  -- forceer opnieuw
-- Stoppen:    select cron.unschedule('odds-auto');
--             select cron.unschedule('odds-test-tonight');
