import { useState, useEffect } from 'react';
import { calculateStartingStats, getProfile } from '../gameData';

const STAT_CAP = 999; // display cap for comp/char/rep; sanity uses 200

const DISPLAYED_STATS = [
  { key: 'competence', label: 'Competence',  icon: '🧠', colour: '#4f6ef7' },
  { key: 'sanity',     label: 'Sanity',       icon: '🧘', colour: '#22c55e' },
  { key: 'charisma',   label: 'Charisma',     icon: '✨', colour: '#a78bfa' },
  { key: 'reputation', label: 'Reputation',   icon: '🌟', colour: '#f59e0b' },
  { key: 'wealth',     label: 'Wealth (USD)', icon: '💵', colour: '#34d399' },
];

export default function OnboardingCard({ character, traits, onBeginCareer }) {
  const [visible, setVisible] = useState(false);
  const stats = calculateStartingStats(traits);
  const profile = getProfile(traits);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const formatVal = (key, val) =>
    key === 'wealth' ? `$${val.toLocaleString()}` : val;

  const barPct = (key, val) => {
    if (key === 'wealth') {
      // wealth bar fills at $5000 for visual reference; no cap on actual value
      return Math.min((val / 5000) * 100, 100);
    }
    return Math.min((val / STAT_CAP) * 100, 100);
  };

  return (
    <div className="screen onboarding-screen">
      <div className={`onboarding-card ${visible ? 'slide-in' : ''}`}>

        {/* Header */}
        <div className="onboarding-header">
          <div className="onboarding-logo">
            <img src="/gslogo.png" alt="Sweatshaw & Co" className="onboarding-logo-img" />
            <span className="onboarding-logo-text">SWEATSHAW & CO</span>
          </div>
          <div className="onboarding-stamp">NEW HIRE</div>
        </div>

        <div className="onboarding-title">EMPLOYEE ONBOARDING FORM</div>
        <div className="onboarding-subtitle">New Hire Processing — Confidential</div>

        {/* Fields */}
        <div className="onboarding-section">
          <div className="onboarding-field">
            <span className="field-label">NAME</span>
            <span className="field-value">{character.name}</span>
          </div>
          <div className="onboarding-field">
            <span className="field-label">PRONOUNS</span>
            <span className="field-value">{character.pronoun}</span>
          </div>
          <div className="onboarding-field">
            <span className="field-label">TITLE</span>
            <span className="field-value">Analyst</span>
          </div>
          <div className="onboarding-field">
            <span className="field-label">STARTING SALARY</span>
            <span className="field-value">
              $100,000{' '}
              <span className="field-note">(non-negotiable, we already decided)</span>
            </span>
          </div>
        </div>

        <div className="onboarding-divider">
          <span>INITIAL PERFORMANCE METRICS</span>
        </div>

        {/* Stats — 5 metrics */}
        <div className="onboarding-stats-grid">
          {DISPLAYED_STATS.map(({ key, label, icon, colour }) => {
            const val = stats[key];
            const pct = barPct(key, val);
            return (
              <div key={key} className="onboarding-stat">
                <div className="stat-row-header">
                  <span className="stat-icon">{icon}</span>
                  <span className="stat-label">{label}</span>
                  <span className="stat-num" style={{ color: colour }}>{formatVal(key, val)}</span>
                </div>
                {key !== 'wealth' && (
                  <>
                    <div className="stat-bar-outer">
                      <div
                        className="stat-bar-inner"
                        style={{ width: `${pct}%`, background: colour }}
                      />
                    </div>
                    <div className="stat-cap-label">cap: {STAT_CAP}</div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="onboarding-divider">
          <span>PSYCHOLOGICAL PROFILE</span>
        </div>

        {/* Profile */}
        <div className="onboarding-profile">
          <p className="profile-text" style={{ whiteSpace: 'pre-line' }}>{profile}</p>
          <p className="profile-signed">— HR Department, Sweatshaw & Co</p>
          <p className="profile-note">
            This assessment was generated in 4.2 seconds. It has not been reviewed by a human.
          </p>
        </div>

        {/* Footer */}
        <div className="onboarding-footer">
          <p className="footer-notice">
            By proceeding, you acknowledge receipt of this form and waive any right to contest its
            accuracy. You also acknowledge that the coffee machine on Floor 3 is broken and
            &quot;being looked into.&quot;
          </p>
          <button className="btn btn-primary btn-large" onClick={onBeginCareer} data-sound="decline">
            [ BEGIN CAREER ]
          </button>
        </div>

      </div>
    </div>
  );
}
