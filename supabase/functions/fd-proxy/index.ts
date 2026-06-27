// ============================================================
// NO RISK NO FUN 2026 — football-data.org EDGE FUNCTION
// (gedeployd als slug 'swift-function' — zie FD-module const FN in index.html)
// ------------------------------------------------------------
// Twee modi (POST body):
//   { path: "/competitions/WC/..." }  → PROXY (browser-import; football-data
//        staat browser-CORS alleen toe vanaf http://localhost, vandaar serverside).
//   { mode: "sync", secret?: "..." }  → ONBEWAAKTE LIVE-SYNC (pg_cron, elke minuut):
//        leest onze matches, checkt of er een wedstrijd live is (anders stop,
//        geen football-data call), haalt uitslagen op, schrijft scores/result,
//        schuift de bracket door en draait recalc_streaks/recalc_day_wins.
//
// De football-data key komt uit settings (key='fd_api_key') of secret FD_API_KEY.
// DB-toegang via SERVICE_ROLE (server-side, omzeilt RLS).
//
// Deploy MET JWT-verificatie UIT:
//   supabase functions deploy <slug> --no-verify-jwt
//   (anders 401 op de CORS-preflight)
// Optioneel: zet secret CRON_SECRET zodat alleen de cron 'mode:sync' mag triggeren.
// ============================================================

const FD_BASE = "https://api.football-data.org/v4";
const DB = Deno.env.get("SUPABASE_URL");
const SRV = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// football-data naam → onze canonieke naam (= matches.home_team/away_team)
const NAME_ALIAS: Record<string, string> = {
  "Côte d'Ivoire": "Ivory Coast", "Cote d'Ivoire": "Ivory Coast", "Korea Republic": "South Korea",
  "IR Iran": "Iran", "United States": "USA", "Czechia": "Czech Republic", "Curaçao": "Curacao",
  "Türkiye": "Turkey", "Cabo Verde": "Cape Verde", "Cape Verde Islands": "Cape Verde",
  "Congo DR": "DR Congo", "Bosnia-Herzegovina": "Bosnia",
};
const canon = (n?: string | null) => (n ? (NAME_ALIAS[n] || n) : null);
const STAGE_PHASE: Record<string, string> = {
  GROUP_STAGE: "group", LAST_32: "r32", LAST_16: "r16",
  QUARTER_FINALS: "qf", SEMI_FINALS: "sf", THIRD_PLACE: "third", FINAL: "final",
};

async function getKey(): Promise<string> {
  const envKey = Deno.env.get("FD_API_KEY");
  if (envKey) return envKey;
  if (!DB || !SRV) return "";
  const r = await fetch(`${DB}/rest/v1/settings?key=eq.fd_api_key&select=value`, {
    headers: { apikey: SRV, Authorization: `Bearer ${SRV}` },
  });
  if (!r.ok) return "";
  const rows = await r.json();
  return rows?.[0]?.value || "";
}

// ── DB helpers (service role) ──
const dbHeaders = { apikey: SRV, Authorization: `Bearer ${SRV}`, "Content-Type": "application/json" };
async function dbGet(qs: string): Promise<any[]> {
  const r = await fetch(`${DB}/rest/v1/${qs}`, { headers: dbHeaders });
  if (!r.ok) throw new Error("db get " + r.status);
  return r.json();
}
async function dbPatch(qs: string, body: unknown) {
  const r = await fetch(`${DB}/rest/v1/${qs}`, {
    method: "PATCH", headers: { ...dbHeaders, Prefer: "return=minimal" }, body: JSON.stringify(body),
  });
  if (!r.ok) throw new Error("db patch " + r.status + " " + (await r.text()));
}
async function rpc(name: string) {
  const r = await fetch(`${DB}/rest/v1/rpc/${name}`, { method: "POST", headers: dbHeaders, body: "{}" });
  if (!r.ok) throw new Error("rpc " + name + " " + r.status);
}
async function setSetting(key: string, value: string) {
  await fetch(`${DB}/rest/v1/settings`, {
    method: "POST",
    headers: { ...dbHeaders, Prefer: "resolution=merge-duplicates,return=minimal" },
    body: JSON.stringify({ key, value, updated_at: new Date().toISOString() }),
  });
}
async function delSetting(key: string) {
  await fetch(`${DB}/rest/v1/settings?key=eq.${key}`, { method: "DELETE", headers: { ...dbHeaders, Prefer: "return=minimal" } });
}

