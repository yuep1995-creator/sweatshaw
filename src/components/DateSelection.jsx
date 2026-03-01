import { DATE_OPTIONS } from '../gameData';

export default function DateSelection({ gameState: gs, onDateChosen }) {
  return (
    <div className="date-screen">
      <div className="date-header">
        <h2 className="date-title">Take a Weekend</h2>
        <p className="date-subtitle">
          You have the weekend. A rare, borderline mythological event. Someone wants to spend it with you.
        </p>
      </div>

      <div className="date-grid">
        {DATE_OPTIONS.map(d => {
          const count = gs.dateHistory[d.id] || 0;
          const isMilestone = count >= 2;
          return (
            <button
              key={d.id}
              className={`date-card ${isMilestone ? 'milestone' : ''}`}
              onClick={() => onDateChosen(d)}
            >
              <div className="date-card-name">{d.name}</div>
              <div className="date-card-desc">{d.description}</div>
              {isMilestone && (
                <div className="date-card-milestone">💌 {d.milestoneText}</div>
              )}
              <div className="date-card-effects">
                {Object.entries(d.effects).map(([k, v]) => (
                  <span key={k} className={`date-effect ${v > 0 ? 'pos' : 'neg'}`}>
                    {k} {v > 0 ? '+' : ''}{v}
                  </span>
                ))}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
