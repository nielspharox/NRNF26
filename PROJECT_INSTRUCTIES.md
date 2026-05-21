# NO RISK NO FUN 2026 — Project Instructies

## Wat is dit project?

Een WK voetbalpool webapp waar risico nemen beloond wordt. Hoe meer underdog je tipt, hoe meer punten je scoort. Gebouwd voor een groep vrienden/collega's.

**Live:** https://nielspharox.github.io/NRNF26/
**Repo:** https://github.com/nielspharox/NRNF26
**Backend:** Supabase project `soonpwnwrvxmariaqdfb`
**Eigenaar:** Niels Besseling (niels@pharox.io)

---

## Werkwijze

- **Grote features/discussie:** in deze chat bespreken en plannen
- **Code aanpassingen:** via Claude Code in de terminal (`cd ~/Projects/NRNF26 && claude`)
- **Claude Code starten met:** `lees CONTEXT.md en index.html`
- **Na elke werkende versie:** `git add . && git commit -m "beschrijving" && git push`
- **Terugzetten:** `git revert HEAD`
- **CHANGELOG.md** bijhouden aan het einde van elke sessie

---

## Stack

- **Frontend:** Vanilla HTML/CSS/JS — alles in `index.html`
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Hosting:** GitHub Pages
- **Fonts:** Press Start 2P, VT323, Oswald (via Google Fonts)
- **Odds:** The Odds API (the-odds-api.com, gratis tier)

---

## Design thema

Retro 1999/2000 internet stijl. Hyves, vroege FIFA games, GeoCities.
Kleurenpalet: donker paars (`#1a0033`), groen (`#00ff66`), geel (`#ffe600`), rood (`#ff2244`).

### Typografie standaarden — ALTIJD VOLGEN

| Font | Gebruik | Grootte |
|------|---------|---------|
| Press Start 2P | Sectietitels | 13px |
| Press Start 2P | Kopteksten modal | 11px |
| Press Start 2P | Knoppen, labels | 9px |
| Press Start 2P | Badges | 8px |
| Press Start 2P | Kleine labels | 7px (minimum) |
| VT323 | Body tekst | 22px |
| VT323 | Datums, meta | 20px |
| VT323 | Secundair | 18px (minimum) |
| Oswald bold | Spelersnamen modals | 26px |
| Oswald bold | Spelersnamen klassement | 18px |
| Oswald bold | Teamnamen | 18px |
| Oswald bold | 3-letter codes | 13px |

**Nooit:** tekst kleiner dan 18px VT323 of 7px Press Start 2P.

---

## Puntensysteem

```
punten = 100 / kans (%)
```

Geen tip = automatisch gelijkspel. Tips vergrendeld bij aftrap.
Knockout = uitslag na 120 min (verlenging, geen penalties).
Gebruik altijd `getScore(userId, filter)` — nooit zelf berekenen.

---

## Streak systeem

```js
const STREAKS = [
  {n:2,  title:'PAUL',                emoji:'🐙'},
  {n:4,  title:'EL JEFE',             emoji:'🌵🤠'},
  {n:6,  title:'THE CHOSEN ONE',      emoji:'⚡'},
  {n:8,  title:'SITTING BULL',        emoji:'🦬'},
  {n:10, title:'THE DEEP STATE',      emoji:'🕵️'},
  {n:12, title:'THE ORACLE',          emoji:'🔮'},
  {n:14, title:'PAUL WAS AN AMATEUR', emoji:'🐙💀'},
];
```

Telt terug vanaf meest recente wedstrijd. Één foute tip = reset.

**Badge kleuren:**
- Zilver (2-5): `#cccccc`
- Goud (6-11): `var(--yellow)`, box-shadow `2px 2px 0 #000`
- Paars glow (12+): `var(--purple-light)`, box-shadow `0 0 12px var(--purple-light), 0 0 24px rgba(170,68,255,0.4)`

**Streak indicator:** dansende banaan GIF (`banana.gif`)

---

## Complotgroepjes — matrix thema

