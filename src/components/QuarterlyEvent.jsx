const getRemoteBg = (characterId) =>
  characterId === 'paige' ? '/paigestudio.png' : '/maxstudio.png';

export default function QuarterlyEvent({ event, stats, characterId, onChoice }) {
  const bgImg = event.location === 'remote'
    ? getRemoteBg(characterId)
    : '/gsoffice.png';

  const canMeet = (req) => {
    if (!req) return true;
    return Object.entries(req).every(([k, v]) => (stats[k] || 0) >= v);
  };

  const formatEffects = (effects) =>
    Object.entries(effects).map(([k, v]) => (
      <span key={k} className={`qe-effect ${v > 0 ? 'pos' : 'neg'}`}>
        {k} {v > 0 ? '+' : ''}{v}
      </span>
    ));

  return (
    <div className="qe-screen">
      {/* Background scene */}
      <div
        className="qe-bg"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="qe-bg-overlay" />

      <div className="qe-card">
        <div className="qe-tag">QUARTERLY EVENT</div>
        <h2 className="qe-title">{event.title}</h2>
        <p className="qe-text">{event.text}</p>

        <div className="qe-choices">
          {event.choices.map((choice, i) => {
            const locked = choice.requires && !canMeet(choice.requires);
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
                  <div className="qe-choice-effects">{formatEffects(choice.effects)}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
