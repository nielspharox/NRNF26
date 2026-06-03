-- ============================================================
-- NO RISK NO FUN 2026 — WK 2026 WEDSTRIJDEN (104 stuks)
-- ------------------------------------------------------------
-- Zet de échte WK-wedstrijden er alvast in, NAAST de warm-up
-- (die blijft staan). WK en warm-up zijn gescheiden via `phase`:
-- warm-up = 'warmup', WK = 'group'/'r32'/'r16'/'qf'/'sf'/'third'/'final'.
--
-- WK-wedstrijden hebben (nog) geen uitslag → tellen niet mee in de
-- test-totalen. De football-data sync UPDATET deze rijen (teams,
-- crests, kickoffs, uitslagen); hij maakt zelf geen wedstrijden aan.
--
-- ⚠️ Run hierna set_matchdays.sql — dat zet de speeldag-nummers (matchday):
--    WK gegroepeerd op US/Pacific-datum (SD1 = 11 juni … SD34 = finale).
--
-- Idempotent: ruimt eerst bestaande NIET-warmup wedstrijden + hun
-- tips op, dan opnieuw invoeren. Warm-up + gebruikers blijven intact.
-- bracket_slots staan los (worden door reset niet gewist).
--
-- ⚠️  ALLEEN VOOR SETUP/HERSTEL. Dit wist alle niet-warmup
--     wedstrijden + hun tips — dus NIET draaien tijdens het echte
--     WK (anders ben je ingevoerde uitslagen/tips kwijt).
-- ============================================================

delete from public.tips where match_id in (select id from public.matches where phase <> 'warmup');
delete from public.matches where phase <> 'warmup';

-- GROEP A
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(1,'Mexico','South Africa',50,25,25,'group','A',1,'2026-06-11 21:00:00+00','Mexico City'),
(2,'South Korea','Czech Republic',35,28,37,'group','A',1,'2026-06-12 04:00:00+00','Guadalajara'),
(25,'Czech Republic','South Africa',38,28,34,'group','A',2,'2026-06-18 18:00:00+00','Atlanta'),
(28,'Mexico','South Korea',45,27,28,'group','A',2,'2026-06-19 03:00:00+00','Guadalajara'),
(53,'Czech Republic','Mexico',35,27,38,'group','A',3,'2026-06-25 03:00:00+00','Mexico City'),
(54,'South Africa','South Korea',30,27,43,'group','A',3,'2026-06-25 03:00:00+00','Monterrey');

-- GROEP B
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(3,'Canada','Bosnia',45,27,28,'group','B',1,'2026-06-12 21:00:00+00','Toronto'),
(8,'Qatar','Switzerland',20,27,53,'group','B',1,'2026-06-13 21:00:00+00','San Francisco Bay Area'),
(26,'Switzerland','Bosnia',50,27,23,'group','B',2,'2026-06-18 21:00:00+00','Los Angeles'),
(27,'Canada','Qatar',62,22,16,'group','B',2,'2026-06-19 00:00:00+00','Vancouver'),
(51,'Switzerland','Canada',42,27,31,'group','B',3,'2026-06-24 21:00:00+00','Vancouver'),
(52,'Bosnia','Qatar',55,25,20,'group','B',3,'2026-06-24 21:00:00+00','Seattle');

-- GROEP C
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(7,'Brazil','Morocco',55,25,20,'group','C',1,'2026-06-14 00:00:00+00','New York/New Jersey'),
(5,'Haiti','Scotland',20,28,52,'group','C',1,'2026-06-14 03:00:00+00','Boston'),
(30,'Scotland','Morocco',30,28,42,'group','C',2,'2026-06-20 00:00:00+00','Boston'),
(29,'Brazil','Haiti',80,13,7,'group','C',2,'2026-06-20 02:30:00+00','Philadelphia'),
(49,'Scotland','Brazil',12,18,70,'group','C',3,'2026-06-25 00:00:00+00','Miami'),
(50,'Morocco','Haiti',70,18,12,'group','C',3,'2026-06-25 00:00:00+00','Atlanta');

