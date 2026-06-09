-- ============================================================
-- NO RISK NO FUN 2026 — SECURITY HARDENING
-- Dicht 3 bevestigde RLS-gaten (security-audit 2026-06-09).
-- Idempotent: meerdere keren draaien mag, uitkomst blijft gelijk.
-- Draai dit in Supabase → SQL Editor → New query → Run.
--
-- Achtergrond: PostgreSQL combineert meerdere PERMISSIVE policies
-- met OR. Een ruime policy kan dus een strikte policy tenietdoen.
-- Daarom vervangen we de losse policies door één sluitende regel.
-- ============================================================


-- ── FIX 1 (KRITIEK): settings niet meer publiek leesbaar ────
-- Was: settings_read SELECT using(true) → IEDEREEN kon
-- odds_api_key / fd_api_key / resend_api_key uitlezen.
-- Nu: alleen admins lezen. De edge function gebruikt SERVICE_ROLE
-- en omzeilt RLS, dus de cron/odds-sync blijven werken.

drop policy if exists "settings_read" on public.settings;
create policy "settings_read" on public.settings for select
  using (exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  ));
-- settings_write (admin-only ALL) blijft ongewijzigd staan.


-- ── FIX 2 (KRITIEK): geen zelf-promotie naar admin ──────────
-- Was: profiles_update using(auth.uid()=id) zónder kolombeperking
-- → speler kon is_admin/day_wins/streaks van zichzelf wijzigen.
-- Oplossing: trigger die privilege-kolommen bevriest voor gewone
-- gebruikers. Admins en server-side (service_role / SQL-editor,
-- waar auth.uid() NULL is) mogen alles. De recalc-RPC's draaien
-- als admin of service_role en blijven dus werken.

create or replace function public.protect_profile_privileges()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  caller_is_admin boolean;
begin
  -- Server-side context (service_role, cron, SQL-editor): geen JWT → toelaten.
  if auth.uid() is null then
    return new;
  end if;

  select is_admin into caller_is_admin
  from public.profiles where id = auth.uid();

  -- Admins mogen alles wijzigen.
  if coalesce(caller_is_admin, false) then
    return new;
  end if;

  -- Gewone gebruiker: privilege-kolommen forceren / bevriezen.
  if tg_op = 'INSERT' then
    new.is_admin       := false;
    new.day_wins       := coalesce(new.day_wins, 0);
    new.current_streak := coalesce(new.current_streak, 0);
    new.longest_streak := coalesce(new.longest_streak, 0);
  elsif tg_op = 'UPDATE' then
    new.is_admin       := old.is_admin;
    new.day_wins       := old.day_wins;
    new.current_streak := old.current_streak;
    new.longest_streak := old.longest_streak;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_protect_profile_privileges on public.profiles;
create trigger trg_protect_profile_privileges
  before insert or update on public.profiles
  for each row execute function public.protect_profile_privileges();
-- profiles_update / profiles_insert (auth.uid()=id) blijven bestaan;
-- de trigger vult de ontbrekende kolombeperking aan.


-- ── FIX 3 (HOOG): tips écht op slot bij aftrap ──────────────
-- Was: losse tips_insert/tips_update (alleen user_id-check) stonden
-- naast de kickoff-policies → met OR vervalt de kickoff-lock, dus
-- tips waren ná aftrap nog te plaatsen/wijzigen (valsspeel-route).
-- Nu: één sluitende policy per actie die user_id ÉN kickoff eist.

drop policy if exists "tips_insert"                      on public.tips;
drop policy if exists "tips_update"                      on public.tips;
drop policy if exists "Tips alleen voor aftrap"          on public.tips;
drop policy if exists "Tips wijzigen alleen voor aftrap" on public.tips;

create policy "tips_insert" on public.tips for insert to authenticated
  with check (
    auth.uid() = user_id
    and (select m.kickoff from public.matches m where m.id = tips.match_id) > now()
  );

create policy "tips_update" on public.tips for update to authenticated
  using (
    auth.uid() = user_id
    and (select m.kickoff from public.matches m where m.id = tips.match_id) > now()
  )
  with check (
    auth.uid() = user_id
    and (select m.kickoff from public.matches m where m.id = tips.match_id) > now()
  );
-- tips_read (using true) blijft: tips zijn publiek leesbaar (nodig voor
-- klassement/H2H/pitch). Geen DELETE-policy → niemand kan tips wissen
-- via de client (server-side/SQL blijft kunnen, bv. wis_warmup.sql).


-- ── FIX 4 (klein, geen security): cg_update verwees naar zichzelf
-- Was: complot_members.group_id = complot_members.id (bug → faalt dicht).
-- Nu: koppeling op de juiste tabel zodat haantjes de groepsnaam mogen wijzigen.

drop policy if exists "cg_update" on public.complot_groups;
create policy "cg_update" on public.complot_groups for update
  using (exists (
    select 1 from public.complot_members cm
    where cm.group_id = complot_groups.id
      and cm.user_id = auth.uid()
      and cm.is_haantje = true
  ));


-- ── OPTIONEEL: dubbele matches-update policy opruimen ───────
-- "matches_update" en "admins can update matches" zijn identiek (admin-only).
-- Eén ervan weghalen is puur cosmetisch; matches_update blijft staan.
drop policy if exists "admins can update matches" on public.matches;


-- ============================================================
-- VERIFICATIE (draai na bovenstaande, controleer de output)
-- ============================================================
-- 1) settings mag NIET meer met true leesbaar zijn:
--    select policyname, cmd, qual from pg_policies
--    where tablename='settings';
--
-- 2) Trigger bestaat:
--    select tgname from pg_trigger
--    where tgrelid = 'public.profiles'::regclass and not tgisinternal;
--
-- 3) tips heeft nog maar 1 insert- en 1 update-policy, beide met kickoff:
--    select policyname, cmd, with_check from pg_policies
--    where tablename='tips';
-- ============================================================
