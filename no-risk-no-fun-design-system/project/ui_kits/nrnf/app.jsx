/* eslint-disable */
// Main app — tab state, screen routing, modals, toast.

const { useState: useStateApp, useEffect: useEffectApp } = React;

function App() {
  const [user, setUser] = useStateApp(null);
  const [tab, setTab] = useStateApp('home');
  const [picks, setPicks] = useStateApp({ m1: 'home', m2: 'away' }); // pre-seeded picks
  const [toast, setToast] = useStateApp('');
  const [inviteOpen, setInviteOpen] = useStateApp(false);
  const [statsOpen, setStatsOpen] = useStateApp(null); // 'waaghals' | 'streak' | 'oddsbeater'
  const [phaseFilter, setPhaseFilter] = useStateApp('all');

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 2200);
  }

  function pick(matchId, side) {
    setPicks(p => ({ ...p, [matchId]: side }));
  }

  function saveTips() {
    showToast('✔ Tips opgeslagen!');
  }

  if (!user) {
    return <AuthScreen onLogin={u => setUser({ ...u, current_streak: 6, points: 147 })} />;
  }

  return (
    <React.Fragment>
      <Header user={user} onLogout={() => setUser(null)} />
      <Nav active={tab} onChange={setTab} />

      <main>
        {/* HOME */}
        {tab === 'home' && (
          <div className="section active">
            <div className="sec-title">▶ HOME</div>

            <div className="subhead first">PODIUM GISTEREN</div>
            <Podium winners={DEMO_PROFILES.slice(0, 3)} />

            <div className="subhead">STATISTIEKEN</div>
            <StatTicker
              label="🎲 WAAGHALS VAN DE DAG"
              value="MIRJAM"
              hint="GEM. KANS 11% · 🎭 DE STROMAN"
              onClick={() => setStatsOpen('waaghals')}
            />
            <StatTicker
              label="🔥 STREAK LEIDER"
              value="NIELS · 6 OP RIJ"
              hint="⚡ THE CHOSEN ONE"
              onClick={() => setStatsOpen('streak')}
            />
            <StatTicker
              label="🎯 ODDS BEATER"
              value="JEROEN"
              hint="WON OP UNDERDOG · 42 PUNTEN"
              onClick={() => setStatsOpen('oddsbeater')}
            />

            <div className="subhead">COMPLOTGROEPJES</div>
            <ComplotCard
              complot={DEMO_COMPLOT}
              onInvite={() => setInviteOpen(true)}
              onManage={() => showToast('Beheer modal stub')}
            />
          </div>
        )}

        {/* TIPS */}
        {tab === 'tips' && (
          <div className="section active">
            <div className="sec-title">▶ JOUW TIPS</div>
            <div className="sec-sub">Vergrendeld bij aftrap · Knockout na 120 min</div>
            <div className="phase-tabs">
              {[
                ['all','ALLES'],['group','GROEPSFASE'],
                ['group1','RONDE 1'],['group2','RONDE 2'],['group3','RONDE 3'],
                ['r32','1/32'],['r16','1/16'],['qf','1/4'],['sf','HALVE'],['final','FINALE'],
              ].map(([id,label]) => (
                <button
                  key={id}
                  className={`phase-tab${phaseFilter === id ? ' active' : ''}`}
                  onClick={() => setPhaseFilter(id)}
                >{label}</button>
              ))}
            </div>
            {DEMO_MATCHES.map(m => (
              <MatchCard key={m.id} match={m} pick={picks[m.id]} onPick={pick} />
            ))}
            <Button variant="green" onClick={saveTips} style={{ marginTop: 8 }}>TIPS OPSLAAN ▶</Button>
          </div>
        )}

        {/* STAND */}
        {tab === 'stand' && (
          <div className="section active">
            <div className="sec-title">▶ KLASSEMENT</div>
            <div className="sec-sub">Wie neemt het meeste risico?</div>
            <div className="stats-row">
              <div className="stat-box">
                <span className="stat-val">5</span>
                <div className="stat-lbl">spelers</div>
              </div>
              <div className="stat-box">
                <span className="stat-val">24</span>
                <div className="stat-lbl">wedstrijden</div>
              </div>
              <div className="stat-box">
                <span className="stat-val">147</span>
                <div className="stat-lbl">jouw pts</div>
              </div>
              <div className="stat-box">
                <span className="stat-val">22%</span>
                <div className="stat-lbl">jouw risico</div>
              </div>
            </div>
            <div className="phase-tabs">
              <button className="phase-tab active">TOTAAL</button>
              <button className="phase-tab">🏅 POULE MEISTER</button>
              <button className="phase-tab">⚡ KNOCK-OUT MEISTER</button>
            </div>
            <Leaderboard
              profiles={DEMO_PROFILES}
              onOpenPlayer={p => showToast(`Profiel: ${p.username}`)}
            />
          </div>
        )}

        {/* SPELREGELS */}
        {tab === 'spelregels' && <Spelregels />}

        {/* TOERNOOI */}
        {tab === 'toernooi' && <Toernooi />}
      </main>

      {/* INVITE MODAL */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)}>
        <div className="modal-title">MAAK EEN SLAPER WAKKER 🐑</div>
        <div style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--muted)', marginBottom: 6 }}>
          GEBRUIKERSNAAM VAN DE SLAAPKOP:
        </div>
        <input type="text" placeholder="gebruikersnaam..." style={{ marginBottom: 10 }} />
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <Button variant="purple" onClick={() => { setInviteOpen(false); showToast('💊 [naam] is ontwaakt.'); }}>
            💊 RODE PIL GEVEN ▶
          </Button>
          <Button variant="ghost" onClick={() => setInviteOpen(false)}>✕ ANNULEER</Button>
        </div>
      </Modal>

      {/* STATS MODAL */}
      <Modal open={!!statsOpen} onClose={() => setStatsOpen(null)} width={620}>
        <div className="modal-title" style={{ color: 'var(--yellow)' }}>
          {statsOpen === 'waaghals' && '🎲 WAAGHALS VAN DE DAG'}
          {statsOpen === 'streak' && '🔥 STREAKS'}
          {statsOpen === 'oddsbeater' && '🎯 ODDS BEATER'}
        </div>
        {DEMO_PROFILES.slice(0, 5).map((p, i) => (
          <div key={p.id} style={{
            display: 'grid', gridTemplateColumns: '32px 1fr auto auto', gap: 12, alignItems: 'center',
            padding: '10px 0', borderBottom: '1px solid rgba(85,0,170,0.3)',
          }}>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 12, color: i === 0 ? 'var(--yellow)' : 'var(--muted)' }}>{i + 1}</span>
            <span style={{ fontFamily: 'var(--oswald)', fontWeight: 700, fontSize: 18, color: 'var(--white)' }}>{p.username.toUpperCase()}</span>
            <StreakBadge streak={p.current_streak} />
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 11, color: 'var(--green)' }}>
              {statsOpen === 'waaghals' && `${p.risk}%`}
              {statsOpen === 'streak' && `${p.current_streak} OP RIJ`}
              {statsOpen === 'oddsbeater' && `${42 - i * 7} PT`}
            </span>
          </div>
        ))}
      </Modal>

      <Toast msg={toast} />
    </React.Fragment>
  );
}

