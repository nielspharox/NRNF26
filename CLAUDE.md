# NO RISK NO FUN 2026 — Project Context v3

> Lees dit altijd eerst voordat je iets aanpast.
> Volg de typografie standaarden ALTIJD — geen uitzonderingen.

---

## Wat is dit?

Een WK voetbalpool webapp waar risico nemen beloond wordt. Hoe meer underdog je tipt, hoe meer punten je scoort. Gebouwd voor een groep vrienden/collega's.

**Live:** https://norisknofun.net (custom domain via GitHub Pages; `CNAME` in repo root. Oud adres `nielspharox.github.io/NRNF26/` redirect hierheen). **OG/meta-tags (og:image, og:url, twitter:image) in `index.html` + `Invite.html` moeten absoluut naar `https://norisknofun.net/...` wijzen — WhatsApp/social crawlers volgen de redirect van het oude domein niet, dus een oude/verkeerde og:image-URL = geen preview.**
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

Retro 1999/2000 internet stijl. Denk Hyves, vroege FIFA games, Startpagina.nl.

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

**Punten ALTIJD op de match-odds van de getipte uitslag (`m.<side>_odds`), NOOIT op `tips.chosen_odds`.** Die match-odds vriezen op exact 48u vóór aftrap (zie ODDS API → geplande fetch), dus iedereen die dezelfde uitslag tipt krijgt **exact dezelfde punten** — ongeacht wanneer ze tipten. `chosen_odds` blijft opgeslagen, maar is puur informatief ("wat de speler zag op tip-moment") en wordt nergens meer voor de score/risico gebruikt. Dit geldt overal: `getScore` (klassement), H2H, odds-beater, tip-kaart (`renderTips`), podium-risico, pitch.

**Risico-statistieken** (`getAvgRisk`, `calcWaaghals`, podium-dagrisico, risicoprofiel) draaien óók op de match-odds van de getipte uitslag — consistent met de scoring, niet op `chosen_odds`.

**Tip-kaart bij gespeelde wedstrijden** (`renderTips`): toont per uitslag de (bevroren) odds% blijven staan zodat spelers kunnen terugkijken; op je eigen tip een groen `+punten` (gewonnen) of rood `−punten` (misgelopen, = de waarde van je eigen tip) via `pickBadge` — nooit meer een kale `X` of `+0`. Punten via `ptsOf(side)=calcPts(m.<side>_odds)`.

**Gebruik altijd `getScore(userId, filter)` voor puntentelling — nooit zelf berekenen.**
Filter opties: `'all'`, `'group'`, `'ko'`

---

## DATABASE TABELLEN

| Tabel | Inhoud |
|-------|--------|
| `profiles` | id, username, is_admin, avatar_url, current_streak, longest_streak, **day_wins**, language, **fav_complot** |
| `matches` | id, match_number, home_team, away_team, home_odds, draw_odds, away_odds, phase, group_name, round, **matchday**, kickoff, venue, result, home_score, away_score, bracket_pos |
| `tips` | id, user_id, match_id, tip (home/draw/away), chosen_odds, max_odds, points_scored |
| `complot_groups` | id, name, invite_code, created_by |
| `complot_members` | id, group_id, user_id, is_haantje |
| `complot_invites` | id, group_id, inviter_id, invitee_id, status (pending/accepted/declined), created_at; unique(group_id,invitee_id) |
| `bracket_slots` | phase, slot, home_label, away_label, home_from_phase/slot, away_from_phase/slot |
| `teams` | name (canonieke Engelse naam = join-key met matches.home/away_team), fd_id, crest_url, area_code |
| `settings` | key, value (bijv. `odds_api_key`, `fd_api_key`) |

**`day_wins`** (INT, default 0) — aantal keer dagwinnaar geweest. Bij gelijke dagstand krijgen alle gedeelde winnaars +1. Wordt volledig herberekend (reset naar 0, dan opnieuw optellen) via Supabase RPC `recalc_day_wins()` — nooit alleen ophogen, anders telt een speeldag dubbel bij het opnieuw opslaan van een uitslag.

