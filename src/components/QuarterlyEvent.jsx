import { useState, useEffect } from 'react';
import { formatDollars } from '../gameEngine';

const getRemoteBg = (characterId) =>
  characterId === 'paige' ? '/paigestudio.png' : '/maxstudio.png';

const HOUSING_BG = {
  studio:    { paige: '/paigestudio.png', max: '/maxstudio.png' },
  oneBed:    { paige: '/paige1bed.png',   max: '/max1bed.png'   },
  twoBed:    { paige: '/paige2bed.png',   max: '/max2bed.png'   },
  mansion:   { paige: '/paige2bed.png',   max: '/max2bed.png'   },
  penthouse: { paige: '/paigeph.png',     max: '/maxph.png'     },
};

const STAGE_ORDER = ['analyst', 'associate', 'vp', 'director'];

export default function QuarterlyEvent({ event, stats, characterId, isPEPath, housingTier, currentStageId, onChoice }) {
  const [cardVisible, setCardVisible] = useState(false);
  const [cryptoPhase, setCryptoPhase]   = useState('input'); // 'input' | 'reveal'
  const [cryptoAmount, setCryptoAmount] = useState(0);
  const [cryptoWon, setCryptoWon]       = useState(false);

  useEffect(() => {
    setCardVisible(false);
    setCryptoPhase('input');
    setCryptoAmount(0);
    const timer = setTimeout(() => setCardVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [event.id]);

  const char = characterId === 'paige' ? 'paige' : 'max';
  const bgImg = event.id === 'theHotIntern'
    ? (isPEPath ? '/pebossoffice.png' : '/bankbossoffice.png')
    : event.id === 'apresSki'
    ? '/bstmoritz.png'
    : event.id === 'christmasParty'
    ? '/network.png'
    : event.id === 'therapyTime'
    ? '/therapy.png'
    : event.id === 'humbleBragging'
    ? '/bclub.png'
    : event.id === 'birthdayDeal'
    ? '/bdaybaby.png'
    : event.id === 'theHangover'
    ? '/bclub.png'
    : event.id === 'clientWhooper'
    ? (isPEPath ? '/peoffice.png' : '/bcoffice.png')
    : event.id === 'linkedInPost'
    ? (isPEPath ? '/peoffice.png' : '/bcoffice.png')
    : event.id === 'cryptoCrypto'
    ? '/crypto.png'
    : event.id === 'fomo'
    ? '/hands.png'
    : event.id === 'theOffsite'
    ? '/hamptonsclub.png'
    : event.id === 'feedbackSandwich' || event.id === 'theWADrama' || event.id === 'theAIDeck'
    ? (isPEPath ? '/pebossoffice.png' : '/bankbossoffice.png')
    : event.id === 'boardQuestion'
    ? '/boardroom.png'
    : event.id === 'timeOff'
    ? '/bearmountain.png'
    : event.id === 'saturdayCall' || event.id === 'theTombstone'
    ? (HOUSING_BG[housingTier]?.[char] ?? getRemoteBg(characterId))
    : event.location === 'remote'
    ? getRemoteBg(characterId)
    : isPEPath ? '/peoffice.png' : '/gsoffice.png';

  const canMeet = (choice) => {
    if (choice.requiresStage) {
      const required = STAGE_ORDER.indexOf(choice.requiresStage);
      const current  = STAGE_ORDER.indexOf(currentStageId);
      if (current < required) return false;
    }
    if (!choice.requires) return true;
    return Object.entries(choice.requires).every(([k, v]) => (stats[k] || 0) >= v);
  };

  const formatEffects = (effects) =>
    Object.entries(effects).map(([k, v]) => (
      <span key={k} className={`qe-effect ${v > 0 ? 'pos' : 'neg'}`}>
        {k} {v > 0 ? '+' : ''}{v}
      </span>
    ));

  // ── Crypto event handlers ─────────────────────────────────────────────────
  const maxCrypto = Math.floor((stats.wealth || 0) / 2);

  const handleCryptoInvest = () => {
    const won = Math.random() < 0.6;
    setCryptoWon(won);
    setCryptoPhase('reveal');
  };

  const handleCryptoContinue = () => {
    let wealthDelta = 0;
    if (cryptoAmount > 0) {
      wealthDelta = cryptoWon ? cryptoAmount : -Math.floor(cryptoAmount / 2);
    }
    onChoice({ effects: { wealth: wealthDelta }, label: 'Crypto investment' });
  };

  return (
    <div className="qe-screen">
      {/* Background scene */}
      <div
        className="qe-bg"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="qe-bg-overlay" />

      <div className={`qe-card ${cardVisible ? 'qe-card--visible' : ''}`}>
        <div className="qe-tag">QUARTERLY EVENT</div>
        <h2 className="qe-title">{event.title}</h2>
        <p className="qe-text">{event.text}</p>

        {event.isCryptoEvent ? (
          cryptoPhase === 'input' ? (
            <div className="qe-crypto">
              <div className="qe-crypto-display">
                <span className="qe-crypto-label">Investment</span>
                <span className="qe-crypto-value">{formatDollars(cryptoAmount)}</span>
              </div>
              <input
                type="range"
                min={0}
                max={maxCrypto}
                step={Math.max(100, Math.floor(maxCrypto / 100) * 10)}
                value={cryptoAmount}
                onChange={e => setCryptoAmount(Number(e.target.value))}
                className="qe-crypto-slider"
              />
              <div className="qe-crypto-limits">
                <span>$0</span>
                <span>Max {formatDollars(maxCrypto)}</span>
              </div>
              <button className="btn btn-primary qe-crypto-btn" onClick={handleCryptoInvest}>
                {cryptoAmount === 0 ? '[ SKIP ]' : '[ INVEST ]'}
              </button>
            </div>
          ) : (
            <div className="qe-crypto-reveal">
              {cryptoAmount === 0 ? (
                <p className="qe-crypto-result">You watched Memecoin from the sidelines. Probably wise.</p>
              ) : cryptoWon ? (
                <>
                  <p className="qe-crypto-result qe-crypto-win">
                    🚀 Memecoin is up 100%. Your {formatDollars(cryptoAmount)} is now {formatDollars(cryptoAmount * 2)}.
                  </p>
                  <p className="qe-crypto-delta pos">+{formatDollars(cryptoAmount)}</p>
                </>
              ) : (
                <>
                  <p className="qe-crypto-result qe-crypto-loss">
                    📉 Memecoin crashed 50%. Your {formatDollars(cryptoAmount)} is now {formatDollars(Math.floor(cryptoAmount / 2))}.
                  </p>
                  <p className="qe-crypto-delta neg">−{formatDollars(Math.floor(cryptoAmount / 2))}</p>
                </>
              )}
              <button className="btn btn-primary qe-crypto-btn" onClick={handleCryptoContinue}>
                [ CONTINUE ]
              </button>
            </div>
          )
        ) : (
          <div className="qe-choices">
            {event.choices.map((choice, i) => {
              const locked = !canMeet(choice);
              return (
                <button
                  key={i}
                  className={`qe-choice ${locked ? 'locked' : ''} ${choice.isD ? 'option-d' : ''}`}
                  onClick={() => !locked && onChoice(choice)}
                  disabled={locked}
                >
                  <span className="qe-choice-letter">{['A','B','C','D'][i]}</span>
                  <div className="qe-choice-body">
                    <div className="qe-choice-label">{choice.label}</div>
                    {locked && <div className="qe-choice-req">{choice.requiresLabel}</div>}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
