# CHANGELOG — NO RISK NO FUN 2026

Dagelijkse voortgang van het project.

---

## Vrijdag 29 mei 2026

### Stand: komende speeldag bovenaan in de tip-kolom
- Tip-kolom toont nu **komende speeldag bovenaan** (groen, met ▶), daaronder de 2 meest recente gespeelde dagen (gister/eergister)
- Groepeert op `matchday`-nummer indien gezet, anders op **kalenderdag van kickoff** (zelfde fallback als `recalc_day_wins`) — werkt dus ook nu nog geen matchday op de komende wedstrijden staat
- Komende (nog niet gespeelde) tips krijgen neutrale `tip-pend`-styling zonder punten i.p.v. de rode "fout"-kleur
- Meteen een latente bug gefixt: oude code toonde door integer-key-ordening juist de *oudste* 3 speeldagen (SD 1/2/3) i.p.v. de recente; nu expliciet chronologisch gesorteerd
- ⚠️ Let op: hierdoor zijn andermans tips voor de komende speeldag zichtbaar vóór aftrap

### Streak-drempels herschikt (Paul → 8)
- Eerbetoon aan Paul de Octopus: nieuwe volgorde 2 EL JEFE · 4 THE CHOSEN ONE · 6 SITTING BULL · 8 PAUL (10/12/14 ongewijzigd)
- Aangepast in de centrale `STREAKS` array (`index.html`), de `streak_title_*` keys in NL/EN/DE (`languages.js`) en de instructies (`CLAUDE.md`)
- Werkt automatisch door in landing, spelregels, podium en streak-badges (allemaal data-gedreven uit `STREAKS`)

### Pitch / landing voor niet-ingelogde bezoekers
- **Pitch-sectie boven het inlogformulier** — alleen zichtbaar als je niet ingelogd bent. Login flow zelf volledig ongewijzigd.
- Opbouw boven → onder: HERO ("IEDEREEN TIPT DE FAVORIET. JIJ NIET.") → FOMO-blok → STREAKS → complotgroepje-uitleg → scrollende ticker → stats-balk → bestaand inlogformulier
- `#auth-screen` scrollt nu (was vast gecentreerd); pitch + login zitten in `.auth-scroll` wrapper
- **Live Supabase data** (anonieme public-read queries via `loadPitchData()`):
  - FOMO: hoogste totaalscore + beste tip, langste huidige streak, meest gewaagde open tip
  - Ticker: dagtopscore, actieve streaks, gewaagde open tips, totaal gescoorde punten — 6-8 items, dubbel gerenderd voor naadloze loop
  - Stats: aantal spelers, tips gezet, langste streak, 64 duels
- STREAK-sectie gevoed vanuit de centrale `STREAKS` array (geen hardcoding) — bananen = `n/2`, badgekleur zilver/goud/paars per niveau
- Volledig meertalig: nieuwe `pitch_*` keys in NL/EN/DE (`languages.js`)
- **Taalvlaggetjes in de pitch-hero** (🇳🇱/🇬🇧/🇩🇪, rechtsboven) — niet-ingelogde bezoeker kan nu zelf wisselen; de header-switcher zit achter de overlay. Hergebruikt `changeLanguage()` + `updateLangSwitcher()` (extra `plang-*` ids)
- Getest op desktop + mobiel, alle drie de talen

### Pitch-code geherstructureerd (robuuster & professioneler)
- Alle losse `pitch*`/`renderPitch*` globals (11 stuks) samengevoegd in één zelfstandige module `const Pitch = (() => { ... })()` — alleen `Pitch` blijft globaal
- Data wordt nu éénmalig geïndexeerd in Maps (`tipsByUser`, `tipsByMatch`) → scoring doet O(1) lookups i.p.v. herhaalde `.find/.filter` in geneste loops
- Gedeelde helpers: `oddsForSide`, `teamForSide`, `teamChip`, `scoreFor(userId, filter?)`, `standings`, `activeStreaks`, `daringOpenTips`, `topScorerToday`
- Lelijke `items._candidates`-hack op het array verwijderd; `try/catch` met `console.warn` bij faalde fetch
- Publieke API: `Pitch.load()`, `Pitch.render()`, `Pitch.renderStreaks()` — gedrag identiek, geverifieerd in preview

