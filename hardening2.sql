-- ============================================================
-- NO RISK NO FUN 2026 — SECURITY HARDENING 2
-- Dicht de WARN's uit de Supabase Security Advisor (2026-06-15).
-- Vervolg op hardening.sql. Idempotent: meerdere keren draaien mag,
-- de uitkomst blijft gelijk.
-- Draai dit in Supabase → SQL Editor → New query → Run.
-- ============================================================


-- ── FIX 1: vaste search_path op de SECURITY DEFINER recalc-functies ─
-- Lint: function_search_path_mutable (0011).
-- Zonder vaste search_path kan een SECURITY DEFINER-functie naar
-- objecten in een ander schema verwijzen → draait dan met admin-rechten
-- tegen een door een aanvaller geplaatste tabel/functie. Pinnen op
-- public + pg_temp dicht dat. (protect_profile_privileges heeft dit al.)

alter function public.recalc_streaks()  set search_path = public, pg_temp;
alter function public.recalc_day_wins() set search_path = public, pg_temp;


-- ── FIX 2: protect_profile_privileges niet meer als RPC aanroepbaar ─
-- Lint: anon/authenticated_security_definer_function_executable (0028/0029).
-- Dit is een TRIGGER-functie, geen RPC. Niemand hoort 'm via
-- /rest/v1/rpc/... aan te roepen. De trigger blijft werken (die draait
-- los van EXECUTE-grants); we sluiten alleen het onnodige API-endpoint.

revoke execute on function public.protect_profile_privileges()
  from anon, authenticated, public;


-- ── FIX 3: recalc-RPC's niet meer publiek (anon) aanroepbaar ────────
-- Lint: anon_security_definer_function_executable (0028).
-- recalc_streaks/recalc_day_wins worden bewust vanuit de admin-UI
-- aangeroepen (sb.rpc(...)). Dat vereist een ingelogde sessie, dus
-- 'authenticated' moet EXECUTE houden; 'anon' heeft het niet nodig.
-- (De 0029-warning voor 'authenticated' blijft dus bewust staan —
-- acceptabel: de functies zijn idempotent en lekken niets.)

revoke execute on function public.recalc_streaks()  from anon, public;
revoke execute on function public.recalc_day_wins() from anon, public;


-- ── NIET in dit script (bewuste keuzes) ────────────────────────────
-- • extension_in_public (pg_net): Supabase zet 'm standaard in public;
--   verplaatsen kan cron/edge-calls breken voor verwaarloosbare winst.
--   → laten staan.
-- • auth_leaked_password_protection: zet aan in het Dashboard →
--   Authentication → AAN (checkt tegen HaveIBeenPwned). Geen SQL.
-- • recalc_* voor 'authenticated': bewust toegestaan (admin-UI gebruikt
--   het). Wil je het dichttimmeren: bouw een is_admin-check ín de
--   functies i.p.v. te vertrouwen op de EXECUTE-grant.


-- ============================================================
-- VERIFICATIE (draai na bovenstaande, controleer de output)
-- ============================================================
-- 1) search_path staat nu vast op de recalc-functies:
--    select p.proname, p.proconfig
--    from pg_proc p join pg_namespace n on n.oid = p.pronamespace
--    where n.nspname='public'
--      and p.proname in ('recalc_streaks','recalc_day_wins','protect_profile_privileges');
--    -- proconfig moet 'search_path=public, pg_temp' bevatten.
--
-- 2) EXECUTE-grants zijn ingetrokken:
--    select routine_name, grantee, privilege_type
--    from information_schema.role_routine_grants
--    where specific_schema='public'
--      and routine_name in ('protect_profile_privileges','recalc_streaks','recalc_day_wins')
--    order by routine_name, grantee;
--    -- protect_profile_privileges: geen anon/authenticated/public meer.
--    -- recalc_*: geen anon/public; authenticated mag blijven.
-- ============================================================