// ── ODDS (the-odds-api) ──────────────────────────────────────
// Geplande odds-fetch, server-side (pg_cron). De-odds-api dekt GEEN friendlies,
// dus warmup wordt overgeslagen. Kost per call = markten × regio's = h2h × eu = 1 credit.
const ODDS_BASE = "https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds/";

async function getOddsKey(): Promise<string> {
  const envKey = Deno.env.get("ODDS_API_KEY");
  if (envKey) return envKey;
  if (!DB || !SRV) return "";
  const r = await fetch(`${DB}/rest/v1/settings?key=eq.odds_api_key&select=value`, {
    headers: { apikey: SRV, Authorization: `Bearer ${SRV}` },
  });
  if (!r.ok) return "";
  const rows = await r.json();
  return rows?.[0]?.value || "";
}

// 1 API-call (1 credit): haalt ALLE door de-odds-api geliste WK-wedstrijden op en
// schrijft kansen (%) weg naar ELKE matchende rij in matches — niet beperkt tot de
// ronde die de fetch triggert. Dus de R1-fetch vult meteen ook R2/R3 (en latere
// rondes) als de bookmakers die al genoteerd hebben. Kosten blijven 1 credit,
// ongeacht het aantal teruggegeven wedstrijden. Richtingsgevoelig gemapt op home/away.
async function fetchOdds(M: any[], region = "eu", frozen: Set<number> = new Set()): Promise<{ ok?: boolean; count?: number; ids?: number[]; error?: string }> {
  const key = await getOddsKey();
  if (!key) return { error: "geen odds_api_key" };
  const res = await fetch(`${ODDS_BASE}?apiKey=${key}&regions=${region}&markets=h2h&oddsFormat=decimal`);
  if (!res.ok) return { error: "the-odds-api " + res.status };
  const data = await res.json();
  if (!Array.isArray(data)) return { error: "onverwacht antwoord" };
  let count = 0;
  const ids: number[] = [];
  for (const ev of data) {
    const home = canon(ev.home_team), away = canon(ev.away_team);
    if (!home || !away) continue;
    const market = ev.bookmakers?.[0]?.markets?.find((x: any) => x.key === "h2h");
    const outs = market?.outcomes || [];
    const priceOf = (n: string) => outs.find((o: any) => o.name === n)?.price;
    const hP = 1 / (priceOf(ev.home_team) || 3);
    const dP = 1 / (priceOf("Draw") || 4);
    const aP = 1 / (priceOf(ev.away_team) || 3);
    const tot = hP + dP + aP;
    const our = M.find((m) =>
      (m.home_team === home && m.away_team === away) || (m.home_team === away && m.away_team === home));
    if (!our) continue;
    if (frozen.has(our.id)) continue; // bevroren (binnen 48u) → odds NOOIT meer overschrijven
    const homeAligned = our.home_team === home; // onze home == de-odds-api home?
    await dbPatch(`matches?id=eq.${our.id}`, {
      home_odds: Math.round((homeAligned ? hP : aP) / tot * 100),
      draw_odds: Math.round(dP / tot * 100),
      away_odds: Math.round((homeAligned ? aP : hP) / tot * 100),
      odds_set: true, // echte odds opgehaald → frontend mag % + punten tonen
    });
    count++; ids.push(our.id);
  }
  return { ok: true, count, ids };
}

