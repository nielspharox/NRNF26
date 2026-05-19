# NO RISK NO FUN — WK Pool 2026 🐙

> *Onderschat de underdog niet.*

Een retro-styled WK-voetbalpool waar risico nemen beloond wordt. Hoe meer underdog je tipt, hoe meer punten je scoort.

---

## Live

**[nielspharox.github.io/NRNF26](https://nielspharox.github.io/NRNF26/)**

---

## Puntensysteem

```
punten = 100 / kans (%)
```

| Gekozen kans | Punten bij goede tip |
|---|---|
| 70% (favoriet) | 14 pts |
| 33% (gelijkspel) | 30 pts |
| 15% (underdog) | 67 pts |
| 5% (grote verrassing) | 200 pts |

Geen tip ingevoerd = automatisch gelijkspel.
Tips worden vergrendeld op het moment van aftrap.
Knockoutwedstrijden: uitslag na 120 minuten (inclusief verlenging).

---

## Features

### Klassementen
- **Totaalstand** — alle wedstrijden
- **Poule Meister** — alleen groepsfase
- **Knock-out Meister** — alleen knockoutfases
- Per **Complotgroepje** een eigen klassement

### Gamification
- 🔥 **Killstreak titels** voor aaneengesloten correcte tips:

| Streak | Titel | Emoji |
|---|---|---|
| 3 | PAUL | 🐙 |
| 6 | EL JEFE | 🌵🤠 |
| 9 | THE CHOSEN ONE | ⚡ |
| 12 | SITTING BULL | 🦬 |
| 15 | THE DEEP STATE | 🕵️ |
| 18 | THE ORACLE | 🔮 |
| 21 | PAUL WAS AN AMATEUR | 🐙💀 |

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
Maak je eigen besloten poule aan. De maker is het **Haantje** en heeft speciale powers:
- 🐑 Schapen uitnodigen (via gebruikersnaam of invite link)
- 😴 Leden laten slapen (verwijderen)
- 🐓👑 Iemand ook Haantje maken

### Toernooioverzicht
- Live groepsstanden met punten, doelsaldo en doelpunten
- Knockout bracket met vaste posities
- Speelsteden en tijden zichtbaar

---

## Bestanden in deze repo

| Bestand | Omschrijving |
|---|---|
| `index.html` | De volledige app |
| `invite.html` | Invite pagina voor complotgroepjes |
| `mascot.png` | De Condor — onze mascotte |
| `setup_final.sql` | Database setup (eenmalig uitvoeren) |
| `fix_complot.sql` | Complot tabellen fix |

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
-- Eerst leegmaken:
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
- Per speelronde apart ophalen zodat kansen actueel blijven

---

## Beheer tijdens het toernooi

- **Uitslagen invoeren:** Admin tabblad → score invullen (x–y) → automatisch resultaat + punten
- **Odds bijwerken:** Admin → Odds API → per ronde ophalen
- **Knockout teams bijwerken:** pas teamnamen aan via Supabase Table Editor zodra bekend is wie er doorging

---

*Built with ❤️ and 🐙 energy*
