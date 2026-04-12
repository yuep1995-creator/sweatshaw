export default function PersonalDevNote({ gameState: gs, onChoice }) {
  const canPE = gs.stats.competence > 450;

  return (
    <div className="se-screen">
      <div className="se-card">
        <div className="se-tag">PERSONAL DEVELOPMENT NOTE</div>
        <h2 className="se-title">The Crossroads</h2>
        <p className="se-text">
          You've been at {gs.companyName} for a year as an Associate. A headhunter calls about a Private Equity role at Darkstone &amp; Partners. And a former colleague just announced a Series B — $40 million raised. They look annoyingly happy in the photo.
        </p>
        <div className="se-choices">
          <button className="se-choice pdn-choice--default" onClick={() => onChoice('stay')}>
            <span className="se-choice-letter">A</span>
            <div>
              <div className="se-choice-label">Stay at {gs.companyName}. You like it here. Mostly.</div>
            </div>
          </button>

          <button
            className={`se-choice ${!canPE ? 'pdn-choice--locked' : ''}`}
            onClick={() => canPE && onChoice('pe')}
            disabled={!canPE}
          >
            <span className="se-choice-letter">B</span>
            <div>
              <div className="se-choice-label">Jump to Private Equity → Darkstone &amp; Partners</div>
              <div className="se-choice-note">
                {canPE
                  ? 'Salary ×1.2, promotion requirements ×1.2'
                  : `Requires Competence > 450 — yours is ${gs.stats.competence}`}
              </div>
            </div>
          </button>

          <button className="se-choice" onClick={() => onChoice('startup')}>
            <span className="se-choice-letter">C</span>
            <div>
              <div className="se-choice-label">Join a startup.</div>
            </div>
          </button>

          <button className="se-choice" onClick={() => onChoice('sabotage')}>
            <span className="se-choice-letter">D</span>
            <div>
              <div className="se-choice-label">Send the headhunter to a rival colleague.</div>
              <div className="se-choice-note">Competence +40, Sanity −30</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