// Auto-modus: per WEDSTRIJD, bevriezen op EXACT 48u (cron draait elke minuut).
// Een wedstrijd moet bevroren worden zodra die (a) binnen 48u start, (b) geen uitslag
// heeft, (c) geen warmup is, (d) BEKENDE teams heeft (placeholders "1st Group A"/
// "Winner M73"/"Best 3rd …" overslaan — daar is nog geen markt voor) en (e) nog niet
// bevroren is. Bevriezen = verse odds ophalen (1 /odds-call vult meteen ÁLLE niet-
// bevroren wedstrijden) en dan de FREEZE-guard 'odds_frozen_m<id>' zetten. Vanaf dat
// moment slaat fetchOdds die wedstrijd over → de odds liggen vast en zijn voor alle
// spelers gelijk (de scoring rekent op match-odds, dus op exact deze 48u-odds).
//   • Precisie: bevroren op de eerste minuut ná 48u → ~exact 48u.
//   • Uitstel: schuift een bevroren wedstrijd weer >48u weg, dan wordt de freeze
//     ongedaan gemaakt (guard verwijderd) → odds bewegen weer mee en bevriezen
//     opnieuw op het nieuwe 48u-moment.
//   • VOORLOPIG OPHALEN (>48u): zodra een wedstrijd bekende teams heeft maar nog de
//     default-odds (33/34/33) draagt, halen we METEEN echte odds op — niet wachten tot
//     48u. Zo verdwijnt de verwarrende 33/34/33 zodra de teams bekend zijn. Daarna
//     bewegen die voorlopige odds nog mee op een rustige cadans (6u) tot hún 48u-freeze.
//   • Overlappende/gespreide KO-rondes komen pas in beeld zodra hun teams bekend zijn.
//   • Bookmaker heeft de markt nog niet? Niet bevriezen; throttled retry (max 1 call/
//     30 min via 'odds_fetch_lock') i.p.v. elke minuut → geen credit-verbranding.
//   • Niets te bevriezen én niets voorlopig op te halen → geen externe call → 0 credits.
// force=true negeert alles (handmatig/test): haalt nu op (zonder bevroren te raken),
// zet geen freeze-guards.
async function doOddsAuto(force = false, region = "eu") {
  const M = await dbGet("matches?select=*");
  const now = Date.now();
  const WINDOW = 48 * 3_600_000;
  const THROTTLE = 30 * 60_000; // min. tijd tussen retries voor nog-niet-geliste wedstrijden
  const PROV_THROTTLE = 6 * 3_600_000; // rustige cadans voor voorlopig verversen (>48u, al echte odds)
  const PLACEHOLDER = /^(1st|2nd|3rd|Best|Winner|Loser)\b/i;
  const teamsKnown = (m: any) => m.home_team && m.away_team && !PLACEHOLDER.test(m.home_team) && !PLACEHOLDER.test(m.away_team);

  // Reeds bevroren wedstrijden (freeze-guard bestaat) — die blijven onaangeroerd.
  const guards = await dbGet(`settings?key=like.odds_frozen_m*&select=key`);
  const frozen = new Set<number>(guards.map((g: any) => +g.key.replace("odds_frozen_m", "")).filter((n: number) => !isNaN(n)));

  // ONTDOOIEN: een bevroren wedstrijd die (door uitstel) weer >48u weg is → freeze eraf.
  // De odds mogen dan weer bewegen en bevriezen opnieuw op het nieuwe 48u-moment.
  let thawed = 0;
  for (const m of M) {
    if (!frozen.has(m.id) || m.result || !m.kickoff) continue;
    if ((new Date(m.kickoff).getTime() - now) > WINDOW) {
      await delSetting(`odds_frozen_m${m.id}`);
      frozen.delete(m.id); thawed++;
    }
  }

  if (force) {
    const r = await fetchOdds(M, region, frozen);
    if (r.error) return { error: r.error };
    return { ok: true, updated: r.count, thawed, forced: true };
  }

  // Te bevriezen: binnen 48u, bekende teams, geen uitslag/warmup, nog niet bevroren.
  const toFreeze = M.filter((m) => {
    if (m.phase === "warmup" || m.result || !m.kickoff || !teamsKnown(m) || frozen.has(m.id)) return false;
    const k = new Date(m.kickoff).getTime();
    return k > now && (k - now) <= WINDOW;
  });

  // Voorlopig (>48u vóór aftrap): bekende teams, geen uitslag/warmup, niet bevroren.
  // Deze krijgen ECHTE odds zodra hun teams bekend zijn (i.p.v. 33/34/33 te blijven tonen
  // tot 48u). 'seedNeeded' = er staat nog een voorlopige wedstrijd zónder odds_set open →
  // die is net bekend geworden en moet nu meteen verse odds krijgen.
  const provisional = M.filter((m) => {
    if (m.phase === "warmup" || m.result || !m.kickoff || !teamsKnown(m) || frozen.has(m.id)) return false;
    return (new Date(m.kickoff).getTime() - now) > WINDOW;
  });
  const seedNeeded = provisional.some((m) => !m.odds_set);

  if (!toFreeze.length && !provisional.length) return { skipped: true, reason: "niets te bevriezen/voorlopig op te halen", thawed };

  // Cadans van de externe call:
  //  • justCrossed (binnen 48u, net over de grens) → meteen (verse 48u-odd).
  //  • due-binnen-48u zonder markt, óf net-bekend-geworden voorlopige wedstrijd
  //    (default-odds) → 30-min throttle: snel echte odds, maar geen credit-burn.
  //  • puur voorlopig verversen (al echte odds, >48u) → 6u throttle: odds bewegen mee
  //    met minimale credits.
  const justCrossed = toFreeze.some((m) => (new Date(m.kickoff).getTime() - now) / 3_600_000 > 48 - 2 / 60);
  const cadence = (toFreeze.length || seedNeeded) ? THROTTLE : PROV_THROTTLE;
  let throttleOk = true;
  const lock = await dbGet(`settings?key=eq.odds_fetch_lock&select=value`);
  if (lock.length && lock[0].value) throttleOk = (now - new Date(lock[0].value).getTime()) > cadence;
  if (!justCrossed && !throttleOk) return { skipped: true, reason: "wacht op throttle" };

  const r = await fetchOdds(M, region, frozen);
  if (r.error) return { error: r.error };
  await setSetting("odds_fetch_lock", new Date().toISOString());
  // Bevries elke due-wedstrijd die nu odds kreeg (bookmaker had een markt). Niet-geliste
  // wedstrijden blijven open → throttled retry tot ze er wel zijn.
  const filled = new Set(r.ids || []);
  let froze = 0;
  for (const m of toFreeze) if (filled.has(m.id)) { await setSetting(`odds_frozen_m${m.id}`, `${m.kickoff}|${m.home_team}|${m.away_team}`); froze++; }
  return { ok: true, dueCount: toFreeze.length, provCount: provisional.length, updated: r.count, froze, thawed, seeded: seedNeeded };
}