-- GROEP D
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(4,'USA','Paraguay',55,25,20,'group','D',1,'2026-06-13 03:00:00+00','Los Angeles'),
(6,'Australia','Turkey',40,28,32,'group','D',1,'2026-06-14 06:00:00+00','Vancouver'),
(32,'USA','Australia',52,27,21,'group','D',2,'2026-06-19 21:00:00+00','Seattle'),
(31,'Turkey','Paraguay',45,27,28,'group','D',2,'2026-06-20 05:00:00+00','San Francisco Bay Area'),
(59,'Turkey','USA',30,27,43,'group','D',3,'2026-06-26 04:00:00+00','Los Angeles'),
(60,'Paraguay','Australia',38,28,34,'group','D',3,'2026-06-26 04:00:00+00','San Francisco Bay Area');

-- GROEP E
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(10,'Germany','Curacao',85,10,5,'group','E',1,'2026-06-14 19:00:00+00','Houston'),
(9,'Ivory Coast','Ecuador',42,28,30,'group','E',1,'2026-06-15 01:00:00+00','Philadelphia'),
(33,'Germany','Ivory Coast',62,22,16,'group','E',2,'2026-06-20 22:00:00+00','Toronto'),
(34,'Ecuador','Curacao',75,16,9,'group','E',2,'2026-06-21 02:00:00+00','Kansas City'),
(55,'Curacao','Ivory Coast',18,24,58,'group','E',3,'2026-06-25 22:00:00+00','Philadelphia'),
(56,'Ecuador','Germany',18,22,60,'group','E',3,'2026-06-25 22:00:00+00','New York/New Jersey');

-- GROEP F
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(11,'Netherlands','Japan',50,27,23,'group','F',1,'2026-06-14 22:00:00+00','Dallas'),
(12,'Sweden','Tunisia',52,27,21,'group','F',1,'2026-06-15 04:00:00+00','Monterrey'),
(35,'Netherlands','Sweden',48,27,25,'group','F',2,'2026-06-20 19:00:00+00','Houston'),
(36,'Tunisia','Japan',35,28,37,'group','F',2,'2026-06-21 06:00:00+00','Monterrey'),
(57,'Japan','Sweden',38,28,34,'group','F',3,'2026-06-26 01:00:00+00','Dallas'),
(58,'Tunisia','Netherlands',22,24,54,'group','F',3,'2026-06-26 01:00:00+00','Kansas City');

-- GROEP G
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(16,'Belgium','Egypt',62,22,16,'group','G',1,'2026-06-15 21:00:00+00','Seattle'),
(15,'Iran','New Zealand',55,25,20,'group','G',1,'2026-06-16 03:00:00+00','Los Angeles'),
(39,'Belgium','Iran',58,24,18,'group','G',2,'2026-06-21 21:00:00+00','Los Angeles'),
(40,'New Zealand','Egypt',38,28,34,'group','G',2,'2026-06-22 03:00:00+00','Vancouver'),
(63,'Egypt','Iran',42,28,30,'group','G',3,'2026-06-27 05:00:00+00','Seattle'),
(64,'New Zealand','Belgium',18,22,60,'group','G',3,'2026-06-27 05:00:00+00','Vancouver');

-- GROEP H
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(14,'Spain','Cape Verde',80,13,7,'group','H',1,'2026-06-15 18:00:00+00','Atlanta'),
(13,'Saudi Arabia','Uruguay',35,28,37,'group','H',1,'2026-06-16 00:00:00+00','Miami'),
(38,'Spain','Saudi Arabia',68,19,13,'group','H',2,'2026-06-21 18:00:00+00','Atlanta'),
(37,'Uruguay','Cape Verde',70,18,12,'group','H',2,'2026-06-22 00:00:00+00','Miami'),
(65,'Cape Verde','Saudi Arabia',30,27,43,'group','H',3,'2026-06-27 02:00:00+00','Houston'),
(66,'Uruguay','Spain',25,24,51,'group','H',3,'2026-06-27 02:00:00+00','Guadalajara');