**`matchday`** (INT) — speeldag-nummer op een wedstrijd. Gebruikt door: dagwinnaar-berekening (`recalc_day_wins()`), dagpodium (`renderPodium`/`getYesterdayPts` via `lastPlayedDayMatches()`/`dayKeyOf()`) en waaghals (`calcWaaghals()`). **WK-speeldagen zijn gegroepeerd op US/Pacific-datum** (UTC−7, geen DST-wissel in juni/juli) zodat één slate niet over 2 NL-dagen valt: SD1 = 11 juni … SD34 = finale. **Warm-up telt aflopend naar de WK-start**: laatste warm-up-dag = SD0, ervoor −1, enz. Nummering staat in **`set_matchdays.sql`** (118 updates, idempotent — run na `warmup_matches.sql` + `wk_matches.sql`). Runtime-fallback (`dayKeyOf`) gebruikt de kalenderdag van `kickoff` (Europe/Amsterdam) als `matchday` null is. **Niet gebruikt voor streak-sortering** (streak sorteert puur op `kickoff`).

**`language`** (TEXT) — taalvoorkeur speler (`'nl'`/`'en'`/`'de'`), opgeslagen in `profiles`.

**Fases:** `warmup`, `group`, `r32`, `r16`, `qf`, `sf`, `third`, `final`

**`warmup`** — aparte oefenronde (friendlies) als **generale repetitie**. Telt tijdens de testperiode gewoon mee voor totaal, streaks, dagwinsten, waaghals, oddsbeater en podium (zodat alle gamification getest wordt). Had een eigen WARM-UP filter in de TIPS- én Admin-tab — **na de oefenronde verwijderd** (juni 2026); de `warmup`-fase + `getPhaseLabel('warmup')`-badge + `tips_filter_warmup`-key bestaan nog, dus terugzetten = alleen de filterknoppen weer toevoegen. Valt vanzelf buiten POULE MEISTER/KNOCK-OUT MEISTER want phase ≠ `group` en niet in `koPhases`. **"Telt niet mee voor het WK" = warm-up wissen vóór het WK.** Twee scenario's:
- **Nog géén WK-tips ingevuld** → `reset_voor_warmup.sql` (wist ÁLLE matches+tips, zet streaks/dagwinsten op 0) en importeer daarna het WK schoon.
- **Spelers hebben al WK-tips ingevuld** → NIET de volledige reset! Gebruik **`wis_warmup.sql`**: verwijdert alleen `phase='warmup'`-wedstrijden + hun tips en draait `recalc_streaks()`/`recalc_day_wins()`. WK-wedstrijden, poule-/KO-tips en odds blijven intact; streaks/dagwinsten worden 0 (WK nog zonder uitslag). Geen RPC-aanpassing nodig. `getScore(uid,'warmup')` geeft de warm-up-only score (handig om vóór de reset een testronde-winnaar te bepalen).
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
2. **TIPS** — Wedstrijden tippen per fase/ronde, tip-tellingen met tooltip wie wat tipte. Opent automatisch op de fase van de eerstvolgende wedstrijd (`getNextTipPhaseFilter`) en scrollt ernaartoe (`scrollToNextTip`). Filters: ALLES · GROEPSFASE · RONDE 1/2/3 · 1/32…FINALE (géén WARM-UP meer)
3. **STAND** — Klassement (totaal/poule/knockout + per complot), laatste 3 speeldagen tips gegroepeerd per dag
4. **SPELREGELS** — Uitleg puntensysteem, **odds & bevriezen** (`rules_odds_*` keys: wanneer odds updaten/bevriezen op 48u), streaks, risicoprofielen, complotgroepjes
5. **TOERNOOI** — Groepsstanden, wedstrijden, knockout bracket (visueel op desktop)
6. **ADMIN** — Alleen voor admin: wedstrijden toevoegen, uitslagen/scores (met fase-filters RONDE 1/2/3 · 1/32…FINALE via `filterAdmin`, opent op fase van eerstvolgende wedstrijd), Odds API (`fetchOddsApi` respecteert de freeze)

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

**Invite modal:** "💊 RODE PIL GEVEN" → `sendInvite(groupId, input, errEl, closeFn)`. Input = **username óf e-mail**.
**Kronen:** "👑 [naam] IS NU DE WAARHEID."
**Laten slapen:** "[naam] slaapt weer. De matrix heeft hem terug."

