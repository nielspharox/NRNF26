-- ============================================================
-- NO RISK NO FUN 2026 — ALLEEN DE WARM-UP WISSEN (vóór WK-start)
-- ------------------------------------------------------------
-- Chirurgische reset: verwijdert UITSLUITEND de warm-up (friendlies) + de tips
-- daarop, en herberekent streaks/dagwinsten naar 0. WK-wedstrijden, de al
-- ingevoerde POULE-/KO-TIPS, de opgehaalde odds, profielen en complotgroepen
-- blijven volledig intact.
--
-- Gebruik dit i.p.v. reset_voor_warmup.sql wanneer spelers al WK-tips hebben
-- ingevuld (reset_voor_warmup.sql wist ÁLLE tips + matches → niet doen!).
-- Voer uit in de Supabase SQL editor.
-- ============================================================

-- 1. Tips op warm-up-wedstrijden weg (eerst, i.v.m. foreign key).
delete from public.tips
where match_id in (select id from public.matches where phase = 'warmup');

-- 2. De warm-up-wedstrijden zelf weg.
delete from public.matches where phase = 'warmup';

-- 3. Streaks + dagwinsten herberekenen. Warm-up telt nu niet meer mee; de WK-
--    wedstrijden hebben nog geen uitslag → resultaat is voor iedereen 0.
select public.recalc_streaks();
select public.recalc_day_wins();

-- ── Controle (verwacht resultaat) ──
-- 0 warm-up-wedstrijden over:
--   select count(*) from public.matches where phase = 'warmup';            -> 0
-- WK-wedstrijden staan er nog:
--   select count(*) from public.matches;                                   -> alle WK-matches
-- Poule-tips zijn behouden:
--   select count(*) from public.tips t join public.matches m on m.id = t.match_id
--     where m.phase = 'group';                                             -> jouw poule-tips
-- Alles op 0:
--   select username, current_streak, longest_streak, day_wins from public.profiles;
