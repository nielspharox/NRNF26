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
    if (M.filter((m) => m.phase === "group" && m.group_name === g && m.result).length > 0) {
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
  // Ook ophalen als de groepsfase klaar is en er nog R32-slots (beste nrs 3) open staan.
  const groupDone = M.some((m) => m.phase === "group") && M.filter((m) => m.phase === "group").every((m) => m.result);
  const thirdsPending = groupDone && M.some((m) => m.phase === "r32" && (isPlaceholderName(m.home_team) || isPlaceholderName(m.away_team)));
  if (!live && !thirdsPending) return { skipped: true, reason: "niets te doen" };

  const key = await getKey();
  if (!key) return { error: "geen fd_api_key" };
  const res = await fetch(`${FD_BASE}/competitions/WC/matches`, { headers: { "X-Auth-Token": key } });
  if (!res.ok) return { error: "football-data " + res.status };
  const fmatches = (await res.json()).matches || [];

  let newResults = 0, liveUpdates = 0;
  for (const fm of fmatches) {
    const phase = STAGE_PHASE[fm.stage]; if (!phase) continue;
    const home = canon(fm.homeTeam?.name), away = canon(fm.awayTeam?.name);
    if (!home || !away) continue;
    // Match op (fase + ongeordend teampaar).
    const our = M.find((m) => m.phase === phase && ((m.home_team === home && m.away_team === away) || (m.home_team === away && m.away_team === home)));
    if (!our) continue;
    const ft = fm.score?.fullTime;

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
    await updateBracket(M);
    await rpc("recalc_streaks");
    await rpc("recalc_day_wins");
  }
  const thirds = await fillThirds(fmatches, M); // beste nummers 3 invullen vanuit FD R32-opstelling
  return { ok: true, newResults, liveUpdates, thirds };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors, "Content-Type": "application/json" } });

  try {
    const body = req.method === "POST" ? await req.json().catch(() => ({})) : {};

    // Modus 2: onbewaakte sync (pg_cron)
    if (body.mode === "sync") {
      const secret = Deno.env.get("CRON_SECRET");
      if (secret && body.secret !== secret) return json({ error: "unauthorized" }, 403);
      return json(await doSync());
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
