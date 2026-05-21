---
name: nrnf-design
description: Use this skill to generate well-branded interfaces and assets for NO RISK NO FUN (Niels Besseling's retro Dutch World Cup pool), either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the `README.md` file within this skill, and explore the other available files. Start here:

- `README.md` — brand overview, content fundamentals, visual foundations, iconography
- `colors_and_type.css` — token file (drop into any new page via `<link rel="stylesheet">` and the system is wired up)
- `assets/mascot.png` — the brand mascot ("De Condor") — only painted illustration in the system
- `assets/banana.gif` — the streak indicator (pixelated, use at 24px with `image-rendering: pixelated`)
- `preview/` — small HTML cards demonstrating every token / component
- `ui_kits/nrnf/` — full click-thru recreation of the pool app, with reusable JSX components

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy the assets you need out of `assets/` and create static HTML files for the user to view. **Always include the Google Fonts import** (Press Start 2P, VT323, Oswald) and the two-layer CRT scanline background — these are the immediately-recognisable signatures of the brand. Use emoji as your icon system; do not import Lucide, Heroicons, or any icon font — it will read as a clean modern UI, which is the opposite of what this brand wants.

If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand. The source code is `https://github.com/nielspharox/NRNF26` (vanilla HTML/CSS/JS, single file, Supabase backend).

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions (audience, surface, copy in Dutch or English, level of fidelity), and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

**Non-negotiable rules:**

- Body text is **Dutch** unless the user explicitly says otherwise.
- Colours come from the token palette only. No bluish-purple gradients, no glassy panels, no soft Material/iOS shadows.
- Corners are **square** — `border-radius: 0` everywhere.
- Shadows are **hard, offset, blur-less** (`Xpx Ypx 0 #000`). The only exceptions are the purple glow on 12+ streak badges, the green focus glow on inputs, and the gold text-shadow on the rank-1 podium row.
- Never go below 7px Press Start 2P or 18px VT323.
- Active buttons translate `(2px, 2px)` and shrink their shadow — always replicate this.
- Mascot is the **only** painted illustration. Don't draw new ones.
