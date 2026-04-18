import { useState } from 'react';
import { HOUSING, getQuarterlyRent, getQuarterlySalary, ANNUAL_SALARY_BY_STAGE, formatDollars } from '../gameEngine';

// Character-specific property images
const PROPERTY_IMAGES = {
  paige: { studio: 'paigestudio', oneBed: 'paige1bed', twoBed: 'paige2bed', mansion: 'paigeph', penthouse: 'paigeph' },
  max:   { studio: 'maxstudio',   oneBed: 'max1bed',   twoBed: 'max2bed',   mansion: 'maxph',   penthouse: 'maxph'   },
};

const MOVEIN_FLAVOUR = {
  studio:    "You'd chosen a studio in Midtown — a decision that made more sense on paper than in practice, given the rent. The walls were thin enough to hear the neighbour's shower repertoire, though mercifully, you were always at your desk when the performance began. Still, there was something about the place that held you. A single west-facing window offered the faintest glimpse of the NYC skyline — just enough of it, framed between two older buildings, to remind you every evening exactly why you'd come to Wall Street in the first place.",
  oneBed:    "The one-bedroom was an upgrade you'd been promising yourself since the first paycheck. A separate room for sleeping — a concept that felt almost decadent after months of folding the laptop closed and calling it night. The kitchen was narrow but functional, and you'd developed a habit of standing at the counter with a coffee, watching the street below as the city assembled itself each morning. It wasn't much. But it was yours, and yours alone, and that counted for something.",
  twoBed:    "Two bedrooms felt like a statement. The second one stood empty for the first three months — a spare room that served as a wardrobe, a gym, a place where unopened boxes went to age gracefully. But there was space to breathe here, space to not think about work the moment you walked in. You'd started cooking again. Small things. But they added up.",
  mansion:   "The penthouse came with views that bordered on unfair. Floor-to-ceiling windows, a terrace you used precisely twice, and a building concierge who remembered your coffee order by week two. The rent made your accountant genuinely emotional, but you'd stopped caring somewhere around the second month, when you realised you were sleeping eight hours and arriving at the office before everyone else. The space did something for you that was difficult to explain and impossible to price.",
  penthouse: "The papers were signed on a Thursday afternoon. No ceremony, no champagne — just a wire transfer and a set of keys that felt heavier than they should. The W1 address had been a long-range target since your first year, something you'd mentioned to nobody and returned to often. Standing in the empty apartment that evening, city spread out below, you found you had nothing particularly profound to think. The goal had been reached. Time to set another.",
};

function getPropertyImg(characterId, tier) {
  const charKey = characterId === 'max' ? 'max' : 'paige';
  const file    = PROPERTY_IMAGES[charKey]?.[tier] ?? PROPERTY_IMAGES.paige.studio;
  return `/${file}.png`;
}

export default function HousingSelect({ gameState: gs, onHousingChosen }) {
  const [confirmTier, setConfirmTier] = useState(null);

  const currentWealth = gs.stats.wealth;
  const { net: salaryNet } = getQuarterlySalary(gs.currentStageId);
  const salaryAnnual = ANNUAL_SALARY_BY_STAGE[gs.currentStageId] || 100_000;
  const { competence, charisma, reputation, sanity } = gs.stats;

  const tiers = gs.isRichLegacy
    ? ['studio', 'oneBed', 'twoBed', 'mansion', 'penthouse']
    : ['studio', 'oneBed', 'twoBed', 'mansion'];

  const currentImg = getPropertyImg(gs.characterId, gs.housingTier);

  const handleOptionClick = (tier, unaffordable) => {
    if (unaffordable) return;
    if (tier === gs.housingTier) {
      onHousingChosen(tier);
    } else {
      setConfirmTier(tier);
    }
  };

  // Move-in confirmation screen
  if (confirmTier) {
    const newImg = getPropertyImg(gs.characterId, confirmTier);
    const h      = HOUSING[confirmTier];
    return (
      <div className="hs-movein-screen" style={{ backgroundImage: `url(${newImg})` }}>
        <div className="hs-movein-overlay" />
        <div className="hs-movein-box">
          <div className="hs-movein-label">{h.label}</div>
          <p className="hs-movein-text">{MOVEIN_FLAVOUR[confirmTier]}</p>
          <button className="btn btn-primary btn-large" onClick={() => onHousingChosen(confirmTier)}>
            [ MOVE IN ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="hs-screen" style={{ backgroundImage: `url(${currentImg})` }}>
      <div className="hs-screen-overlay" />
      <div className="hs-card">
        <div className="hs-tag">ANNUAL LEASE RENEWAL</div>
        <h2 className="hs-title">Your lease is up. Where are you living next year?</h2>
        <p className="hs-subtitle">The quality of your housing impacts your sleep quality... and sanity.</p>

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
            const h          = HOUSING[tier];
            const isOwned    = tier === 'penthouse' || (tier === 'mansion' && gs.mansionOwned);
            const rent       = isOwned ? 0 : h.quarterlyRent;
            const isCurrent  = gs.housingTier === tier;
            const unaffordable = !isOwned && rent > currentWealth;
            const propImg    = getPropertyImg(gs.characterId, tier);

            return (
              <button
                key={tier}
                className={`hs-option ${isCurrent ? 'current' : ''} ${unaffordable ? 'unaffordable' : ''}`}
                onClick={() => handleOptionClick(tier, unaffordable)}
                disabled={unaffordable}
              >
                <div className="hs-option-img-wrap">
                  <img src={propImg} alt={h.label} className="hs-option-img" />
                </div>
                <div className="hs-option-body">
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
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
