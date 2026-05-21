# No Risk No Fun — Design System 🐙

A design system extracted from **NO RISK NO FUN — WK Pool 2026**, a retro‑styled World Cup football betting pool by Niels Besseling. Built for use by design agents that need to mock, extend, or prototype against this brand.

> *Onderschat de underdog niet.* — Don't underestimate the underdog.

---

## What is this product?

**NO RISK NO FUN** is a Dutch‑language web app where a group of friends bet on World Cup 2026 matches. Tipping the favourite earns you next to nothing; tipping an underdog and being right is what wins the pool. The whole product is one HTML file (`index.html`) plus a Supabase backend.

Core game loop: `points = 100 / chance%`. So a 5% "wild guess" tip pays 20 points, a 70% favourite pays 1. Knockout results count after extra time (120 min). No tip entered = automatic draw.

Around that sit gamification layers — streaks named after octopus oracle Paul (🐙 PAUL → 🐓 PAUL WAS AN AMATEUR), risk profiles ("De Bureaucraat" → "De Rebel"), a Matrix‑themed sub‑group system called **Complotgroepjes** ("conspiracy crews"), a daily Waaghals (daredevil), Odds Beater bonuses, and a Head‑to‑Head comparison modal.

**Product surface:** one product — a single‑page web app at `index.html` (auth + Home + Tips + Stand + Spelregels + Toernooi + Admin) with a secondary `Invite.html` landing page for joining a complot via invite link.

---

## Sources

| Source | URL / Path |
|---|---|
| GitHub repo (input) | https://github.com/nielspharox/NRNF26 |
| Live product | https://nielspharox.github.io/NRNF26/ |
| Backend | Supabase project `soonpwnwrvxmariaqdfb` |
| Owner | Niels Besseling — `niels@pharox.io` |

If you want to dig deeper, open the repo above and read **`CONTEXT.md`** — it contains the canonical typography table the rest of this system is derived from.

---

## File index

```
.
├── README.md                  ← you are here
├── SKILL.md                   ← agent-skill manifest
├── colors_and_type.css        ← CSS tokens (colors, fonts, type scale, shadows)
├── assets/                    ← logos, mascot, brand imagery
│   ├── mascot.png             ← "De Condor" — the brand mascot
│   └── banana.gif             ← streak indicator (dancing pixel banana)
├── preview/                   ← Design System tab cards (each ~700×variable)
│   ├── card-*.html            ← one HTML file per card
├── ui_kits/
│   └── nrnf/                  ← the pool app, recreated
│       ├── README.md
│       ├── index.html         ← click-thru prototype
│       ├── nrnf.css           ← full component stylesheet
│       └── components/        ← reusable JSX components
└── slides/                    ← (none — no decks were attached)
```

---

## CONTENT FUNDAMENTALS

The product is written in **Dutch**, second person ("jij/je"), informal. It speaks like a group chat between friends, not a sportsbook.

### Voice

- **Casual, slightly rowdy.** "Wie neemt het meeste risico?", "Geen tip? Dan tel je automatisch gelijkspel." Sentences are short and confident.
- **Mock‑conspiratorial.** The Complotgroepje surface is entirely Matrix/red‑pill themed. Members are *slapers* (sleepers) you "wake up" with a *rode pil* (red pill); the founder is a *Haantje* (little rooster).
- **Underdog‑celebrating.** Copy actively encourages risk. Pejorative names for safe play ("De Bureaucraat", "De Ambtenaar") and admiring names for risk ("De Rebel", "De Stroman").
- **Trash‑talk where appropriate.** H2H winner string is literally: *"[NAAM] troeft [NAAM] genadeloos af met [X] punten verschil."* ("[name] mercilessly outclasses [name] by [X] points.")

### Casing

- **Buttons, section titles, badges, tabs → ALL CAPS** in Press Start 2P. e.g. `TIPS OPSLAAN ▶`, `🏠 HOME`, `LOCKED`.
- **Body copy → sentence case** in VT323. Punctuation is normal Dutch.
- **Player names → all caps** when in Oswald (modals, leaderboards). Team names → all caps too.
- **Labels above inputs → ALL CAPS** Press Start 2P, e.g. `E-MAILADRES`, `WACHTWOORD`.

### Emoji & symbols

Heavy, deliberate use. Emoji are **part of the brand**, not decoration:

