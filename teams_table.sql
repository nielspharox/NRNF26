-- ============================================================
-- NO RISK NO FUN 2026 — TEAMS referentietabel (crests)
-- ------------------------------------------------------------
-- Eén rij per land. Join-key = canonieke Engelse naam, gelijk
-- aan matches.home_team / matches.away_team.
-- Wordt gevuld door de football-data.org sync (admin → import).
-- ============================================================

create table if not exists public.teams (
  name       text primary key,   -- canonieke Engelse naam (= matches.home_team/away_team)
  fd_id      integer,            -- football-data.org team id
  crest_url  text,               -- https://crests.football-data.org/<id>.png
  area_code  text,               -- optioneel: ISO landcode (vlag-fallback)
  updated_at timestamptz default now()
);

alter table public.teams enable row level security;

drop policy if exists "teams_read"  on public.teams;
drop policy if exists "teams_write" on public.teams;

-- Iedereen mag lezen (ook niet-ingelogde pitch-bezoekers).
create policy "teams_read" on public.teams for select using (true);

-- Alleen admin mag schrijven (sync draait als ingelogde admin).
create policy "teams_write" on public.teams for all
  using      (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true))
  with check (exists (select 1 from public.profiles where id = auth.uid() and is_admin = true));