### Uitnodigen, accepteren, uitstappen
- **Bestaande speler uitnodigen** → géén directe member-insert meer, maar een **pending rij in `complot_invites`** (`status='pending'`). Alleen een haantje mag uitnodigen (RLS `ci_insert`).
- **Melding + accept/decline:** `loadAll()` laadt `myInvites` (mijn pending invites). `renderInvitePanel()` toont bovenaan HOME een paneel met **✅ Accepteren / ✕ Weigeren**; `updateInviteBadge()` zet een rood telbadge op de HOME-nav. `acceptInvite()` → self-insert in `complot_members` (RLS `cm_insert` staat `auth.uid()=user_id` toe) + invite `accepted`. `declineInvite()` → invite `declined`.
- **Favoriet:** ster rechtsboven op de complot-kaart (`setFavComplot`) zet `profiles.fav_complot` (uuid). `renderComplotHome` sorteert die groep als eerste (en eerste tab). Toggle: nogmaals klikken zet 'm uit. Kolom via `fav_complot.sql` (+ in `setup_final.sql`).
- **Uitstappen:** `leaveGroup(groupId)` (knop "🚪 Uitstappen" per groep) verwijdert je eigen membership (RLS `cm_delete` staat self-delete toe). Blokkeert als je de enige haantje bent terwijl er nog leden zijn.
- **Niet-speler uitnodigen (marketing):** `shareInvite(groupId)` deelt de invite-link via de **native share-sheet** (mobiel → WhatsApp etc.) of valt terug op **WhatsApp Web** (`wa.me/?text=`). Knoppen: "📲 Deel via WhatsApp" in de haantje-acties, de beheer-modal en de invite-modal ("nog niet in het spel?"-blok), plus "🔗 Kopieer link" (`copyInviteFor`). Link = `Invite.html?code=<invite_code>` (hoofdletter-`I` voor GitHub Pages). `Invite.html` is de landing (leest `?code=`, login/registreer → auto-join) en is opgemaakt als pakkende uitnodiging (mascotte + pitch + og/preview).
- **E-mail (optioneel, geparkeerd):** er is een `send-invite` edge function (Resend) + admin-veld voor `resend_api_key`/afzender, maar de standaard-flow gebruikt WhatsApp/link — e-mail is niet nodig en wordt niet aangeroepen tenzij je het zelf inschakelt.

---

## KLASSEMENT TIP CHIPS

Per dag één flex-rij: datum label (44px vast, pixel 6px) + tip chips naast elkaar.
Elke chip: 62px breed, `display:inline-flex`, vlag (16px) + 3-letter code (pixel 7px) + punten superscript (pixel 6px, groen).