| Emoji | Role |
|---|---|
| 🐙 | Paul the octopus — first streak tier, mascot of the streak system |
| 🍌 / `banana.gif` | Streak indicator (1 banana per ~2 streak levels) |
| 🐓 | Haantje — the leader of a complotgroepje |
| 🐑 | Slaper — a member to be "woken up" |
| 💊 | Red pill — invite mechanic |
| 😴 | Removing a member |
| 🐓👑 | Crowning a new Haantje |
| ⚔️ | Head‑to‑head |
| ⚽ 🏆 🏅 ⚡ 🎯 🎲 📊 📋 ⚙ | Tab + section icons |
| 🌵🤠 🦬 🕵️ 🔮 💀 | Streak titles (EL JEFE, SITTING BULL, THE DEEP STATE, THE ORACLE, PAUL WAS AN AMATEUR) |
| 📁 🖊️ 🤫 🎭 ✊ | Risk profiles (Bureaucraat → Rebel) |
| ▶ | Action‑arrow suffix on most buttons (`INLOGGEN ▶`) and section titles (`▶ HOME`) |
| ✕ | Close affordance on modals (`✕ SLUITEN`) |
| ✔ ✗ | Confirmation / error inline glyphs |

**Country flags** are always emoji (🇳🇱 🇧🇷 etc.), never SVG, never scaled below 16px.

### Microcopy examples (lift these — don't paraphrase)

- Login button: `INLOGGEN ▶`
- Register button: `AANMELDEN ▶`
- Save tips: `TIPS OPSLAAN ▶`
- Logout: `UITLOGGEN`
- Toast on save: `✔ Tips opgeslagen!`
- Invite modal title: `MAAK EEN SLAPER WAKKER 🐑`
- Invite primary button: `💊 RODE PIL GEVEN ▶`
- Invite success: `[naam] is ontwaakt. Welkom in het complot.`
- Invite fail: `Deze slaapkop bestaat niet in de matrix.`
- Crown confirmation: `👑 [naam] IS NU DE WAARHEID.`
- Remove member confirmation: `[naam] slaapt weer. De matrix heeft hem terug.`
- H2H winner line: `[NAAM] troeft [NAAM] genadeloos af met [X] punten verschil.`
- H2H tie: `[NAAM1] en [NAAM2] staan volledig gelijk.`
- Footer: `Built with ❤️ and 🐙 energy`

### Things to NEVER write

- Apologetic / corporate copy ("We are sorry, but...").
- Generic CTA verbiage ("Get Started", "Learn More"). Use specific, in‑world verbs.
- English on user‑facing surfaces unless it's a streak title (EL JEFE, THE ORACLE) or 3‑letter country code.
- Decimal points (this is Dutch — use commas if you ever need them, but the product barely uses non‑integer numbers).

---

## VISUAL FOUNDATIONS

The visual language is **retro internet ~1999** — Hyves, early FIFA games, GeoCities. Read every choice through that filter.

### Palette

Deep purple base, neon green accents, electric yellow + alert red. See `colors_and_type.css` for tokens.

| Token | Hex | Role |
|---|---|---|
| `--bg` | `#1a0033` | page background — deep purple |
| `--bg2` | `#2a0050` | cards, sections — one step lighter |
| `--bg3` | `#0f001f` | inputs, deepest plane |
| `--purple` | `#7b00ff` | primary brand / nav active |
| `--purple-light` | `#aa44ff` | accents, glow |
| `--border` | `#5500aa` | default border tone |
| `--green` | `#00ff66` | success, correct tip, primary CTA |
| `--green-dark` | `#00cc44` | green button border (pressed) |
| `--yellow` | `#ffe600` | streak / warning / gold rank |
| `--red` | `#ff2244` | error / locked / wrong tip |
| `--white` | `#f0e6ff` | primary text (very slight purple cast — never pure white) |
| `--muted` | `#d4bef5` | secondary text |
| Medals | `#ffe600` / `#cccccc` / `#c87941` | gold / silver / bronze |

**Never** introduce a colour outside this palette inline. The CONTEXT.md is explicit: *"inline kleuren die niet uit de kleurenpalet komen"* are forbidden.

### Typography

Three fonts, three jobs. Always follow the size table.

| Font | Use | Sizes |
|---|---|---|
| **Press Start 2P** (pixel) | Section titles, button labels, tab labels, badges, table headers | 13 / 11 / 9 / 8 / 7px |
| **VT323** (retro mono) | Body copy, dates, descriptions, meta | 22 / 20 / 18px |
| **Oswald 700** (display) | Player names, team names, country codes | 26 / 18 / 13px |

**Hard floors:** never use Press Start 2P below 7px or VT323 below 18px. Both become unreadable below that. See `colors_and_type.css` token block for canonical sizes.

### Layout rules