-- GROEP I
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(17,'France','Senegal',62,22,16,'group','I',1,'2026-06-16 21:00:00+00','New York/New Jersey'),
(18,'Iraq','Norway',28,27,45,'group','I',1,'2026-06-17 00:00:00+00','Boston'),
(42,'France','Iraq',78,14,8,'group','I',2,'2026-06-22 23:00:00+00','Philadelphia'),
(41,'Norway','Senegal',45,27,28,'group','I',2,'2026-06-23 02:00:00+00','New York/New Jersey'),
(61,'Norway','France',22,24,54,'group','I',3,'2026-06-26 21:00:00+00','Boston'),
(62,'Senegal','Iraq',60,22,18,'group','I',3,'2026-06-26 21:00:00+00','Toronto');

-- GROEP J
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(19,'Argentina','Algeria',75,15,10,'group','J',1,'2026-06-17 03:00:00+00','Kansas City'),
(20,'Austria','Jordan',58,24,18,'group','J',1,'2026-06-17 06:00:00+00','San Francisco Bay Area'),
(43,'Argentina','Austria',65,20,15,'group','J',2,'2026-06-22 19:00:00+00','Dallas'),
(44,'Jordan','Algeria',38,28,34,'group','J',2,'2026-06-23 05:00:00+00','San Francisco Bay Area'),
(69,'Algeria','Austria',42,28,30,'group','J',3,'2026-06-28 04:00:00+00','Kansas City'),
(70,'Jordan','Argentina',8,14,78,'group','J',3,'2026-06-28 04:00:00+00','Dallas');

-- GROEP K
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(23,'Portugal','DR Congo',75,16,9,'group','K',1,'2026-06-17 19:00:00+00','Houston'),
(24,'Uzbekistan','Colombia',28,27,45,'group','K',1,'2026-06-18 04:00:00+00','Mexico City'),
(47,'Portugal','Uzbekistan',80,13,7,'group','K',2,'2026-06-23 19:00:00+00','Houston'),
(48,'Colombia','DR Congo',60,22,18,'group','K',2,'2026-06-24 04:00:00+00','Guadalajara'),
(71,'Colombia','Portugal',28,25,47,'group','K',3,'2026-06-28 01:30:00+00','Miami'),
(72,'DR Congo','Uzbekistan',50,27,23,'group','K',3,'2026-06-28 01:30:00+00','Atlanta');

-- GROEP L
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue) values
(22,'England','Croatia',52,27,21,'group','L',1,'2026-06-17 22:00:00+00','Dallas'),
(21,'Ghana','Panama',48,27,25,'group','L',1,'2026-06-18 01:00:00+00','Toronto'),
(45,'England','Ghana',60,22,18,'group','L',2,'2026-06-23 22:00:00+00','Boston'),
(46,'Panama','Croatia',32,27,41,'group','L',2,'2026-06-24 01:00:00+00','Toronto'),
(67,'Panama','England',15,20,65,'group','L',3,'2026-06-27 23:00:00+00','New York/New Jersey'),
(68,'Croatia','Ghana',52,27,21,'group','L',3,'2026-06-27 23:00:00+00','Philadelphia');

