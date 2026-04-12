import { DATE_OPTIONS } from '../gameData';
import { formatDollars } from '../gameEngine';

function meetsRequirements(dateOption, stats) {
  const { requires } = dateOption;
  if (!requires || Object.keys(requires).length === 0) return true;
  return Object.entries(requires).every(([stat, min]) => (stats[stat] || 0) >= min);
}

export default function DateSelection({ gameState: gs, onDateChosen }) {
  const stats = gs.stats;

  return (
    <div className="date-screen">
      <div className="date-header">
        <h2 className="date-title">Date Night</h2>
        <p className="date-subtitle">
          The city has options. Some doors only open at a certain level.
        </p>
      </div>

      <div className="date-grid">
        {DATE_OPTIONS.filter(d => {
          if (gs.firstEncounterId) return d.id === gs.firstEncounterId;
          return !d.encounterOnly;
        }).map(d => {
          const count      = gs.dateHistory[d.id] || 0;
          const canAfford  = (stats.wealth || 0) >= (d.dateCost || 0);
          const qualified  = meetsRequirements(d, stats);
          const isMilestone = count >= 2;

          return (
            <button
              key={d.id}
              className={`date-card ${isMilestone ? 'milestone' : ''} ${!canAfford ? 'unaffordable' : ''} ${!qualified ? 'locked' : ''}`}
              onClick={() => onDateChosen(d, !qualified)}
            >
              <div className="date-card-header">
                <span className="date-card-name">{d.name}</span>
                <span className={`date-card-cost ${!canAfford ? 'unaffordable' : ''}`}>
                  {formatDollars(d.dateCost)}
                </span>
              </div>

              <div className="date-card-desc">{d.description}</div>

              {d.requiresLabel && (
                <div className={`date-card-req ${qualified ? 'met' : 'unmet'}`}>
                  {qualified ? '✓' : '✗'} {d.requiresLabel}
                </div>
              )}

              {!qualified && (
                <div className="date-card-reject-warn">
                  ⚠ Below requirement — risks rejection (Sanity −10)
                </div>
              )}

              {!canAfford && (
                <div className="date-card-reject-warn">
                  ⚠ Insufficient funds — this will bankrupt you
                </div>
              )}

              <div className="date-card-effects">
                {Object.entries(d.effects).map(([k, v]) => (
                  <span key={k} className={`date-effect ${v > 0 ? 'pos' : 'neg'}`}>
                    {k} {v > 0 ? '+' : ''}{v}
                  </span>
                ))}
              </div>

              {isMilestone && (
                <div className="date-card-milestone">💌 {d.milestoneText}</div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