**Teamnaam afkortingen:**
```js
const teamShort = {
  'Netherlands':'NED', 'DR Congo':'DRC', 'Saudi Arabia':'SAU', 'Cape Verde':'CPV',
  'Czech Republic':'CZE', 'New Zealand':'NZL', 'Ivory Coast':'CIV',
  'South Korea':'KOR', 'South Africa':'RSA', 'El Salvador':'SAL',
  'Costa Rica':'CRC', 'Northern Ireland':'NIR',
  'Australia':'AUS', 'Austria':'AUT', 'Iran':'IRN', 'Iraq':'IRQ'
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

**Bron van waarheid = football-data, gekoppeld op `matches.fd_match_id`.** Elke wedstrijd (groep + KO) heeft een vaste `fd_match_id` (kolom via `fd_match_id_mapping.sql`; mapping eenmalig bepaald — groep op teampaar, KO op datum-volgorde, gevalideerd tegen bekende ankers). `syncMatches` (client + edge) koppelt FD-wedstrijd → ons slot op dat id en **schrijft de KO-teams (in FD-oriëntatie) zodra FD ze invult** — dat vervangt het zelf-afleiden volledig. Groep-teams worden nooit overschreven (al getipt, oriëntatie = FD).

- **Geen `updateBracket()`/`fillThirds()` meer in de geautomatiseerde sync.** Groepswinnaars/nrs 2, beste nummers 3 én KO-winnaars komen allemaal direct uit football-data. Dit verving de oude zelf-berekening (die vulde de R32 al op tussenstand → bug, zie `fix_premature_r32.sql`). `nummers3_invullen.sql` is overbodig.
- **`updateBracket()` (client, index.html) bestaat nog als handmatige admin-fallback** in `saveScore`/`setResult` (nu mét group-complete-fix: `gm.every(result)`). De edge function heeft `updateBracket`/`fillThirds`/`calcGroupStandings` nog als **dode code** (niet aangeroepen) — `calcGroupStandings` (client) is nog wél in gebruik voor de groepstabellen in TOERNOOI.
- KO-slots zonder bekende teams houden hun placeholder (`1st Group F`, `Winner M73`, `Best 3rd …`); de sync laat ze staan tot FD ze vult. `bracket.js` rendert gewoon wat in de DB staat (placeholder-fallback).

---

## ODDS API

- Key opgeslagen in `settings` tabel (`key = 'odds_api_key'`)
- Automatisch laden bij openen Admin tab via `loadOddsKey()`
- Client-side handmatig ophalen via `fetchOddsApi()` (admin-knop, per groepsronde) — **slaat bevroren wedstrijden over** (leest `odds_frozen_m*` uit `settings`), zodat "bevroren = vast" óók geldt bij een handmatige fetch; toont hoeveel er zijn overgeslagen

### Geplande odds-fetch (server-cron, bevriest per wedstrijd op exact 48u)
- **Edge function `mode:"odds"`** (in `supabase/functions/fd-proxy/index.ts`, slug `swift-function`): `doOddsAuto()` **bevriest de odds per wedstrijd op ~exact 48u vóór aftrap** (cron draait elke minuut; freeze landt op de eerste minuut ná de 48u-grens). Per wedstrijd, niet per ronde (KO-rondes overlappen: de eerste R32-wedstrijd start ~17u ná de laatste groepswedstrijd, dus de R32-teams zijn 48u vóór die wedstrijd nog onbekend). Een wedstrijd wordt bevroren zodra die binnen **48u** start, geen uitslag heeft, geen warmup is, **bekende teams** heeft (placeholders `1st Group A`/`Winner M73`/`Best 3rd …` worden overgeslagen — daar heeft de bookmaker nog geen markt voor) en nog niet bevroren is. Bevriezen = verse odds ophalen + **freeze-guard `odds_frozen_m<id>`** in `settings` zetten (waarde = `kickoff|home|away`). Vanaf dat moment slaat `fetchOdds()` die wedstrijd over → de odds **liggen vast en zijn voor alle spelers gelijk**. Wedstrijden >48u bewegen (provisioneel) nog mee tot hún 48u-moment. **Uitstel:** schuift een al-bevroren wedstrijd weer >48u weg, dan wordt de freeze-guard verwijderd (ontdooien) → de odds mogen weer bewegen en bevriezen opnieuw op het nieuwe 48u-moment. Bookmaker heeft de markt nog niet? Niet bevriezen, maar **throttled retry** (max 1 call/30 min via `odds_fetch_lock`) i.p.v. elke minuut → geen credit-verbranding. Niets te bevriezen → geen externe call → 0 credits.
- **`fetchOdds(M, region, frozen)`** doet 1 call (h2h × eu) en schrijft kansen richtingsgevoelig naar **élke** matchende, **niet-bevroren** rij in `matches` (bevroren wedstrijden in de `frozen`-set worden overgeslagen). Eén fetch vult dus meteen alle op dat moment geliste, niet-bevroren wedstrijden; daarna worden alleen de due-wedstrijden die écht odds kregen bevroren. Kosten blijven 1 credit ongeacht het aantal wedstrijden.
- **`body.force=true`** negeert 48u + guard en haalt nu echt op (handmatig/test); zet géén guard-flag.
- **pg_cron** (`cron_odds.sql`): job `odds-auto` **elke minuut** (`* * * * *`) → `{"mode":"odds","secret":"<CRON_SECRET>"}` (freeze op exact 48u); test-job `odds-test-tonight` (`0 19 8 6 *` = 8 juni 21:00 CEST) → `{"mode":"odds","force":true,"secret":"<CRON_SECRET>"}` — ná de test opruimen met `select cron.unschedule('odds-test-tonight');`. **`CRON_SECRET`** staat project-breed onder Edge Functions → Secrets; `swift-function` dwingt 'm af voor `mode:sync`/`mode:odds`, dus de cron-bodies MOETEN 'm meesturen (anders 403). Dit dicht meteen het risico van de open (JWT-uit) functie.
- **Token-budget:** free plan = 500 credits/maand, kost = markten×regio's = h2h×eu = **1 credit/fetch**. ~1 fetch per cluster wedstrijden dat z'n 48u-moment passeert (gelijktijdige aftrappen delen één call) → enkele tientallen over het toernooi, gesplitst over juni+juli, ruim onder 500/maand. De elke-minuut-cron verbruikt 0 credits zolang er niets te bevriezen is; nog-niet-geliste wedstrijden zijn ge-throttled op 1 call/30 min.

---

## FOOTBALL-DATA.ORG (FIXTURES · UITSLAGEN · CRESTS)

Bron van waarheid voor de échte WK-data; **odds blijven van the-odds-api** (football-data heeft geen odds, en geen friendlies).

- **Module:** `const FD = (()=>{…})()` (IIFE, stijl zoals `Pitch`). Key in `settings` (`key='fd_api_key'`). Free tier: 10 calls/min (rate-guard in `FD`), WK = competitie `WC`.
- **CORS / proxy:** football-data staat browser-CORS **alleen toe vanaf `http://localhost`**, dus vanaf GitHub Pages kan de client niet rechtstreeks bellen. `FD.api()` gaat daarom via een Supabase Edge Function (code: `supabase/functions/fd-proxy/index.ts`), aangeroepen met `sb.functions.invoke(FN,{body:{path}})`. **`FN`** (const boven in de `FD`-module) is de gedeployde slug — momenteel `'swift-function'` (Dashboard genereert een willekeurige naam; pas `FN` aan als je 'm hernoemt). De functie leest de key uit `settings` (of secret `FD_API_KEY`) en belt football-data server-side. **LET OP: code-map = `fd-proxy`, maar de gedeployde slug = `swift-function`** (= `FN`, en wat de cron aanroept). Deploy dus naar `swift-function`, niet `fd-proxy`: Dashboard → `swift-function` → code plakken; **of** CLI met de map-truc: `cp -r supabase/functions/fd-proxy supabase/functions/swift-function && supabase functions deploy swift-function --no-verify-jwt && rm -rf supabase/functions/swift-function`. **Altijd met "Verify JWT" UIT** — anders blokkeert de gateway de CORS-preflight én de cron (POST zonder JWT → 401 `UNAUTHORIZED_NO_AUTH_HEADER`, functie draait dan nooit).
- **Mapping:** `NAME_ALIAS` (football-data naam → onze canonieke naam) + `STAGE_PHASE`. `syncMatches()` koppelt FD-wedstrijd → ons slot op **`matches.fd_match_id`** (vaste 1-op-1 link, zie `fd_match_id_mapping.sql`) en schrijft teams (KO, FD-oriëntatie)/kickoff/venue/score/uitslag. Raakt odds nooit aan. Zie BRACKET LOGICA voor de team-overname die `updateBracket`/`fillThirds` verving.
- **`FD.fullImport()`** (admin: 📥 WK VOLLEDIG IMPORTEREN): teams+crests (`teams`-tabel) + alle wedstrijden in één `syncMatches`-pass (FD levert alle rondes tegelijk; geen bracket-passes meer).
- **`FD.syncUpcoming()`** (🔄 SYNC KOMENDE): werkt kickoffs/teams bij.
- **`FD.startLivePoll()` / `stopLivePoll()`**: client-side fallback, elke 60s, alleen als er een wedstrijd live is (`kickoff<=now`, <3u, geen uitslag); `syncAll` schrijft teams/scores/result (op `fd_match_id`) en draait `updateStreaks`+`updateDayWins`. `FD.maybeAutoStart()` (in `loadAll`, alleen admin + key) start de poller automatisch — maar werkt alleen met open admin-tab.
- **Crests:** `teamCrest` (naam→crest_url) wordt in `loadAll()` uit de `teams`-tabel geladen; `crestImg(team,size)` toont het logo of valt terug op de emoji-vlag. Gebruikt in tip-kaarten, bracket (`bracket.js td()`), toernooi, admin-resultaten en H2H.
- **LIVE TUSSENSTAND:** kolommen `live_home`/`live_away`/`minute` op `matches` (`live_columns.sql`). De sync schrijft bij `IN_PLAY`/`PAUSED` de tussenstand weg **zonder `result`** te zetten; bij `FINISHED` wordt `result` gezet en worden de live-velden geleegd. Helpers `isLive(m)`/`liveSide(m)`/`liveMinuteLabel(m)`. Frontend toont `🔴 LIVE`-badge + score op: home **NU BEZIG-strip** (`renderLiveStrip`, boven de marquee), tip-kaarten, toernooi (groep + KO). **Voorlopige klassement-stand**: `getScore` geeft `livePts`/`liveCorrect` (tip vs huidige live-stand); `renderScoreboard` sorteert op `pts+livePts`, toont `+N` (`.live-prov`) en een "niet definitief"-banner (`live_stand_note`). **Client-refresh**: `FD.maybeAutoStart()` start voor álle ingelogde users een 60s-poller — admin synct (schrijft), niet-admins doen een read-only `loadAll()` zodat de live-weergave bijwerkt; draait alleen als er een wedstrijd live is.
- **Onbewaakte live-sync (server-cron):** de edge function heeft naast de proxy een tweede modus `{mode:'sync'}` die volledig server-side draait: leest matches, draait als er een wedstrijd live is **óf** er nog KO-slots met placeholder-teams open staan (anders stop, geen FD-call), koppelt op `fd_match_id`, schrijft KO-teams/scores/result en draait `recalc_streaks`/`recalc_day_wins` bij nieuwe uitslagen. (De oude geporte `updateBracket`/`fillThirds` staan nog als dode code in de functie.) **pg_cron** (`cron_fd_sync.sql`) roept dit elke minuut aan — werkt dus ook zonder open tab. Beveilig `mode:sync` evt. met secret `CRON_SECRET` (dan `{"mode":"sync","secret":"…"}` in de cron-body). De client-side poller blijft als fallback bestaan.

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
6. **Auth-/bevestigingsmails aanzetten** — bewust UIT in Supabase tot er meer gebruikers zijn (Resend-mail-limieten). Code is voorbereid; de Custom SMTP (Resend) staat al ingevuld onder Supabase → Authentication → SMTP/Notifications. Aanzetten = in Supabase → Authentication → Providers → Email → "Confirm email" AAN, en Site URL/redirects op `https://norisknofun.net`. Daarna evt. NRNF-gestylde templates (NL-only of drietalig-gestapeld) plakken bij Email Templates.