// ── Bracket-logica (port van index.html updateBracket/calcGroupStandings) ──
function calcGroupStandings(M: any[], g: string) {
  const gm = M.filter((m) => m.phase === "group" && m.group_name === g && m.result);
  const teams: Record<string, any> = {};
  for (const m of gm) {
    for (const t of [m.home_team, m.away_team]) if (!teams[t]) teams[t] = { name: t, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0 };
    const hs = m.home_score || 0, as = m.away_score || 0;
    teams[m.home_team].p++; teams[m.away_team].p++;
    teams[m.home_team].gf += hs; teams[m.home_team].ga += as;
    teams[m.away_team].gf += as; teams[m.away_team].ga += hs;
    if (m.result === "home") { teams[m.home_team].w++; teams[m.home_team].pts += 3; teams[m.away_team].l++; }
    else if (m.result === "away") { teams[m.away_team].w++; teams[m.away_team].pts += 3; teams[m.home_team].l++; }
    else { teams[m.home_team].d++; teams[m.home_team].pts += 1; teams[m.away_team].d++; teams[m.away_team].pts += 1; }
  }
  return Object.values(teams).sort((a: any, b: any) => b.pts - a.pts || (b.gf - b.ga) - (a.gf - a.ga) || b.gf - a.gf);
}

