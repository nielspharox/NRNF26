/* ============================================================================
   NRNF · Pixel Player Generator
   ----------------------------------------------------------------------------
   Framework-free. Three ways to consume it:

   1) Web component:
        <script src="…/pixel-player.js"></script>
        <pixel-player name="niels"></pixel-player>
        <pixel-player name="niels" mini></pixel-player>
        <pixel-player name="niels" size="80"></pixel-player>

   2) Plain JS:
        const player = NRNFPixelPlayer.generatePlayer('niels');
        el.innerHTML = NRNFPixelPlayer.renderPlayerSVG(player, { size: 96 });

   3) React (use the wrapper at PixelPlayer.jsx):
        <PixelPlayer name="niels" />

   The generator is deterministic — the same username always produces the same
   card, so leaderboards, podiums and modals all stay in sync.
   ============================================================================ */

(function (root) {
  'use strict';

  /* ── PALETTES ───────────────────────────────────────────── */

  const SKIN = [
    ['#f0c8a0', '#d6a880'],
    ['#e8b692', '#c69172'],
    ['#d49870', '#b8825c'],
    ['#a87048', '#8a5a36'],
    ['#7a4828', '#5a3416'],
  ];

  const HAIR_COLORS = {
    black:    '#1a1a1a',
    brown:    '#4a2d1a',
    blonde:   '#e8c870',
    ginger:   '#c87432',
    grey:     '#aaaaaa',
    platinum: '#f0e0c0',
    bleach:   '#fff4cc',
  };

  /* Hair-style functions return arrays of {x,y,w,h[,color]}.
     Head occupies x=8-15, y=5-11 on the 24×26 grid. */
  const HAIR_STYLES = {
    SHORT:    () => [{x:8,y:3,w:8,h:1},{x:7,y:4,w:10,h:2},{x:7,y:6,w:1,h:1},{x:16,y:6,w:1,h:1}],
    MULLET:   () => [{x:8,y:3,w:8,h:1},{x:6,y:4,w:12,h:2},{x:5,y:6,w:2,h:6},{x:17,y:6,w:2,h:6},{x:6,y:11,w:2,h:2},{x:16,y:11,w:2,h:2}],
    CURLY:    () => [{x:7,y:2,w:2,h:1},{x:10,y:2,w:2,h:1},{x:13,y:2,w:2,h:1},{x:6,y:3,w:12,h:1},{x:5,y:4,w:14,h:2},{x:5,y:6,w:2,h:3},{x:17,y:6,w:2,h:3}],
    BALD:     () => [],
    AFRO:     () => [{x:6,y:2,w:12,h:1},{x:5,y:3,w:14,h:1},{x:4,y:4,w:16,h:3},{x:4,y:7,w:1,h:3},{x:19,y:7,w:1,h:3}],
    BUZZCUT:  () => [{x:8,y:4,w:8,h:1},{x:7,y:5,w:10,h:1}],
    LONG:     () => [{x:7,y:3,w:10,h:1},{x:6,y:4,w:12,h:2},{x:5,y:6,w:2,h:8},{x:17,y:6,w:2,h:8},{x:6,y:13,w:2,h:1},{x:16,y:13,w:2,h:1}],
    UNDERCUT: () => [{x:8,y:3,w:8,h:1},{x:7,y:4,w:10,h:2}],
    PONYTAIL: () => [{x:8,y:3,w:8,h:1},{x:7,y:4,w:10,h:2},{x:7,y:6,w:1,h:1},{x:16,y:6,w:1,h:1},{x:17,y:6,w:2,h:4},{x:18,y:10,w:2,h:2}],
    BUN:      () => [{x:8,y:4,w:8,h:1},{x:7,y:5,w:10,h:1},{x:10,y:1,w:4,h:2},{x:11,y:0,w:2,h:1}],
    HEADBAND: () => [{x:7,y:4,w:10,h:1},{x:7,y:5,w:1,h:1},{x:16,y:5,w:1,h:1},{x:6,y:6,w:12,h:1,color:'#cc2222'}],
  };

  const FACIAL_HAIR = {
    NONE:       () => [],
    STUBBLE:    () => [{x:9,y:11,w:6,h:1}],
    MOUSTACHE:  () => [{x:10,y:10,w:4,h:1}],
    GOATEE:     () => [{x:11,y:11,w:2,h:2}],
    FULL_BEARD: () => [{x:9,y:10,w:6,h:1},{x:9,y:11,w:6,h:2}],
  };

  /* ── KITS ───────────────────────────────────────────────── */

  /* Schema:
     { name, jersey, shade, accent, shorts, shortsAccent,
       stripe   (vertical stripes — color string or null),
       band     ({ color, y, h } — horizontal chest band, or null),
       collar   ('v' | 'crew' | 'big' — defaults 'v'),
       crest    (color of the small 1px crest above the centre),
       keeper   (true if goalkeeper — long sleeves + gloves),
       throwback(true → renders a small RETRO tag in the corner) } */

  const OUTFIELD_KITS = {
    NED:    { name:'NED', jersey:'#ff7a00', shade:'#cc5500', accent:'#000000', shorts:'#0a0a0a', shortsAccent:'#1f1f1f', stripe:null,        band:null, crest:'#ffe600' },
    FRA:    { name:'FRA', jersey:'#1a5fb4', shade:'#0d4080', accent:'#ffffff', shorts:'#f0eee0', shortsAccent:'#1a5fb4', stripe:null,        band:null, crest:'#cc2222' },
    BRA:    { name:'BRA', jersey:'#fff04c', shade:'#cccc00', accent:'#0d6b30', shorts:'#0a3d80', shortsAccent:'#1a5fb4', stripe:null,        band:null, crest:'#0d6b30' },
    GER:    { name:'GER', jersey:'#f0eee0', shade:'#aaaaaa', accent:'#1a1a1a', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,        band:null, crest:'#cc2222' },
    ITA:    { name:'ITA', jersey:'#1a489c', shade:'#0d2c66', accent:'#ffe600', shorts:'#f0eee0', shortsAccent:'#1a489c', stripe:null,        band:null, crest:'#ffe600' },
    ESP:    { name:'ESP', jersey:'#cc1122', shade:'#881111', accent:'#ffe600', shorts:'#1a3a8c', shortsAccent:'#0d2466', stripe:null,        band:null, crest:'#ffe600' },
    ARG:    { name:'ARG', jersey:'#7cc8f0', shade:'#5aa0c8', accent:'#ffffff', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:'#ffffff',   band:null, crest:'#ffe600' },
    ENG:    { name:'ENG', jersey:'#f0eee0', shade:'#aaaaaa', accent:'#cc1122', shorts:'#1a3a8c', shortsAccent:'#0d2466', stripe:null,        band:null, crest:'#cc1122' },
    POR:    { name:'POR', jersey:'#a8181b', shade:'#700f10', accent:'#0d6b30', shorts:'#0d6b30', shortsAccent:'#0a4a20', stripe:null,        band:null, crest:'#ffe600' },
    CRO:    { name:'CRO', jersey:'#cc1122', shade:'#881111', accent:'#ffffff', shorts:'#f0eee0', shortsAccent:'#1a3a8c', stripe:'#ffffff',   band:null, crest:'#1a3a8c' },
    BEL:    { name:'BEL', jersey:'#7a1414', shade:'#4a0a0a', accent:'#ffe600', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,        band:null, crest:'#ffe600' },
    MAR:    { name:'MAR', jersey:'#a8181b', shade:'#700f10', accent:'#0d6b30', shorts:'#f0eee0', shortsAccent:'#a8181b', stripe:null,        band:null, crest:'#0d6b30' },

    /* ── THROWBACKS ──────────────────────────────────────── */
    NED_88: { name:'NED', jersey:'#ff7a00', shade:'#cc5500', accent:'#ffffff', shorts:'#f0eee0', shortsAccent:'#ff7a00', stripe:'#ff9933',   band:null,                           crest:'#ffe600', throwback:true },
    BRA_70: { name:'BRA', jersey:'#ffe600', shade:'#c89900', accent:'#0d6b30', shorts:'#0d4d8a', shortsAccent:'#0a3d80', stripe:null,        band:{color:'#0d6b30',y:13,h:1},     crest:'#0d6b30', throwback:true, collar:'big' },
    ENG_66: { name:'ENG', jersey:'#a8181b', shade:'#700f10', accent:'#ffffff', shorts:'#f0eee0', shortsAccent:'#1a3a8c', stripe:null,        band:{color:'#ffffff',y:15,h:1},     crest:'#ffe600', throwback:true },
    GER_90: { name:'GER', jersey:'#f0eee0', shade:'#aaaaaa', accent:'#1a1a1a', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,        band:{color:'#1a1a1a',y:14,h:1,
                                                                                                                                              extra:[{color:'#cc1122',y:15,h:1},{color:'#ffe600',y:16,h:1}]}, crest:'#ffe600', throwback:true },
    ITA_82: { name:'ITA', jersey:'#1a4a99', shade:'#0d2c66', accent:'#ffffff', shorts:'#f0eee0', shortsAccent:'#1a4a99', stripe:null,        band:null,                           crest:'#ffe600', throwback:true, collar:'big' },
    DEN_86: { name:'DEN', jersey:'#cc1133', shade:'#881122', accent:'#ffffff', shorts:'#f0eee0', shortsAccent:'#cc1133', stripe:'#e8a4b0',   band:null,                           crest:'#ffffff', throwback:true },
  };

  const KEEPER_KITS = {
    GK_NEON:   { name:'GK', jersey:'#aaff00', shade:'#66cc00', accent:'#000000', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,    band:null, crest:'#1a1a1a', keeper:true },
    GK_PURPLE: { name:'GK', jersey:'#9c44e8', shade:'#5e22a0', accent:'#ffe600', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:'#ffe600',band:null, crest:'#ffe600', keeper:true },
    GK_YELLOW: { name:'GK', jersey:'#ffcc00', shade:'#c89900', accent:'#1a1a1a', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,    band:null, crest:'#cc1122', keeper:true },
    GK_PINK:   { name:'GK', jersey:'#ff44aa', shade:'#cc1a7a', accent:'#1a1a1a', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,    band:null, crest:'#1a1a1a', keeper:true },
    GK_TEAL:   { name:'GK', jersey:'#22ccaa', shade:'#117a66', accent:'#ffffff', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,    band:null, crest:'#ffffff', keeper:true },
    GK_ORANGE: { name:'GK', jersey:'#ff5522', shade:'#aa3311', accent:'#1a1a1a', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,    band:null, crest:'#ffe600', keeper:true },
    /* additions */
    GK_LIME:   { name:'GK', jersey:'#ddff44', shade:'#a8c818', accent:'#0d2c66', shorts:'#0d2c66', shortsAccent:'#1a489c', stripe:null,    band:null, crest:'#0d2c66', keeper:true },
    GK_BLACK:  { name:'GK', jersey:'#1a1a1a', shade:'#000000', accent:'#aaff00', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:'#aaff00',band:null, crest:'#aaff00', keeper:true },
    GK_RED:    { name:'GK', jersey:'#cc2244', shade:'#881122', accent:'#ffe600', shorts:'#000000', shortsAccent:'#1a1a1a', stripe:null,    band:{color:'#ffe600',y:14,h:1}, crest:'#ffe600', keeper:true },
    GK_CYAN:   { name:'GK', jersey:'#00ccff', shade:'#0080aa', accent:'#ff44aa', shorts:'#1a1a1a', shortsAccent:'#000000', stripe:null,    band:null, crest:'#ff44aa', keeper:true },
  };

  const POSITIONS = ['DEF', 'MID', 'FWD'];

  /* ── SEED / RNG ─────────────────────────────────────────── */

  function hashString(s) {
    let h = 2166136261 >>> 0;
    for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
    return h >>> 0;
  }
  function rng(seed) {
    let s = (seed >>> 0) || 1;
    return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s; };
  }
  function pick(rand, arr) { return arr[rand() % arr.length]; }

  const HAIR_STYLE_KEYS  = Object.keys(HAIR_STYLES);
  const HAIR_COLOR_KEYS  = Object.keys(HAIR_COLORS);
  const FACIAL_HAIR_KEYS = Object.keys(FACIAL_HAIR);
  const OUTFIELD_KEYS    = Object.keys(OUTFIELD_KITS);
  const KEEPER_KEYS      = Object.keys(KEEPER_KITS);
  const ALL_KIT_KEYS     = [...OUTFIELD_KEYS, ...KEEPER_KEYS];

  /* ── GENERATE ───────────────────────────────────────────── */

  /**
   * Deterministically generate a player profile from a username.
   * @param {string} username
   * @param {object} [opts]
   * @param {number} [opts.keeperChance=0.15] — probability the player is a goalkeeper
   * @param {string} [opts.kit] — force a specific kit key (overrides random)
   * @param {string} [opts.position] — force a position (GK / DEF / MID / FWD)
   */
  function generatePlayer(username, opts) {
    opts = opts || {};
    const seed = hashString(String(username || 'unknown').toLowerCase());
    const r = rng(seed);

    let kit;
    let isKeeper;
    if (opts.kit && (OUTFIELD_KITS[opts.kit] || KEEPER_KITS[opts.kit])) {
      kit = OUTFIELD_KITS[opts.kit] || KEEPER_KITS[opts.kit];
      isKeeper = !!kit.keeper;
    } else {
      const keeperChance = opts.keeperChance != null ? opts.keeperChance : 0.15;
      isKeeper = (r() % 1000) / 1000 < keeperChance;
      kit = isKeeper ? KEEPER_KITS[pick(r, KEEPER_KEYS)] : OUTFIELD_KITS[pick(r, OUTFIELD_KEYS)];
    }

    const position = opts.position || (isKeeper ? 'GK' : pick(r, POSITIONS));

    const hairStyle = pick(r, HAIR_STYLE_KEYS);
    const hairColor = pick(r, HAIR_COLOR_KEYS);
    const skinIdx = r() % SKIN.length;
    const facialRoll = r() % 100;
    const facialHair = facialRoll < 55 ? 'NONE'
                      : facialRoll < 70 ? 'STUBBLE'
                      : facialRoll < 82 ? 'MOUSTACHE'
                      : facialRoll < 92 ? 'GOATEE'
                      : 'FULL_BEARD';
    const eyeColor = pick(r, ['#000000', '#1a3a8c', '#3a6020', '#4a2010']);
    const number = isKeeper ? pick(r, [1, 12, 22, 32]) : (r() % 30) + 2;

    return {
      seed, username, isKeeper, kit, position,
      hairStyle, hairColor, skin: SKIN[skinIdx],
      facialHair, eyeColor, number,
    };
  }

  /* ── RENDER ─────────────────────────────────────────────── */

  function rect(x, y, w, h, fill) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
  }

  /**
   * Render a player as an SVG string.
   * @param {object} player — output of generatePlayer()
   * @param {object} [opts]
   * @param {number|string} [opts.size] — width in px (height auto)
   * @param {boolean} [opts.mini] — head+torso only (no shorts/legs)
   * @param {string} [opts.className] — class for the root <svg>
   */
  function renderPlayerSVG(player, opts) {
    opts = opts || {};
    const [skin, skinShade] = player.skin;
    const kit = player.kit;
    const hair = HAIR_COLORS[player.hairColor];

    let body = '';

    // hair behind head
    const hairRects = HAIR_STYLES[player.hairStyle]();
    for (const r of hairRects) body += rect(r.x, r.y, r.w, r.h, r.color || hair);

    // face + ears
    body += rect(8, 6, 8, 6, skin);
    body += rect(8, 5, 8, 1, skin);
    body += rect(7, 8, 1, 2, skinShade);
    body += rect(16, 8, 1, 2, skinShade);

    // facial hair
    const fh = FACIAL_HAIR[player.facialHair]();
    for (const r of fh) body += rect(r.x, r.y, r.w, r.h, hair);

    // eyes + brows
    body += rect(10, 8, 1, 2, player.eyeColor);
    body += rect(13, 8, 1, 2, player.eyeColor);
    body += rect(10, 7, 1, 1, hair);
    body += rect(13, 7, 1, 1, hair);

    if (player.facialHair !== 'FULL_BEARD') body += rect(11, 10, 2, 1, '#7a3322');

    // neck
    body += rect(10, 12, 4, 1, skinShade);

    // jersey body
    body += rect(6, 13, 12, 7, kit.jersey);
    body += rect(6, 13, 12, 1, kit.shade);
    body += rect(5, 14, 1, 3, kit.jersey);
    body += rect(18, 14, 1, 3, kit.jersey);

    // vertical stripes (ARG, CRO, NED_88, GK_BLACK …)
    if (kit.stripe) {
      body += rect(8,  13, 2, 7, kit.stripe);
      body += rect(14, 13, 2, 7, kit.stripe);
    }

    // horizontal band (GER_90, ENG_66, BRA_70 …) — extra bands stacked
    if (kit.band) {
      body += rect(6, kit.band.y, 12, kit.band.h, kit.band.color);
      if (kit.band.extra) for (const b of kit.band.extra) body += rect(6, b.y, 12, b.h, b.color);
    }

    // collar — defaults to a small v-neck unless 'big' (throwback)
    if (kit.collar === 'big') {
      body += rect(10, 13, 4, 2, kit.accent);
      body += rect(11, 13, 2, 1, kit.jersey); // gap so it reads as a V
    } else {
      body += rect(11, 13, 2, 1, kit.accent);
    }

    // crest
    body += rect(11, 16, 2, 2, '#000');
    body += rect(11, 16, 2, 1, kit.crest);

    // arms
    if (kit.keeper) {
      body += rect(4, 17, 2, 3, kit.jersey);
      body += rect(18, 17, 2, 3, kit.jersey);
      body += rect(4, 19, 2, 1, '#ffffff');   // gloves
      body += rect(18, 19, 2, 1, '#ffffff');
    } else {
      body += rect(5, 17, 1, 1, kit.shade);
      body += rect(18, 17, 1, 1, kit.shade);
      body += rect(4, 17, 2, 3, skin);
      body += rect(18, 17, 2, 3, skin);
    }

    // shorts + legs + socks + boots (skip in mini mode)
    if (!opts.mini) {
      body += rect(7, 20, 10, 3, kit.shorts);
      body += rect(11, 20, 2, 3, kit.shortsAccent);
      body += rect(8, 23, 3, 2, skin);
      body += rect(13, 23, 3, 2, skin);
      body += rect(8, 24, 3, 1, kit.accent);
      body += rect(13, 24, 3, 1, kit.accent);
      body += rect(7, 25, 4, 1, '#000');
      body += rect(13, 25, 4, 1, '#000');
    }

    // throwback "RETRO" stamp — tiny corner pixels on the jersey
    if (kit.throwback) {
      body += rect(15, 18, 2, 1, kit.accent);
    }

    const viewBox = opts.mini ? '3 3 18 17' : '0 0 24 26';
    const cls = opts.className || 'pixel-player';
    const sizeAttr = opts.size ? `style="width:${opts.size}px;height:auto;"` : '';
    return `<svg class="${cls}" viewBox="${viewBox}" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg" ${sizeAttr}>${body}</svg>`;
  }

  /* ── WEB COMPONENT ──────────────────────────────────────── */

  if (typeof HTMLElement !== 'undefined' && typeof customElements !== 'undefined' && !customElements.get('pixel-player')) {
    class PixelPlayerEl extends HTMLElement {
      static get observedAttributes() { return ['name', 'size', 'mini', 'kit', 'position']; }
      connectedCallback()    { this._render(); }
      attributeChangedCallback() { if (this.isConnected) this._render(); }
      _render() {
        const name = this.getAttribute('name') || 'unknown';
        const size = this.getAttribute('size');
        const mini = this.hasAttribute('mini');
        const kit = this.getAttribute('kit');
        const position = this.getAttribute('position');
        const player = generatePlayer(name, { kit: kit || undefined, position: position || undefined });
        this.innerHTML = renderPlayerSVG(player, { size, mini });
      }
    }
    customElements.define('pixel-player', PixelPlayerEl);
  }

  /* ── EXPORT ─────────────────────────────────────────────── */

  const api = {
    generatePlayer,
    renderPlayerSVG,
    hashString,
    OUTFIELD_KITS,
    KEEPER_KITS,
    ALL_KIT_KEYS,
    HAIR_STYLES: Object.fromEntries(HAIR_STYLE_KEYS.map(k => [k, k])),
    HAIR_COLORS,
    POSITIONS,
  };

  root.NRNFPixelPlayer = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;

})(typeof window !== 'undefined' ? window : globalThis);