- **Hard‑square corners.** `border-radius: 0` everywhere. Buttons, cards, modals, badges, inputs — all sharp 90° corners.
- **Visible borders are the structure.** 2–4px solid borders define every container. Borders, not shadows, hold the layout.
- **Page is centered at max 900px** in main content. Auth + modal boxes cap at 400–780px.
- **Mobile reflow.** Form grids collapse to one column under 600px, header wraps.

### Shadows / elevation

The brand uses **hard, offset, blur‑less drop shadows** — never soft Material/iOS shadows. Three rungs:

| Token | Value | Used on |
|---|---|---|
| `--shadow-sm` | `2px 2px 0 #000` | small badges, chips |
| `--shadow-card` | `4px 4px 0 #000` | raised cards, buttons |
| `--shadow-modal` | `8px 8px 0 #000` | modal containers |

There are **two glow shadows** for specific signals only:
- `--glow-purple` — applied to the **streak badge at level 12+** (THE ORACLE / PAUL WAS AN AMATEUR), and the H2H custom dropdown. Two‑layer glow: `0 0 12px var(--purple-light), 0 0 24px rgba(170,68,255,0.4)`.
- `--glow-green` — input focus state: `0 0 8px rgba(0,255,102,0.25)`.

Card boxes also use a *pseudo‑element bump* — a black rectangle offset by `(3px, 3px)` behind the card, sitting at `z-index: -1`, to fake the drop shadow without using box‑shadow (so the colour is opaque). Replicate this pattern, not a regular box‑shadow, when matching the `.box` and `.match-card` look.

### Backgrounds

- **Two layered scanline gradients** sit fixed across the whole page. A coarser one painted into `body` (4px stripe, 12% black), and a finer one in `body::before` (3px stripe, 6% black, `pointer-events: none`, `z-index: 9999`). This is the retro‑CRT signature — replicate it on any new page.
- **No gradients elsewhere.** No bluish‑purple decoration gradients, no glassy panels, no hero blobs. The page is a flat deep purple field plus borders.
- **No imagery as background.** The mascot appears only as an avatar in the auth box, header, and onboarding — never tiled, never blurred behind content.
- **The header carries a flat 3‑colour stripe** (`purple / green / yellow`, 20px each, repeating) along its top edge. Use this anywhere the brand needs a "header bar".

### Borders & cards

- **Default card** = `var(--bg2)` fill + 3px `var(--border)` + a `::before` shadow rectangle offset `(3px, 3px)`.
- **Green emphasis card** = same, swap border to `var(--green)`.
- **Match card** = `var(--bg2)` + 2px `var(--border)` + `::after` shadow with `rgba(0,0,0,0.4)`.
- **Result‑coded cards** use a thick (4px) coloured **left** border: `--green` for home win, `--yellow` for draw, `--red` for away win. *(This is the one place the colored‑left‑border motif is allowed — because it visually maps to the colour‑coded pick buttons above it.)*
- **Modal box** = `var(--bg2)` + 4px `var(--purple)` + `8px 8px 0 #000` shadow.
- **Auth box** = same but 4px `var(--green)` border.

### Buttons

- **Footprint:** 3px solid border + 4px offset hard shadow. On `:active` the button shifts `translate(2px, 2px)` AND shrinks the shadow to `2px 2px 0 #000` — the press literally "lands" the button into its shadow. Always replicate this.
- **Variants:** green (primary action / save), purple (secondary action / claim), yellow (highlight), red (destructive), ghost (subtle / cancel — transparent + muted text + bordered).
- **Size:** default 9px Press Start 2P + 10px/16px padding; small (`.btn-sm`) drops to 7px Press Start 2P + 2px shadow.

### Inputs

- `var(--bg3)` fill, 2px `var(--border)`, **text rendered in green** (`var(--green)`, VT323 20px). Label above in Press Start 2P 9px white.
- On focus: border swaps to green, plus a soft green glow (the rare blur‑shadow in the system).

### Hover / press states

- **Buttons:** colour swap on hover (e.g. green button → `#44ffaa`). On press: translate down‑right, shrink shadow.
- **Tabs:** add purple alpha background (`rgba(123,0,255,0.3)`) + white text on hover; active tab gets full purple fill + green text.
- **Pick buttons (tip rows):** border + text colour swap to the option's accent on hover (green for home, yellow for draw, red for away). Selected adds a 12–15% alpha background fill in the matching colour.
- **Avatar wrap:** on hover reveals a 📷 overlay at 60% black scrim.

### Animation

- **Minimal.** A 200ms fadein + 4px lift on section change (`@keyframes fadein`). That's it.
- **No bounces, no springs, no easing curves.** Transitions are short (50–100ms) and linear. The vibe is *snap*, not *slide*.
- **No motion on hover** beyond the press translate. No scale, no skew, no transform tricks.