async function updateBracket(M: any[]) {
  const patch = async (m: any, nh: string, na: string) => {
    if (nh !== m.home_team || na !== m.away_team) { await dbPatch(`matches?id=eq.${m.id}`, { home_team: nh, away_team: na }); m.home_team = nh; m.away_team = na; }
  };
  // Stap 1: groepswinnaars/nummers 2 in R32
  const groupNames = [...new Set(M.filter((m) => m.phase === "group" && m.group_name).map((m) => m.group_name))].sort();
  const gr: Record<string, { first?: string; second?: string }> = {};
  for (const g of groupNames) {
    // Pas vullen als de groep VOLLEDIG gespeeld is — anders schuift een tussenstand
    // (incl. nog-niet-gespeelde ronde 3) verkeerde teams de R32 in.
    const gm = M.filter((m) => m.phase === "group" && m.group_name === g);
    if (gm.length > 0 && gm.every((m) => m.result)) {
      const s = calcGroupStandings(M, g) as any[];
      gr[g] = { first: s[0]?.name, second: s[1]?.name };
    }
  }
  for (const m of M.filter((m) => m.phase === "r32")) {
    let nh = m.home_team, na = m.away_team;
    for (const g of groupNames) {
      if (!gr[g]) continue;
      if (m.home_team === `1st Group ${g}`) nh = gr[g].first || nh;
      if (m.home_team === `2nd Group ${g}`) nh = gr[g].second || nh;
      if (m.away_team === `1st Group ${g}`) na = gr[g].first || na;
      if (m.away_team === `2nd Group ${g}`) na = gr[g].second || na;
    }
    await patch(m, nh, na);
  }
  // Stap 2: KO winnaars/verliezers doorschuiven
  const winMap: Record<number, string> = {}, losMap: Record<number, string> = {};
  for (const m of M.filter((m) => m.result && ["r32", "r16", "qf", "sf"].includes(m.phase))) {
    winMap[m.match_number] = m.result === "home" ? m.home_team : m.away_team;
    losMap[m.match_number] = m.result === "home" ? m.away_team : m.home_team;
  }
  const phMap: Record<string, string> = { R32: "r32", R16: "r16", QF: "qf", SF: "sf" };
  for (const m of M.filter((m) => ["r16", "qf", "sf", "third", "final"].includes(m.phase) && !m.result)) {
    let nh = m.home_team, na = m.away_team;
    const hWM = m.home_team?.match(/^Winner M(\d+)$/), aWM = m.away_team?.match(/^Winner M(\d+)$/);
    if (hWM && winMap[+hWM[1]]) nh = winMap[+hWM[1]];
    if (aWM && winMap[+aWM[1]]) na = winMap[+aWM[1]];
    const hLM = m.home_team?.match(/^Loser M(\d+)$/), aLM = m.away_team?.match(/^Loser M(\d+)$/);
    if (hLM && losMap[+hLM[1]]) nh = losMap[+hLM[1]];
    if (aLM && losMap[+aLM[1]]) na = losMap[+aLM[1]];
    const hRP = m.home_team?.match(/^Winner (R32|R16|QF|SF)-(\d+)$/i), aRP = m.away_team?.match(/^Winner (R32|R16|QF|SF)-(\d+)$/i);
    if (hRP) { const s = M.find((x) => x.phase === phMap[hRP[1].toUpperCase()] && x.bracket_pos === +hRP[2] && x.result); if (s) nh = s.result === "home" ? s.home_team : s.away_team; }
    if (aRP) { const s = M.find((x) => x.phase === phMap[aRP[1].toUpperCase()] && x.bracket_pos === +aRP[2] && x.result); if (s) na = s.result === "home" ? s.home_team : s.away_team; }
    const hLS = m.home_team?.match(/^Loser SF-(\d+)$/i), aLS = m.away_team?.match(/^Loser SF-(\d+)$/i);
    if (hLS) { const s = M.find((x) => x.phase === "sf" && x.bracket_pos === +hLS[1] && x.result); if (s) nh = s.result === "home" ? s.away_team : s.home_team; }
    if (aLS) { const s = M.find((x) => x.phase === "sf" && x.bracket_pos === +aLS[1] && x.result); if (s) na = s.result === "home" ? s.away_team : s.home_team; }
    await patch(m, nh, na);
  }
}

// Vult de "Best 3rd ..."-slots in R32 vanuit football-data's R32-opstelling (anker = bekend team).
function isPlaceholderName(s: string) { return !s || /^(1st|2nd|3rd|Best)\s/i.test(s); }
async function fillThirds(fmatches: any[], M: any[]) {
  const fdR32 = fmatches.filter((f) => STAGE_PHASE[f.stage] === "r32" && f.homeTeam?.name && f.awayTeam?.name);
  if (!fdR32.length) return 0;
  let n = 0;
  for (const m of M.filter((x) => x.phase === "r32")) {
    const hP = isPlaceholderName(m.home_team), aP = isPlaceholderName(m.away_team);
    if (hP === aP) continue;
    const anchor = hP ? m.away_team : m.home_team;
    const f = fdR32.find((x) => canon(x.homeTeam.name) === anchor || canon(x.awayTeam.name) === anchor);
    if (!f) continue;
    const opp = canon(f.homeTeam.name) === anchor ? canon(f.awayTeam.name) : canon(f.homeTeam.name);
    if (!opp || opp === anchor) continue;
    const upd = hP ? { home_team: opp } : { away_team: opp };
    await dbPatch(`matches?id=eq.${m.id}`, upd);
    Object.assign(m, upd); n++;
  }
  return n;
}

