import { useState } from 'react';
import { ENDINGS, EXTENSION_ENDINGS } from '../gameData';
import { formatDollars } from '../gameEngine';

export default function GameEnding({ endingId, gameState: gs, onRestart, onNextChapter }) {
  const [phase, setPhase] = useState('base'); // 'base' | 'extension'

  const ending = ENDINGS[endingId] || ENDINGS.obsolescence;

  // Find matching extension ending (if any)
  const extensionEntry = Object.entries(EXTENSION_ENDINGS).find(
    ([, ext]) => ext.triggeredBy.includes(endingId) && ext.condition(gs)
  );
  const extensionEnding = extensionEntry?.[1];

  const epilogue = typeof ending.epilogue === 'function'
    ? ending.epilogue(gs.characterName, gs.stats.sanity, gs)
    : ending.epilogue;

  const title = typeof ending.title === 'function' ? ending.title(gs) : ending.title;

  const text = ending.text(gs.characterName, gs.stats, gs);

  // ── Extension ending screen ──────────────────────────────────────────────
  if (phase === 'extension' && extensionEnding) {
    const extText = typeof extensionEnding.text === 'function'
      ? extensionEnding.text(gs.characterName, gs.stats, gs)
      : extensionEnding.text;
    const extEpilogue = typeof extensionEnding.epilogue === 'function'
      ? extensionEnding.epilogue(gs.characterName, gs.stats.sanity, gs)
      : extensionEnding.epilogue;

    const extBgSrc = typeof extensionEnding.bg === 'object'
      ? (gs.characterId === 'paige' ? extensionEnding.bg.paige : extensionEnding.bg.max)
      : extensionEnding.bg;

    return (
      <div
        className="ending-screen ending-screen--char-bg"
        style={extBgSrc ? { backgroundImage: `url('${extBgSrc}')` } : undefined}
      >
        <div className="ending-card" style={{ '--ending-colour': extensionEnding.colour }}>
          <div className="ending-header">
            <img src={gs.isPEPath ? '/dplogo.png' : '/sclogo.png'} alt="" className="ending-logo" />
            <span className="ending-company">{gs.isPEPath ? 'Darkstone Partners' : gs.companyName}</span>
          </div>

          <div className="ending-stamp">NEXT CHAPTER</div>

          <h1 className="ending-title" style={{ color: extensionEnding.colour }}>{extensionEnding.title}</h1>

          <div className="ending-body">
            {extText.split('\n\n').map((para, i) => (
              <p key={i} className="ending-para">{para}</p>
            ))}
          </div>

          {extEpilogue && (
            <>
              <div className="ending-divider" />
              <p className="ending-epilogue">{extEpilogue}</p>
            </>
          )}

          <button className="btn btn-primary btn-large ending-restart" onClick={onRestart}>
            [ PLAY AGAIN ]
          </button>
        </div>
      </div>
    );
  }

  // ── American Psycho: dark full-screen, white serif, no branding ──────────
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

  // ── Bankruptcy: stripped-down, logo-free card ────────────────────────────
  if (ending.isBankruptcy) {
    return (
      <div className="ending-screen ending-bankruptcy-screen" style={{ backgroundImage: "url('/bankruptcy.png')" }}>
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

  const CHAR_BG_ENDINGS = {
    fire:                    { paige: 'firepaige',            max: 'firemax'            },
    regulator:               { paige: 'regulatorpaige',       max: 'regulatormax'       },
    burntOut:                { paige: 'burntoutpaige',        max: 'burntoutmax'        },
    upOrOut:                 { paige: 'uporoutpaige',         max: 'uporoutmax'         },
    permanentVP:             { paige: 'vppaige',              max: 'vpmax'              },
    headOfInternalStrategy:  { paige: 'internalstratpaige',  max: 'internalstratmax'   },
    professionalCoach:       { paige: 'ecoachpaige',         max: 'ecoachmax'          },
    mentalBreakdown:         { paige: 'mentalpaige',          max: 'mentalmax'          },
    madeMD:                  { paige: 'madeMDpaige',          max: 'madeMDmax'          },
    hollowMD:                { paige: 'ehollowpaige',         max: 'ehollowmax'         },
    hollowVictory:           { paige: 'ehollowpaige',         max: 'ehollowmax'         },
    madePartner:             { paige: 'madepartnerpaige',     max: 'madepartnermax'     },
    kingOfWallStreet:        { paige: 'kingofwspaige',        max: 'kingofwsmax'        },
  };
  const SHARED_BG_ENDINGS = {
    startupSuccess: '/startupsuc.png',
    startupBust:    '/startupbust.png',
    headOfCorpDev:  '/corpdev.png',
    friendsFO:      '/efamilyoffice.png',
  };
  const charBgKey = CHAR_BG_ENDINGS[endingId];
  const charBg = charBgKey
    ? `url('/${gs.characterId === 'paige' ? charBgKey.paige : charBgKey.max}.png')`
    : SHARED_BG_ENDINGS[endingId]
    ? `url('${SHARED_BG_ENDINGS[endingId]}')`
    : undefined;

  const hasBgClass = ['backToFamilyBusiness', 'fire', 'regulator', 'burntOut', 'upOrOut', 'permanentVP', 'headOfInternalStrategy', 'professionalCoach', 'mentalBreakdown', 'madeMD', 'hollowMD', 'hollowVictory', 'madePartner', 'kingOfWallStreet', 'startupSuccess', 'startupBust', 'headOfCorpDev', 'friendsFO'].includes(endingId);

  return (
    <div
      className={`ending-screen${endingId === 'backToFamilyBusiness' ? ' ending-screen--family-business' : ''}${hasBgClass && !['backToFamilyBusiness'].includes(endingId) ? ' ending-screen--char-bg' : ''}`}
      style={charBg ? { backgroundImage: charBg } : undefined}
    >
      <div className="ending-card" style={{ '--ending-colour': ending.colour }}>
        {/* Header */}
        <div className="ending-header">
          <img src={gs.isPEPath ? '/dplogo.png' : '/sclogo.png'} alt="" className="ending-logo" />
          <span className="ending-company">{gs.isPEPath ? 'Darkstone Partners' : gs.companyName}</span>
        </div>

        <div className="ending-stamp">CASE CLOSED</div>

        <h1 className="ending-title" style={{ color: ending.colour }}>{title}</h1>

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
                const icons  = { officeFurniture:'🪑', starAssociate:'⭐', spreadsheetWhisperer:'🧠', theGhost:'👻', runningOnFumes:'🫠', actuallyOkay:'🧘', taken:'💌', overachiever:'🏆' };
                const labels = { officeFurniture:'Office Furniture', starAssociate:'Star Associate', spreadsheetWhisperer:'Spreadsheet Whisperer', theGhost:'The Ghost', runningOnFumes:'Running on Fumes', actuallyOkay:'Actually Okay', taken:'Taken', overachiever:'Overachiever' };
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

        {extensionEnding ? (
          <button className="btn btn-primary btn-large ending-restart" onClick={() => { setPhase('extension'); onNextChapter && onNextChapter(extensionEnding.music); }}>
            [ NEXT CHAPTER ]
          </button>
        ) : (
          <button className="btn btn-primary btn-large ending-restart" onClick={onRestart}>
            [ PLAY AGAIN ]
          </button>
        )}
      </div>
    </div>
  );
}
