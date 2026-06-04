# NO RISK NO FUN — WK Pool 2026 🐙

> *Onderschat de underdog niet.*

Een retro-styled WK-voetbalpool waar risico nemen beloond wordt. Hoe meer underdog je tipt, hoe meer punten je scoort.

---

## Live

**[norisknofun.net](https://norisknofun.net)**

---

## Puntensysteem

```
punten = 100 / kans (%)
```

| Gekozen kans | Punten bij goede tip |
|---|---|
| 70% (favoriet) | 1 pt |
| 33% (gelijkspel) | 3 pts |
| 20% (underdog) | 5 pts |
| 10% (grote verrassing) | 10 pts |
| 5% (ultieme gok) | 20 pts |

Geen tip ingevoerd = automatisch gelijkspel.
Tips worden vergrendeld op het moment van aftrap.
Knockoutwedstrijden: uitslag na 120 minuten (inclusief verlenging).

---

## Features

### Klassementen
- **Totaalstand** — alle wedstrijden
- **Poule Meister** — alleen groepsfase
- **Knock-out Meister** — alleen knockoutfase
- Per **Complotgroepje** een eigen klassement

### Gamification
- 🍌 **Streaks** voor aaneengesloten correcte tips:

| Streak | Titel | Emoji |
|---|---|---|
| 2 | PAUL | 🐙 |
| 4 | EL JEFE | 🌵🤠 |
| 6 | THE CHOSEN ONE | ⚡ |
| 8 | SITTING BULL | 🦬 |
| 10 | THE DEEP STATE | 🕵️ |
| 12 | THE ORACLE | 🔮 |
| 14 | PAUL WAS AN AMATEUR | 🐙💀 |

- 🎲 **Waaghals van de dag** — wie nam vandaag het meeste risico?
- 🎯 **Odds Beater** — wie wint terwijl ze niet op de favoriet gokken?
- 📊 **Risico profiel** per speler:

| Profiel | Gem. kans |
|---|---|
| 📁 De Bureaucraat | 55–100% |
| 🖊️ De Ambtenaar | 40–55% |
| 🤫 De Informant | 28–40% |
| 🎭 De Stroman | 18–28% |
| ✊ De Rebel | 0–18% |

### Complotgroepjes 🐓
Bouw je eigen waarheid. Ontsnap aan de matrix. De maker is het **Haantje**:
- 🐑 Slaper wakker maken — nodig iemand uit via gebruikersnaam of invite link
- 😴 Laten slapen — stuur een lid terug de matrix in
- 🐓👑 Kronen — geef iemand ook Haantje-rechten

### Head-to-Head ⚔️
Vergelijk jezelf direct met een andere speler — per ronde, per wedstrijd.

### Toernooioverzicht
- Live groepsstanden met punten, doelsaldo en doelpunten
- Knockout bracket met vaste posities
- Speelsteden en Nederlandse tijden zichtbaar

---

## Bestanden

| Bestand | Omschrijving |
|---|---|
| `index.html` | De volledige app |
| `invite.html` | Invite pagina voor complotgroepjes |
| `mascot.png` | De Condor — onze mascotte |
| `banana.gif` | De dansende banaan — streak indicator |
| `setup_final.sql` | Database setup (eenmalig uitvoeren) |
| `fix_complot.sql` | Complot tabellen fix |
| `testdata.sql` | Testdata voor ontwikkeling |
| `cleanup.sql` | Reset voor het echte toernooi |
| `beste_nummers_3.sql` | Welke 8 nummers 3 gaan door |
| `nummers3_invullen.sql` | Vul beste nummers 3 in R32 bracket |
| `CONTEXT.md` | Context voor Claude Code sessies |
| `PROJECT_INSTRUCTIES.md` | Projectinstructies en openstaande items |
| `CHANGELOG.md` | Dagelijkse voortgang |

---

## Technische stack

- **Frontend:** Vanilla HTML/CSS/JS — geen framework, één bestand
- **Backend:** [Supabase](https://supabase.com) — database, auth, storage
- **Hosting:** GitHub Pages
- **Odds:** [The Odds API](https://the-odds-api.com) — gratis tier

---

## Setup (voor de beheerder)

### 1. Supabase database
```sql
delete from public.tips;
delete from public.matches;
```
Dan `setup_final.sql` runnen, dan `fix_complot.sql` runnen.

### 2. Storage bucket voor avatars
- Supabase → Storage → New bucket
- Naam: `avatars`, Public: **aan**
- Policy: "Give users access to only their own top level folder named as uid"

### 3. Jezelf admin maken
```sql
update public.profiles set is_admin = true where username = 'jouw-username';
```

### 4. Odds ophalen
- Gratis account op [the-odds-api.com](https://the-odds-api.com)
- In de app: Admin → Odds API → key invullen → Odds ophalen
- Key wordt opgeslagen — eenmalig invullen

---

## Deploy

```bash
git add .
git commit -m "beschrijving"
git push
```

GitHub Pages deploy duurt ~1 minuut. Hard refresh: `Cmd+Shift+R`.

---

*Built with ❤️ and 🐙 energy*