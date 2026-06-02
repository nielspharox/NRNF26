# NO RISK NO FUN 2026 — Project Context v3

> Lees dit altijd eerst voordat je iets aanpast.
> Volg de typografie standaarden ALTIJD — geen uitzonderingen.

---

## Wat is dit?

Een WK voetbalpool webapp waar risico nemen beloond wordt. Hoe meer underdog je tipt, hoe meer punten je scoort. Gebouwd voor een groep vrienden/collega's.

**Live:** https://nielspharox.github.io/NRNF26/
**Repo:** https://github.com/nielspharox/NRNF26
**Backend:** Supabase project `soonpwnwrvxmariaqdfb`

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — alles in één bestand (`index.html`) + `pixel-player.js` + `bracket.js` + `languages.js`
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** GitHub Pages
- **Odds:** The Odds API (the-odds-api.com)

---

## Design thema

Retro 1999/2000 internet stijl. Denk Hyves, vroege FIFA games, GeoCities.

**Kleuren:**
```
--bg: #1a0033        achtergrond donker paars
--bg2: #2a0050       kaarten/secties
--bg3: #0f001f       inputs, donkerste vlakken
--purple: #7b00ff    primaire kleur
--purple-light: #aa44ff  accenten
--green: #00ff66     succes, actief, goed getippt
--green-dark: #00cc44
--yellow: #ffe600    streak, accenten, waarschuwing
--red: #ff2244       fout, gevaar, slecht getippt
--white: #f0e6ff     primaire tekst
--muted: #d4bef5     secundaire tekst
--border: #5500aa    borders
```

---

## TYPOGRAFIE STANDAARDEN — ALTIJD VOLGEN

### Press Start 2P (pixel font) — labels, titels, badges
| Gebruik | Grootte |
|---------|---------|
| Sectietitels (▶ TIPS, ▶ STAND) | **13px** |
| Modal kopteksten | **11px** |
| Knoptekst | **9px** |
| Kolom headers tabellen | **9px** |
| Badges (streak, fase, locked) | **8px** |
| Kleine labels, dag-labels | **7px** — absoluut minimum |

### VT323 (retro body font) — lopende tekst, getallen
| Gebruik | Grootte |
|---------|---------|
| Body tekst, omschrijvingen | **22px** |
| Datums, meta info | **20px** |
| Secundaire info | **18px** — absoluut minimum |

### Oswald bold — teamnamen, spelersnamen
| Gebruik | Grootte |
|---------|---------|
| Spelersnamen in modals (H2H etc.) | **26px** |
| Spelersnamen in klassement | **18px** |
| Teamnamen in wedstrijdkaarten | **18px** |
| 3-letter landcodes in klassement | **13px** |

### Speciale elementen
- `+X` punten superscript: Press Start 2P **7px**, color `--green`
- Vlag emoji: altijd **16-18px**, nooit schalen
- Streak badges: Press Start 2P **8px**, padding 3px 8px, box-shadow 2px 2px 0 #000
- Puntentotaal in klassement: Press Start 2P **14px**

### NOOIT DOEN
- Tekst kleiner dan 18px VT323
- Tekst kleiner dan 7px Press Start 2P
- Gele/gouden iconen op gele achtergrond
- Inline kleuren die niet uit de kleurenpalet komen

---

## STREAK SYSTEEM

### Drempelwaarden
```js
const STREAKS = [
  {n:2,  title:'EL JEFE',            emoji:'🌵🤠'},
  {n:4,  title:'THE CHOSEN ONE',     emoji:'⚡'},
  {n:6,  title:'SITTING BULL',       emoji:'🦬'},
  {n:8,  title:'PAUL',               emoji:'🐙'},
  {n:10, title:'THE DEEP STATE',     emoji:'🕵️'},
  {n:12, title:'THE ORACLE',         emoji:'🔮'},
  {n:14, title:'PAUL WAS AN AMATEUR',emoji:'🐙💀'},
];
```

### Streak badge kleuren per niveau
| Niveau | Streaks | Border/tekst kleur | Box shadow |
|--------|---------|-------------------|------------|
| Zilver | 2-4 | `#cccccc` | `2px 2px 0 #000` |
| Goud | 6-10 | `var(--yellow)` | `2px 2px 0 #000` |
| Paars glow | 12+ | `var(--purple-light)` | `0 0 12px var(--purple-light), 0 0 24px rgba(170,68,255,0.4)` |

