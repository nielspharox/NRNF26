/* eslint-disable */
// Match card with pick row + tip counts. Behaviour: tap a side, it selects.
// If `locked`, all buttons disabled and result-coded left border shows the outcome.

const { useState: useStateMC } = React;

function MatchCard({ match, pick, onPick }) {
  const { home, away, home_odds, draw_odds, away_odds, kickoff, venue, locked, result, phase, group, round, id } = match;
  const counts = DEMO_TIP_COUNTS[id] || { home: 0, draw: 0, away: 0 };

  const resultClass = locked && result
    ? (result === 'home' ? 'res-home' : result === 'draw' ? 'res-draw' : 'res-away')
    : '';

  const PickBtn = ({ side, label, odds, pts, flag }) => {
    const selClass = pick === side ? (side === 'home' ? 'sel-home' : 'sel-away') : '';
    return (
      <button
        className={`pick-btn ${selClass}`}
        disabled={locked}
        onClick={() => onPick(id, side)}
      >
        <span className="team-flag" style={{ fontSize: 18, marginRight: 4 }}>{flag}</span>
        <span className="team-name">{label}</span>
        <span className="team-odds">{odds}% KANS</span>
        <span className="team-pts">+{pts} PT</span>
      </button>
    );
  };

  return (
    <div className={`match-card ${resultClass}`}>
      <div className="match-meta">
        <PhaseBadge phase={phase} />
        {phase === 'group' && <span>RONDE {round}</span>}
        {phase === 'group' && group && <span>GROEP {group}</span>}
        <span>·</span>
        <span>{kickoff}</span>
        <span>·</span>
        <span>{venue}</span>
        {locked && <span className="locked-badge">🔒 LOCKED</span>}
        {locked && result && <span style={{ color: 'var(--white)', fontFamily: 'var(--vt)', fontSize: 16 }}>
          {match.home_score}–{match.away_score}
        </span>}
      </div>
      <div className="pick-row">
        <PickBtn side="home"
          label={home}
          odds={home_odds}
          pts={calcPoints(home_odds)}
          flag={TEAM_FLAGS[home] || '🏳️'} />
        <button
          className={`pick-draw ${pick === 'draw' ? 'sel-draw' : ''}`}
          disabled={locked}
          onClick={() => onPick(id, 'draw')}
        >
          GELIJK<br />
          <span style={{ fontSize: 8 }}>{draw_odds}%</span><br />
          +{calcPoints(draw_odds)} PT
        </button>
        <PickBtn side="away"
          label={away}
          odds={away_odds}
          pts={calcPoints(away_odds)}
          flag={TEAM_FLAGS[away] || '🏳️'} />
      </div>
      <div className="tip-counts">
        <span className="tc-home">▲ {counts.home}</span>
        <span className="tc-sep">·</span>
        <span className="tc-draw">═ {counts.draw}</span>
        <span className="tc-sep">·</span>
        <span className="tc-away">▼ {counts.away}</span>
      </div>
    </div>
  );
}

Object.assign(window, { MatchCard });