// ─── SPELREGELS (rules page) ─────────────────────────────────
function Spelregels() {
  return (
    <div className="section active">
      <div className="sec-title">▶ SPELREGELS</div>
      <div className="sec-sub">No Risk, No Fun — alles wat je moet weten</div>

      <div className="box box-green" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'var(--green)', marginBottom: 12 }}>⚽ HOE WERKT HET?</div>
        <div style={{ fontFamily: 'var(--vt)', fontSize: 20, color: 'var(--white)', lineHeight: 1.7 }}>
          Tip per wedstrijd: thuisploeg wint, gelijkspel, of uitploeg wint.<br />
          Geen tip ingevoerd? Dan telt automatisch <span style={{ color: 'var(--yellow)' }}>gelijkspel</span>.<br />
          Tips worden <span style={{ color: 'var(--red)' }}>vergrendeld bij aftrap</span> — daarna kun je niet meer aanpassen.<br />
          Knockoutwedstrijden: uitslag na <span style={{ color: 'var(--yellow)' }}>120 minuten</span>.
        </div>
      </div>

      <div className="box" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'var(--yellow)', marginBottom: 12 }}>🎯 PUNTENSYSTEEM</div>
        <div style={{ fontFamily: 'var(--vt)', fontSize: 20, color: 'var(--white)', lineHeight: 1.7, marginBottom: 12 }}>
          Punten = <span style={{ color: 'var(--green)', fontFamily: 'var(--pixel)', fontSize: 12 }}>100 / kans%</span><br />
          Hoe kleiner de kans, hoe meer punten bij een goede tip.
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'var(--vt)', fontSize: 18 }}>
          {[
            ['Favoriet (70% kans)', '1 PT'],
            ['Gelijkspel (33% kans)', '3 PTS'],
            ['Underdog (20% kans)', '5 PTS'],
            ['Grote verrassing (10% kans)', '10 PTS'],
            ['Ultieme gok (5% kans)', '20 PTS'],
          ].map(([k, v], i) => (
            <tr key={k} style={{ borderBottom: i < 4 ? '1px solid var(--border)' : 'none' }}>
              <td style={{ padding: 6, color: 'var(--muted)' }}>{k}</td>
              <td style={{ padding: 6, textAlign: 'right', fontFamily: 'var(--pixel)', fontSize: 10, color: i >= 2 ? 'var(--green)' : 'var(--white)' }}>{v}</td>
            </tr>
          ))}
        </table>
      </div>

      <div className="box" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'var(--yellow)', marginBottom: 12 }}>🔥 STREAKS</div>
        <div style={{ fontFamily: 'var(--vt)', fontSize: 20, color: 'var(--muted)', marginBottom: 10 }}>
          Voorspel wedstrijden op rij goed en verdien een titel.<br />
          Eén foute tip en je gaat terug naar start.
        </div>
        {STREAKS.map((s, i) => (
          <div key={s.n} style={{ padding: '6px 0', borderBottom: i < STREAKS.length - 1 ? '1px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '80px 1fr', alignItems: 'center' }}>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--yellow)' }}>{s.n} OP RIJ</span>
            <span style={{ fontFamily: 'var(--vt)', fontSize: 20, color: 'var(--white)' }}>{s.emoji} {s.title}</span>
          </div>
        ))}
      </div>

      <div className="box" style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: 'var(--pixel)', fontSize: 10, color: 'var(--yellow)', marginBottom: 12 }}>📊 RISICOPROFIELEN</div>
        {RISK_PROFILES.map((r, i) => (
          <div key={r.title} style={{ padding: '5px 0', borderBottom: i < RISK_PROFILES.length - 1 ? '1px solid var(--border)' : 'none', display: 'grid', gridTemplateColumns: '40px 200px 1fr', alignItems: 'center' }}>
            <span style={{ fontSize: 20 }}>{r.emoji}</span>
            <span style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: 'var(--white)' }}>{r.title}</span>
            <span style={{ fontFamily: 'var(--vt)', fontSize: 18, color: 'var(--muted)' }}>{r.min}–{r.max}% gem. kans</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── TOERNOOI (tournament screen — minimal stub) ──────────────
function Toernooi() {
  const standings = [
    { team: 'Netherlands', g: 2, w: 2, d: 0, l: 0, gf: 4, ga: 1, pts: 6 },
    { team: 'Brazil',      g: 2, w: 1, d: 1, l: 0, gf: 3, ga: 2, pts: 4 },
    { team: 'Morocco',     g: 2, w: 1, d: 0, l: 1, gf: 2, ga: 2, pts: 3 },
    { team: 'Senegal',     g: 2, w: 0, d: 1, l: 1, gf: 1, ga: 5, pts: 1 },
  ];
  return (
    <div className="section active">
      <div className="sec-title">▶ TOERNOOIOVERZICHT</div>
      <div className="sec-sub">Groepsfase · Knockout · Standen &amp; uitslagen</div>
      <div className="phase-tabs">
        <button className="phase-tab active">STANDEN</button>
        <button className="phase-tab">WEDSTRIJDEN</button>
        <button className="phase-tab">KNOCKOUT</button>
      </div>
      <div className="box">
        <div style={{ fontFamily: 'var(--pixel)', fontSize: 11, color: 'var(--yellow)', marginBottom: 12 }}>GROEP A</div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['TEAM','G','W','G','V','+','−','PTS'].map((h, i) => (
                <th key={i} style={{ fontFamily: 'var(--pixel)', fontSize: 8, color: 'var(--white)', padding: '6px 8px', borderBottom: '1px solid var(--border)', textAlign: i === 0 ? 'left' : 'center' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((s, i) => (
              <tr key={s.team}>
                <td style={{ fontFamily: 'var(--oswald)', fontWeight: 700, fontSize: 16, padding: '6px 8px', borderBottom: i < 3 ? '1px solid rgba(85,0,170,0.2)' : 'none' }}>
                  {TEAM_FLAGS[s.team]} {s.team.toUpperCase()}
                </td>
                {[s.g, s.w, s.d, s.l, s.gf, s.ga].map((v, j) => (
                  <td key={j} style={{ fontFamily: 'var(--vt)', fontSize: 18, padding: '6px 6px', textAlign: 'center', borderBottom: i < 3 ? '1px solid rgba(85,0,170,0.2)' : 'none', color: 'var(--muted)' }}>{v}</td>
                ))}
                <td style={{ fontFamily: 'var(--pixel)', fontSize: 11, color: 'var(--green)', padding: '6px 8px', textAlign: 'center', borderBottom: i < 3 ? '1px solid rgba(85,0,170,0.2)' : 'none' }}>{s.pts}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
