import { useState, useEffect } from 'react';
import { formatDollars } from '../gameEngine';

const TAX_RATE = 0.40;

const BONUS_EVENTS = {
  peSyntheticCarry: {
    charImage: '/pebosshappy.png',
    bgImage:   '/pebossoffice.png',
    speaker:   'Partner — Darkstone & Partners',
    grossBonus: 200_000,
    dialogue: (name, pron3) =>
      `The RestructuringCo investment closed last week at a 3.8× return — one of the best exits this fund has produced.\n\n${name} played a material role in that outcome. The modelling, the management prep, the way ${pron3} handled the LP process under pressure.\n\n"I don't give these out lightly," he says, setting down his pen. "But credit where it's due."\n\n"Effective immediately, you are being awarded a $200,000 synthetic carry in recognition of your contribution to the RestructuringCo deal."`,
  },
  peCarry: {
    charImage: '/pebosshappy.png',
    bgImage:   '/pebossoffice.png',
    speaker:   'Partner — Darkstone & Partners',
    grossBonus: 1_500_000,
    dialogue: (name, pron3) =>
      `The CarveoutCo realisation came through this morning. Final multiple: 3.1×.\n\n"${name}," he says, leaning forward. "You may remember this one. CarveoutCo was one of the first deals you worked on when you joined the firm. The diligence, the early modelling — that groundwork mattered more than people gave it credit for at the time."\n\nHe pauses.\n\n"The carry pool has been allocated. Given ${pron3} involvement in the early years of this investment, it was decided that ${name} should receive a meaningful share."\n\nHe slides a document across the desk.\n\n"You are being awarded $1,500,000 in deal carry. It will be processed this quarter. Tax will be withheld at source."`,
  },
  ibChristmasBonus: {
    charImage: '/happyboss.png',
    bgImage:   '/bankbossoffice.png',
    speaker:   'Managing Director — Sweatshaw & Co',
    grossBonus: 150_000,
    dialogue: (name, pron3) =>
      `"Close the door."\n\nHe leans back. There is something almost relaxed about him today, which is not an expression you have seen often.\n\n"The team generated $88 million in fees last year. Best performing team in the firm. Full stop."\n\nA pause. He lets that land.\n\n"We have a very fat bonus pool this year, and it was decided — by me — that ${name} will receive a $150,000 one-off Christmas bonus. On top of the annual. In recognition of the year ${pron3} had."\n\nHe stands. Meeting over. "Well done. Don't make me regret it."`,
  },
};

export default function BonusEvent({ gameState: gs, bonusEventId, onDone }) {
  const [fadeOut,  setFadeOut]  = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 400);
    return () => clearTimeout(t);
  }, []);

  const event = BONUS_EVENTS[bonusEventId];
  if (!event) return null;

  const firstName = gs.characterName?.split(' ')[0] ?? gs.characterName;
  const pron3     = gs.characterId === 'max' ? 'his' : 'her';
  const text      = event.dialogue(firstName, pron3);
  const lines     = text.split('\n');

  const gross      = event.grossBonus;
  const taxWithheld = Math.round(gross * TAX_RATE);
  const net        = gross - taxWithheld;

  const handleAccept = () => {
    setFadeOut(true);
    setTimeout(() => onDone(net, gross, taxWithheld), 600);
  };

  return (
    <div
      className={`bi-screen${fadeOut ? ' bi-fadeout' : ''}`}
      style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.5s ease' }}
    >
      <div className="bi-bg" style={{ backgroundImage: `url('${event.bgImage}')` }} />
      <div className="bi-overlay" />

      <img src={event.charImage} className="bi-boss" alt="" />

      <div className="bi-left-panel">
        <div className="bi-dialogue">
          <div className="bi-speaker">{event.speaker}</div>
          <div className="bi-text">
            {lines.map((line, i) =>
              line === ''
                ? <br key={i} />
                : <span key={i}>{line}<br /></span>
            )}
          </div>
        </div>

        <button className="bi-begin" onClick={handleAccept}>
          Accept — {formatDollars(net)} net deposited
        </button>
      </div>
    </div>
  );
}
