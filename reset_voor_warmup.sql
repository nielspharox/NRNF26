-- ============================================================
-- NO RISK NO FUN 2026 — SCHONE START vóór de WARM-UP RONDE
-- ------------------------------------------------------------
-- Wist alle wedstrijden + tips en reset streaks/dagwinsten.
-- BLIJFT staan: profiles (gebruikers), complot_groups, complot_members.
-- Voer dit in de Supabase SQL editor uit.
-- ============================================================

delete from public.tips;
delete from public.matches;

update public.profiles
  set current_streak = 0,
      longest_streak = 0,
      day_wins       = 0;

-- Ter controle (idempotent — geven 0 terug op lege data):
select public.recalc_streaks();
select public.recalc_day_wins();
