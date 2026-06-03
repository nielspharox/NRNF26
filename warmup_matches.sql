-- ============================================================
-- NO RISK NO FUN 2026 — WARM-UP RONDE (oefeninterlands)
-- ------------------------------------------------------------
-- 14 friendlies vóór het WK. phase = 'warmup' → telt NIET mee
-- voor totaal/poule/knockout. Odds staan op de standaard 33/34/33;
-- vul de echte odds handmatig in via admin (home_odds NOT NULL).
-- Tijden zijn lokale tijd (CEST, +02:00).
-- match_number 901+ zodat het niet botst met de WK-nummers 1-104.
-- matchday telt aflopend naar de WK-start: laatste warm-up-dag = SD0, ervoor -1, ...
-- (WK-dag 1 = SD1). Zie set_matchdays.sql voor de volledige nummering.
-- ============================================================

-- Zorg dat de matchday-kolom bestaat (gebruikt door dagwinnaar/waaghals).
alter table public.matches
  add column if not exists matchday integer default null;

insert into public.matches
  (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, matchday, kickoff, venue)
values
  (901,'Netherlands','Algeria',      33,34,33,'warmup',null,null,-4,'2026-06-03 20:45:00+02',null),
  (902,'Denmark','DR Congo',         33,34,33,'warmup',null,null,-4,'2026-06-03 20:00:00+02',null),
  (903,'Sweden','Greece',            33,34,33,'warmup',null,null,-3,'2026-06-04 19:00:00+02',null),
  (904,'Spain','Iraq',               33,34,33,'warmup',null,null,-3,'2026-06-04 21:00:00+02',null),
  (905,'France','Ivory Coast',       33,34,33,'warmup',null,null,-3,'2026-06-04 21:10:00+02',null),
  (906,'Belgium','Tunisia',          33,34,33,'warmup',null,null,-2,'2026-06-06 15:00:00+02',null),
  (907,'Portugal','Chile',           33,34,33,'warmup',null,null,-2,'2026-06-06 19:45:00+02',null),
  (908,'USA','Germany',              33,34,33,'warmup',null,null,-2,'2026-06-06 20:30:00+02',null),
  (909,'England','New Zealand',      33,34,33,'warmup',null,null,-2,'2026-06-06 22:00:00+02',null),
  (910,'Brazil','Egypt',             33,34,33,'warmup',null,null,-1,'2026-06-07 00:00:00+02',null),
  (911,'Argentina','Honduras',       33,34,33,'warmup',null,null,-1,'2026-06-07 02:00:00+02',null),
  (912,'Curacao','Aruba',            33,34,33,'warmup',null,null,-1,'2026-06-07 02:00:00+02',null),
  (913,'France','Northern Ireland',  33,34,33,'warmup',null,null,0,'2026-06-08 21:10:00+02',null),
  (914,'Netherlands','Uzbekistan',   33,34,33,'warmup',null,null,0,'2026-06-08 20:45:00+02',null);
