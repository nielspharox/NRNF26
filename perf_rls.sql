-- ============================================================
-- NO RISK NO FUN 2026 — PERFORMANCE HARDENING (RLS)
-- Dicht de WARN's uit de Supabase Performance Advisor (2026-06-15).
-- Idempotent: meerdere keren draaien mag, de uitkomst blijft gelijk.
-- Draai dit in Supabase → SQL Editor → New query → Run.
--
-- Twee lints:
--  • 0003 auth_rls_initplan — auth.uid()/current_setting() wordt PER RIJ
--    herberekend. Fix: wrap in (select auth.uid()) → Postgres evalueert het
--    één keer per query i.p.v. één keer per rij. Zelfde resultaat, sneller.
--  • 0006 multiple_permissive_policies — een `for select`-policy én een
--    `for all`-policy gelden allebei voor SELECT (dubbel werk per query).
--    Fix: splits de `for all`-write-policy in losse insert/update/delete,
--    zodat SELECT alleen nog door de read-policy wordt afgedekt.
--
-- LET OP — VERIFY EERST (zie blok onderaan vóór je dit draait):
-- De policies op `matches`, `profiles` en `settings_write` staan NIET in de
-- repo-SQL (destijds in het dashboard gemaakt). De definities hieronder zijn
-- gereconstrueerd uit het vaste admin-patroon (zoals bracket_write/teams_write)
-- + wat hardening.sql documenteert. Controleer met de query onderaan dat de
-- HUIDIGE definities overeenkomen vóór je dit toepast.
-- ============================================================


-- ════════════════════════════════════════════════════════════
-- DEEL 1 — auth.uid() inpakken in (select ...) op alle policies
-- die in de repo-SQL staan (zeker weten correct).
-- ════════════════════════════════════════════════════════════

-- ── tips (uit hardening.sql; kickoff-lock behouden) ──────────
drop policy if exists "tips_insert" on public.tips;
create policy "tips_insert" on public.tips for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and (select m.kickoff from public.matches m where m.id = tips.match_id) > now()
  );

drop policy if exists "tips_update" on public.tips;
create policy "tips_update" on public.tips for update to authenticated
  using (
    (select auth.uid()) = user_id
    and (select m.kickoff from public.matches m where m.id = tips.match_id) > now()
  )
  with check (
    (select auth.uid()) = user_id
    and (select m.kickoff from public.matches m where m.id = tips.match_id) > now()
  );

-- ── complot_groups ───────────────────────────────────────────
drop policy if exists "cg_insert" on public.complot_groups;
create policy "cg_insert" on public.complot_groups for insert
  with check ((select auth.uid()) = created_by);

drop policy if exists "cg_update" on public.complot_groups;
create policy "cg_update" on public.complot_groups for update
  using (exists (
    select 1 from public.complot_members
    where group_id = id and user_id = (select auth.uid()) and is_haantje = true
  ));

drop policy if exists "cg_delete" on public.complot_groups;
create policy "cg_delete" on public.complot_groups for delete
  using ((select auth.uid()) = created_by);

-- ── complot_members ──────────────────────────────────────────
drop policy if exists "cm_insert" on public.complot_members;
create policy "cm_insert" on public.complot_members for insert
  with check (
    (select auth.uid()) = user_id
    or exists (
      select 1 from public.complot_members cm2
      where cm2.group_id = complot_members.group_id
        and cm2.user_id = (select auth.uid())
        and cm2.is_haantje = true
    )
  );

drop policy if exists "cm_update" on public.complot_members;
create policy "cm_update" on public.complot_members for update
  using (
    exists (
      select 1 from public.complot_members cm2
      where cm2.group_id = complot_members.group_id
        and cm2.user_id = (select auth.uid())
        and cm2.is_haantje = true
    )
  );

drop policy if exists "cm_delete" on public.complot_members;
create policy "cm_delete" on public.complot_members for delete
  using (
    user_id = (select auth.uid())
    or exists (
      select 1 from public.complot_members cm2
      where cm2.group_id = complot_members.group_id
        and cm2.user_id = (select auth.uid())
        and cm2.is_haantje = true
    )
  );

-- ── complot_invites ──────────────────────────────────────────
drop policy if exists "ci_insert" on public.complot_invites;
create policy "ci_insert" on public.complot_invites for insert
  with check (exists (
    select 1 from public.complot_members cm
    where cm.group_id = complot_invites.group_id
      and cm.user_id = (select auth.uid()) and cm.is_haantje = true
  ));

drop policy if exists "ci_update" on public.complot_invites;
create policy "ci_update" on public.complot_invites for update
  using (
    invitee_id = (select auth.uid())
    or inviter_id = (select auth.uid())
    or exists (
      select 1 from public.complot_members cm
      where cm.group_id = complot_invites.group_id
        and cm.user_id = (select auth.uid()) and cm.is_haantje = true
    )
  );