// ── Onbewaakte live-sync ──
async function doSync() {
  const M = await dbGet("matches?select=*");
  const now = Date.now();
  const live = M.some((m) => {
    if (m.phase === "warmup" || m.result || !m.kickoff) return false;
    const k = new Date(m.kickoff).getTime();
    return k <= now && (now - k) < 3 * 3600 * 1000; // afgetrapt, binnen 3u, geen uitslag
  });
  // Ook syncen als er KO-slots zijn waarvan de teams nog niet bekend zijn — football-data
  // kan ze inmiddels gevuld hebben. FD-calls zijn gratis binnen de rate-limit (10/min), dus
  // elke minuut mag.
  const KO = ["r32", "r16", "qf", "sf", "third", "final"];
  const PH = /^(1st|2nd|3rd|Best|Winner|Loser)\b/i;
  const koTeamsPending = M.some((m) => KO.includes(m.phase) && !m.result && (PH.test(m.home_team || "") || PH.test(m.away_team || "")));
  if (!live && !koTeamsPending) return { skipped: true, reason: "niets te doen" };

  const key = await getKey();
  if (!key) return { error: "geen fd_api_key" };
  const res = await fetch(`${FD_BASE}/competitions/WC/matches`, { headers: { "X-Auth-Token": key } });
  if (!res.ok) return { error: "football-data " + res.status };
  const fmatches = (await res.json()).matches || [];

  // Koppelen op fd_match_id (de bron van waarheid). Vervangt het matchen op teampaar.
  const byFd = new Map<number, any>(M.filter((m: any) => m.fd_match_id != null).map((m: any) => [m.fd_match_id, m]));
  // Canonieke placeholder-labels per (fase, bracket_pos) — bepaalt of de bron al klaar is.
  const bs = await dbGet("bracket_slots?select=phase,slot,home_label,away_label");
  const slotLabels = new Map<string, any>(bs.map((r: any) => [`${r.phase}:${r.slot}`, r]));
  // Is de bron van een placeholder definitief? Pas dán nemen we het FD-team over (zo grijpen
  // we geen door FD geprojecteerde, nog niet besliste teams).
  const groupComplete = (g: string) => { const gm = M.filter((m: any) => m.phase === "group" && m.group_name === g); return gm.length > 0 && gm.every((m: any) => m.result); };
  const sourceFinal = (label: string): boolean => {
    if (!label) return false; let m;
    if (m = label.match(/^(?:1st|2nd) Group (.+)$/)) return groupComplete(m[1]);
    if (/^Best 3rd/i.test(label)) { const gm = M.filter((x: any) => x.phase === "group"); return gm.length > 0 && gm.every((x: any) => x.result); }
    if (m = label.match(/^Winner M(\d+)$/i)) { const s = M.find((x: any) => x.match_number === +m[1]); return !!(s && s.result); }
    const ph: Record<string, string> = { R32: "r32", R16: "r16", QF: "qf", SF: "sf" };
    if (m = label.match(/^Winner (R32|R16|QF|SF)-(\d+)$/i)) { const s = M.find((x: any) => x.phase === ph[m[1].toUpperCase()] && x.bracket_pos === +m[2]); return !!(s && s.result); }
    if (m = label.match(/^Loser SF-(\d+)$/i)) { const s = M.find((x: any) => x.phase === "sf" && x.bracket_pos === +m[1]); return !!(s && s.result); }
    return false;
  };
  let newResults = 0, liveUpdates = 0, teamFills = 0;
  for (const fm of fmatches) {
    const our = byFd.get(fm.id);
    if (!our) continue;
    const ft = fm.score?.fullTime;
    const home = canon(fm.homeTeam?.name), away = canon(fm.awayTeam?.name);

    // KO-teams: bron definitief (groep volledig gespeeld / voedende KO-wedstrijd heeft
    // uitslag) → FD-team overnemen. Bron NIET definitief → slot hoort placeholder te zijn,
    // dus terugzetten (ruimt door FD geprojecteerde teams op). Flikker-vrij want bron-status
    // loopt alleen vooruit. Live/afgelopen nooit terugzetten. Vervangt updateBracket/fillThirds.
    if (KO.includes(our.phase)) {
      const lbl = slotLabels.get(`${our.phase}:${our.bracket_pos}`) || {};
      const tu: any = {};
      if (sourceFinal(lbl.home_label)) { if (home && home !== our.home_team) tu.home_team = home; }
      else if (!our.result && lbl.home_label && our.home_team !== lbl.home_label) tu.home_team = lbl.home_label;
      if (sourceFinal(lbl.away_label)) { if (away && away !== our.away_team) tu.away_team = away; }
      else if (!our.result && lbl.away_label && our.away_team !== lbl.away_label) tu.away_team = lbl.away_label;
      if (Object.keys(tu).length) { await dbPatch(`matches?id=eq.${our.id}`, tu); Object.assign(our, tu); teamFills++; }
    }

    // Live tussenstand (geen result zetten) bij IN_PLAY/PAUSED.
    if (fm.status === "IN_PLAY" || fm.status === "PAUSED") {
      if (our.result != null) continue; // al definitief
      const lh = our.home_team === home ? (ft?.home ?? 0) : (ft?.away ?? 0);
      const la = our.home_team === home ? (ft?.away ?? 0) : (ft?.home ?? 0);
      const min = fm.minute ?? null;
      if (our.live_home !== lh || our.live_away !== la || our.minute !== min) {
        await dbPatch(`matches?id=eq.${our.id}`, { live_home: lh, live_away: la, minute: min });
        our.live_home = lh; our.live_away = la; our.minute = min; liveUpdates++;
      }
      continue;
    }

    // Eindstand.
    if (fm.status === "FINISHED") {
      if (!ft || ft.home == null || ft.away == null) continue;
      const hs = our.home_team === home ? ft.home : ft.away;
      const as = our.home_team === home ? ft.away : ft.home;
      const result = hs > as ? "home" : as > hs ? "away" : "draw";
      // Resultaat bepalen op teamnaam (volgorde-onafhankelijk). Live-velden wissen.
      if (our.result !== result || our.home_score !== hs || our.away_score !== as || our.live_home != null) {
        await dbPatch(`matches?id=eq.${our.id}`, { home_score: hs, away_score: as, result, live_home: null, live_away: null, minute: null });
        if (our.result !== result) newResults++;
        our.home_score = hs; our.away_score = as; our.result = result; our.live_home = null; our.live_away = null; our.minute = null;
      }
    }
  }
  if (newResults) {
    await rpc("recalc_streaks");
    await rpc("recalc_day_wins");
  }
  return { ok: true, newResults, liveUpdates, teamFills };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    // Modus 2: onbewaakte sync (pg_cron)
    // Fail-closed: zonder geconfigureerd CRON_SECRET wordt elke aanroep geweigerd
    // (anders zou een ontbrekend secret het endpoint publiek openzetten).
    if (body.mode === "sync") {
      const secret = Deno.env.get("CRON_SECRET");
      if (!secret || body.secret !== secret) return json({ error: "unauthorized" }, 403);
      return json(await doSync());
    }

    // Modus 3: geplande odds-fetch (pg_cron) — 48u vóór de eerstvolgende ronde.
    // body.force=true → forceer nu (handmatig/test), negeert 48u + guard.
    if (body.mode === "odds") {
      const secret = Deno.env.get("CRON_SECRET");
      if (!secret || body.secret !== secret) return json({ error: "unauthorized" }, 403);
      return json(await doOddsAuto(body.force === true, body.region || "eu"));
    }

    // Modus 1: proxy
    const path = body.path || new URL(req.url).searchParams.get("path") || "";
    if (!path.startsWith("/competitions/WC")) return json({ error: "path moet beginnen met /competitions/WC" }, 400);
    const key = await getKey();
    if (!key) return json({ error: "Geen fd_api_key gevonden (settings/secret)" }, 400);
    const res = await fetch(FD_BASE + path, { headers: { "X-Auth-Token": key } });
    const text = await res.text();
    return new Response(text, { status: res.status, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return json({ error: String((e as Error)?.message || e) }, 500);
  }
});
