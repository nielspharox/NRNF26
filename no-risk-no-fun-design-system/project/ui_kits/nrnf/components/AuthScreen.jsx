/* eslint-disable */
// Pre-login screen — mascot, login + register tabs, scanline background.

const { useState: useStateAuth } = React;

function AuthScreen({ onLogin }) {
  const [showReg, setShowReg] = useStateAuth(false);
  const [email, setEmail] = useStateAuth('niels@pharox.io');
  const [pass, setPass] = useStateAuth('demo');

  return (
    <div id="auth-screen">
      <div className="auth-box">
        <div className="auth-mascot">
          <img src="../../assets/mascot.png" alt="De Condor" />
        </div>
        <div className="auth-title">NO RISK<br />NO FUN</div>
        <div className="auth-sub">⚽ WK POOL 2026 ⚽</div>

        {!showReg ? (
          <div>
            <div className="form-row">
              <label>E-MAILADRES</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="jouw@email.nl" />
            </div>
            <div className="form-row">
              <label>WACHTWOORD</label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)} placeholder="••••••••" />
            </div>
            <Button variant="green" onClick={() => onLogin({ username: 'niels' })} style={{ width: '100%', marginTop: 8 }}>
              INLOGGEN ▶
            </Button>
            <div className="auth-toggle">
              Geen account? <span onClick={() => setShowReg(true)}>Registreren</span>
            </div>
          </div>
        ) : (
          <div>
            <div className="form-row">
              <label>GEBRUIKERSNAAM</label>
              <input type="text" placeholder="bijv. niels99" />
            </div>
            <div className="form-row">
              <label>E-MAILADRES</label>
              <input type="email" placeholder="jouw@email.nl" />
            </div>
            <div className="form-row">
              <label>WACHTWOORD</label>
              <input type="password" placeholder="min. 6 tekens" />
            </div>
            <Button variant="green" onClick={() => onLogin({ username: 'nieuw' })} style={{ width: '100%', marginTop: 8 }}>
              AANMELDEN ▶
            </Button>
            <div className="auth-toggle">
              Al een account? <span onClick={() => setShowReg(false)}>Inloggen</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { AuthScreen });
