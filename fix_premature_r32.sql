-- FIX: voortijdig ingevulde R32-slots terugzetten naar placeholder.
-- Oorzaak: updateBracket vulde de R32 al bij de EERSTE groepsuitslag (tussenstand)
-- i.p.v. pas als de groep helemaal klaar is. Groepen D/F/G/H/I/J/K/L hadden ronde 3
-- nog niet gespeeld, maar hun '1st/2nd Group X'-slots waren al met (verkeerde) teams
-- gevuld. De code-fix (gm.every(result)) voorkomt herhaling; deze SQL herstelt de data.
--
-- ALLEEN kanten uit nog-niet-afgeronde groepen worden teruggezet. Kanten uit AFGERONDE
-- groepen (A/B/C/E) blijven staan want die zijn definitief correct.
-- Labels exact zoals in setup_final.sql (R32-blok). Idempotent.
--
-- VOLGORDE: draai dit PAS NA het deployen van de code-fix (index.html + edge function),
-- anders kan een open admin-tab / cron de slots meteen opnieuw fout vullen.

-- M75 home: 1st Group F (F nog niet klaar)
update public.matches set home_team='1st Group F' where match_number=75;
-- M76 away: 2nd Group F
update public.matches set away_team='2nd Group F' where match_number=76;
-- M77 home: 1st Group I
update public.matches set home_team='1st Group I' where match_number=77;
-- M78 away: 2nd Group I
update public.matches set away_team='2nd Group I' where match_number=78;
-- M80 home: 1st Group L
update public.matches set home_team='1st Group L' where match_number=80;
-- M81 home: 1st Group D
update public.matches set home_team='1st Group D' where match_number=81;
-- M82 home: 1st Group G
update public.matches set home_team='1st Group G' where match_number=82;
-- M83: 2nd Group K vs 2nd Group L (beide groepen nog niet klaar)
update public.matches set home_team='2nd Group K', away_team='2nd Group L' where match_number=83;
-- M84: 1st Group H vs 2nd Group J
update public.matches set home_team='1st Group H', away_team='2nd Group J' where match_number=84;
-- M86: 1st Group J vs 2nd Group H
update public.matches set home_team='1st Group J', away_team='2nd Group H' where match_number=86;
-- M87 home: 1st Group K
update public.matches set home_team='1st Group K' where match_number=87;
-- M88: 2nd Group D vs 2nd Group G
update public.matches set home_team='2nd Group D', away_team='2nd Group G' where match_number=88;

-- Zekerheid: teruggezette R32-slots mogen geen (stale) odds dragen → default + niet gezet.
update public.matches
set home_odds=33, draw_odds=34, away_odds=33, odds_set=false
where phase='r32'
  and (home_team like '1st Group %' or home_team like '2nd Group %' or home_team like 'Best 3rd %'
    or away_team like '1st Group %' or away_team like '2nd Group %' or away_team like 'Best 3rd %');

-- Controle: welke R32-slots staan nog op een placeholder?
select match_number, home_team, away_team, odds_set
from public.matches where phase='r32' order by match_number;
