import { ENDINGS } from '../gameData';
import { formatDollars } from '../gameEngine';

export default function GameEnding({ endingId, gameState: gs, onRestart }) {
  const ending = ENDINGS[endingId] || ENDINGS.obsolescence;

  const epilogue = typeof ending.epilogue === 'function'
    ? ending.epilogue(gs.stats.sanity)
    : ending.epilogue;

  const text = ending.text(gs.characterName, gs.stats, gs);

  // American Psycho: dark full-screen, white serif, no branding
  if (ending.isAmericanPsycho) {
    return (
      <div className="ending-screen ending-ap-screen">
        <div className="ending-ap-card">
          <h1 className="ending-ap-title">{ending.title}</h1>
          <div className="ending-ap-body">
            {text.split('\n\n').map((para, i) => (
              <p key={i} className="ending-ap-para">{para}</p>
            ))}
          </div>
          <button className="btn btn-primary btn-large ending-restart" onClick={onRestart}>
            [ PLAY AGAIN ]
          </button>
        </div>
      </div>
    );
  }

  // Bankruptcy gets a stripped-down, logo-free card
  if (ending.isBankruptcy) {
    return (
      <div className="ending-screen ending-bankruptcy-screen">
        <div className="ending-bankruptcy-card">
          <h1 className="ending-bankruptcy-title">{ending.title}</h1>
          <div className="ending-bankruptcy-body">
            {text.split('\n\n').map((para, i) => (
              <p key={i} className="ending-para">{para}</p>
            ))}
          </div>
          <button className="btn btn-primary btn-large ending-restart" onClick={onRestart}>
            [ PLAY AGAIN ]
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ending-screen">
      <div className="ending-card" style={{ '--ending-colour': ending.colour }}>
        {/* Header */}
        <div className="ending-header">
          <img src="/gslogo.png" alt="" className="ending-logo" />
          <span className="ending-company">{gs.companyName}</span>
        </div>

        <div className="ending-stamp">CASE CLOSED</div>

        <h1 className="ending-title" style={{ color: ending.colour }}>{ending.title}</h1>

        <div className="ending-body">
          {text.split('\n\n').map((para, i) => (
            <p key={i} className="ending-para">{para}</p>
          ))}
        </div>

        <div className="ending-divider" />

        {epilogue && <p className="ending-epilogue">{epilogue}</p>}

        {/* Final stats */}
        <div className="ending-stats">
          <div className="ending-stats-label">FINAL PERFORMANCE RECORD</div>
          <div className="ending-stats-grid">
            {Object.entries(gs.stats).map(([k, v]) => (
              <div key={k} className="ending-stat">
                <span className="ending-stat-key">{k}</span>
                <span className="ending-stat-val" style={{ color: ending.colour }}>
                  {k === 'wealth' ? formatDollars(v) : v}
                </span>
              </div>
            ))}
            <div className="ending-stat">
              <span className="ending-stat-key">years served</span>
              <span className="ending-stat-val" style={{ color: ending.colour }}>{gs.currentYear - 1}</span>
            </div>
          </div>
        </div>

        {/* Badges */}
        {gs.allBadgesEarned.length > 0 && (
          <div className="ending-badges">
            <div className="ending-stats-label">TITLES EARNED</div>
            <div className="ending-badges-list">
              {gs.allBadgesEarned.map(id => {
                const icons  = { officeFurniture:'🪑', starAssociate:'⭐', spreadsheetWhisperer:'🧠', theGhost:'👻', runningOnFumes:'🫠', linkedInInfluencer:'🤡', actuallyOkay:'🧘', taken:'💌', overachiever:'🏆' };
                const labels = { officeFurniture:'Office Furniture', starAssociate:'Star Associate', spreadsheetWhisperer:'Spreadsheet Whisperer', theGhost:'The Ghost', runningOnFumes:'Running on Fumes', linkedInInfluencer:'LinkedIn Influencer', actuallyOkay:'Actually Okay', taken:'Taken', overachiever:'Overachiever' };
                return (
                  <span key={id} className="ending-badge">
                    {icons[id] || '🏅'} {labels[id] || id}
                  </span>
                );
              })}
            </div>
          </div>
        )}

        <div className="ending-fine-print">
          This document is confidential. Sweatshaw & Co accepts no liability for emotional damage sustained during employment.
        </div>

        <button className="btn btn-primary btn-large ending-restart" onClick={onRestart}>
          [ PLAY AGAIN ]
        </button>
      </div>
    </div>
  );
}