### Streak telt TERUG
Matches gesorteerd op `kickoff` desc, dan `created_at` desc. Één foute tip = reset naar 0. Geen tip = streak breekt (telt NIET mee).

### Streak indicator
Dansende banaan GIF (`banana.gif`). Aantal bananen = `Math.floor(streak / 2)` — dus per 2 goede tips 1 banaan erbij.

---

## PUNTENSYSTEEM

```
punten = 1000 / kans (%)   // zie calcPts(o) → Math.round(1000/Math.max(o,1))
```

Geen tip = automatisch gelijkspel. Tips vergrendeld bij aftrap.
Knockout = uitslag na 120 min (verlenging, geen penalties).

**Gebruik altijd `getScore(userId, filter)` voor puntentelling — nooit zelf berekenen.**
Filter opties: `'all'`, `'group'`, `'ko'`

---

## DATABASE TABELLEN

| Tabel | Inhoud |
|-------|--------|
| `profiles` | id, username, is_admin, avatar_url, current_streak, longest_streak, **day_wins**, language |
| `matches` | id, match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, **matchday**, kickoff, venue, result, home_score, away_score, bracket_pos |
| `tips` | id, user_id, match_id, tip (home/draw/away), chosen_odds, max_odds, points_scored |
| `complot_groups` | id, name, invite_code, created_by |
| `complot_members` | id, group_id, user_id, is_haantje |
| `bracket_slots` | phase, slot, home_label, away_label, home_from_phase/slot, away_from_phase/slot |
| `teams` | name (canonieke Engelse naam = join-key met matches.home/away_team), fd_id, crest_url, area_code |
| `settings` | key, value (bijv. `odds_api_key`, `fd_api_key`) |

**`day_wins`** (INT, default 0) — aantal keer dagwinnaar geweest. Bij gelijke dagstand krijgen alle gedeelde winnaars +1. Wordt volledig herberekend (reset naar 0, dan opnieuw optellen) via Supabase RPC `recalc_day_wins()` — nooit alleen ophogen, anders telt een speeldag dubbel bij het opnieuw opslaan van een uitslag.

**`matchday`** (INT) — speeldag-nummer op een wedstrijd. Gebruikt door: dagwinnaar-berekening (`recalc_day_wins()`) en waaghals-statistiek (`calcWaaghals()`). Valt terug op kalenderdag van `kickoff` als `matchday` null is. **Niet meer gebruikt voor streak-sortering** (streak sorteert puur op `kickoff`).

**`language`** (TEXT) — taalvoorkeur speler (`'nl'`/`'en'`/`'de'`), opgeslagen in `profiles`.

**Fases:** `warmup`, `group`, `r32`, `r16`, `qf`, `sf`, `third`, `final`

**`warmup`** — aparte oefenronde (friendlies) als **generale repetitie**. Telt tijdens de testperiode gewoon mee voor totaal, streaks, dagwinsten, waaghals, oddsbeater en podium (zodat alle gamification getest wordt). Heeft een eigen WARM-UP filter in de TIPS-tab + "WARM-UP" fase-badge. Valt vanzelf buiten POULE MEISTER/KNOCK-OUT MEISTER want phase ≠ `group` en niet in `koPhases`. **"Telt niet mee voor het WK" = de reset vóór het WK**: draai `reset_voor_warmup.sql` opnieuw (wist matches+tips, zet streaks/dagwinsten op 0) en importeer daarna het WK schoon. Geen RPC-aanpassing nodig. `getScore(uid,'warmup')` geeft de warm-up-only score (handig om vóór de reset een testronde-winnaar te bepalen).
**Speelrondes groep:** round 1, 2, 3

### RLS (Row Level Security) op `tips`
Tips kunnen alleen worden opgeslagen als `kickoff > now()` — server-side geblokkeerd via Supabase RLS policies. Foutmelding in de UI: "⏰ Te laat — wedstrijd is al begonnen!"

### RLS op `profiles` — admin-functies via Supabase RPC
De RLS policy op `profiles` staat alleen toe dat een user zijn eigen rij updatet. Admin-functies die meerdere profielen schrijven (streaks, dagwinsten) draaien daarom via Supabase database-functies met `SECURITY DEFINER`:
- `recalc_streaks()` — herberekent `current_streak` + `longest_streak` voor alle users
- `recalc_day_wins()` — reset en herberekent `day_wins` voor alle users