### FOMO-regels leesbaar gemaakt voor nieuwe bezoekers
- Was cryptische data (`👑 sem 89 PTS · Turkije`) → nu een herkenbaar label + volzin per regel:
  - 👑 KOPLOPER — "{naam} staat bovenaan met {pts} punten — dikste tip: {team}"
  - 🍌 HEETSTE STREAK — "{naam} heeft {n} goede tips op rij · {titel}"
  - 🎯 GROOTSTE GOK — "{naam} gokt op {team} — goed voor {pts} punten als het lukt"
- Nieuwe i18n-keys `pitch_fomo_leader/streak/daring(_label)` in NL/EN/DE
- Layout: pixel-label (7px) boven, VT-zin (20px) eronder; naam groen, getal geel, vlag inline

---

## Woensdag 21 mei 2026

### Claude Code setup
- Node.js geïnstalleerd + Claude Code opgezet voor lokale ontwikkeling
- Workflow: lokaal aanpassen → Live Server preview → git push → live
- CONTEXT.md aangemaakt als kennisbank voor Claude Code sessies

### Features
- **Tooltips tip-tellingen** — hover/klik op `4× · 1× · 3×` toont wie wat heeft getipt
- **Head-to-head vergelijking** — twee spelers vergelijken per wedstrijd, fase en ronde
  - 3-kolom layout: tip speler 1 | wedstrijd + score | tip speler 2
  - Filter tabs: Ronde 1/2/3, R32, R16, 1/4, Halve, 3e Plaats, Finale
  - Winnaar tekst: "[naam] troeft [naam] genadeloos af met X punten verschil"
  - Custom dropdown met streak info per speler
- **Dansende banaan** als streak indicator (ipv vuur emojis)
- **Klikbare namen** in stats blokken op homepagina

### Complotgroepjes verbeterd
- "Object object" bug gefixed in complotklassement
- Ledenbeheer UI gebouwd (was nog SQL-only)
- Invite modal in NRNF stijl (ipv browser prompt)
- Matrix thema teksten doorgevoerd:
  - "Slaper wakker maken" / "Laten slapen" / "Kronen"
  - "Rode pil geven" / "Terug de matrix in"
  - "X IS NU DE WAARHEID"

### Streak systeem
- Drempelwaarden aangepast: 2 / 4 / 6 / 8 / 10 / 12 / 14
- Streak telt nu terug vanaf meest recente wedstrijd
- Streak badge kleuren per niveau:
  - Zilver (2-4): `#cccccc`
  - Goud (6-10): `var(--yellow)` 
  - Paars glow (12+): `var(--purple-light)` met box-shadow glow

### Design & typografie
- Typografie standaarden vastgelegd in CONTEXT.md
- Modal breedtes vergroot (H2H 780px, profiel 560px etc.)
- Streak badges consistent gemaakt door hele app
- H2H gebruikersnamen Oswald bold 26px

### CONTEXT.md
- Uitgebreid met volledige typografie standaarden
- Streak badge kleuren gedocumenteerd
- Complot terminologie gedocumenteerd
- Openstaande items bijgewerkt

---

## Dinsdag 20 mei 2026

### Supabase & authenticatie
- Supabase project opgezet (`soonpwnwrvxmariaqdfb`)
- Database schema aangemaakt: profiles, matches, tips, bracket_slots, complot_groups, complot_members, settings
- Row Level Security policies ingesteld
- Authenticatie systeem: registreren, inloggen, uitloggen
- Admin rol via `is_admin` flag op profiles
- Avatar upload via Supabase Storage (avatars bucket)

### Volledige app herbouwd (v2)
- Retro design: paars/groen thema, Press Start 2P + VT323 + Oswald fonts
- Mascotte (De Condor) als header en login scherm
- 5 tabs: Home, Tips, Stand, Spelregels, Toernooi + Admin

