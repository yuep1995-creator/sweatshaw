import { formatDollars } from '../gameEngine';

const STAGE_LABELS = {
  analyst:   'Analyst',
  associate: 'Associate',
  vp:        'VP',
  director:  'Director',
};

function timeAgo(isoString) {
  const diff = Date.now() - new Date(isoString).getTime();
  const mins  = Math.floor(diff / 60_000);
  const hours = Math.floor(diff / 3_600_000);
  const days  = Math.floor(diff / 86_400_000);
  if (mins  < 1)   return 'just now';
  if (mins  < 60)  return `${mins}m ago`;
  if (hours < 24)  return `${hours}h ago`;
  return `${days}d ago`;
}

export default function SlotPicker({ slots, mode, onSelect, onCancel }) {
  return (
    <div className="sp-screen">
      <div className="sp-card">
        <div className="sp-tag">{mode === 'load' ? 'LOAD GAME' : 'SAVE GAME'}</div>
        <h2 className="sp-title">
          {mode === 'load' ? 'Select a save to load' : 'Select a slot to save'}
        </h2>

        <div className="sp-slots">
          {slots.map((slot, i) => {
            const slotNum = i + 1;
            const isEmpty = slot === null;
            const disabled = mode === 'load' && isEmpty;

            const gs         = slot?.gameState;
            const stageLabel = gs ? (STAGE_LABELS[gs.currentStageId] ?? gs.currentStageId) : '';
            const tenure     = gs ? `${stageLabel} — Year ${gs.currentYear}` : '';
            const wealth     = gs ? formatDollars(gs.stats.wealth) : '';
            const saved      = slot ? timeAgo(slot.savedAt) : '';

            return (
              <button
                key={slotNum}
                className={`sp-slot ${isEmpty ? 'sp-slot-empty' : ''} ${disabled ? 'sp-slot-disabled' : ''}`}
                onClick={() => !disabled && onSelect(slotNum)}
                disabled={disabled}
                data-sound="decline"
              >
                <div className="sp-slot-num">SLOT {slotNum}</div>

                {isEmpty ? (
                  <div className="sp-slot-empty-label">— Empty —</div>
                ) : (
                  <div className="sp-slot-info">
                    <div className="sp-slot-name">{gs.characterName}</div>
                    <div className="sp-slot-tenure">{tenure}</div>
                    <div className="sp-slot-wealth">Wealth: {wealth}</div>
                    <div className="sp-slot-date">Saved {saved}</div>
                  </div>
                )}

                {mode === 'save' && (
                  <div className={`sp-slot-action ${isEmpty ? 'save-here' : 'overwrite'}`}>
                    {isEmpty ? 'SAVE HERE' : 'OVERWRITE'}
                  </div>
                )}
              </button>
            );
          })}
        </div>

        <button className="btn btn-secondary sp-cancel" onClick={onCancel}>
          [ CANCEL ]
        </button>
      </div>
    </div>
  );
}
