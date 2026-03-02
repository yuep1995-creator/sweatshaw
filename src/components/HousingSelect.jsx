import { HOUSING, getQuarterlyRent, getQuarterlySalary, ANNUAL_SALARY_BY_STAGE, formatDollars } from '../gameEngine';

export default function HousingSelect({ gameState: gs, onHousingChosen }) {
  const currentWealth = gs.stats.wealth;
  const { net: salaryNet } = getQuarterlySalary(gs.currentStageId);
  const salaryAnnual = ANNUAL_SALARY_BY_STAGE[gs.currentStageId] || 75_000;
  const { competence, charisma, reputation, sanity } = gs.stats;

  const tiers = gs.isRichLegacy
    ? ['studio', 'oneBed', 'mansion', 'penthouse']
    : ['studio', 'oneBed', 'mansion'];

  return (
    <div className="hs-screen">
      <div className="hs-card">
        <div className="hs-tag">ANNUAL LEASE RENEWAL</div>
        <h2 className="hs-title">Your lease is up. Where are you living next year?</h2>

        <div className="hs-info-bar">
          <div className="hs-info-item">
            <span className="hs-info-label">Current balance</span>
            <span className="hs-balance">{formatDollars(currentWealth)}</span>
          </div>
          <div className="hs-info-divider" />
          <div className="hs-info-item">
            <span className="hs-info-label">Base salary</span>
            <span className="hs-balance">{formatDollars(salaryAnnual)}/yr</span>
            <span className="hs-info-sub">{formatDollars(salaryNet)} net / qtr</span>
          </div>
        </div>

        <div className="hs-stats-bar">
          <div className="hs-stat-chip">
            <span className="hs-stat-label">Competence</span>
            <span className="hs-stat-val">{competence}</span>
          </div>
          <div className="hs-stat-chip">
            <span className="hs-stat-label">Charisma</span>
            <span className="hs-stat-val">{charisma}</span>
          </div>
          <div className="hs-stat-chip">
            <span className="hs-stat-label">Reputation</span>
            <span className="hs-stat-val">{reputation}</span>
          </div>
          <div className="hs-stat-chip">
            <span className="hs-stat-label">Sanity</span>
            <span className="hs-stat-val">{sanity}</span>
          </div>
        </div>

        <div className="hs-options">
          {tiers.map(tier => {
            const h         = HOUSING[tier];
            const isOwned   = tier === 'penthouse' || (tier === 'mansion' && gs.mansionOwned);
            const rent      = isOwned ? 0 : h.quarterlyRent;
            const isCurrent = gs.housingTier === tier;
            const unaffordable = !isOwned && rent > currentWealth;

            return (
              <button
                key={tier}
                className={`hs-option ${isCurrent ? 'current' : ''} ${unaffordable ? 'unaffordable' : ''}`}
                onClick={() => !unaffordable && onHousingChosen(tier)}
                disabled={unaffordable}
              >
                <div className="hs-option-header">
                  <span className="hs-option-name">{h.label}</span>
                  {isCurrent && <span className="hs-option-badge">CURRENT</span>}
                  {unaffordable && <span className="hs-option-badge unaffordable">CAN'T AFFORD</span>}
                </div>
                <div className="hs-option-rent">
                  {isOwned
                    ? 'Owned — no rent'
                    : `${formatDollars(h.monthlyRent)}/mo · ${formatDollars(h.quarterlyRent)}/qtr`
                  }
                </div>
                {h.sanityMod > 0 && (
                  <div className="hs-option-sanity">
                    +{Math.round(h.sanityMod * 100)}% to all Sanity gains
                  </div>
                )}
                <div className="hs-option-flavour">"{h.flavour}"</div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
