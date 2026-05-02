import { useState, useEffect, useCallback } from 'react';

const STEPS = [
  {
    targetId:    'tut-actions',
    title:       '#1 Monthly Actions',
    description: "You have 3 Monthly Actions per Quarter. Bankers' Time Are Precious. Choose wisely.",
  },
  {
    targetId:    'tut-sanity',
    title:       'Sanity',
    description: "Sanity: the one metric your MD will never put on your performance review, and the one that matters most.",
  },
  {
    targetId:    'tut-promo',
    title:       'Promotion Bar',
    description: "Meet all promotion criteria within three years or be shown the door with a firm handshake and a suspiciously generic reference letter. Your promotion cycle is every 3 years.",
  },
  {
    targetId:    'tut-items',
    title:       'Item Purchase',
    description: "You may purchase one item per quarter, separate from your Monthly Actions. A friendly reminder that your possessions will outlast your sanity, your relationships, and quite possibly your career.",
  },
];

const TOTAL_STEPS = STEPS.length + 1; // +1 for the closing modal
const PAD = 10;
const CARD_HEIGHT = 160;

export default function TutorialOverlay({ onDone }) {
  const [step, setStep] = useState(0);
  const [rect, setRect] = useState(null);

  const isClosingModal = step === STEPS.length;
  const current = STEPS[step];

  const measure = useCallback(() => {
    if (isClosingModal) return;
    const el = document.getElementById(STEPS[step].targetId);
    if (el) setRect(el.getBoundingClientRect());
  }, [step, isClosingModal]);

  useEffect(() => {
    if (isClosingModal) { setRect(null); return; }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, isClosingModal]);

  const handleNext = () => {
    if (step < STEPS.length) {
      setStep(s => s + 1);
    } else {
      onDone();
    }
  };

  // Position tooltip card: prefer below, fall back to above
  const cardStyle = rect ? (() => {
    const spaceBelow = window.innerHeight - (rect.bottom + PAD + 16);
    const top = spaceBelow >= CARD_HEIGHT
      ? rect.bottom + PAD + 12
      : rect.top - PAD - CARD_HEIGHT - 12;
    const left = Math.max(12, Math.min(rect.left, window.innerWidth - 316));
    return { top, left };
  })() : {};

  return (
    <div className="tut-overlay">

      {/* ── Spotlight steps (1–4) ── */}
      {!isClosingModal && rect && (
        <div
          className="tut-spotlight"
          style={{
            top:    rect.top    - PAD,
            left:   rect.left   - PAD,
            width:  rect.width  + PAD * 2,
            height: rect.height + PAD * 2,
          }}
        />
      )}

      {!isClosingModal && rect && (
        <div className="tut-card" style={cardStyle}>
          <div className="tut-step-ind">{step + 1} / {TOTAL_STEPS}</div>
          <div className="tut-card-title">{current.title}</div>
          <p className="tut-card-desc">{current.description}</p>
          <div className="tut-card-footer">
            <button className="tut-skip-btn" onClick={onDone}>Skip</button>
            <button className="tut-next-btn" onClick={handleNext}>Next →</button>
          </div>
        </div>
      )}

      {/* ── Closing modal (step 5) ── */}
      {isClosingModal && (
        <div className="tut-closing-modal">
          <p className="tut-closing-text">
            This is it, your investment banking career starts today. Good luck, you will need it.
          </p>
          <button className="tut-grind-btn" onClick={onDone}>
            Start the Grind
          </button>
        </div>
      )}

    </div>
  );
}
