import { HOUSING, getQuarterlyRent, formatDollars } from '../gameEngine';

export default function HousingSelect({ gameState: gs, onHousingChosen }) {
  const currentWealth = gs.stats.wealth;
  const tiers = gs.isRichLegacy
    ? ['studio', 'oneBed', 'mansion', 'penthouse']
    : ['studio', 'oneBed', 'mansion'];

  return (
    <div className="hs-screen">
      <div className="hs-card">
        <div className="hs-tag">ANNUAL LEASE RENEWAL</div>
        <h2 className="hs-title">Your lease is up. Where are you living next year?</h2>
        <p className="hs-subtitle">
          Current balance: <span className="hs-balance">{formatDollars(currentWealth)}</span>
        </p>

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
