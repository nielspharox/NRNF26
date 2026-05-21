# `pixel-player` — NRNF retro player generator

A standalone pixel-art player card generator used across the NRNF design system (Podium, Leaderboard, profile modals).

- **Deterministic.** `hash(username)` seeds an LCG → same username always produces the same card.
- **Framework-free.** Single vanilla JS file. Exposes `window.NRNFPixelPlayer`, a `<pixel-player>` web component, and CommonJS export.
- **A React wrapper exists** at `PixelPlayer.jsx` for use inside the UI kit, but the vanilla file is the canonical source.

## Files

| File | Purpose |
|---|---|
| `pixel-player.js` | The generator. Vanilla JS, no deps. **Source of truth.** |
| `PixelPlayer.jsx` | Tiny React wrapper. Re-exports `<PixelPlayer />` and `usePlayer(name)`. |
| `pixel-player.md` | This doc. |

## Quick start

### 1. Web component (any HTML page)

```html
<script src="path/to/pixel-player.js"></script>

<pixel-player name="niels"></pixel-player>
<pixel-player name="niels" mini></pixel-player>
<pixel-player name="niels" size="80"></pixel-player>
<pixel-player name="niels" kit="NED_88"></pixel-player>
<pixel-player name="niels" kit="GK_PINK" position="GK"></pixel-player>
```

Attributes:
- `name` *(required)* — username. Used as the seed.
- `size` — pixel width (height auto). Default is the SVG's intrinsic size.
- `mini` — boolean. Crops to head + torso only (no shorts / legs). Use for inline avatars in leaderboards.
- `kit` — force a specific kit key (e.g. `NED`, `BRA_70`, `GK_NEON`). Overrides the random kit pick. Pass a keeper kit and the player becomes a keeper automatically.
- `position` — force `GK`, `DEF`, `MID`, or `FWD`.

### 2. Plain JS

```js
const { generatePlayer, renderPlayerSVG } = window.NRNFPixelPlayer;

const player = generatePlayer('niels');
//  { seed, username, isKeeper, kit, position, hairStyle, hairColor,
//    skin, facialHair, eyeColor, number }

document.getElementById('me').innerHTML = renderPlayerSVG(player, { size: 96 });
```

### 3. React

```jsx
// In a Babel-loaded JSX file:
<PixelPlayer name="niels" />
<PixelPlayer name="niels" mini size={36} />
<PixelPlayer name="niels" kit="GK_NEON" />
```

```jsx
const player = usePlayer('niels');
// Same object as generatePlayer() — handy if you want to read kit.name etc.
```

## API

```ts
type SkinPair = [base: string, shade: string];

interface Kit {
  name: string;          // 'NED', 'GK', etc.
  jersey: string;        // body fill
  shade: string;         // top-shoulder shading
  accent: string;        // collar / sock band
  shorts: string;
  shortsAccent: string;
  stripe?: string | null;          // vertical stripes (ARG, CRO, NED_88, GK_BLACK…)
  band?: { color: string; y: number; h: number; extra?: Array<{color, y, h}> } | null;
  collar?: 'v' | 'big';            // 'big' = throwback wide collar (BRA_70, ITA_82)
  crest: string;                    // 1px crest dot above centre
  keeper?: boolean;
  throwback?: boolean;
}

interface Player {
  seed: number;
  username: string;
  isKeeper: boolean;
  kit: Kit;
  position: 'GK' | 'DEF' | 'MID' | 'FWD';
  hairStyle: 'SHORT' | 'MULLET' | 'CURLY' | 'BALD' | 'AFRO' | 'BUZZCUT'
           | 'LONG' | 'UNDERCUT' | 'PONYTAIL' | 'BUN' | 'HEADBAND';
  hairColor: 'black' | 'brown' | 'blonde' | 'ginger' | 'grey' | 'platinum' | 'bleach';
  skin: SkinPair;
  facialHair: 'NONE' | 'STUBBLE' | 'MOUSTACHE' | 'GOATEE' | 'FULL_BEARD';
  eyeColor: string;
  number: number;
}

generatePlayer(username: string, opts?: {
  keeperChance?: number;     // default 0.15
  kit?: string;              // force a kit by key
  position?: string;         // force a position
}): Player

renderPlayerSVG(player: Player, opts?: {
  size?: number | string;
  mini?: boolean;            // head + torso only — for leaderboard avatars
  className?: string;        // default 'pixel-player'
}): string                   // returns SVG markup
```

## Kits available

**Outfield (12 modern):** `NED`, `FRA`, `BRA`, `GER`, `ITA`, `ESP`, `ARG`, `ENG`, `POR`, `CRO`, `BEL`, `MAR`

**Throwback (6):** `NED_88`, `BRA_70`, `ENG_66`, `GER_90`, `ITA_82`, `DEN_86`

**Keeper (10):** `GK_NEON`, `GK_PURPLE`, `GK_YELLOW`, `GK_PINK`, `GK_TEAL`, `GK_ORANGE`, `GK_LIME`, `GK_BLACK`, `GK_RED`, `GK_CYAN`

To list keys at runtime: `Object.keys(NRNFPixelPlayer.OUTFIELD_KITS)` and `Object.keys(NRNFPixelPlayer.KEEPER_KITS)`.

## Usage tips

- **Leaderboard avatars:** use `mini` + `size: 36`. Wrap in a 2px-bordered black square to match the in-app avatar frame.
- **Profile / podium:** full body at `size: 96–108`. Drop on a dark plate with the CRT scanline overlay (see `colors_and_type.css` for the pattern).
- **Match-day previews:** call `generatePlayer(name, { kit: 'NED' })` to force a specific national kit when the player is "representing" that team.
- **Stability:** seeded by lowercased username. Renaming a user changes the card. If you want stability across renames, key the seed off the user `id` instead — the generator's first arg is just a string.
