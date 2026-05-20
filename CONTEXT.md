# NO RISK NO FUN 2026 — Project Context v2

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

- **Frontend:** Vanilla HTML/CSS/JS — alles in één bestand (`index.html`)
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
  {n:2,  title:'PAUL',               emoji:'🐙'},
  {n:4,  title:'EL JEFE',            emoji:'🌵🤠'},
  {n:6,  title:'THE CHOSEN ONE',     emoji:'⚡'},
  {n:8,  title:'SITTING BULL',       emoji:'🦬'},
  {n:10, title:'THE DEEP STATE',     emoji:'🕵️'},
  {n:12, title:'THE ORACLE',         emoji:'🔮'},
  {n:14, title:'PAUL WAS AN AMATEUR',emoji:'🐙💀'},
];
```

**Opmerking:** Paul drempel wordt later 8 (eerbetoon aan Paul de Octopus met 8 correcte voorspellingen). Nu nog 2.

### Streak badge kleuren per niveau
| Niveau | Streaks | Border/tekst kleur | Box shadow |
|--------|---------|-------------------|------------|
| Zilver | 2-4 | `#cccccc` | `2px 2px 0 #000` |
| Goud | 6-10 | `var(--yellow)` | `2px 2px 0 #000` |
| Paars glow | 12+ | `var(--purple-light)` | `0 0 12px var(--purple-light), 0 0 24px rgba(170,68,255,0.4)` |

### Streak telt TERUG
Vanaf de meest recente gespeelde wedstrijd terug tellen. Één foute tip = reset naar 0. Geen tip ingevoerd = automatisch gelijkspel (telt mee voor streak).

### Streak indicator
Dansende banaan GIF (`banana.gif`) als indicator. Aantal bananen = streak niveau:
- 1 banaan bij streak 2-4
- 2 bananen bij streak 6-10  
- 3+ bananen bij streak 12+

---

## PUNTENSYSTEEM

```
punten = 100 / kans (%)
```

Geen tip = automatisch gelijkspel. Tips vergrendeld bij aftrap.
Knockout = uitslag na 120 min (verlenging, geen penalties).

**Gebruik altijd `getScore(userId, filter)` voor puntentelling — nooit zelf berekenen.**
Filter opties: `'all'`, `'group'`, `'ko'`

---

## DATABASE TABELLEN

| Tabel | Inhoud |
|-------|--------|
| `profiles` | id, username, is_admin, avatar_url, current_streak, longest_streak |
| `matches` | id, match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, kickoff, venue, result, home_score, away_score, bracket_pos |
| `tips` | id, user_id, match_id, tip (home/draw/away), chosen_odds, max_odds, points_scored |
| `complot_groups` | id, name, invite_code, created_by |
| `complot_members` | id, group_id, user_id, is_haantje |
| `bracket_slots` | phase, slot, home_label, away_label, home_from_phase/slot, away_from_phase/slot |
| `settings` | key, value (bijv. odds_api_key) |

**Fases:** `group`, `r32`, `r16`, `qf`, `sf`, `third`, `final`
**Speelrondes groep:** round 1, 2, 3

---

## APP STRUCTUUR (tabs)

1. **HOME** — Podium dagwinnaars (pixel-art poppetjes), stats (waaghals/streak/odds beater klikbaar → popup), complotgroepjes
2. **TIPS** — Wedstrijden tippen per fase/ronde, tip-tellingen met tooltip wie wat tipte
3. **STAND** — Klassement (totaal/poule/knockout + per complot), laatste 3 speeldagen tips gegroepeerd per dag
4. **SPELREGELS** — Uitleg puntensysteem, streaks, risicoprofielen, complotgroepjes
5. **TOERNOOI** — Groepsstanden, wedstrijden, knockout bracket
6. **ADMIN** — Alleen voor admin: wedstrijden toevoegen, uitslagen/scores, Odds API

---

## COMPLOTGROEPJES — MATRIX THEMA

**Terminologie (consistent gebruiken):**
| Actie | Knoptitel | Omschrijving |
|-------|-----------|--------------|
| Lid toevoegen | 🐑 Slaper wakker maken | Geef iemand de rode pil. Hij weet nog van niets. |
| Lid verwijderen | 😴 Laten slapen | Stuur een lid terug de matrix in. Ze herinneren zich niets. |
| Haantje maken | 🐓👑 Kronen | Laat iemand zijn eigen waarheid creëren. |

**Invite modal teksten:**
- Titel: "MAAK EEN SLAPER WAKKER 🐑"
- Label: "Gebruikersnaam van de slaapkop:"
- Knop: "💊 RODE PIL GEVEN ▶"
- Succes: "[naam] is ontwaakt. Welkom in het complot."
- Fout: "Deze slaapkop bestaat niet in de matrix."

