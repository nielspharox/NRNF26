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

## Security

> Lees dit vóór je iets aan de database, auth of render-laag wijzigt.

### Kernprincipe
De Supabase **anon-key staat publiek in de frontend** (`index.html`, `Invite.html`) — dat hoort zo. Elke Supabase-webapp doet dit; iedere bezoeker krijgt 'm sowieso via de Network-tab. **De beveiliging zit NIET in het geheimhouden van die key, maar in server-side Row Level Security (RLS).** Vertrouw dus nooit op het verbergen van UI (zoals de admin-tab) als beveiliging — dat is alleen cosmetisch. Alles moet server-side afdwingbaar zijn.

> 🚨 De enige key die NOOIT in de frontend of een commit mag staan is de `service_role`-key (`"role":"service_role"` in de JWT) — die omzeilt álle RLS. Zie je die ergens in de client-code verschijnen = direct alarm. Hij hoort alleen in Edge Function Secrets.

### Wat is afgedicht (audit juni 2026 → `hardening.sql`)
| # | Risico | Fix |
|---|--------|-----|
| 1 | `settings`-tabel was **publiek leesbaar** → API-keys lekten naar elke bezoeker | RLS: `settings` alleen admin-leesbaar |
| 2 | Speler kon **zichzelf admin maken** (`profiles` UPDATE zonder kolombeperking) | Trigger `protect_profile_privileges` bevriest `is_admin`/`day_wins`/streaks voor niet-admins |
| 3 | **Tip-lock bij aftrap omzeilbaar** (losse policies werden met OR gecombineerd) | Eén sluitende `tips`-policy: eigen tip **én** `kickoff > now()` |
| 4 | `cg_update` self-referentie-bug | Koppeling op `complot_groups.id` hersteld |
| 5 | **Open `sync`/`odds`-endpoints** van de edge function | `CRON_SECRET` afgedwongen; cron stuurt 'm mee in de body |
| 6 | Geheime keys in DB (`fd_api_key`, `resend_api_key`) | Verplaatst naar **Edge Function Secrets**; uit `settings` verwijderd |
| 7 | **Stored XSS** via username / groepsnaam / `avatar_url` (rauw in `innerHTML`) | `escapeHtml()`-helper op álle render-plekken + tekenvalidatie bij registratie |
| 8 | **Avatar-upload** zonder MIME-check (SVG/HTML met script mogelijk) | Whitelist `jpg/png/webp/gif` + extensie uit MIME-type + 5MB-limiet |
| 9 | **Zelf-promotie tot Haantje**: `cm_insert` beperkte `is_haantje` niet → speler kon zichzelf haantje van elke groep maken (en die kapen) | Trigger `protect_haantje` bevriest `is_haantje` voor niet-haantjes (carve-out voor groep-maker) |
| 10 | **Clickjacking**: app was framebaar (GitHub Pages kan geen `X-Frame-Options`/CSP sturen) | JS-framebuster in `index.html` + `Invite.html` |
| 11 | **Username-validatie ontbrak in `Invite.html`** (alleen in `index.html`) | Zelfde tekenregex toegevoegd in de invite-registratieflow |
| 12 | **Edge-function auth was fail-open** (`if (secret && …)` → open als `CRON_SECRET` leeg) | Fail-closed gemaakt: zonder secret weigert `sync`/`odds` |

**Belangrijk over RLS:** PostgreSQL combineert meerdere *permissive* policies met **OR**. Eén ruime policy kan dus een strikte policy volledig tenietdoen (dat was bug #3). Voeg nooit een tweede, ruimere policy toe naast een beperkende — combineer de voorwaarden in één policy.

**Belangrijk over XSS:** alle user-controlled data (username, groepsnaam, avatar-URL) moet door `escapeHtml()` vóór het in `innerHTML` belandt. HTML-escaping is **niet** voldoende in een JS-string binnen een `onclick`-attribuut — geef daar geen user-data door, maar zoek het op via een veilig id (uuid) binnen de functie.

### Bewust geaccepteerd / lage prioriteit
- **`profiles` is publiek leesbaar** (`profiles_read = true`) — nodig voor klassement/pitch. Bevat géén e-mailadres of PII (e-mail zit in `auth.users`, niet blootgesteld). `is_admin` is wel zichtbaar; acceptabel.
- **`send-invite` edge function is open** (`--no-verify-jwt`) maar **inert** zolang er geen `RESEND_API_KEY` gezet is. ⚠️ Beveilig 'm (JWT-verificatie aan of een shared secret in de body) **vóór** je e-mail aanzet — anders is het een open mail-relay op jouw Resend-account.
- **`fd-proxy` proxy-modus is open** maar laag risico: alleen `/competitions/WC*`-paden, zelfde host (football-data), read-only publieke data. Worst case = misbruik van je football-data rate-limit. Optioneel strakker te zetten met een exacte path-whitelist.
- **`complot_members` self-insert** — een speler kan zichzelf zonder uitnodiging aan een groep toevoegen. Laag risico (groepen bevatten geen geheime data; alles is toch publiek). De self-insert is bovendien nodig voor `acceptInvite()` en groep-aanmaken — niet zomaar weghalen.
- **E-mailbevestiging staat bewust UIT** in Supabase (tot er meer gebruikers zijn) → iemand kan registreren met een willekeurig e-mailadres. Aanzetten wanneer gewenst.
- **Complotgroepjes zijn publiek leesbaar** (`cg_read`/`cm_read = true`) → met de anon-key kan men álle groepsnamen, invite-codes en het lidmaatschapsgraaf opvragen. Laag risico (geen geheime data; invites zijn toch deelbaar). Wil je het dichter: beperk lees-toegang tot leden + een `security definer`-RPC voor de invite-preview in `Invite.html`.
- **Laatste-haantje-bescherming is alleen client-side** — via de API kan een haantje een groep zonder haantje achterlaten (beheer-lock-out, geen score-impact). Optioneel server-side afdwingen.

### Aanbevolen verbeteringen (nog niet gedaan)
- **Supply-chain / SRI:** `supabase-js` wordt geladen via `cdn.jsdelivr.net/npm/@supabase/supabase-js@2` (zwevende major-tag, géén `integrity`). Bij een CDN-compromittering draait er arbitraire JS in een pagina met je sessie in localStorage. Pin een exacte versie + SRI-hash, of self-host het bestand op de Pages-origin.
- **DB CHECK op username** (server-side waarheid voor beide signup-flows): `alter table profiles add constraint username_no_html check (username !~ '[<>"''&]') not valid;` (`not valid` raakt bestaande rijen niet).

### Checklist bij nieuwe code
- [ ] Nieuwe tabel? → RLS aanzetten + policies; standaard `read using(true)` alleen als de data echt publiek mag.
- [ ] Schrijfactie voor admins? → policy met `exists(select 1 from profiles where id=auth.uid() and is_admin=true)`.
- [ ] User-data in `innerHTML`? → door `escapeHtml()`. Nooit user-data in een `onclick`-string.
- [ ] Nieuwe edge-function-modus die schrijft? → achter `CRON_SECRET` of JWT.
- [ ] Bij DB-herinstallatie (`setup_final.sql`): **draai daarna `hardening.sql`** — anders komen bugs #1–4 terug.

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