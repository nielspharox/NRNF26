# NO RISK NO FUN 2026 — Project Context

> Lees dit altijd eerst voordat je iets aanpast.

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
- **Fonts:** Press Start 2P (pixel), VT323 (retro body), Oswald (teamnamen)

---

## Design thema

Retro 1999/2000 internet stijl. Denk Hyves, vroege FIFA games, GeoCities.

**Kleuren:**
- `--bg: #1a0033` — achtergrond (donker paars)
- `--purple: #7b00ff` — primaire kleur
- `--green: #00ff66` — actieve elementen, succes
- `--yellow: #ffe600` — accenten, streaks
- `--red: #ff2244` — fout, gevaar
- `--muted: #d4bef5` — secundaire tekst
- `--white: #f0e6ff` — primaire tekst

**Lettertypes:**
- `Press Start 2P` — titels, badges, labels (gebruik spaarzaam, alleen >9px)
- `VT323` — body tekst, datums, grote getallen
- `Oswald` — teamnamen, spelersnamen

---

## Puntensysteem

```
punten = 100 / kans (%)
```

Geen tip = automatisch gelijkspel. Tips vergrendeld bij aftrap.
Knockout = uitslag na 120 min (verlenging, geen penalties).

---

## Database tabellen

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

## App structuur (tabs)

1. **HOME** — Podium dagwinnaars (pixel-art poppetjes), stats (waaghals/streak/odds beater), complotgroepjes
2. **TIPS** — Wedstrijden tippen per fase/ronde, tip-tellingen zichtbaar
3. **STAND** — Klassement (totaal/poule/knockout), laatste 3 speeldagen tips, streaks
4. **SPELREGELS** — Uitleg puntensysteem, streaks, risicoprofielen, complotgroepjes
5. **TOERNOOI** — Groepsstanden, wedstrijden, knockout bracket
6. **ADMIN** — Alleen voor admin: wedstrijden toevoegen, uitslagen/scores, Odds API

---

## Gamification

**Killstreak titels:**
| Streak | Titel | Emoji |
|--------|-------|-------|
| 3 | PAUL | 🐙 |
| 6 | EL JEFE | 🌵🤠 |
| 9 | THE CHOSEN ONE | ⚡ |
| 12 | SITTING BULL | 🦬 |
| 15 | THE DEEP STATE | 🕵️ |
| 18 | THE ORACLE | 🔮 |
| 21 | PAUL WAS AN AMATEUR | 🐙💀 |

**Streak telt terug** vanaf meest recente wedstrijd. Één foute tip = reset.

**Risicoprofielen** (op basis van gem. gekozen kans):
- 📁 De Bureaucraat: 55-100%
- 🖊️ De Ambtenaar: 40-55%
- 🤫 De Informant: 28-40%
- 🎭 De Stroman: 18-28%
- ✊ De Rebel: 0-18%

---

## Complotgroepjes

Besloten sub-poules. Maker = Haantje. Powers:
- 🐑 Schaap uitnodigen (via username of invite link `/invite.html?code=XXXX`)
- 😴 Laten slapen (verwijderen)
- 🐓👑 Haantje maken

Haantje kan pas vertrekken als er een ander Haantje is.

---

## Teamnaam afkortingen (3 letters)

```js
const teamShort = {
  'DR Congo':'DRC', 'Saudi Arabia':'SAU', 'Cape Verde':'CPV',
  'Czech Republic':'CZE', 'New Zealand':'NZL', 'Ivory Coast':'CIV',
  'South Korea':'KOR', 'South Africa':'RSA', 'El Salvador':'SAL',
  'Costa Rica':'CRC'
};
```

---

## Vlag emojis

Alle 48 WK-landen hebben emoji vlaggen via de `FLAGS` lookup table in de JS.
Landen zonder specifieke emoji krijgen `🏳️`.

---

## Odds API

- Provider: the-odds-api.com (gratis tier, 500 requests/maand)
- Key opgeslagen in `settings` tabel (`key = 'odds_api_key'`)
- Sport: `soccer_fifa_world_cup`
- Na laatste wedstrijd van een speelronde: automatisch odds ophalen voor volgende ronde
- Foutmelding in admin als niet alle wedstrijden van de ronde gevuld zijn

---

## Bracket logica

- Groepswinnaars + nummers 2 → automatisch ingevuld in R32 na groepsfase
- Beste nummers 3 → handmatig via SQL (`nummers3_invullen.sql`)
- Knockout winnaars → automatisch doorgeschoven na elke uitslag
- `updateBracket()` herkent: `Winner M73`, `Winner R32-1`, `Loser SF-1` etc.

---

## Bekende openstaande issues

- Streak badge toont soms `0` in profiel modal — komt door gecachte `allProfiles` data
- Streaks worden niet altijd live herberekend na uitslag opslaan
- Auto-odds fetch faalt zonder opgeslagen API key (correct gedrag, foutmelding in admin)

---

## Testdata

- `testdata.sql` — vult de database met 5 dummy spelers + alle 72 groepsuitslagen
- `cleanup.sql` — reset alles terug naar leeg voor het echte toernooi
- `beste_nummers_3.sql` — toont welke 8 nummers 3 doorgaan na groepsfase
- `nummers3_invullen.sql` — vul de 4 beste nummers 3 in de R32 bracket

---

## Deploy

```bash
git add .
git commit -m "beschrijving"
git push
```

GitHub Pages deploy duurt ~1 minuut. Hard refresh: `Cmd+Shift+R`.