### Transparency & blur

- **No backdrop blur** anywhere. The CRT look depends on hard pixel edges.
- **Limited alpha:** modal scrims use `rgba(0,0,0,0.85–0.88)`. Selected pick rows use `rgba(0,255,102,0.15)` etc. Purple hover wash uses `rgba(123,0,255,0.3)`. Glow shadows use `rgba(170,68,255,0.4)`.
- **No frosted glass, no translucent cards.** Everything is fully opaque.

### Imagery

- **The mascot** ("De Condor") is the only painted illustration in the system — a hyper‑detailed, gritty drawing of a curly‑haired moustachioed coach in a red KNVB tracksuit. Used in the auth box (80px), header (90px), and as a fallback avatar. Treated as a **photo, not an icon**: always inside a hard square frame with a 3px green border and a 4px black shadow, `object-fit: cover; object-position: top center` to crop nicely.
- **Pixel art**: the `banana.gif` is a true low‑res GIF, used at 24px with `image-rendering: pixelated`. The number of bananas shown stacks with streak level (1 → 2 → 3+).
- **Player avatars**: square (never circular), 2–3px border, varying size (28 / 32 / 36 / 48 / 80px depending on context).

### Iconography for UI affordances

See `ICONOGRAPHY` below.

---

## ICONOGRAPHY

There is **no icon font**, no SVG sprite, no Lucide or Heroicons. The brand uses **emoji as iconography** — across tabs, buttons, table rows, and badges. This is intentional retro‑web vibe.

| Surface | Convention |
|---|---|
| Tabs | Emoji prefix + space + ALL CAPS label: `🏠 HOME`, `⚽ TIPS`, `🏆 STAND`, `📖 SPELREGELS`, `📋 TOERNOOI`, `⚙ ADMIN` |
| Section titles | `▶ HOME`, `▶ JOUW TIPS` — the ▶ glyph is the brand's section arrow |
| Action buttons | Verb in caps + ▶ at the end: `TIPS OPSLAAN ▶`, `RODE PIL GEVEN ▶`, `LID WORDEN ▶` |
| Modal close | `✕ SLUITEN` button (top‑right of modal) |
| Confirmation | `✔` (green) for success, `✗` (red) for fail, both inline |
| Streak indicator | `banana.gif` at 24×24px, `image-rendering: pixelated`, repeated 1–7 times based on streak |
| Country flags | OS emoji flags only — 16–18px, never scaled, never replaced with SVG |
| Risk / streak titles | Emoji + ALL‑CAPS title pair: `🐙 PAUL`, `⚡ THE CHOSEN ONE`, `📁 De Bureaucraat` |

**When designing for NRNF, do this:**

1. **Use emoji.** This is the brand. Do not substitute with an icon library.
2. **Never draw a hand‑rolled SVG icon** that competes with the emoji style — it will read as a clean modern UI, which is exactly wrong.
3. **The only non‑emoji "icons" allowed** are:
   - `▶` action arrow on buttons + section titles
   - `✕` close glyph
   - `✔` / `✗` confirmation glyphs
4. **The mascot and the banana** are the only raster art used. Both live in `assets/`. Don't generate alternatives.

If you absolutely need an affordance with no good emoji match, **use the closest emoji** rather than introducing an icon system. e.g. settings → `⚙`, calendar → `📅`, alert → `⚠`, lock → `🔒`.

---

## UI Kits

| Kit | Path | Covers |
|---|---|---|
| **nrnf** | `ui_kits/nrnf/` | The full pool app — auth screen, header, nav, home (podium + stats + complot list), tips screen with match cards, stand (leaderboard), tournament view, modals. **Ships the standalone `pixel-player.js` generator** — drop `<pixel-player name="niels"></pixel-player>` into any HTML for an arcade-style player card. Full docs at `ui_kits/nrnf/components/pixel-player.md`. |

Open `ui_kits/nrnf/index.html` for a click‑through prototype.

---

## Caveats / open questions for the user

1. **Webfonts** are loaded from Google Fonts CDN (Press Start 2P, VT323, Oswald). The source repo does the same — no local TTFs were provided. Flag if you'd like local fallbacks bundled.
2. **No slide decks** were attached, so `slides/` is empty.
3. The mascot is the only brand illustration — no logomark / wordmark exists. The "NO RISK NO FUN" lockup is set in Press Start 2P with a green text shadow; there is no SVG logo file.
4. Mascot is 3.4MB at full resolution. May want to provide an optimised version for production use.

---

*Built with ❤️ and 🐙 energy.*
