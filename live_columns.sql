-- ============================================================
-- NO RISK NO FUN 2026 — LIVE TUSSENSTAND kolommen
-- ------------------------------------------------------------
-- Tijdens een wedstrijd schrijft de sync de live stand hierin weg
-- (zonder `result` te zetten, zodat de tip nog niet "afgerond" is).
-- Bij FINISHED worden deze weer op null gezet en wordt result gezet.
-- ============================================================

alter table public.matches
  add column if not exists live_home integer default null,
  add column if not exists live_away integer default null,
  add column if not exists minute    integer default null;
