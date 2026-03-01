import { useState, useEffect } from 'react';

const INTRO_LINES = [
  "You have a degree, a dream, and a laptop bag that cost more than your first paycheck.",
  "You've watched every TED Talk. You've optimised your LinkedIn. You've practiced your firm handshake in the mirror.",
  "This is it. The first day of the rest of your career.",
  "Good luck. You're going to need it.",
];

const TICKER_ITEMS = [
  'Q3 EARNINGS EXCEED PROJECTIONS',
  'HEADCOUNT REVIEW SCHEDULED',
  'SYNERGY TARGETS MET',
  'RESTRUCTURING ANNOUNCEMENT PENDING',
  'TEAM OFFSITE CANCELLED — BUDGET',
  'MANDATORY TRAINING: WEDNESDAY',
  'CEO MEMO: CULTURE IS OUR PRODUCT',
  'PERFORMANCE CYCLE OPENS MONDAY',
  'FREE PIZZA IN BREAKROOM (GONE)',
  'URGENT: REPLY ALL INCIDENT UNDER INVESTIGATION',
];

export default function IntroScreen({ onBegin, onLoad, hasSave }) {
  const [phase, setPhase] = useState(0); // 0=logo, 1=text, 2=button
  const [tickerOffset, setTickerOffset] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), 600);
    const t2 = setTimeout(() => setPhase(2), 3000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  // Ticker scroll
  useEffect(() => {
    const id = setInterval(() => setTickerOffset(o => o - 1), 30);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="intro-screen">
      {/* Scrolling background grid */}
      <div className="intro-bg-grid" />

      {/* Ambient corner stats */}
      <div className="intro-ambient intro-ambient-tl">
        <span>FISCAL YEAR 01</span>
        <span>HEADCOUNT: 1</span>
        <span>MORALE: UNKNOWN</span>
      </div>
      <div className="intro-ambient intro-ambient-tr">
        <span>SECTOR: CORPORATE</span>
        <span>RISK LEVEL: HIGH</span>
        <span>EXIT: OPTIONAL</span>
      </div>
      <div className="intro-ambient intro-ambient-bl">
        <span>PORTFOLIO: EMPTY</span>
        <span>AMBITION: MAXIMUM</span>
      </div>
      <div className="intro-ambient intro-ambient-br">
        <span>STATUS: PROBATIONARY</span>
        <span>REVIEWED: NEVER</span>
      </div>

      {/* Main content */}
      <div className="intro-content">
        {/* Logo */}
        <div className={`intro-logo-block ${phase >= 0 ? 'intro-phase-in' : ''}`}>
          <img src="/gslogo.png" alt="Goldman Stanley" className="intro-logo-img" />
          <div className="intro-logo-sub">Where Ambition Meets Accountability™</div>
        </div>

        {/* Text */}
        <div className={`intro-text-block ${phase >= 1 ? 'intro-phase-in' : ''}`}>
          {INTRO_LINES.map((line, i) => (
            <p
              key={i}
              className="intro-line"
              style={{ animationDelay: `${i * 0.45}s` }}
            >
              {line}
            </p>
          ))}
        </div>

        {/* Buttons */}
        <div className={`intro-button-wrap ${phase >= 2 ? 'intro-phase-in' : ''}`}>
          <div className="intro-btn-row">
            <button className="btn btn-primary btn-large intro-cta" onClick={onBegin}>
              [ NEW GAME ]
            </button>
            {hasSave && (
              <button className="btn btn-secondary btn-large intro-cta intro-load-btn" onClick={onLoad}>
                [ LOAD GAME ]
              </button>
            )}
          </div>
          <p className="intro-fine-print">
            By clicking NEW GAME you agree to sacrifice your work-life balance. Terms non-negotiable.
          </p>
        </div>
      </div>

      {/* News ticker at bottom */}
      <div className="intro-ticker">
        <span className="ticker-label">BREAKING</span>
        <div className="ticker-track">
          <span className="ticker-content" style={{ transform: `translateX(${tickerOffset % (TICKER_ITEMS.join(' ◆ ').length * 9)}px)` }}>
            {[...TICKER_ITEMS, ...TICKER_ITEMS].join(' ◆ ')}
          </span>
        </div>
      </div>
    </div>
  );
}
