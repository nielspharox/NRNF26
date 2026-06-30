-- ADVANCE_TEAM — wie gaat door naar de volgende ronde (los van de tip-uitslag).
-- Nodig omdat KO-wedstrijden die na 120 min gelijk staan voor de SCORING als gelijkspel
-- tellen (result='draw', penalty's tellen niet mee), maar voor de BRACKET moet de
-- penalty-winnaar doorschuiven. result = tip-uitslag; advance_team = doorgeschoven team.
-- Wordt door de sync gezet op afgeronde KO-wedstrijden. Idempotent.

alter table public.matches add column if not exists advance_team text;
