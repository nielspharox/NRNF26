-- ODDS_SET — expliciete vlag: zijn er ECHTE odds opgehaald voor deze wedstrijd?
-- Vervangt de oude 33/34/33-heuristiek. Zo weten server (doOddsAuto) én frontend
-- (renderTips display-guard) zeker of de getoonde odds echt zijn i.p.v. de default
-- placeholder-odds. fetchOdds (cron + handmatig) en admin-odds zetten 'm op true;
-- de frontend toont pas percentages+punten als odds_set = true.
-- Idempotent — veilig om vaker te draaien.

alter table public.matches add column if not exists odds_set boolean not null default false;

-- Backfill 1: alles wat al niet-default odds draagt, is al opgehaald.
update public.matches
set odds_set = true
where odds_set = false
  and not (home_odds = 33 and draw_odds = 34 and away_odds = 33);

-- Backfill 2: al-bevroren wedstrijden hebben sowieso echte odds gekregen.
update public.matches m
set odds_set = true
from public.settings s
where m.odds_set = false
  and s.key = 'odds_frozen_m' || m.id::text;