-- RONDE VAN 32
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, bracket_pos, kickoff, venue) values
(73,'2nd Group A','2nd Group B',33,34,33,'r32',1,'2026-06-28 21:00:00+00','Los Angeles'),
(74,'1st Group E','Best 3rd A/B/C/D/F',33,34,33,'r32',2,'2026-06-29 22:30:00+00','Boston'),
(75,'1st Group F','2nd Group C',33,34,33,'r32',3,'2026-06-30 03:00:00+00','Monterrey'),
(76,'1st Group C','2nd Group F',33,34,33,'r32',4,'2026-06-29 19:00:00+00','Houston'),
(77,'1st Group I','Best 3rd C/D/F/G/H',33,34,33,'r32',5,'2026-06-30 23:00:00+00','New York/New Jersey'),
(78,'2nd Group E','2nd Group I',33,34,33,'r32',6,'2026-06-30 19:00:00+00','Dallas'),
(79,'1st Group A','Best 3rd C/E/F/H/I',33,34,33,'r32',7,'2026-07-01 03:00:00+00','Mexico City'),
(80,'1st Group L','Best 3rd E/H/I/J/K',33,34,33,'r32',8,'2026-07-01 18:00:00+00','Atlanta'),
(81,'1st Group D','Best 3rd B/E/F/I/J',33,34,33,'r32',9,'2026-07-02 02:00:00+00','San Francisco Bay Area'),
(82,'1st Group G','Best 3rd A/E/H/I/J',33,34,33,'r32',10,'2026-07-01 22:00:00+00','Seattle'),
(83,'2nd Group K','2nd Group L',33,34,33,'r32',11,'2026-07-03 01:00:00+00','Toronto'),
(84,'1st Group H','2nd Group J',33,34,33,'r32',12,'2026-07-02 21:00:00+00','Los Angeles'),
(85,'1st Group B','Best 3rd E/F/G/I/J',33,34,33,'r32',13,'2026-07-03 05:00:00+00','Vancouver'),
(86,'1st Group J','2nd Group H',33,34,33,'r32',14,'2026-07-04 00:00:00+00','Miami'),
(87,'1st Group K','Best 3rd D/E/I/J/L',33,34,33,'r32',15,'2026-07-04 03:30:00+00','Kansas City'),
(88,'2nd Group D','2nd Group G',33,34,33,'r32',16,'2026-07-03 20:00:00+00','Dallas');

-- RONDE VAN 16
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, bracket_pos, kickoff, venue) values
(89,'Winner M74','Winner M77',33,34,33,'r16',1,'2026-07-04 23:00:00+00','Philadelphia'),
(90,'Winner M73','Winner M75',33,34,33,'r16',2,'2026-07-04 19:00:00+00','Houston'),
(91,'Winner M76','Winner M78',33,34,33,'r16',3,'2026-07-05 22:00:00+00','New York/New Jersey'),
(92,'Winner M79','Winner M80',33,34,33,'r16',4,'2026-07-06 02:00:00+00','Mexico City'),
(93,'Winner M83','Winner M84',33,34,33,'r16',5,'2026-07-06 21:00:00+00','Dallas'),
(94,'Winner M81','Winner M82',33,34,33,'r16',6,'2026-07-07 02:00:00+00','Seattle'),
(95,'Winner M86','Winner M88',33,34,33,'r16',7,'2026-07-07 18:00:00+00','Atlanta'),
(96,'Winner M85','Winner M87',33,34,33,'r16',8,'2026-07-07 22:00:00+00','Vancouver');

-- KWARTFINALE
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, bracket_pos, kickoff, venue) values
(97,'Winner R16-1','Winner R16-2',33,34,33,'qf',1,'2026-07-09 22:00:00+00','Boston'),
(98,'Winner R16-5','Winner R16-6',33,34,33,'qf',2,'2026-07-10 21:00:00+00','Los Angeles'),
(99,'Winner R16-3','Winner R16-4',33,34,33,'qf',3,'2026-07-11 23:00:00+00','Miami'),
(100,'Winner R16-7','Winner R16-8',33,34,33,'qf',4,'2026-07-12 03:00:00+00','Kansas City');

-- HALVE FINALE
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, bracket_pos, kickoff, venue) values
(101,'Winner QF-1','Winner QF-2',33,34,33,'sf',1,'2026-07-14 21:00:00+00','Dallas'),
(102,'Winner QF-3','Winner QF-4',33,34,33,'sf',2,'2026-07-15 21:00:00+00','Atlanta');

-- 3E PLAATS
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, bracket_pos, kickoff, venue) values
(103,'Loser SF-1','Loser SF-2',33,34,33,'third',1,'2026-07-18 23:00:00+00','Miami');

-- FINALE
insert into public.matches (match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, bracket_pos, kickoff, venue) values
(104,'Winner SF-1','Winner SF-2',33,34,33,'final',1,'2026-07-19 21:00:00+00','New York/New Jersey');
