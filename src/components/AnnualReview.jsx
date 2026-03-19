import { getManagerNote, BADGES } from '../gameData';
import { getStageInfo, formatDollars, ANNUAL_SALARY_BY_STAGE, getTaxRate } from '../gameEngine';

const STAT_LABELS = { competence: 'Competence', charisma: 'Charisma', reputation: 'Reputation', sanity: 'Sanity', wealth: 'Wealth' };

export default function AnnualReview({ gameState: gs, annualData, onContinue }) {
  const { year, yearStartStats, endStats, badgesThisYear, promotionResult, wakeUpCall, bonusInfo, salaryMultiplier } = annualData;
  const { stage, calendarYear } = getStageInfo(year);
  const managerNote = getManagerNote(endStats, yearStartStats, gs.characterName);

  const statKeys = Object.keys(STAT_LABELS);

  const deltaColour = (v) => v > 0 ? '#22c55e' : v < 0 ? '#ef4444' : '#555e80';
  const fmtVal   = (k, v) => k === 'wealth' ? formatDollars(v) : v;
  const fmtDelta = (k, v) => k === 'wealth' ? (v >= 0 ? '+' + formatDollars(v) : '-' + formatDollars(Math.abs(v))) : (v > 0 ? '+' : '') + v;

  const handleWakeUpCall = (option) => onContinue({ wakeUpCallOption: option });

  // Annual comp figures
  const stageId    = gs.currentStageId;
  const annual     = ANNUAL_SALARY_BY_STAGE[stageId] || 100_000;
  const taxRate    = getTaxRate(stageId);
  const taxPct     = Math.round(taxRate * 100);
  const salTax     = Math.round(annual * taxRate);
  const salNet     = annual - salTax;
  const salNetDisp = Math.round(salNet * (salaryMultiplier || 1));
  const mult       = salaryMultiplier && salaryMultiplier > 1;

  return (
    <div className="ar-screen">
      <div className="ar-card">
        {/* Header */}
        <div className="ar-header">
          <div className="ar-logo">
            <img src={gs.isPEPath ? '/dplogo.png' : '/sclogo.png'} alt={gs.companyName} className="ar-logo-img ar-logo-img--large" />
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

        {/* Annual comp statement */}
        <div className="ar-section-label">ANNUAL COMPENSATION SUMMARY</div>
        <div className="ar-comp-table">
          <div className="ar-comp-row">
            <span>Base Salary (Gross)</span>
            <span>{formatDollars(annual)}</span>
          </div>
          <div className="ar-comp-row ar-comp-neg">
            <span>Income Tax ({taxPct}%)</span>
            <span>−{formatDollars(salTax)}</span>
          </div>
          <div className="ar-comp-row ar-comp-pos">
            <span>Net Base Salary{mult ? ' (×1.2 PE)' : ''}</span>
            <span>+{formatDollars(salNetDisp)}</span>
          </div>

          {bonusInfo && (
            <>
              <div className="ar-comp-spacer" />
              <div className="ar-comp-row ar-comp-highlight">
                <span>Annual Bonus ({Math.round(bonusInfo.bonusPct * 100)}% of base)</span>
                <span>{formatDollars(bonusInfo.gross)}</span>
              </div>
              <div className="ar-comp-row ar-comp-neg">
                <span>Tax on Bonus ({taxPct}%)</span>
                <span>−{formatDollars(bonusInfo.taxWithheld)}</span>
              </div>
              <div className="ar-comp-row ar-comp-pos">
                <span>Net Bonus{mult ? ' (×1.2 PE)' : ''}</span>
                <span>+{formatDollars(bonusInfo.net)}</span>
              </div>
              <div className="ar-comp-spacer" />
              <div className="ar-comp-row ar-comp-total">
                <span>Total Net Compensation</span>
                <span>{formatDollars(salNetDisp + bonusInfo.net)}</span>
              </div>
            </>
          )}
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
                  Jump to Private Equity → Darkstone & Partners
                  <span className="ar-wakeup-note">Salary ×1.2, promotion requirements ×1.2</span>
                </button>
                <button className="ar-wakeup-btn" onClick={() => onContinue({ wakeUpCallOption: 'startup' })}>
                  <span className="ar-choice-letter">C</span>
                  Join a startup.
                </button>
                <button className="ar-wakeup-btn" onClick={() => handleWakeUpCall('sabotage')}>
                  <span className="ar-choice-letter">D</span>
                  Send headhunter to a rival colleague.
                  <span className="ar-wakeup-note">Competence +40, Sanity −30</span>
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