Aanroep vanuit JS: `await sb.rpc('recalc_streaks')` / `await sb.rpc('recalc_day_wins')`.
Beide functies zijn idempotent — hoe vaak je ze aanroept, de uitkomst is altijd correct.
Admin heeft knoppen 🔄 HERBEREKEN STREAKS en 🔄 HERBEREKEN DAGWINSTEN om dit handmatig te triggeren.

---

## APP STRUCTUUR (tabs)

1. **HOME** — Podium dagwinnaars (voetbalkaarten + pixel-art poppetjes), stats (waaghals/streak/odds beater klikbaar → popup), complotgroepjes
2. **TIPS** — Wedstrijden tippen per fase/ronde, tip-tellingen met tooltip wie wat tipte
3. **STAND** — Klassement (totaal/poule/knockout + per complot), laatste 3 speeldagen tips gegroepeerd per dag
4. **SPELREGELS** — Uitleg puntensysteem, streaks, risicoprofielen, complotgroepjes
5. **TOERNOOI** — Groepsstanden, wedstrijden, knockout bracket (visueel op desktop)
6. **ADMIN** — Alleen voor admin: wedstrijden toevoegen, uitslagen/scores, Odds API

---

## PIXEL-ART SPELER GENERATOR (`pixel-player.js`)

> **Belangrijk:** Gebruik altijd `pixel-player.js` voor avatars — nooit zelf SVG tekenen.
> De generator is deterministisch: dezelfde username → altijd dezelfde kaart.

### Bestand
- `pixel-player.js` — staat in de repo root, geladen via `<script src="pixel-player.js"></script>`

### Drie gebruikswijzen

**1. Web component (aanbevolen voor nieuwe code):**
```html
<pixel-player name="niels"></pixel-player>
<pixel-player name="niels" mini></pixel-player>
<pixel-player name="niels" size="80"></pixel-player>
<pixel-player name="niels" kit="GK_PINK" position="GK"></pixel-player>
```

**2. Plain JS:**
```js
const player = NRNFPixelPlayer.generatePlayer('niels');
el.innerHTML = NRNFPixelPlayer.renderPlayerSVG(player, { size: 96 });
el.innerHTML = NRNFPixelPlayer.renderPlayerSVG(player, { size: 48, mini: true });
```

**3. `generatePlayer(username, opts)` opties:**
```js
// opts zijn optioneel — zonder opts volledig hash-based
{ kit: 'GK_PINK', position: 'GK' }
```

### Beschikbare kits

**Outfield (12):** NED, FRA, BRA, GER, ITA, ESP, ARG, ENG, POR, CRO, BEL, MAR

**Throwback (6):** NED_88, BRA_70, ENG_66, GER_90, ITA_82, DEN_86

**Keeper (10):** GK_NEON, GK_PURPLE, GK_YELLOW, GK_PINK, GK_TEAL, GK_ORANGE, GK_LIME, GK_BLACK, GK_RED, GK_CYAN
- Keepers krijgen automatisch: lange mouwen + witte handschoenen + positie GK (geel chip) + rugnummer 1/12/22/32
- 15% kans op keeper kit via hash

### Varianten
- **11 haarstijlen:** SHORT, MULLET, CURLY, BALD, AFRO, BUZZCUT, LONG, UNDERCUT, PONYTAIL, BUN, HEADBAND
- **7 haarkleuren:** black, brown, blonde, ginger, grey, platinum, bleach
- **5 huidtinten:** light → deep
- **5 gezichtshaar opties:** none, stubble, moustache, goatee, full beard

---

## PODIUM (dag winnaars)

Gerenderd via `renderPodium()` → `renderPodiumCard(player, rank)` + `renderStreakBadge(streak)`.

