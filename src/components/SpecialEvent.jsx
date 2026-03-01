import { formatDollars } from '../gameEngine';

export default function SpecialEvent({ eventType, gameState: gs, onDone }) {
  if (eventType === 'legacyHire') {
    return <LegacyHireEvent characterName={gs.characterName} onDone={onDone} />;
  }
  if (eventType === 'mummysHelp') {
    return <MummysHelpEvent gameState={gs} onDone={onDone} />;
  }
  return null;
}

// ── Legacy Hire event ─────────────────────────────────────────────────────
function LegacyHireEvent({ characterName, onDone }) {
  const choices = [
    { label: 'Walk past. Say nothing.', changes: { sanity: -3 } },
    { label: 'Work twice as hard next quarter.', changes: { sanity: -5 }, note: 'Competence gains +20% this quarter.' },
    { label: 'Use your network to find out who they are.', changes: { reputation: -8 }, note: '20% chance of discovery.' },
    { label: 'Go home and genuinely reflect on this.', changes: { sanity: 4 }, note: 'Unlocks grounded dialogue.' },
  ];

  const handleChoice = (choice) => {
    const statChanges = { ...choice.changes };
    if (choice.label.includes('network') && Math.random() > 0.8) {
      statChanges.reputation = (statChanges.reputation || 0) - 8;
    }
    onDone({ statChanges });
  };

  return (
    <div className="se-screen">
      <div className="se-card">
        <div className="se-tag">SPECIAL EVENT</div>
        <h2 className="se-title">The Stairwell</h2>
        <p className="se-text">
          You overhear two analysts talking in the stairwell. They don't know you're there.
        </p>
        <p className="se-text se-dialogue">
          "Would they even be a VP if their dad didn't go to school with Morrison?"
          <br />A pause. "Probably not."
          <br />They're talking about someone else. Probably.
        </p>
        <div className="se-choices">
          {choices.map((c, i) => (
            <button key={i} className="se-choice" onClick={() => handleChoice(c)}>
              <span className="se-choice-letter">{['A', 'B', 'C', 'D'][i]}</span>
              <div>
                <div className="se-choice-label">{c.label}</div>
                {c.note && <div className="se-choice-note">{c.note}</div>}
                <div className="se-choice-effects">
                  {Object.entries(c.changes).map(([k, v]) => (
                    <span key={k} className={v > 0 ? 'pos' : 'neg'}>{k} {v > 0 ? '+' : ''}{v}</span>
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Mummy's Help event ────────────────────────────────────────────────────
function MummysHelpEvent({ gameState: gs, onDone }) {
  const count     = gs.mummysHelpCount;
  const amount    = count >= 2 ? 100_000 : 50_000;
  const isBigOne  = count >= 2;

  const memo = isBigOne
    ? `"Darling. We need to talk about your budgeting. Also your father knows. — Mum x"`
    : `"For incidentals. Don't tell your father. Call me. — Mum x"`;

  const choices = [
    {
      letter: 'A',
      label: 'Accept it. It\'s not a big deal.',
      note: `Wealth +${formatDollars(amount)}, Reputation -5`,
      onChoose: () => onDone({ statChanges: { wealth: amount, reputation: -5 } }),
    },
    {
      letter: 'B',
      label: 'Accept it, but pay it back within the year.',
      note: `Wealth +${formatDollars(amount)} now. Repaid at Q4 automatically. Reputation +4 on repayment.`,
      onChoose: () => onDone({ statChanges: { wealth: amount }, flags: { mustRepayMum: true } }),
    },
    {
      letter: 'C',
      label: 'Decline. Send it back.',
      note: 'Reputation +8. Sanity -5. (This was incredibly stupid of you.)',
      onChoose: () => onDone({ statChanges: { reputation: 8, sanity: -5 } }),
    },
    {
      letter: 'D',
      label: 'Accept it and tell no one. Ever.',
      note: `Wealth +${formatDollars(amount)}. No reputation effect.`,
      onChoose: () => onDone({ statChanges: { wealth: amount }, flags: { secretBailout: true } }),
    },
  ];

  return (
    <div className="se-screen">
      <div className="se-card">
        <div className="se-tag">SPECIAL EVENT — MUMMY'S HELP</div>
        <h2 className="se-title">The Transfer</h2>
        <p className="se-text">
          Your account balance is looking somewhat uncomfortable for someone of your background. Your mother has noticed.
        </p>
        <p className="se-text">You didn't tell her. She just knew. She always knows.</p>
        <p className="se-text">
          A transfer arrives. <strong>{formatDollars(amount)}</strong>. The memo reads:
        </p>
        <p className="se-text se-dialogue">{memo}</p>
        <p className="se-text">What do you do?</p>
        <div className="se-choices">
          {choices.map((c) => (
            <button key={c.letter} className="se-choice" onClick={c.onChoose}>
              <span className="se-choice-letter">{c.letter}</span>
              <div>
                <div className="se-choice-label">{c.label}</div>
                <div className="se-choice-note">{c.note}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
