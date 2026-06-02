(function () {
  'use strict';

  /* ── GEOMETRY ─────────────────────────────────────────────────── */
  const U   = 90;        // vertical unit (px)
  const CW  = 126;       // card width
  const CH  = 68;        // card height
  const GAP = 28;        // horizontal gap between columns
  const COL = CW + GAP;  // column pitch: 154px
  const FW  = 168;       // final / third card width
  const BH  = U * 8;     // main bracket height: 720px
  const LBL = 22;        // column label height
  const TOT_H = LBL + BH + 110; // total height incl. third place

  // Left-side column x positions (left edge of card): [r32, r16, qf, sf]
  const Xl = [0, COL, COL*2, COL*3];
  const FX = COL * 4;   // final / third x: 616
  // Right-side column x positions: [sfr, qfr, r16r, r32r]
  const Xr = [
    FX + FW + GAP,
    FX + FW + GAP + COL,
    FX + FW + GAP + COL*2,
    FX + FW + GAP + COL*3,
  ];
  const TOT_W = Xr[3] + CW;

  // Y center for slot i in a column of N slots (relative to bracket area start)
  function yc(N, i) {
    const step = BH / N;
    return step * i + step / 2;
  }

  /* ── WK 2026 R32 FIXED MATCHUPS ────────────────────────────── */
  const R32_LABELS = {
    1:  ['A1',    'B2'],   2:  ['C1',    'D2'],
    3:  ['E1',    'F2'],   4:  ['G1',    'H2'],
    5:  ['I1',    'J2'],   6:  ['K1',    'L2'],
    7:  ['Nr3-1', ''],     8:  ['Nr3-2', ''],
    9:  ['B1',    'A2'],   10: ['D1',    'C2'],
    11: ['F1',    'E2'],   12: ['H1',    'G2'],
    13: ['J1',    'I2'],   14: ['L1',    'K2'],
    15: ['Nr3-3', ''],     16: ['Nr3-4', ''],
  };

  /* ── SCALE STATE ─────────────────────────────────────────────── */
  let _lastScale = 0;
  let _ro = null;

  /* ── CSS ──────────────────────────────────────────────────────── */
  function injectCSS() {
    const s = document.createElement('style');
    s.textContent = `
#bracket-view{display:none;overflow:hidden}
@media(min-width:900px){
  #bracket-view.bkt-visible{
    display:flex;justify-content:center;align-items:center;margin-top:8px;
    width:100%;max-width:100vw;overflow-x:auto;
  }
  #tournament-view.bracket-active{display:none!important}
}
.bkt-inner{position:relative;transform-origin:top left}
.bkt-card{
  position:absolute;border:2px solid var(--border);background:var(--bg2);
  box-sizing:border-box;padding:4px 5px;cursor:pointer;overflow:hidden;
  display:flex;flex-direction:column;justify-content:space-between;
  transition:border-color .12s;box-shadow:2px 2px 0 #000;
}
.bkt-card:hover{border-color:var(--purple-light)!important;background:var(--bg3)}
.bkt-played{background:var(--bg3)}
.bkt-ht,.bkt-at{
  font-family:var(--oswald);font-weight:700;font-size:11px;color:var(--white);
  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.2;
}
.bkt-vs{
  font-family:var(--pixel);font-size:5px;color:var(--muted);
  text-align:center;line-height:1;flex-shrink:0;
}
.bkt-win{
  font-family:var(--pixel);font-size:5px;color:var(--green);
  text-align:center;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;line-height:1.4;
}
.bkt-date{
  font-family:var(--vt);font-size:11px;color:var(--muted);
  text-align:center;line-height:1.2;
}
.bkt-tbd{color:var(--muted);font-family:var(--pixel);font-size:6px}
`;
    document.head.appendChild(s);
  }

  /* ── SCALING ──────────────────────────────────────────────────── */
  function applyScale() {
    const bv = document.getElementById('bracket-view');
    if (!bv) return;
    const inner = bv.querySelector('.bkt-inner');
    if (!inner) return;
    const avail = document.documentElement.clientWidth;
    if (!avail) return;
    const scale = Math.min(1, avail / TOT_W);
    if (scale === _lastScale) return;
    _lastScale = scale;
    inner.style.transform = scale < 1 ? `scale(${scale})` : '';
    bv.style.height = Math.ceil(TOT_H * scale) + 'px';
  }

  function setupRO() {
    if (!window.ResizeObserver || _ro) return;
    const bv = document.getElementById('bracket-view');
    if (!bv) return;
    _ro = new ResizeObserver(applyScale);
    _ro.observe(document.documentElement);
  }

  /* ── DATA HELPERS ──────────────────────────────────────────── */
  function gm(phase, pos) {
    return (window.matches || []).find(m => m.phase === phase && m.bracket_pos === pos) || null;
  }

  function winTeam(m) {
    if (!m || !m.result) return null;
    if (m.result === 'home') return m.home_team;
    if (m.result === 'away') return m.away_team;
    return null;
  }

  function isPlaceholder(t) {
    return !t || /^(1st|2nd|3rd|Best)\s/.test(t);
  }

  // t = team name from DB; fallback = short label like 'A1' when t is empty/placeholder
  function td(t, fallback) {
    if (isPlaceholder(t)) {
      const lbl = fallback || '';
      return lbl
        ? `<span class="bkt-tbd">${lbl}</span>`
        : '<span class="bkt-tbd">TBD</span>';
    }
    const short = (window.teamShort || {})[t] || t;
    if (window.crestImg) return `${window.crestImg(t, 16)}&nbsp;${short}`;
    const f = window.flag ? window.flag(t) : '';
    return `${f ? f + '&nbsp;' : ''}${short}`;
  }

  function dateShort(k) {
    if (!k) return '';
    try {
      return new Date(k).toLocaleDateString('nl-NL', {
        timeZone: 'Europe/Amsterdam', day: 'numeric', month: 'short',
      });
    } catch (e) { return ''; }
  }

  /* ── CLICK HANDLER ─────────────────────────────────────────── */
  window._bktClick = function (phase) {
    const tabBtn = document.querySelector('.tab[onclick*="\'tips\'"]');
    const phBtn  = document.querySelector(`.phase-tab[onclick*="'${phase}'"]`);
    if (tabBtn) window.showTab('tips', tabBtn);
    if (phBtn)  window.filterPhase(phase, phBtn);
  };

  /* ── CARD HTML ─────────────────────────────────────────────── */
  function card(m, x, y, w, phase, isFinal, fallback) {
    const played = m && m.result;
    const win    = winTeam(m);
    const fb = fallback || ['', ''];
    const ht = td(m && m.home_team, fb[0]);
    const at = td(m && m.away_team, fb[1]);

    let bottom = '';
    if (win) {
      const ws = (window.teamShort || {})[win] || win;
      bottom = `<div class="bkt-win">&#9658; ${ws}</div>`;
    } else if (m && m.kickoff) {
      bottom = `<div class="bkt-date">${dateShort(m.kickoff)}</div>`;
    }

    const bc = isFinal && played ? 'var(--yellow)'
             : played            ? 'var(--green)'
             :                     'var(--border)';

    return `<div class="bkt-card${played ? ' bkt-played' : ''}"
      style="left:${x}px;top:${y}px;width:${w}px;height:${CH}px;border-color:${bc}"
      onclick="window._bktClick('${phase}')">
      <div class="bkt-ht">${ht}</div>
      <div class="bkt-vs">VS</div>
      <div class="bkt-at">${at}</div>
      ${bottom}
    </div>`;
  }

  /* ── SVG CONNECTORS ────────────────────────────────────────── */
  function buildSVG(yOff) {
    const sc = '#5500aa';
    const sw = '1.5';
    let ps = [];

    function p(d) { ps.push(`<path d="${d}" stroke="${sc}" stroke-width="${sw}" fill="none"/>`); }

    // Left side: child right edge → midX → vertical → parent left edge
    function connL(nChild, nPar, xChild, xPar) {
      const midX = xChild + CW + GAP / 2;
      for (let i = 0; i < nPar; i++) {
        const y1 = yOff + yc(nChild, i * 2);
        const y2 = yOff + yc(nChild, i * 2 + 1);
        const yp = yOff + yc(nPar, i);
        p(`M${xChild+CW},${y1} H${midX}`);
        p(`M${xChild+CW},${y2} H${midX}`);
        p(`M${midX},${y1} V${y2}`);
        p(`M${midX},${yp} H${xPar}`);
      }
    }

    // Right side: child left edge ← midX ← vertical ← parent right edge
    function connR(nChild, nPar, xChild, xPar) {
      const midX = xPar + CW + GAP / 2;
      for (let i = 0; i < nPar; i++) {
        const y1 = yOff + yc(nChild, i * 2);
        const y2 = yOff + yc(nChild, i * 2 + 1);
        const yp = yOff + yc(nPar, i);
        p(`M${xChild},${y1} H${midX}`);
        p(`M${xChild},${y2} H${midX}`);
        p(`M${midX},${y1} V${y2}`);
        p(`M${midX},${yp} H${xPar+CW}`);
      }
    }

    // Left: R32→R16→QF→SF→Final
    connL(8, 4, Xl[0], Xl[1]);
    connL(4, 2, Xl[1], Xl[2]);
    connL(2, 1, Xl[2], Xl[3]);
    const sfY = yOff + yc(1, 0);
    p(`M${Xl[3]+CW},${sfY} H${FX}`);

    // Right: R32→R16→QF→SF→Final (mirrored)
    connR(8, 4, Xr[3], Xr[2]);
    connR(4, 2, Xr[2], Xr[1]);
    connR(2, 1, Xr[1], Xr[0]);
    p(`M${Xr[0]},${sfY} H${FX+FW}`);

    return `<svg style="position:absolute;top:0;left:0;width:${TOT_W}px;height:${TOT_H}px;pointer-events:none;overflow:visible">${ps.join('')}</svg>`;
  }

  /* ── COLUMN LABEL ──────────────────────────────────────────── */
  function lbl(text, x, w) {
    return `<div style="position:absolute;top:0;left:${x}px;width:${w}px;text-align:center;font-family:var(--pixel);font-size:6px;color:var(--muted);letter-spacing:.12em">${text}</div>`;
  }

  /* ── RENDER ────────────────────────────────────────────────── */
  function renderBracket() {
    const el = document.getElementById('bracket-view');
    if (!el) return;

    _lastScale = 0; // force recalculation after re-render

    const Y = LBL;

    let h = `<div class="bkt-inner" style="width:${TOT_W}px;height:${TOT_H}px">`;

    // Column labels
    h += lbl('R32',    Xl[0], CW);
    h += lbl('R16',    Xl[1], CW);
    h += lbl('QF',     Xl[2], CW);
    h += lbl('SF',     Xl[3], CW);
    h += lbl('FINALE', FX,    FW);
    h += lbl('SF',     Xr[0], CW);
    h += lbl('QF',     Xr[1], CW);
    h += lbl('R16',    Xr[2], CW);
    h += lbl('R32',    Xr[3], CW);

    // Left R32 (bracket_pos 1–8)
    for (let i = 0; i < 8; i++) {
      const pos = i + 1;
      h += card(gm('r32', pos), Xl[0], Y + yc(8,i) - CH/2, CW, 'r32', false, R32_LABELS[pos]);
    }
    // Left R16 (bracket_pos 1–4)
    for (let i = 0; i < 4; i++) {
      h += card(gm('r16', i+1), Xl[1], Y + yc(4,i) - CH/2, CW, 'r16', false);
    }
    // Left QF (bracket_pos 1–2)
    for (let i = 0; i < 2; i++) {
      h += card(gm('qf', i+1), Xl[2], Y + yc(2,i) - CH/2, CW, 'qf', false);
    }
    // Left SF (bracket_pos 1)
    h += card(gm('sf', 1), Xl[3], Y + yc(1,0) - CH/2, CW, 'sf', false);

    // Final (bracket_pos 1)
    h += card(gm('final', 1), FX, Y + yc(1,0) - CH/2, FW, 'final', true);

    // Third place label + card
    const thY = Y + BH + 28;
    h += `<div style="position:absolute;left:${FX}px;top:${thY-14}px;width:${FW}px;text-align:center;font-family:var(--pixel);font-size:5px;color:var(--muted);letter-spacing:.12em">3E PLAATS</div>`;
    h += card(gm('third', 1), FX, thY, FW, 'third', false);

    // Right SF (bracket_pos 2)
    h += card(gm('sf', 2), Xr[0], Y + yc(1,0) - CH/2, CW, 'sf', false);
    // Right QF (bracket_pos 3–4)
    for (let i = 0; i < 2; i++) {
      h += card(gm('qf', i+3), Xr[1], Y + yc(2,i) - CH/2, CW, 'qf', false);
    }
    // Right R16 (bracket_pos 5–8)
    for (let i = 0; i < 4; i++) {
      h += card(gm('r16', i+5), Xr[2], Y + yc(4,i) - CH/2, CW, 'r16', false);
    }
    // Right R32 (bracket_pos 9–16)
    for (let i = 0; i < 8; i++) {
      const pos = i + 9;
      h += card(gm('r32', pos), Xr[3], Y + yc(8,i) - CH/2, CW, 'r32', false, R32_LABELS[pos]);
    }

    // SVG connector lines
    h += buildSVG(Y);

    h += '</div>';
    el.innerHTML = h;
    applyScale();
  }

  /* ── OVERRIDE renderTournament ─────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    injectCSS();
    setupRO();

    const _orig = window.renderTournament;
    window.renderTournament = function () {
      _orig.call(window);
      const toernooiSection = document.getElementById('sec-toernooi');
      const isTournamentActive = toernooiSection && toernooiSection.classList.contains('active');
      const koBtn = document.querySelector('#sec-toernooi .phase-tab[onclick*="\'ko\'"]');
      const isKO  = koBtn && koBtn.classList.contains('active');
      const tv = document.getElementById('tournament-view');
      const bv = document.getElementById('bracket-view');
      if (isTournamentActive && isKO) {
        if (tv) tv.classList.add('bracket-active');
        if (bv) { bv.classList.add('bkt-visible'); renderBracket(); }
      } else {
        if (tv) tv.classList.remove('bracket-active');
        if (bv) bv.classList.remove('bkt-visible');
      }
    };
  });

})();
