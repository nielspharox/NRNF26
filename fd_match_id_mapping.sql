-- FD_MATCH_ID — koppelt elke wedstrijd aan z'n football-data match-id.
-- Maakt updateBracket/fillThirds overbodig: syncMatches haalt teams/scores/uitslag
-- voortaan per fd_match_id direct uit football-data (de bron van waarheid).
-- Mapping eenmalig bepaald + gevalideerd (groep op teampaar, KO op datum-volgorde,
-- bevestigd door de al-bekende ankers Germany/Mexico/USA/Argentina). Idempotent.

alter table public.matches add column if not exists fd_match_id bigint;

update public.matches set fd_match_id=537327 where match_number=1;  -- group Mexico v South Africa
update public.matches set fd_match_id=537328 where match_number=2;  -- group South Korea v Czech Republic
update public.matches set fd_match_id=537333 where match_number=3;  -- group Canada v Bosnia
update public.matches set fd_match_id=537345 where match_number=4;  -- group USA v Paraguay
update public.matches set fd_match_id=537340 where match_number=5;  -- group Haiti v Scotland
update public.matches set fd_match_id=537346 where match_number=6;  -- group Australia v Turkey
update public.matches set fd_match_id=537339 where match_number=7;  -- group Brazil v Morocco
update public.matches set fd_match_id=537334 where match_number=8;  -- group Qatar v Switzerland
update public.matches set fd_match_id=537352 where match_number=9;  -- group Ivory Coast v Ecuador
update public.matches set fd_match_id=537351 where match_number=10;  -- group Germany v Curacao
update public.matches set fd_match_id=537357 where match_number=11;  -- group Netherlands v Japan
update public.matches set fd_match_id=537358 where match_number=12;  -- group Sweden v Tunisia
update public.matches set fd_match_id=537370 where match_number=13;  -- group Saudi Arabia v Uruguay
update public.matches set fd_match_id=537369 where match_number=14;  -- group Spain v Cape Verde
update public.matches set fd_match_id=537364 where match_number=15;  -- group Iran v New Zealand
update public.matches set fd_match_id=537363 where match_number=16;  -- group Belgium v Egypt
update public.matches set fd_match_id=537391 where match_number=17;  -- group France v Senegal
update public.matches set fd_match_id=537392 where match_number=18;  -- group Iraq v Norway
update public.matches set fd_match_id=537397 where match_number=19;  -- group Argentina v Algeria
update public.matches set fd_match_id=537398 where match_number=20;  -- group Austria v Jordan
update public.matches set fd_match_id=537410 where match_number=21;  -- group Ghana v Panama
update public.matches set fd_match_id=537409 where match_number=22;  -- group England v Croatia
update public.matches set fd_match_id=537403 where match_number=23;  -- group Portugal v DR Congo
update public.matches set fd_match_id=537404 where match_number=24;  -- group Uzbekistan v Colombia
update public.matches set fd_match_id=537329 where match_number=25;  -- group Czech Republic v South Africa
update public.matches set fd_match_id=537335 where match_number=26;  -- group Switzerland v Bosnia
update public.matches set fd_match_id=537336 where match_number=27;  -- group Canada v Qatar
update public.matches set fd_match_id=537330 where match_number=28;  -- group Mexico v South Korea
update public.matches set fd_match_id=537341 where match_number=29;  -- group Brazil v Haiti
update public.matches set fd_match_id=537342 where match_number=30;  -- group Scotland v Morocco
update public.matches set fd_match_id=537347 where match_number=31;  -- group Turkey v Paraguay
update public.matches set fd_match_id=537348 where match_number=32;  -- group USA v Australia
update public.matches set fd_match_id=537353 where match_number=33;  -- group Germany v Ivory Coast
update public.matches set fd_match_id=537354 where match_number=34;  -- group Ecuador v Curacao
update public.matches set fd_match_id=537359 where match_number=35;  -- group Netherlands v Sweden
update public.matches set fd_match_id=537360 where match_number=36;  -- group Tunisia v Japan
update public.matches set fd_match_id=537372 where match_number=37;  -- group Uruguay v Cape Verde
update public.matches set fd_match_id=537371 where match_number=38;  -- group Spain v Saudi Arabia
update public.matches set fd_match_id=537365 where match_number=39;  -- group Belgium v Iran
update public.matches set fd_match_id=537366 where match_number=40;  -- group New Zealand v Egypt
update public.matches set fd_match_id=537394 where match_number=41;  -- group Norway v Senegal
update public.matches set fd_match_id=537393 where match_number=42;  -- group France v Iraq
update public.matches set fd_match_id=537399 where match_number=43;  -- group Argentina v Austria
update public.matches set fd_match_id=537400 where match_number=44;  -- group Jordan v Algeria
update public.matches set fd_match_id=537411 where match_number=45;  -- group England v Ghana
update public.matches set fd_match_id=537412 where match_number=46;  -- group Panama v Croatia
update public.matches set fd_match_id=537405 where match_number=47;  -- group Portugal v Uzbekistan
update public.matches set fd_match_id=537406 where match_number=48;  -- group Colombia v DR Congo
update public.matches set fd_match_id=537343 where match_number=49;  -- group Scotland v Brazil
update public.matches set fd_match_id=537344 where match_number=50;  -- group Morocco v Haiti
update public.matches set fd_match_id=537337 where match_number=51;  -- group Switzerland v Canada
update public.matches set fd_match_id=537338 where match_number=52;  -- group Bosnia v Qatar
update public.matches set fd_match_id=537331 where match_number=53;  -- group Czech Republic v Mexico
update public.matches set fd_match_id=537332 where match_number=54;  -- group South Africa v South Korea
update public.matches set fd_match_id=537356 where match_number=55;  -- group Curacao v Ivory Coast
update public.matches set fd_match_id=537355 where match_number=56;  -- group Ecuador v Germany
update public.matches set fd_match_id=537362 where match_number=57;  -- group Japan v Sweden
update public.matches set fd_match_id=537361 where match_number=58;  -- group Tunisia v Netherlands
update public.matches set fd_match_id=537349 where match_number=59;  -- group Turkey v USA
update public.matches set fd_match_id=537350 where match_number=60;  -- group Paraguay v Australia
update public.matches set fd_match_id=537395 where match_number=61;  -- group Norway v France
update public.matches set fd_match_id=537396 where match_number=62;  -- group Senegal v Iraq
update public.matches set fd_match_id=537368 where match_number=63;  -- group Egypt v Iran
update public.matches set fd_match_id=537367 where match_number=64;  -- group New Zealand v Belgium
update public.matches set fd_match_id=537374 where match_number=65;  -- group Cape Verde v Saudi Arabia
update public.matches set fd_match_id=537373 where match_number=66;  -- group Uruguay v Spain
update public.matches set fd_match_id=537413 where match_number=67;  -- group Panama v England
update public.matches set fd_match_id=537414 where match_number=68;  -- group Croatia v Ghana
update public.matches set fd_match_id=537402 where match_number=69;  -- group Algeria v Austria
update public.matches set fd_match_id=537401 where match_number=70;  -- group Jordan v Argentina
update public.matches set fd_match_id=537407 where match_number=71;  -- group Colombia v Portugal
update public.matches set fd_match_id=537408 where match_number=72;  -- group DR Congo v Uzbekistan
update public.matches set fd_match_id=537417 where match_number=73;  -- r32   South Africa v Bosnia
update public.matches set fd_match_id=537415 where match_number=74;  -- r32   Germany v Best 3rd A/B/C/D/F
update public.matches set fd_match_id=537418 where match_number=75;  -- r32   Netherlands v Morocco
update public.matches set fd_match_id=537423 where match_number=76;  -- r32   Brazil v Japan
update public.matches set fd_match_id=537416 where match_number=77;  -- r32   France v Best 3rd C/D/F/G/H
update public.matches set fd_match_id=537424 where match_number=78;  -- r32   Curacao v Senegal
update public.matches set fd_match_id=537425 where match_number=79;  -- r32   Mexico v Best 3rd C/E/F/H/I
update public.matches set fd_match_id=537426 where match_number=80;  -- r32   England v Best 3rd E/H/I/J/K
update public.matches set fd_match_id=537421 where match_number=81;  -- r32   USA v Best 3rd B/E/F/I/J
update public.matches set fd_match_id=537422 where match_number=82;  -- r32   Belgium v Best 3rd A/E/H/I/J
update public.matches set fd_match_id=537419 where match_number=83;  -- r32   DR Congo v Croatia
update public.matches set fd_match_id=537420 where match_number=84;  -- r32   Spain v Algeria
update public.matches set fd_match_id=537429 where match_number=85;  -- r32   Canada v Best 3rd E/F/G/I/J
update public.matches set fd_match_id=537427 where match_number=86;  -- r32   Argentina v Cape Verde
update public.matches set fd_match_id=537430 where match_number=87;  -- r32   Portugal v Best 3rd D/E/I/J/L
update public.matches set fd_match_id=537428 where match_number=88;  -- r32   Paraguay v Egypt
update public.matches set fd_match_id=537375 where match_number=89;  -- r16   Winner M74 v Winner M77
update public.matches set fd_match_id=537376 where match_number=90;  -- r16   Winner M73 v Winner M75
update public.matches set fd_match_id=537377 where match_number=91;  -- r16   Winner M76 v Winner M78
update public.matches set fd_match_id=537378 where match_number=92;  -- r16   Winner M79 v Winner M80
update public.matches set fd_match_id=537379 where match_number=93;  -- r16   Winner M83 v Winner M84
update public.matches set fd_match_id=537380 where match_number=94;  -- r16   Winner M81 v Winner M82
update public.matches set fd_match_id=537381 where match_number=95;  -- r16   Winner M86 v Winner M88
update public.matches set fd_match_id=537382 where match_number=96;  -- r16   Winner M85 v Winner M87
update public.matches set fd_match_id=537383 where match_number=97;  -- qf    Winner R16-1 v Winner R16-2
update public.matches set fd_match_id=537384 where match_number=98;  -- qf    Winner R16-5 v Winner R16-6
update public.matches set fd_match_id=537385 where match_number=99;  -- qf    Winner R16-3 v Winner R16-4
update public.matches set fd_match_id=537386 where match_number=100;  -- qf    Winner R16-7 v Winner R16-8
update public.matches set fd_match_id=537387 where match_number=101;  -- sf    Winner QF-1 v Winner QF-2
update public.matches set fd_match_id=537388 where match_number=102;  -- sf    Winner QF-3 v Winner QF-4
update public.matches set fd_match_id=537389 where match_number=103;  -- third Loser SF-1 v Loser SF-2
update public.matches set fd_match_id=537390 where match_number=104;  -- final Winner SF-1 v Winner SF-2

create unique index if not exists matches_fd_match_id_uidx on public.matches(fd_match_id);

-- Controle: alles gekoppeld?
select count(*) filter (where fd_match_id is not null) as gekoppeld, count(*) as totaal from public.matches;
