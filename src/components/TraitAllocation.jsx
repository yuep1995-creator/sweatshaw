import { useState, useMemo } from 'react';
import { TRAITS, getSnarkyComment } from '../gameData';

const TOTAL_POINTS = 140;
const MIN_PER_TRAIT = 10;
const MAX_PER_TRAIT = 100;
const DEFAULT_TRAITS = {
  intelligence: 10,
  grit: 10,
  looks: 10,
  streetSmart: 10,
  familyBackground: 10,
};

export default function TraitAllocation({ character, onConfirm }) {
  const [traits, setTraits] = useState({ ...DEFAULT_TRAITS });
  const [tooltip, setTooltip] = useState(null);

  const totalAllocated = useMemo(() => Object.values(traits).reduce((a, b) => a + b, 0), [traits]);
  const remaining = TOTAL_POINTS - totalAllocated;
  const isConfirmable = remaining === 0;

  const handleChange = (id, newVal) => {
    const currentOthersTotal = totalAllocated - traits[id];
    const maxFromPool = TOTAL_POINTS - currentOthersTotal;
    const finalVal = Math.max(MIN_PER_TRAIT, Math.min(newVal, maxFromPool, MAX_PER_TRAIT));
    setTraits((prev) => ({ ...prev, [id]: finalVal }));
  };

  const snarky = useMemo(() => getSnarkyComment(traits), [traits]);

  const remainingColour =
    remaining === 0 ? '#22c55e' : remaining < 0 ? '#ef4444' : '#f59e0b';

  return (
    <div className="screen trait-screen">
      <div className="screen-header">
        <h1 className="screen-title">TRAIT ALLOCATION</h1>
        <p className="screen-subtitle">
          Before you walk through those doors, let&apos;s talk about what you&apos;re walking in
          with. You have 90 points to distribute across 5 traits. Choose wisely. Or don&apos;t.
          This is your origin story.
        </p>
      </div>

      <div className="trait-layout">
        <div className="trait-list">
          {TRAITS.map((trait) => {
            const val = traits[trait.id];
            const pct = (val / MAX_PER_TRAIT) * 100;
            return (
              <div key={trait.id} className="trait-row">
                <div className="trait-header-row">
                  <span className="trait-icon">{trait.icon}</span>
                  <div className="trait-labels">
                    <span className="trait-name">{trait.name}</span>
                    <span className="trait-subtitle">{trait.subtitle}</span>
                  </div>
                  <div
                    className="trait-info-btn"
                    onMouseEnter={() => setTooltip(trait.id)}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    ?
                    {tooltip === trait.id && (
                      <div className="trait-tooltip">{trait.tooltip}</div>
                    )}
                  </div>
                  <span className="trait-value">{val}</span>
                </div>

                <p className="trait-description">{trait.description}</p>

                <div className="trait-slider-row">
                  <span className="slider-min">{MIN_PER_TRAIT}</span>
                  <div className="slider-track-wrap">
                    <div
                      className="slider-fill"
                      style={{ width: `${pct}%`, background: 'var(--accent)' }}
                    />
                    <input
                      type="range"
                      min={MIN_PER_TRAIT}
                      max={MAX_PER_TRAIT}
                      value={val}
                      onChange={(e) => handleChange(trait.id, Number(e.target.value))}
                      className="trait-slider"
                    />
                  </div>
                  <span className="slider-max">{MAX_PER_TRAIT}</span>
                </div>

                {trait.finePrint && (
                  <p className="trait-fine-print">
                    * {trait.finePrint(character.name.split(' ')[0])}
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="trait-sidebar">
          <div className="points-panel">
            <div className="points-label">Points Remaining</div>
            <div className="points-count" style={{ color: remainingColour }}>
              {remaining}
            </div>
            <div className="points-bar-outer">
              <div
                className="points-bar-inner"
                style={{
                  width: `${((TOTAL_POINTS - remaining) / TOTAL_POINTS) * 100}%`,
                  background: remainingColour,
                }}
              />
            </div>
            <div className="points-note">
              {remaining > 0
                ? `${remaining} point${remaining === 1 ? '' : 's'} left to assign.`
                : remaining < 0
                ? `${Math.abs(remaining)} point${Math.abs(remaining) === 1 ? '' : 's'} over budget.`
                : 'Points fully allocated. '}
              {remaining === 0 && <strong>Nice.</strong>}
            </div>
          </div>

          <div className="snarky-panel">
            <div className="snarky-label">SYSTEM ASSESSMENT</div>
            <p className="snarky-text">🤖 {snarky}</p>
          </div>

          <div className="trait-preview-panel">
            <div className="preview-label">STAT PREVIEW</div>
            <div className="preview-grid">
              <span className="preview-key">Competence</span>
              <span className="preview-val">{traits.intelligence} / 500</span>
              <span className="preview-key">Charisma</span>
              <span className="preview-val">{traits.looks} / 500</span>
              <span className="preview-key">Reputation</span>
              <span className="preview-val">{10 + Math.floor(traits.familyBackground * 0.3)} / 999</span>
              <span className="preview-key">Starting Sanity</span>
              <span className="preview-val">{Math.min(200, 50 + Math.floor(traits.grit * 0.3))} / 200</span>
              <span className="preview-key">Sanity Floor</span>
              <span className="preview-val">{Math.floor(traits.grit / 2)}</span>
              <span className="preview-key">Starting Wealth</span>
              <span className="preview-val">{traits.familyBackground === 100 ? '$1,000,000' : `$${(traits.familyBackground * 1_000).toLocaleString()}`}</span>
            </div>
            <div className="preview-cap-note">Competence · Charisma · Reputation cap at 500. Sanity caps at 100.</div>
          </div>

          <button
            className={`btn btn-primary btn-confirm ${!isConfirmable ? 'disabled' : ''}`}
            onClick={() => isConfirmable && onConfirm(traits)}
            disabled={!isConfirmable}
          >
            {isConfirmable ? '[ CONFIRM ]' : `[ ${remaining} PTS REMAINING ]`}
          </button>
          {!isConfirmable && (
            <p className="confirm-hint">
              Allocate all 90 points to proceed. The system is watching.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