**Complot beheren modal teksten:**
- Titel: "BEHEER HET COMPLOT 🐓"
- Laten slapen bevestiging: "[naam] slaapt weer. De matrix heeft hem terug."
- Kronen bevestiging: "👑 [naam] IS NU DE WAARHEID."

---

## KLASSEMENT TIP CHIPS

Per dag één flex-rij: datum label (44px vast, pixel 6px) + tip chips naast elkaar.

```html
<!-- Per chip: altijd 62px breed, vlag + 3-letter code + punten superscript -->
<span class="tip-ok/tip-fail" style="display:inline-flex;align-items:center;width:62px;flex-shrink:0;white-space:nowrap">
  <span style="font-size:16px">🇳🇱</span>
  <span style="font-family:var(--pixel);font-size:7px"> NET<sup style="color:var(--green);font-size:6px">+22</sup></span>
</span>
```

**Teamnaam afkortingen (3 letters):**
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

**Layout per wedstrijdrij (3 kolommen flex):**
```
LINKS (130px):  tip speler 1 — vlag + 3letters + pts superscript
MID (flex:1):   vlag + volledige teamnaam + score (pixel 10px) + vlag + teamnaam  
RECHTS (130px): tip speler 2 — zelfde opmaak
```

**Samenvatting:**
- Beide gebruikersnamen: Oswald bold 26px (winnaar groen, verliezer rood)
- Winnaar regel: "[NAAM] troeft [NAAM] genadeloos af met [X] punten verschil."
- Puntenverschil: var(--yellow)
- Bij gelijke stand: "[NAAM1] en [NAAM2] staan volledig gelijk."

**Filter tabs:** RONDE 1 · RONDE 2 · RONDE 3 · R32 · R16 · 1/4 · HALVE · 3E PLAATS · FINALE
(GROEPSFASE, KNOCKOUT en ALLES zijn verwijderd)

**Speler selector:** Custom dropdown in NRNF stijl met naam + streak info per optie.

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

**Gebruik altijd de helper functies:**
- `calcWaaghals()` — laagste gem. gekozen kans = meeste risico
- `calcAllStreaks()` — alle spelers met streak >= 1, gesorteerd
- `calcOddsBeaters()` — wie wint terwijl ze niet op favoriet gokken
- `getAvgRisk(userId)` — gemiddelde gekozen kans per speler

**Stats zijn klikbaar op homepagina** → `openStatsModal('waaghals'/'streaks'/'oddsbeater')`

---

## BRACKET LOGICA

- Groepswinnaars + nummers 2 → automatisch R32 na groepsfase via `updateBracket()`
- Beste nummers 3 → handmatig via `nummers3_invullen.sql`
- Knockout winnaars → automatisch doorgeschoven na elke uitslag
- `updateBracket()` herkent: `Winner M73`, `Winner R32-1`, `Loser SF-1` etc.

---

## ODDS API

- Key opgeslagen in `settings` tabel (`key = 'odds_api_key'`)
- Automatisch laden bij openen Admin tab via `loadOddsKey()`
- Na laatste wedstrijd speelronde: automatisch odds voor volgende ronde via `autoFetchOddsIfRoundComplete()`
- Validatie: foutmelding als niet alle wedstrijden van de ronde gevuld zijn

---

## PIXEL-ART PODIUM POPPETJES

- `pixelFigure(pos, avatarUrl)` — pos: 0=goud, 1=zilver, 2=brons
- Random tenues via seeded random op basis van datum + positie
- Medaille kleur: goud `#ffe600`, zilver `#cccccc`, brons `#c87941`
- Avatar als hoofd van het poppetje

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
2. **Custom streak namen per complotgroepje** — Haantje kan titels + emojis aanpassen
   - Nieuwe DB tabel nodig: `complot_streak_names (group_id, streak_level, title, emoji)`
3. **Meertaligheid NL/EN/DE** — volledige UI vertaling, taalvoorkeur in `profiles`
4. **Bonus/nerf systeem** — superkrachten via streaks, nog te brainstormen
5. **Paul drempel → 8** — eerbetoon aan Paul de Octopus (8 correcte voorspellingen)
6. **Streak badge in profielmodal** — toont soms nog niet correct (cached data issue)
7. **Auto-odds fetch finetunen** — edge cases afvangen

---

## TESTDATA

- `testdata.sql` — 5 dummy spelers + alle 72 groepsuitslagen
- `cleanup.sql` — reset alles voor het echte toernooi
- `beste_nummers_3.sql` — welke 8 nummers 3 gaan door
- `nummers3_invullen.sql` — vul beste nummers 3 in R32 bracket
