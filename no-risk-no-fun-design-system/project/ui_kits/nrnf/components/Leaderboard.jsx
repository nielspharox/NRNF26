/* eslint-disable */
// Leaderboard table — rank · avatar · name · recent tip chips · pts.

function Leaderboard({ profiles, onOpenPlayer }) {
  const sorted = [...profiles].sort((a, b) => b.points - a.points);
  // Mock recent tips per player so each row has something to show.
  const mockTips = (i) => [
    { team: ['Netherlands','Brazil','Argentina'][i%3], points: [22, 5, 50][i%3], ok: true },
    { team: ['Morocco','France','Germany'][i%3], points: [3, 50, 0][i%3], ok: i % 4 !== 3 },
    { team: ['Spain','Italy','Japan'][i%3], points: [5, 0, 33][i%3], ok: i % 2 === 0 },
  ];

  return (
    <div className="box" style={{ padding: '0.5rem 1rem', overflowX: 'auto' }}>
      <table className="sb-table">
        <thead>
          <tr>
            <th>#</th>
            <th></th>
            <th>SPELER</th>
            <th>RECENTE TIPS</th>
            <th style={{ textAlign: 'right' }}>PTS</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p, i) => {
            const rankCls = i === 0 ? 'r1' : i === 1 ? 'r2' : i === 2 ? 'r3' : '';
            return (
              <tr key={p.id}>
                <td className={`rank-cell ${rankCls}`}>{i + 1}</td>
                <td>
                  <div style={{ width: 40, height: 40, border: '2px solid var(--border)', background: 'var(--bg3)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', overflow: 'hidden' }}>
                    <PixelPlayer name={p.username} mini size={42} />
                  </div>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <span
                      style={{ fontFamily: 'var(--oswald)', fontWeight: 700, fontSize: 18, color: 'var(--white)', cursor: 'pointer' }}
                      onClick={() => onOpenPlayer && onOpenPlayer(p)}
                    >
                      {p.username.toUpperCase()}
                    </span>
                    <StreakBadge streak={p.current_streak} />
                  </div>
                </td>
                <td>
                  {mockTips(i).map((t, j) => (
                    <TipChip key={j} team={t.team} points={t.points} ok={t.ok} />
                  ))}
                </td>
                <td className="pts-cell">{p.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

Object.assign(window, { Leaderboard });
