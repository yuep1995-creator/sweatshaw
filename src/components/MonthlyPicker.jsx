import { ACTIVITIES } from '../gameData';
import { getQuarterLabel, getSeasonLabel, getQuarterlyRent, formatDollars } from '../gameEngine';

const CATEGORY_ORDER = ['Work', 'Social', 'Recovery', 'Wild Card'];

export default function MonthlyPicker({ gameState: gs, onActivityChosen }) {
  const monthNum      = gs.currentMonth;
  const alreadyChosen = gs.monthActivities;
  const wealth        = gs.stats.wealth;
  const nextRent      = getQuarterlyRent(gs.housingTier, gs.mansionOwned);

  const grouped = CATEGORY_ORDER.map(cat => ({
    cat,
    activities: ACTIVITIES.filter(a => a.category === cat),
  }));

  const formatEffect = (effects) =>
    Object.entries(effects).map(([k, v]) => (
      <span key={k} className={`mp-effect ${v < 0 ? 'neg' : 'pos'}`}>
        {k} {v > 0 ? '+' : ''}{v}
      </span>
    ));

  return (
    <div className="mp-screen">
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

      {nextRent > 0 && wealth < nextRent && (
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
                const unaffordable = (act.cost || 0) > wealth;
                return (
                  <button
                    key={act.id}
                    className={`mp-card ${unaffordable ? 'unaffordable' : ''}`}
                    onClick={() => !unaffordable && onActivityChosen(act)}
                    disabled={unaffordable}
                  >
                    <span className="mp-card-icon">{act.icon}</span>
                    <div className="mp-card-body">
                      <div className="mp-card-name">{act.name}</div>
                      <div className="mp-card-desc">
                        {unaffordable
                          ? "You can't afford this right now."
                          : act.description
                        }
                      </div>
                      {act.cost > 0 && (
                        <div className={`mp-card-cost ${unaffordable ? 'unaffordable' : ''}`}>
                          -{formatDollars(act.cost)}
                        </div>
                      )}
                      <div className="mp-card-effects">{formatEffect(act.effects)}</div>
                      {act.risk && !unaffordable && (
                        <div className="mp-card-risk">⚠ {Math.round(act.risk.chance * 100)}% risk</div>
                      )}
                      {act.requiresDateFromYear && gs.currentYear >= act.requiresDateFromYear && !unaffordable && (
                        <div className="mp-card-date-note">💝 Choose your date</div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