### Wedstrijden & data
- Alle 104 WK 2026 wedstrijden in database geladen
  - 72 groepswedstrijden (12 groepen × 3 rondes)
  - 32 knockoutwedstrijden (R32 t/m Finale + 3e Plaats)
  - Speelsteden, datums, tijden (Nederlandse tijd CEST)
- Officiële loting verwerkt op basis van FIFA spreadsheet
- Bracket slots tabel aangemaakt voor knockout koppeling

### Knockout bracket
- `updateBracket()` functie: groepswinnaars + nummers 2 automatisch invullen
- Beste nummers 3 via handmatige SQL (`nummers3_invullen.sql`)
- Winnaars schuiven automatisch door na elke uitslag

### Groepsstanden
- Live berekend op basis van uitslagen + scores
- Sortering: punten → doelsaldo → doelpunten voor
- Groepswedstrijden tab + knockout bracket tab in toernooi overzicht

### Gamification
- Killstreak titels: PAUL → EL JEFE → THE CHOSEN ONE → SITTING BULL → THE DEEP STATE → THE ORACLE → PAUL WAS AN AMATEUR
- Risicoprofielen: De Bureaucraat → De Ambtenaar → De Informant → De Stroman → De Rebel
- Waaghals van de dag (laagste gem. gekozen kans)
- Odds Beater (wint terwijl niet op favoriet gokken)
- Stats popup bij klikken op stat-blokken

### Complotgroepjes
- Aanmaken, uitnodigen via gebruikersnaam + invite link (`invite.html`)
- Haantje powers: schaap rekruteren, laten slapen, kronen
- Eigen klassement per groepje

### Odds API
- The Odds API gekoppeld (gratis tier)
- Key opgeslagen in `settings` tabel
- Auto-fetch na laatste wedstrijd per speelronde
- Foutmelding als niet alle wedstrijden gevuld zijn

### Testdata
- `testdata.sql`: 5 dummy spelers + alle 72 groepsuitslagen + tips
- `cleanup.sql`: reset alles voor het echte toernooi
- `beste_nummers_3.sql`: welke 8 nummers 3 gaan door
- `nummers3_invullen.sql`: vul beste nummers 3 in R32 bracket

### Podium
- Pixel-art voetbalpoppetjes met random dagelijkse tenues
- Avatar als hoofd van het poppetje
- Goud/zilver/brons kleuren + medaille om de nek

---

## Maandag 19 mei 2026

### Eerste versie live
- Eerste versie WK pool app gebouwd (vanilla HTML, localStorage)
- Odds-gebaseerd puntensysteem: `100 / kans%`
- Tips invoeren per wedstrijd (thuis/gelijk/uit)
- Scorebord met klassement
- Live gezet op GitHub Pages: `https://nielspharox.github.io/NRNF26/`

### Feedback verwerkt
- Lettertype verbeterd (minder chaotisch)
- Retro stijl toegevoegd (paars/groen, pixel fonts)
- Puntenaantal verkleind (100x kleiner)
- Gelijkspel tippen toegevoegd

### Beslissingen
- Supabase als backend (ipv localStorage)
- The Odds API voor kansen
- GitHub Pages voor hosting
- Mascotte: De Condor (gebaseerd op Jiskefet sketch)

---

## Zondag 18 mei 2026

### Conceptfase
- Idee: WK pool waarbij risico nemen beloond wordt
- Puntensysteem bedacht: `100 / kans%`
- NRNF logo ontworpen (SVG)
- Mascotte (De Condor) Midjourney prompts ontwikkeld
- Naam vastgesteld: **No Risk No Fun 2026**

---

## Openstaande items

- [ ] Prijzenkast in profielmodal (behaalde streaks, dagwinsten, medailles)
- [ ] Custom streak namen per complotgroepje (door Haantje aan te passen)
- [ ] Meertaligheid NL/EN/DE
- [ ] Bonus/nerf systeem (nog te brainstormen)
- [ ] Paul drempel → 8 (eerbetoon aan Paul de Octopus)
- [ ] Streak badge in profielmodal soms incorrect (cached data)
- [ ] Auto-odds fetch edge cases