| Actie | Knoptitel |
|-------|-----------|
| Lid toevoegen | 🐑 Slaper wakker maken |
| Lid verwijderen | 😴 Laten slapen |
| Haantje maken | 🐓👑 Kronen |

Invite modal: "💊 RODE PIL GEVEN", succes: "[naam] is ontwaakt. Welkom in het complot."
Kronen bevestiging: "👑 [naam] IS NU DE WAARHEID."
Laten slapen bevestiging: "[naam] slaapt weer. De matrix heeft hem terug."

---

## Klassement tip chips

Per dag één flex-rij: datum label (44px, pixel 6px) + chips naast elkaar.
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

## Head-to-Head modal

Layout per rij: 3 kolommen flex.
- Links (130px): tip speler 1 — vlag + 3letters + pts
- Midden (flex:1): vlag + teamnaam + score + vlag + teamnaam
- Rechts (130px): tip speler 2

Filters: Ronde 1 · Ronde 2 · Ronde 3 · R32 · R16 · 1/4 · Halve · 3e Plaats · Finale
(geen Groepsfase, Knockout of Alles)

Winnaar tekst: "[NAAM] troeft [NAAM] genadeloos af met [X] punten verschil."
Beide namen: Oswald bold 26px (winnaar groen, verliezer rood).

---

## Openstaande features (niet bouwen tenzij gevraagd)

### Hoge prioriteit
- [ ] **Prijzenkast in profielmodal** — behaalde streaks + hoe vaak, dagwinsten (goud/zilver/brons), Poule Meister + Knock-out Meister medailles
- [ ] **Custom streak namen per complotgroepje** — Haantje kan titels + emojis aanpassen, alleen zichtbaar binnen groepje. Nieuwe DB tabel: `complot_streak_names (group_id, streak_level, title, emoji)`

### Middel prioriteit
- [ ] **Meertaligheid NL/EN/DE** — volledige UI vertaling, taalvoorkeur in `profiles`
- [ ] **Paul drempel → 8** — eerbetoon aan Paul de Octopus (8 correcte voorspellingen). Nu nog 2.

### Later / nog te brainstormen
- [ ] **Bonus/nerf systeem** — superkrachten via streaks, punten vermenigvuldigen of andermans punten negatief beïnvloeden, tips verbergen. Nog uitwerken.
- [ ] **Complotgroepje subpoule** — eigen klassement al aanwezig, custom streak namen volgt

### Technische bugs
- [ ] Streak badge in profielmodal toont soms `0` (cached `allProfiles` data)
- [ ] Auto-odds fetch edge cases finetunen

---

## Bekende beslissingen & waarom

| Beslissing | Reden |
|-----------|-------|
| Alles in één `index.html` | Simpel deployen via GitHub Pages, geen build stap |
| Supabase ipv Firebase | Betere SQL support, gratis tier ruim genoeg |
| The Odds API | Gratis tier 500 req/maand, ruim genoeg voor een poule |
| Beste nummers 3 handmatig | Te complex om volledig te automatiseren (FIFA heeft 4096 combinaties) |
| Streak telt terug | Voelt logischer — huidige form is wat telt |
| Geen groepsfase/knockout/alles filter in H2H | Teveel, ronde-gebaseerde filters zijn overzichtelijker |

---

## Belangrijke SQL scripts (in repo)

- `setup_final.sql` — complete database setup (eenmalig)
- `fix_complot.sql` — complot tabellen fix
- `testdata.sql` — 5 dummy spelers + 72 groepsuitslagen
- `cleanup.sql` — reset alles voor het echte toernooi
- `beste_nummers_3.sql` — welke 8 nummers 3 gaan door
- `nummers3_invullen.sql` — vul beste nummers 3 in R32 bracket

---

## WK 2026 toernooi info

- 48 landen, 12 groepen (A t/m L), 4 teams per groep
- Top 2 per groep + 8 beste nummers 3 → Ronde van 32
- Rondes: R32 → R16 → QF → SF → 3e Plaats + Finale
- Gastheren: USA, Canada, Mexico
- Finale: 19 juli 2026, New York/New Jersey
