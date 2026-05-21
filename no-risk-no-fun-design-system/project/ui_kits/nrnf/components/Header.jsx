/* eslint-disable */
// Top-of-app chrome: header strip, mascot, user block, tab nav.

function Header({ user, onLogout }) {
  return (
    <header>
      <div className="header-stripe"></div>
      <div className="header-inner">
        <div className="mascot-wrap">
          <img src="../../assets/mascot.png" alt="De Condor" />
        </div>
        <div className="logo-block">
          <div className="logo-title">NO RISK NO FUN</div>
          <div className="logo-sub">⚽ WK POOL 2026 ⚽</div>
        </div>
        {user && (
          <div className="header-user">
            ingelogd als<strong>{user.username}</strong>
            <button className="btn-logout" onClick={onLogout}>UITLOGGEN</button>
          </div>
        )}
      </div>
    </header>
  );
}

const TABS = [
  { id: 'home',       label: '🏠 HOME' },
  { id: 'tips',       label: '⚽ TIPS' },
  { id: 'stand',      label: '🏆 STAND' },
  { id: 'spelregels', label: '📖 SPELREGELS' },
  { id: 'toernooi',   label: '📋 TOERNOOI' },
];

function Nav({ active, onChange }) {
  return (
    <nav>
      {TABS.map(t => (
        <button
          key={t.id}
          className={`tab${active === t.id ? ' active' : ''}`}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}

Object.assign(window, { Header, Nav, TABS });
