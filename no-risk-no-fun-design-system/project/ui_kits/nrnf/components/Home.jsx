/* eslint-disable */
// Home screen building blocks: Podium (top 3 daywinners), StatTicker, ComplotCard.

function Podium({ winners }) {
  // winners: array of 3, ordered [1st, 2nd, 3rd]
  const places = [
    { p: winners[1], cls: 'podium-2', rank: 2 },
    { p: winners[0], cls: 'podium-1', rank: 1 },
    { p: winners[2], cls: 'podium-3', rank: 3 },
  ];
  return (
    <div className="podium">
      {places.map(({ p, cls, rank }) => (
        <div key={rank} className="podium-place">
          <div className={`podium-block ${cls}`}>
            <div className="podium-avatar" style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
              <PixelPlayer name={p.username} size={52} />
            </div>
            <div className="podium-name">{p.username.toUpperCase()}</div>
            <div className="podium-pts">{p.points} PT</div>
            <div className="podium-rank" style={{ color: cls === 'podium-1' ? 'var(--yellow)' : cls === 'podium-2' ? '#ccc' : '#c87941' }}>{rank}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StatTicker({ label, value, hint, onClick }) {
  return (
    <div className="stat-ticker" onClick={onClick}>
      <div className="stat-ticker-label">{label}</div>
      <div className="stat-ticker-val">{value}</div>
      {hint && <div className="stat-ticker-hint">{hint}</div>}
    </div>
  );
}

function ComplotCard({ complot, onManage, onInvite }) {
  return (
    <div className="complot-card">
      <div className="complot-name">🐓 {complot.name}</div>
      <div style={{ fontFamily: 'var(--vt)', fontSize: 18, color: 'var(--muted)', marginBottom: 10 }}>
        {complot.members.length} leden · 8 wedstrijden gespeeld
      </div>
      {complot.members.map(m => (
        <div key={m.id} className="member-row">
          <MascotAvatar size={28} />
          <span style={{ fontFamily: 'var(--oswald)', fontWeight: 700, fontSize: 18, color: 'var(--white)' }}>
            {m.username.toUpperCase()}
          </span>
          {m.haantje && <span className="haantje-badge">HAANTJE</span>}
          <span style={{ marginLeft: 'auto', fontFamily: 'var(--pixel)', fontSize: 9, color: 'var(--green)' }}>
            {m.points}
          </span>
        </div>
      ))}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <Button variant="purple" size="sm" onClick={onInvite}>🐑 SLAPER WAKKER MAKEN ▶</Button>
        <Button variant="ghost" size="sm" onClick={onManage}>🐓 BEHEER COMPLOT</Button>
      </div>
    </div>
  );
}

Object.assign(window, { Podium, StatTicker, ComplotCard });