**Layout:** Drie voetbalkaarten naast elkaar — goud (#1) in het midden iets hoger, zilver (#2) links, brons (#3) rechts.

**Dag winsten sterren op de kaart:**
- 0-5 wins: altijd 5 sterposities zichtbaar — ★ gevuld (goud), ☆ leeg
- 6-10 wins: sterren verdwijnen, alleen het getal in dezelfde kleur/grootte
- Desktop: tooltip bij hover "[X] dagwinsten junge!"
- Mobiel: getal altijd zichtbaar

**`day_wins` ophogen:** In de admin, na het invoeren van een uitslag, wordt de dagwinnaar(s) berekend en `day_wins + 1` uitgevoerd. Bij gelijke dagpunten krijgen alle gedeelde winnaars +1.

---

## KNOCKOUT BRACKET

**Desktop:** Visuele bracket in de Toernooi tab. Alleen zichtbaar op `min-width: 900px`.
**Mobiel:** Huidige lijst-weergave blijft intact, bracket verborgen.

**Structuur (van buiten naar binnen):**
```
Links:  R32 → R16 → QF → SF
Midden: FINALE (groot) + 3E PLAATS (klein, eronder)
Rechts: SF → QF → R16 → R32 (gespiegeld)
```

**R32 slots — WK 2026 vaste indeling:**
- Links: A1-B2, C1-D2, E1-F2, G1-H2, I1-J2, K1-L2 + 2 beste nummers 3
- Rechts: B1-A2, D1-C2, F1-E2, H1-G2, J1-I2, L1-K2 + 2 beste nummers 3
- Zolang teams onbekend: groeplabel tonen in muted kleur
- Zodra `home_team`/`away_team` ingevuld: echte teamnaam + vlag

**Winnaars:** Automatisch visueel doorgeschoven op basis van `m.result` — wordt niet teruggeschreven naar DB, realtime berekend.

**Klikbaar:** Elke wedstrijd in de bracket opent de bestaande match-card (tips, odds, uitslag).

---

## COMPLOTGROEPJES — MATRIX THEMA

| Actie | Knoptitel |
|-------|-----------|
| Lid toevoegen | 🐑 Slaper wakker maken |
| Lid verwijderen | 😴 Laten slapen |
| Haantje maken | 🐓👑 Kronen |

**Invite modal:** "💊 RODE PIL GEVEN", succes: "[naam] is ontwaakt. Welkom in het complot."
**Kronen:** "👑 [naam] IS NU DE WAARHEID."
**Laten slapen:** "[naam] slaapt weer. De matrix heeft hem terug."

---

## KLASSEMENT TIP CHIPS

Per dag één flex-rij: datum label (44px vast, pixel 6px) + tip chips naast elkaar.
Elke chip: 62px breed, `display:inline-flex`, vlag (16px) + 3-letter code (pixel 7px) + punten superscript (pixel 6px, groen).

**Teamnaam afkortingen:**
```js
const teamShort = {
  'DR Congo':'DRC', 'Saudi Arabia':'SAU', 'Cape Verde':'CPV',
  'Czech Republic':'CZE', 'New Zealand':'NZL', 'Ivory Coast':'CIV',
  'South Korea':'KOR', 'South Africa':'RSA', 'El Salvador':'SAL',
  'Costa Rica':'CRC', 'Bosnia':'BOS', 'Iran':'IRA'
};
```

---

## HEAD-TO-HEAD MODAL

**Layout:** 3 kolommen flex per wedstrijdrij.
- Links (130px): tip speler 1 — vlag + 3letters + pts
- Midden (flex:1): vlag + teamnaam + score + vlag + teamnaam
- Rechts (130px): tip speler 2

**Filter tabs:** RONDE 1 · RONDE 2 · RONDE 3 · R32 · R16 · 1/4 · HALVE · 3E PLAATS · FINALE

**Winnaar tekst:** "[NAAM] troeft [NAAM] genadeloos af met [X] punten verschil."
Beide namen: Oswald bold 26px (winnaar groen, verliezer rood).

---

## RISICOPROFIELEN

```js
const RISK_PROFILES = [
  {min:55, max:100, title:'De Bureaucraat', emoji:'📁'},
  {min:40, max:55,  title:'De Ambtenaar',   emoji:'🖊️'},
  {min:28, max:40,  title:'De Informant',   emoji:'🤫'},
  {min:18, max:28,  title:'De Stroman',     emoji:'🎭'},
  {min:0,  max:18,  title:'De Rebel',       emoji:'✊'},
];
```

---

## GAMIFICATION STATISTIEKEN

- `calcWaaghals()` — laagste gem. gekozen kans op de laatste `matchday` = meeste risico. Spelers zonder tips op die dag worden uitgesloten.
- `calcAllStreaks()` — alle spelers met streak >= 1, gesorteerd
- `calcOddsBeaters()` — wie wint terwijl ze niet op favoriet gokken
- `getAvgRisk(userId)` — gemiddelde gekozen kans per speler

Stats zijn klikbaar op homepagina → `openStatsModal('waaghals'/'streaks'/'oddsbeater')`

---

## BRACKET LOGICA

- Groepswinnaars + nummers 2 → automatisch R32 via `updateBracket()`
- Beste nummers 3 → handmatig via `nummers3_invullen.sql`
- Knockout winnaars → automatisch doorgeschoven na elke uitslag
- `updateBracket()` herkent: `Winner M73`, `Winner R32-1`, `Loser SF-1` etc.

---

## ODDS API

- Key opgeslagen in `settings` tabel (`key = 'odds_api_key'`)
- Automatisch laden bij openen Admin tab via `loadOddsKey()`
- Na laatste wedstrijd speelronde: automatisch odds voor volgende ronde via `autoFetchOddsIfRoundComplete()`

---

## FOOTBALL-DATA.ORG (FIXTURES · UITSLAGEN · CRESTS)

Bron van waarheid voor de échte WK-data; **odds blijven van the-odds-api** (football-data heeft geen odds, en geen friendlies).

- **Module:** `const FD = (()=>{…})()` (IIFE, stijl zoals `Pitch`). Key in `settings` (`key='fd_api_key'`). Free tier: 10 calls/min (rate-guard in `FD`), WK = competitie `WC`.
- **CORS / proxy:** football-data staat browser-CORS **alleen toe vanaf `http://localhost`**, dus vanaf GitHub Pages kan de client niet rechtstreeks bellen. `FD.api()` gaat daarom via de Supabase Edge Function **`fd-proxy`** (`supabase/functions/fd-proxy/index.ts`), aangeroepen met `sb.functions.invoke('fd-proxy',{body:{path}})`. De functie leest de key uit `settings` (of secret `FD_API_KEY`) en belt football-data server-side. Deploy: `supabase functions deploy fd-proxy` (of via Dashboard → Edge Functions).
- **Mapping:** `NAME_ALIAS` (football-data naam → onze canonieke naam) + `STAGE_PHASE` (`GROUP_STAGE→group`, `LAST_32→r32`, … `FINAL→final`). `syncMatches()` matcht op **(fase + teampaar)** met onze rijen uit `setup_final.sql`, zodat `bracket_pos`/`match_number`/bracket-logica intact blijven. Raakt odds nooit aan.
- **`FD.fullImport()`** (admin: 📥 WK VOLLEDIG IMPORTEREN): teams+crests (`teams`-tabel) + alle wedstrijden; loopt max 8 passes zodat KO-uitslagen via `updateBracket()` doorschuiven en de volgende ronde gematcht wordt.
- **`FD.syncUpcoming()`** (🔄 SYNC KOMENDE): werkt kickoffs/teams bij.
- **`FD.startLivePoll()` / `stopLivePoll()`**: elke 60s, alleen als er een wedstrijd live is (`kickoff<=now`, <3u, geen uitslag); schrijft scores/result en draait dan `updateBracket`+`updateStreaks`+`updateDayWins`. `FD.maybeAutoStart()` (in `loadAll`, alleen admin + key) start de poller automatisch.
- **Crests:** `teamCrest` (naam→crest_url) wordt in `loadAll()` uit de `teams`-tabel geladen; `crestImg(team,size)` toont het logo of valt terug op de emoji-vlag. Gebruikt in tip-kaarten, bracket (`bracket.js td()`), toernooi, admin-resultaten en H2H.
- **Onbewaakte scheduling** (draaien zonder open tab): nog niet gebouwd — zou een Supabase Edge Function + pg_cron vereisen (zie stappenplan stap 7). Nu draait de poller alleen met een open admin-tab.

---

## MEERTALIGHEID (NL/EN/DE)

Geïmplementeerd via `languages.js` (extern bestand). Taalvoorkeur opgeslagen in `profiles.language`.

- `loadLanguageFromProfile()` — laadt voorkeur bij login
- `saveLanguageToProfile()` — slaat op bij taalwissel
- `changeLanguage(lang)` — wisselt actieve taal
- `t('key', {X: val})` — vertaalfunctie voor alle UI-teksten
- Taalknopjes (NL/EN/DE) zichtbaar in profielmodal
- HTML-elementen hebben `data-i18n="key"` attributen

---

## AVATAR UPLOAD

Spelers kunnen een eigen avatar uploaden in de profielmodal.

- Upload via `<input type="file">` → `uploadAvatar()` → Supabase Storage
- Na upload: `avatar_url` in `profiles` bijgewerkt
- Fallback: als geen avatar, `<pixel-player>` component tonen

---

## PITCH / LANDING (niet-ingelogd)

Boven het inlogformulier staat een pitch-sectie, alleen zichtbaar voor niet-ingelogde bezoekers. Zit in `#auth-screen` (de fixed overlay), in wrapper `.auth-scroll` die scrollt. Bij login verdwijnt de hele overlay (`showApp()` zet `display:none`).

**Volgorde (boven → onder):** HERO → FOMO → STREAKS → COMPLOT → TICKER → STATS-balk → divider → bestaand inlogformulier (ongewijzigd).

**Architectuur:** alle pitch-logica zit in één zelfstandige module `const Pitch = (() => { ... })()` (IIFE) onderaan het script — geen globals behalve `Pitch` zelf. Bij het laden worden matches/profiles/tips éénmalig anoniem (public read, geen auth) opgehaald en geïndexeerd in Maps (`tipsByUser`, `tipsByMatch`) zodat scoring O(1) lookups doet i.p.v. herhaalde `.find/.filter`.

**Publieke API (`Pitch.*`):**
- `Pitch.load()` — async: haalt data op, indexeert, rendert de live blokken (FOMO/ticker/stats). Faalt veilig terug op lege data.
- `Pitch.renderStreaks()` — statische lijst uit de centrale `STREAKS` array (18×18px banaan-icoontjes = `n/2`, badgekleur: <6 zilver, 6-10 goud `--yellow`, ≥12 paars `--purple-light`)
- `Pitch.render()` — volledige her-render (streaks + live data); gebruikt door `changeLanguage()` als niet ingelogd

**Interne afgeleide stats (privé):** `scoreFor(userId, filter?)`, `bestTipFor`, `standings`, `activeStreaks`, `daringOpenTips`, `topScorerToday`. FOMO = leider + beste tip, langste streak, gewaagdste open tip. Ticker = totaalpunten, dagtopscore, streaks, gewaagde tips, aantallen (6-8 items, dubbel gerenderd voor naadloze loop). Stats = spelers/tips count + langste streak; duels statisch 64.

**Boot:** als geen sessie → `translateStaticText()` + `Pitch.renderStreaks()` (direct) + `Pitch.load()` (async).
**i18n:** alle teksten via `pitch_*` keys in `languages.js` (NL/EN/DE). Live data is grotendeels taal-neutraal (namen/getallen/emoji) + herbruikte keys.
**Taalvlaggetjes:** rechtsboven in de hero (`.pitch-langs`, ids `plang-nl/en/de`) zodat een niet-ingelogde bezoeker kan wisselen — de header-switcher zit achter de fixed overlay. Hergebruikt `changeLanguage()`; `updateLangSwitcher()` togglet ook de `plang-*` actieve staat.

---

## DEPLOY

```bash
git add .
git commit -m "beschrijving"
git push
```

GitHub Pages deploy ~1 minuut. Hard refresh: `Cmd+Shift+R`.
**Altijd committen voor grote wijzigingen!** Terugzetten: `git revert HEAD`

---

## OPENSTAANDE ITEMS (niet bouwen tenzij gevraagd)

1. **Prijzenkast in profielmodal** — behaalde streaks + hoe vaak, dagwinsten, medailles
2. **Custom streak namen per complotgroepje** — nieuwe DB tabel: `complot_streak_names (group_id, streak_level, title, emoji)`
3. **Bonus/nerf systeem** — superkrachten via streaks, nog te brainstormen
4. **Streak badge in profielmodal** — toont soms niet correct (cached data issue)
5. **Auto-odds fetch finetunen** — edge cases afvangen

> ✅ **Paul drempel → 8** (eerbetoon aan Paul de Octopus) — gedaan. Nieuwe volgorde: 2 EL JEFE · 4 THE CHOSEN ONE · 6 SITTING BULL · 8 PAUL · 10 THE DEEP STATE · 12 THE ORACLE · 14 PAUL WAS AN AMATEUR.

---

## TESTDATA & SQL SCRIPTS

- `testdata.sql` — 5 dummy spelers + alle 72 groepsuitslagen
- `cleanup.sql` — reset alles voor het echte toernooi
- `beste_nummers_3.sql` — welke 8 nummers 3 gaan door
- `nummers3_invullen.sql` — vul beste nummers 3 in R32 bracket
- `setup_final.sql` — complete database setup (eenmalig)
- `fix_complot.sql` — complot tabellen fix
