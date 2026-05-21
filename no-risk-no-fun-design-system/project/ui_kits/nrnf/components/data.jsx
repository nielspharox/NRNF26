/* eslint-disable */
// Static demo fixture data for the UI kit.
// Matches the shape of the real Supabase schema (profiles, matches, tips) — minimal subset.

const STREAKS = [
  { n: 2,  title: 'PAUL',                emoji: '🐙' },
  { n: 4,  title: 'EL JEFE',             emoji: '🌵🤠' },
  { n: 6,  title: 'THE CHOSEN ONE',      emoji: '⚡' },
  { n: 8,  title: 'SITTING BULL',        emoji: '🦬' },
  { n: 10, title: 'THE DEEP STATE',      emoji: '🕵️' },
  { n: 12, title: 'THE ORACLE',          emoji: '🔮' },
  { n: 14, title: 'PAUL WAS AN AMATEUR', emoji: '🐙💀' },
];

const RISK_PROFILES = [
  { min: 55, max: 100, title: 'De Bureaucraat', emoji: '📁' },
  { min: 40, max: 55,  title: 'De Ambtenaar',   emoji: '🖊️' },
  { min: 28, max: 40,  title: 'De Informant',   emoji: '🤫' },
  { min: 18, max: 28,  title: 'De Stroman',     emoji: '🎭' },
  { min: 0,  max: 18,  title: 'De Rebel',       emoji: '✊' },
];

const TEAM_FLAGS = {
  Netherlands: '🇳🇱', Brazil: '🇧🇷', Argentina: '🇦🇷', Germany: '🇩🇪',
  France: '🇫🇷', Spain: '🇪🇸', Portugal: '🇵🇹', England: '🏴󠁧󠁢󠁥󠁮󠁧󠁿',
  Belgium: '🇧🇪', Italy: '🇮🇹', Croatia: '🇭🇷', Morocco: '🇲🇦',
  Mexico: '🇲🇽', USA: '🇺🇸', Canada: '🇨🇦', Senegal: '🇸🇳',
  Japan: '🇯🇵', 'South Korea': '🇰🇷', Australia: '🇦🇺', Uruguay: '🇺🇾',
};

const TEAM_CODES = {
  Netherlands: 'NED', Brazil: 'BRA', Argentina: 'ARG', Germany: 'GER',
  France: 'FRA', Spain: 'ESP', Portugal: 'POR', England: 'ENG',
  Belgium: 'BEL', Italy: 'ITA', Croatia: 'CRO', Morocco: 'MAR',
  Mexico: 'MEX', USA: 'USA', Canada: 'CAN', Senegal: 'SEN',
  Japan: 'JPN', 'South Korea': 'KOR', Australia: 'AUS', Uruguay: 'URU',
};

const DEMO_PROFILES = [
  { id: 'u1', username: 'niels',  current_streak: 6, points: 147, avatar: null, risk: 22 },
  { id: 'u2', username: 'mirjam', current_streak: 3, points: 132, avatar: null, risk: 11 },
  { id: 'u3', username: 'jeroen', current_streak: 1, points: 98,  avatar: null, risk: 35 },
  { id: 'u4', username: 'petra',  current_streak: 0, points: 76,  avatar: null, risk: 51 },
  { id: 'u5', username: 'tom',    current_streak: 2, points: 64,  avatar: null, risk: 62 },
];

const DEMO_MATCHES = [
  {
    id: 'm1', home: 'Netherlands', away: 'Brazil',
    home_odds: 35, draw_odds: 30, away_odds: 35,
    phase: 'group', group: 'A', round: 2,
    kickoff: '23 juni · 21:00', venue: 'Amsterdam',
    locked: false, result: null,
  },
  {
    id: 'm2', home: 'Argentina', away: 'Morocco',
    home_odds: 62, draw_odds: 22, away_odds: 16,
    phase: 'group', group: 'A', round: 2,
    kickoff: '24 juni · 18:00', venue: 'Mexico City',
    locked: false, result: null,
  },
  {
    id: 'm3', home: 'France', away: 'Senegal',
    home_odds: 58, draw_odds: 24, away_odds: 18,
    phase: 'group', group: 'B', round: 2,
    kickoff: '24 juni · 21:00', venue: 'New York',
    locked: true, result: 'away', home_score: 1, away_score: 2,
  },
  {
    id: 'm4', home: 'Spain', away: 'Italy',
    home_odds: 45, draw_odds: 30, away_odds: 25,
    phase: 'group', group: 'B', round: 2,
    kickoff: '25 juni · 18:00', venue: 'Toronto',
    locked: false, result: null,
  },
];

// Tip counts (how many other people picked each side)
const DEMO_TIP_COUNTS = {
  m1: { home: 4, draw: 2, away: 1 },
  m2: { home: 5, draw: 1, away: 1 },
  m3: { home: 3, draw: 1, away: 3 },
  m4: { home: 2, draw: 2, away: 3 },
};

const DEMO_COMPLOT = {
  name: 'DE PHAROX BENDE',
  members: [
    { ...DEMO_PROFILES[0], haantje: true },
    DEMO_PROFILES[1],
    DEMO_PROFILES[2],
    DEMO_PROFILES[3],
  ],
};

function getStreakInfo(n) {
  let info = null;
  for (const s of STREAKS) if (n >= s.n) info = s;
  return info;
}

function getStreakBadgeStyle(streak) {
  const s = streak || 0;
  if (s >= 12) return { border: '3px solid var(--purple-light)', color: 'var(--purple-light)', background: 'rgba(170,68,255,0.15)', boxShadow: '0 0 12px var(--purple-light), 0 0 24px rgba(170,68,255,0.4)' };
  if (s >= 6)  return { border: '2px solid var(--yellow)', color: 'var(--yellow)', background: 'rgba(255,230,0,0.15)', boxShadow: '2px 2px 0 #000' };
  return { border: '2px solid #cccccc', color: '#cccccc', background: 'rgba(200,200,200,0.1)', boxShadow: '2px 2px 0 #000' };
}

function getRiskProfile(avg) {
  for (const r of RISK_PROFILES) if (avg >= r.min && avg < r.max) return r;
  return RISK_PROFILES[0];
}

function bananaCount(n) {
  if (n >= 14) return 7;
  if (n >= 12) return 6;
  if (n >= 10) return 5;
  if (n >= 8)  return 4;
  if (n >= 6)  return 3;
  if (n >= 4)  return 2;
  if (n >= 2)  return 1;
  return 0;
}

function calcPoints(oddsPct) {
  if (!oddsPct) return 0;
  return Math.round(100 / oddsPct);
}

Object.assign(window, {
  STREAKS, RISK_PROFILES, TEAM_FLAGS, TEAM_CODES,
  DEMO_PROFILES, DEMO_MATCHES, DEMO_TIP_COUNTS, DEMO_COMPLOT,
  getStreakInfo, getStreakBadgeStyle, getRiskProfile, bananaCount, calcPoints,
});
