import { ACTIVITIES, DATE_OPTIONS } from '../gameData';
import { getQuarterLabel, getSeasonLabel, getQuarterlyRent, getQuarterlySalary, formatDollars, getAdjustedEffects, getStagePromotionMultiplier } from '../gameEngine';
import ItemShop from './ItemShop';

const CATEGORY_ORDER = ['Work', 'Social', 'Recovery'];

export default function MonthlyPicker({ gameState: gs, onActivityChosen, onItemPurchase }) {
  const monthNum      = gs.currentMonth;
  const alreadyChosen = gs.monthActivities;
  const wealth        = gs.stats.wealth;
  const nextRent      = getQuarterlyRent(gs.housingTier, gs.mansionOwned);
  const nextSalary    = getQuarterlySalary(gs.currentStageId).net;

  const grouped = CATEGORY_ORDER.map(cat => ({
    cat,
    activities: ACTIVITIES.filter(a => {
      if (a.category !== cat) return false;
      if (a.id === 'goOnDate' && !gs.dateUnlocked && !gs.firstEncounterDone) return false;
      if (a.q3Only && gs.currentQuarter !== 3) return false;
      if (a.id === 'hitGym' && gs.currentQuarter === 3) return false;
      if (a.stageOnly && !a.stageOnly.includes(gs.currentStageId)) return false;
      return true;
    }),
  }));

  const formatEffect = (effects) =>
    Object.entries(effects).map(([k, v]) => (
      <span key={k} className={`mp-effect ${v < 0 ? 'neg' : 'pos'}`}>
        {k} {v > 0 ? '+' : ''}{v}
      </span>
    ));

  const formatRiskEffect = (effect) =>
    Object.entries(effect).map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(', ');

  const bgImage = gs.isPEPath ? "url('/peoffice.png')" : "url('/bcoffice.png')";

  return (
    <div className="mp-screen" style={{ backgroundImage: bgImage }}>
    <div className="mp-bg">
      <div className="mp-header">
        <h2 className="mp-title">
          {getQuarterLabel(gs.currentQuarter)} {2025 + gs.currentYear}
          <span className="mp-season"> — {getSeasonLabel(gs.currentQuarter)}</span>
        </h2>
        <p className="mp-subtitle">
          Month {monthNum} of 3 — choose your focus for this month.
        </p>
        <div className="mp-month-dots">
          {[1, 2, 3].map(m => (
            <span key={m} className={`mp-dot ${m < monthNum ? 'done' : m === monthNum ? 'active' : 'pending'}`} />
          ))}
        </div>
      </div>

      {nextRent > 0 && (wealth + nextSalary) < nextRent && (
        <div className="mp-bankruptcy-warning">
          ⚠ CRITICAL: Balance ({formatDollars(wealth)}) cannot cover next quarter's rent ({formatDollars(nextRent)})
        </div>
      )}

      {alreadyChosen.length > 0 && (
        <div className="mp-chosen-bar">
          <span className="mp-chosen-label">This quarter:</span>
          {alreadyChosen.map((id, i) => {
            const a = ACTIVITIES.find(x => x.id === id);
            return <span key={i} className="mp-chosen-chip">{a?.icon} {a?.name}</span>;
          })}
        </div>
      )}

      <div className="mp-grid-wrap">
        {grouped.map(({ cat, activities }) => (
          <div key={cat} className="mp-category">
            <div className="mp-cat-label">{cat}</div>
            <div className="mp-activity-grid">
              {activities.map(act => {
                const yearLocked    = act.minYear != null && gs.currentYear < act.minYear;
                const encounterLocked = act.id === 'goOnDate' && !yearLocked && !gs.firstEncounterId;
                const dateMissed   = act.id === 'goOnDate' && gs.firstEncounterDone && !gs.dateUnlocked;
                const onceLocked    = act.oncePerQuarter && alreadyChosen.includes(act.id);
                const unaffordable  = !yearLocked && !encounterLocked && !dateMissed && !onceLocked && (act.cost || 0) > wealth;
                const unavailable   = yearLocked || encounterLocked || dateMissed || unaffordable || onceLocked;
                const multipliers   = { ...(gs.traitMultipliers || {}), isPEPath: gs.isPEPath || false };
                const baseEffects = (() => {
                  const e = act.promotionScaled
                    ? Object.fromEntries(Object.entries(act.effects).map(([k, v]) => [k, Math.round(v * getStagePromotionMultiplier(gs.currentStageId))]))
                    : { ...act.effects };
                  if (act.sanityByStage && act.sanityByStage[gs.currentStageId] != null)
                    e.sanity = act.sanityByStage[gs.currentStageId];
                  return e;
                })();
                const adjEffects = (() => {
                  if (act.bypassSanityMultiplier && baseEffects.sanity != null) {
                    const rawSanity = baseEffects.sanity;
                    const { sanity: _s, ...rest } = baseEffects;
                    return { ...getAdjustedEffects(rest, multipliers, gs.housingTier, gs.currentYear), sanity: rawSanity };
                  }
                  return getAdjustedEffects(baseEffects, multipliers, gs.housingTier, gs.currentYear);
                })();
                const adjRiskEffect = act.risk ? getAdjustedEffects(act.risk.effect, multipliers, gs.housingTier, gs.currentYear) : null;
                return (
                  <button
                    key={act.id}
                    className={`mp-card ${unaffordable ? 'unaffordable' : ''} ${yearLocked || encounterLocked ? 'year-locked' : ''} ${dateMissed ? 'date-missed' : ''} ${onceLocked ? 'once-locked' : ''}`}
                    onClick={() => !unavailable && onActivityChosen(act)}
                    disabled={unavailable}
                  >
                    <span className="mp-card-icon">{act.icon}</span>
                    <div className="mp-card-body">
                      <div className="mp-card-name">{gs.isPEPath && act.peName ? act.peName : act.name}</div>
                      <div className="mp-card-desc">{act.description}</div>
                      {yearLocked ? (
                        <div className="mp-card-year-lock">Available from Year 2</div>
                      ) : encounterLocked ? (
                        <div className="mp-card-year-lock">Unlocked after your first encounter</div>
                      ) : dateMissed ? (
                        <div className="mp-card-year-lock">You never made the time. The window closed.</div>
                      ) : onceLocked ? (
                        <div className="mp-card-year-lock">Already done this quarter.</div>
                      ) : (
                        <>
                          {(() => {
                            const dateDef = act.id === 'goOnDate' && gs.firstEncounterId
                              ? DATE_OPTIONS.find(d => d.id === gs.firstEncounterId)
                              : null;
                            const displayCost = dateDef ? dateDef.dateCost : act.cost;
                            return (
                              <div className={`mp-card-cost ${unaffordable ? 'unaffordable' : displayCost > 0 ? '' : 'free'}`}>
                                {displayCost > 0 ? `Cost: -${formatDollars(displayCost)}` : 'Cost: Free'}
                              </div>
                            );
                          })()}
                          {act.id === 'goOnDate' && gs.firstEncounterId ? (() => {
                            const dateDef = DATE_OPTIONS.find(d => d.id === gs.firstEncounterId);
                            return dateDef ? (
                              <div className="mp-card-effects">{formatEffect(dateDef.effects)}</div>
                            ) : null;
                          })() : act.coinFlip ? (
                            <div className="mp-card-effects">
                              <span className="mp-effect pos">50% reputation +{act.coinFlip.good.reputation}</span>
                              <span className="mp-effect neg">50% reputation {act.coinFlip.bad.reputation}</span>
                              {adjEffects.sanity != null && <span className={`mp-effect ${adjEffects.sanity < 0 ? 'neg' : 'pos'}`}>sanity {adjEffects.sanity > 0 ? '+' : ''}{adjEffects.sanity}</span>}
                            </div>
                          ) : (
                            <div className="mp-card-effects">
                              {formatEffect(adjEffects)}
                              {act.gritGain && (gs.marathonGritGained || 0) < 30 && (gs.baseTraits?.grit || 0) < 100 && (
                                <span className="mp-effect pos">grit +{Math.min(act.gritGain, 30 - (gs.marathonGritGained || 0), 100 - (gs.baseTraits?.grit || 0))}</span>
                              )}
                            </div>
                          )}
                          {act.risk && (
                            <div className="mp-card-risk">
                              ⚠ {Math.round(act.risk.chance * 100)}% chance: {formatRiskEffect(adjRiskEffect)}
                            </div>
                          )}
                          {act.requiresDateFromYear && gs.currentYear >= act.requiresDateFromYear && !unaffordable && gs.firstEncounterId && (() => {
                            const dateDef = DATE_OPTIONS.find(d => d.id === gs.firstEncounterId);
                            return dateDef ? (
                              <div className="mp-card-date-note">💝 with {dateDef.name}</div>
                            ) : null;
                          })()}
                        </>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        <ItemShop
          gameState={gs}
          quarterlyItems={gs.quarterlyItems || []}
          onItemPurchase={onItemPurchase}
        />
      </div>
    </div>
    </div>
  );
}
