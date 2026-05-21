# NRNF UI Kit

A click-through recreation of the **NO RISK NO FUN — WK Pool 2026** web app, built as a small React + Babel prototype. Components are factored into reusable files so you can lift any of them into a fresh design.

## Run

Open `index.html` directly — it loads React, ReactDOM and Babel from unpkg. No build step.

## What's here

| File | Role |
|---|---|
| `index.html` | Shell — loads React, Babel, the token sheet, then every component file in order |
| `nrnf.css` | Full component stylesheet (header, nav, match card, leaderboard, podium, modals, toast) |
| `app.jsx` | Top-level `App` — tab routing, modal state, toast, `Spelregels`, `Toernooi` |
| `components/data.jsx` | Demo fixture: profiles, matches, tip counts, complot · constants (STREAKS, RISK_PROFILES, TEAM_FLAGS, TEAM_CODES) · helpers (`getStreakInfo`, `bananaCount`, `calcPoints`) |
| `components/ui.jsx` | Small primitives — `MascotAvatar`, `StreakBadge`, `BananaStreak`, `Button`, `PhaseBadge`, `Modal`, `Toast`, `TipChip` |
| `components/Header.jsx` | `Header` (mascot + lockup + user block) and `Nav` (six tabs) |
| `components/MatchCard.jsx` | `MatchCard` with pick row, tip counts, locked + result states |
| `components/Home.jsx` | `Podium`, `StatTicker`, `ComplotCard` |
| `components/Leaderboard.jsx` | `Leaderboard` table |
| `components/PixelPlayer.jsx` | React wrapper around `pixel-player.js` — exposes `<PixelPlayer name="…" />` and `usePlayer(name)`. |
| `components/pixel-player.js` | **Standalone, framework-free generator** — deterministic pixel-art player cards (12 outfield + 6 throwback + 10 keeper kits, 11 hair styles, 5 facial-hair variants). Use as web component `<pixel-player name="…">`, via `window.NRNFPixelPlayer.generatePlayer(…)`, or import into Claude Code. Full docs in `components/pixel-player.md`. |
| `components/pixel-player.md` | API + usage docs for the generator. |
| `components/AuthScreen.jsx` | Pre-login screen with toggle between INLOGGEN / AANMELDEN |

## What you can click

- Log in (any value works — it's a stub) → main app
- Tab nav switches between Home / Tips / Stand / Spelregels / Toernooi
- Tips → click pick buttons → state updates, "TIPS OPSLAAN ▶" fires a toast
- Home → click any stat ticker → opens a stats modal
- Home → "🐑 SLAPER WAKKER MAKEN ▶" → opens the invite modal
- Modals close on backdrop click or ✕ SLUITEN
- Header → UITLOGGEN → back to auth screen

## What's intentionally not here

This is a **UI recreation**, not a working app. So:

- No real auth, no Supabase
- No real odds API
- No real bracket logic
- Admin tab not rendered (was complex form, not a visual showcase)
- H2H modal not wired up (the Modal primitive can be reused for it)

## Patterns to copy when extending

- **Components export to `window`** via `Object.assign(window, { ... })` at the bottom of each file. This works around the per-`<script type="text/babel">` scope split.
- **No `const styles` object collisions** — use `className` + the stylesheet, or inline `style={{ ... }}`. Never name a styles object generically.
- **Pseudo-shadow** — the `.box` and `.match-card` use a `::before`/`::after` black rectangle offset by (2-3px) instead of `box-shadow` (so the shadow stays fully opaque and pixel-sharp). Replicate this when you build new card-shaped containers.
- **`Object.fit: cover` + `object-position: top center`** on the mascot, so the head shows cleanly in any sized frame.