drop policy if exists "ci_delete" on public.complot_invites;
create policy "ci_delete" on public.complot_invites for delete
  using (
    inviter_id = (select auth.uid())
    or exists (
      select 1 from public.complot_members cm
      where cm.group_id = complot_invites.group_id
        and cm.user_id = (select auth.uid()) and cm.is_haantje = true
    )
  );


-- ════════════════════════════════════════════════════════════
-- DEEL 2 — write-policies van `for all` → losse insert/update/delete
-- (lost 0006 multiple_permissive_policies op) ÉN auth.uid() ingepakt.
-- Read-policies (SELECT using true) blijven ongemoeid.
-- ════════════════════════════════════════════════════════════

-- ── bracket_slots (read = using true; write was admin-only ALL) ─
drop policy if exists "bracket_write" on public.bracket_slots;
create policy "bracket_insert" on public.bracket_slots for insert
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));
create policy "bracket_update" on public.bracket_slots for update
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true))
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));
create policy "bracket_delete" on public.bracket_slots for delete
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));

-- ── teams (read = using true; write was admin-only ALL) ─────────
drop policy if exists "teams_write" on public.teams;
create policy "teams_insert" on public.teams for insert
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));
create policy "teams_update" on public.teams for update
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true))
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));
create policy "teams_delete" on public.teams for delete
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));


-- ════════════════════════════════════════════════════════════
-- DEEL 3 — GERECONSTRUEERD (verify eerst! zie blok onderaan).
-- matches / profiles / settings: niet in repo-SQL. Onderstaande
-- volgt het vaste admin-patroon + hardening.sql. Pas alleen toe
-- nadat de verify-query bevestigt dat dit de huidige logica is.
-- ════════════════════════════════════════════════════════════

-- ── settings: read = admin-only SELECT (hardening.sql),
--    write = admin-only ALL → splitsen + inpakken ───────────────
drop policy if exists "settings_read" on public.settings;
create policy "settings_read" on public.settings for select
  using (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));

drop policy if exists "settings_write" on public.settings;
create policy "settings_insert" on public.settings for insert
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));
create policy "settings_update" on public.settings for update
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true))
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));
create policy "settings_delete" on public.settings for delete
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));

-- ── matches: admin-only writes (insert/update/delete) ───────────
--    (read-policy met `using true` blijft staan; alleen writes hier)
drop policy if exists "matches_insert" on public.matches;
create policy "matches_insert" on public.matches for insert
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));

drop policy if exists "matches_update" on public.matches;
create policy "matches_update" on public.matches for update
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true))
  with check (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));

drop policy if exists "matches_delete" on public.matches;
create policy "matches_delete" on public.matches for delete
  using      (exists (select 1 from public.profiles where id = (select auth.uid()) and is_admin = true));

-- ── profiles: speler beheert eigen rij; kolom-bescherming zit in
--    de trigger protect_profile_privileges (hardening.sql) ───────
drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles for insert
  with check ((select auth.uid()) = id);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles for update
  using      ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);


-- ============================================================
-- VERIFY EERST — draai dit APART vóór bovenstaande en vergelijk!
-- ============================================================
-- Toont de HUIDIGE policies + hun expressies. Controleer vooral
-- matches_*/profiles_*/settings_* tegen DEEL 3 hierboven; wijken ze
-- af, pas DEEL 3 aan vóór je het toepast.
--
--   select tablename, policyname, cmd, roles, qual, with_check
--   from pg_policies
--   where schemaname = 'public'
--     and tablename in ('matches','profiles','settings','tips',
--                       'bracket_slots','teams','complot_groups',
--                       'complot_members','complot_invites')
--   order by tablename, cmd, policyname;
--
-- ============================================================
-- VERIFICATIE (draai NA bovenstaande)
-- ============================================================
-- 1) Geen auth.uid() meer kaal (alles via (select auth.uid())):
--    select tablename, policyname, qual, with_check
--    from pg_policies
--    where schemaname='public'
--      and (qual like '%auth.uid()%' and qual not like '%select auth.uid()%')
--       or (with_check like '%auth.uid()%' and with_check not like '%select auth.uid()%');
--    -- moet 0 rijen geven.
--
-- 2) Geen `for all`-write-policy meer op de 3 split-tabellen:
--    select tablename, policyname, cmd from pg_policies
--    where schemaname='public'
--      and tablename in ('bracket_slots','teams','settings')
--    order by tablename, cmd;
--    -- cmd mag alleen SELECT/INSERT/UPDATE/DELETE zijn, geen ALL.
-- ============================================================