> ✅ **Live tussenstand** — gebouwd. Zie de football-data sectie (LIVE TUSSENSTAND).

> ✅ **Paul drempel → 8** (eerbetoon aan Paul de Octopus) — gedaan. Nieuwe volgorde: 2 EL JEFE · 4 THE CHOSEN ONE · 6 SITTING BULL · 8 PAUL · 10 THE DEEP STATE · 12 THE ORACLE · 14 PAUL WAS AN AMATEUR.

---

## TESTDATA & SQL SCRIPTS

- `testdata.sql` — 5 dummy spelers + alle 72 groepsuitslagen
- `cleanup.sql` — reset alles voor het echte toernooi
- `wis_warmup.sql` — wist ALLEEN de warm-up (matches+tips phase='warmup') + recalc streaks/dagwinsten; WK-tips/odds blijven (gebruik dit als er al WK-tips zijn)
- `beste_nummers_3.sql` — welke 8 nummers 3 gaan door
- `nummers3_invullen.sql` — vul beste nummers 3 in R32 bracket (legacy; KO-teams komen nu uit football-data)
- `setup_final.sql` — complete database setup (eenmalig)
- `fix_complot.sql` — complot tabellen fix
- `odds_set_column.sql` — kolom `matches.odds_set` (zijn er echte odds opgehaald?) + backfill
- `fd_match_id_mapping.sql` — kolom `matches.fd_match_id` + 1-op-1 koppeling met football-data (104 updates, eenmalig); maakt `updateBracket`/`fillThirds` overbodig
- `fix_premature_r32.sql` — zet voortijdig (op tussenstand) ingevulde R32-slots terug naar placeholder
