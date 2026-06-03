-- ============================================================
-- NO RISK NO FUN 2026 — FAVORIET COMPLOTGROEPJE
-- ------------------------------------------------------------
-- Per speler één favoriet complot (uuid → complot_groups.id), wordt op HOME
-- als eerste getoond. Update via de eigen profiles-rij (RLS staat dat al toe).
-- ============================================================

alter table public.profiles
  add column if not exists fav_complot uuid default null;
