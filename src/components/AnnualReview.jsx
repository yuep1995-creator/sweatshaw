import { getManagerNote, BADGES } from '../gameData';
import { getStageInfo, formatDollars } from '../gameEngine';

const STAT_LABELS = { competence: 'Competence', charisma: 'Charisma', reputation: 'Reputation', sanity: 'Sanity', wealth: 'Wealth' };

export default function AnnualReview({ gameState: gs, annualData, onContinue }) {
  const { year, yearStartStats, endStats, badgesThisYear, promotionResult, wakeUpCall } = annualData;
  const { stage, calendarYear } = getStageInfo(year);
  const managerNote = getManagerNote(endStats, gs.characterName);

  const statKeys = Object.keys(STAT_LABELS);

  const deltaColour = (v) => v > 0 ? '#22c55e' : v < 0 ? '#ef4444' : '#555e80';
  const fmtVal   = (k, v) => k === 'wealth' ? formatDollars(v) : v;
  const fmtDelta = (k, v) => k === 'wealth' ? (v >= 0 ? '+' + formatDollars(v) : '-' + formatDollars(Math.abs(v))) : (v > 0 ? '+' : '') + v;

  const handleWakeUpCall = (option) => onContinue({ wakeUpCallOption: option });

  return (
    <div className="ar-screen">
      <div className="ar-card">
        {/* Header */}
        <div className="ar-header">
          <div className="ar-logo">
            <img src="/gslogo.png" alt="Sweatshaw & Co" className="ar-logo-img" />
            <span>{gs.companyName}</span>
          </div>
          <div className="ar-stamp">ANNUAL REVIEW</div>
        </div>

        <div className="ar-title">PERFORMANCE REVIEW — {calendarYear}</div>
        <div className="ar-subtitle">{gs.characterName} · {stage?.title}</div>

        {/* Stat changes */}
        <div className="ar-section-label">YEAR-ON-YEAR PERFORMANCE</div>
        <div className="ar-stats-grid">
          {statKeys.map(k => {
            const before = yearStartStats?.[k] ?? 0;
            const after  = endStats[k];
            const delta  = after - before;
            return (
              <div key={k} className="ar-stat-row">
                <span className="ar-stat-name">{STAT_LABELS[k]}</span>
                <span className="ar-stat-before">{fmtVal(k, before)}</span>
                <span className="ar-stat-arrow">→</span>
                <span className="ar-stat-after">{fmtVal(k, after)}</span>
                <span className="ar-stat-delta" style={{ color: deltaColour(delta) }}>
                  {fmtDelta(k, delta)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Manager note */}
        <div className="ar-section-label">MANAGER NOTES</div>
        <div className="ar-manager-note">
          <p className="ar-note-text">"{managerNote}"</p>
          <p className="ar-note-signed">— Manager, {gs.companyName}</p>
        </div>

        {/* Badges */}
        {badgesThisYear.length > 0 && (
          <>
            <div className="ar-section-label">TITLES EARNED THIS YEAR</div>
            <div className="ar-badges">
              {badgesThisYear.map(id => {
                const b = BADGES[id];
                return b ? (
                  <div key={id} className="ar-badge">
                    <span className="ar-badge-icon">{b.icon}</span>
                    <div>
                      <div className="ar-badge-label">{b.label}</div>
                      <div className="ar-badge-desc">{b.desc}</div>
                    </div>
                  </div>
                ) : null;
              })}
            </div>
          </>
        )}

        {/* Promotion result */}
        {promotionResult && (
          <div className={`ar-promotion ${promotionResult.type}`}>
            {promotionResult.type === 'accelerated' && (
              <div className="ar-promo-title">🏆 ACCELERATED PROMOTION</div>
            )}
            {promotionResult.type === 'standard' && (
              <div className="ar-promo-title">⬆️ PROMOTION</div>
            )}
            {promotionResult.type === 'fail' && (
              <div className="ar-promo-title ar-fail">⚠️ PERFORMANCE REVIEW OUTCOME</div>
            )}

            {/* Per-stat requirement breakdown */}
            <div className="ar-promo-reqs">
              {[
                { key: 'competence', label: 'Competence', icon: '🧠' },
                { key: 'charisma',   label: 'Charisma',   icon: '✨' },
                { key: 'reputation', label: 'Reputation', icon: '🌟' },
              ].map(({ key, label, icon }) => {
                const actual = endStats[key];
                const req    = promotionResult.reqs[key];
                const met    = actual > req;
                return (
                  <div key={key} className={`ar-promo-req-row ${met ? 'met' : 'unmet'}`}>
                    <span className="ar-promo-req-icon">{icon}</span>
                    <span className="ar-promo-req-label">{label}</span>
                    <span className="ar-promo-req-actual">{actual}</span>
                    <span className="ar-promo-req-sep">/</span>
                    <span className="ar-promo-req-needed">{req}</span>
                    <span className="ar-promo-req-check">{met ? '✓' : '✗'}</span>
                  </div>
                );
              })}
            </div>

            {promotionResult.type === 'accelerated' && (
              <p className="ar-promo-flavour">You're moving up ahead of schedule. Sweatshaw & Co is delighted. Your social life is less so.</p>
            )}
            {promotionResult.type === 'standard' && (
              <p className="ar-promo-flavour">Three years, one step up. The title changes. The 6am emails do not.</p>
            )}
            {promotionResult.type === 'fail' && (
              <p className="ar-promo-flavour">Sweatshaw &amp; Co has identified a "strategic restructuring opportunity" for your role.</p>
            )}
          </div>
        )}

        {/* Wake-up call: Associate Year 1 special branching event */}
        {wakeUpCall && (
          <div className="ar-wakeup">
            <div className="ar-section-label">PERSONAL DEVELOPMENT NOTE</div>
            <div className="ar-wakeup-card">
              <p className="ar-wakeup-text">
                You've been at {gs.companyName} for four years. A headhunter calls about a Private Equity role. And a former colleague just announced a Series B. $40 million raised. They look annoyingly happy in the photo.
              </p>
              <div className="ar-wakeup-choices">
                <button className="ar-wakeup-btn" onClick={() => onContinue({})}>
                  <span className="ar-choice-letter">A</span>
                  Stay at {gs.companyName}. You like it here. Mostly.
                </button>
                <button className="ar-wakeup-btn highlight" onClick={() => handleWakeUpCall('pe')}>
                  <span className="ar-choice-letter">B</span>
                  Jump to Private Equity → Darkrock Partners
                  <span className="ar-wakeup-note">Stat multiplier 1.1× for remainder of game</span>
                </button>
                <button
                  className={`ar-wakeup-btn ${!(gs.baseTraits.streetSmart >= 30 || gs.stats.competence >= 70) ? 'locked' : ''}`}
                  onClick={() => onContinue({ wakeUpCallOption: 'startup' })}
                  disabled={!(gs.baseTraits.streetSmart >= 30 || gs.stats.competence >= 70)}
                >
                  <span className="ar-choice-letter">C</span>
                  Join a startup. (Requires Street Smart 30+ OR Competence 70+)
                </button>
                <button className="ar-wakeup-btn" onClick={() => onContinue({ wakeUpCallOption: 'ignore' })}>
                  <span className="ar-choice-letter">D</span>
                  Close the LinkedIn tab. Get back to work.
                  <span className="ar-wakeup-note">Sanity -5, Reputation +2</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {!wakeUpCall && (
          <button className="btn btn-primary btn-large ar-continue-btn" onClick={() => onContinue({})}>
            {promotionResult?.type === 'fail' ? '[ ACCEPT LATERAL ROLE ]' : '[ BEGIN NEW YEAR ]'}
          </button>
        )}
      </div>
    </div>
  );
}
