/* eslint-disable */
// Small UI primitives — buttons, badges, avatar, streak indicator, modal shell.

const { useState, useEffect } = React;

function MascotAvatar({ size = 32, border = 'var(--border)', radius = 0, style = {} }) {
  return (
    <div style={{
      width: size, height: size, border: `2px solid ${border}`,
      overflow: 'hidden', background: 'var(--bg3)', flexShrink: 0,
      borderRadius: radius, ...style,
    }}>
      <img
        src="../../assets/mascot.png"
        alt="avatar"
        style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center' }}
      />
    </div>
  );
}

function StreakBadge({ streak }) {
  const info = getStreakInfo(streak);
  if (!info) return null;
  const sty = getStreakBadgeStyle(streak);
  return (
    <span className="streak-badge" style={{ ...sty, display: 'inline-block', padding: '3px 8px' }}>
      {info.emoji} {info.title}
    </span>
  );
}

function BananaStreak({ streak }) {
  const count = bananaCount(streak);
  if (!count) return null;
  return (
    <span style={{ display: 'inline-flex', gap: 0, verticalAlign: 'middle' }}>
      {Array.from({ length: count }).map((_, i) => (
        <img key={i} src="../../assets/banana.gif"
          style={{ width: 24, height: 24, imageRendering: 'pixelated' }} alt="" />
      ))}
    </span>
  );
}

function Button({ variant = 'green', size = 'md', onClick, children, disabled, style = {} }) {
  const cls = `btn btn-${variant}${size === 'sm' ? ' btn-sm' : ''}`;
  return (
    <button className={cls} onClick={onClick} disabled={disabled} style={style}>
      {children}
    </button>
  );
}

function PhaseBadge({ phase }) {
  if (phase === 'group') return <span className="phase-badge phase-group">GROEP</span>;
  const labels = { r32: '1/32', r16: '1/16', qf: '1/4', sf: 'HALVE', third: '3E PLAATS', final: 'FINALE' };
  return <span className="phase-badge phase-ko">{labels[phase] || phase.toUpperCase()}</span>;
}

function Modal({ open, onClose, title, children, width }) {
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className="modal-box" style={{ maxWidth: width || 480 }} onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕ SLUITEN</button>
        {title && <div className="modal-title">{title}</div>}
        {children}
      </div>
    </div>
  );
}

function Toast({ msg }) {
  return <div id="toast" className={msg ? 'show' : ''}>{msg}</div>;
}

// Helper to render a tip chip in a leaderboard's "recent tips" cell.
function TipChip({ team, points, ok }) {
  const flag = TEAM_FLAGS[team] || '🏳️';
  const code = TEAM_CODES[team] || team.slice(0, 3).toUpperCase();
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', width: 62, flexShrink: 0,
      whiteSpace: 'nowrap', color: ok ? 'var(--green)' : 'var(--red)', marginRight: 4,
    }}>
      <span style={{ fontSize: 16 }}>{flag}</span>
      <span style={{ fontFamily: 'var(--pixel)', fontSize: 7, marginLeft: 3 }}>
        {code}
        <sup style={{ color: ok ? 'var(--green)' : 'var(--red)', fontSize: 6 }}>+{points}</sup>
      </span>
    </span>
  );
}

Object.assign(window, {
  MascotAvatar, StreakBadge, BananaStreak, Button, PhaseBadge, Modal, Toast, TipChip,
});
