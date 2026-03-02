import { useState, useEffect } from 'react';

const PAGES = [
  `Welcome to Sweatshaw & Co.\n\nLook around this room. Take a good look.\nHalf of you will not be here in eighteen months.\nThat is not a threat. That is a forecast.\nI have been making forecasts for twenty-three years\nand I am rarely wrong.\n\nYou were the best at your university.\nCongratulations. So was everyone else in this room.`,

  `Here at Sweatshaw & Co\nwe believe deeply in work-life balance.\nWe also believe that 'life'\nis quite a broad category\nthat can comfortably include\nthe office, the deal room,\na working dinner that is definitely not just dinner,\nand the back of a car\non the way to an airport\nat 4:45 on a Sunday morning.\n\nYou see? Balance.\nIt is everywhere, if you look.`,

  `I started where you are sitting.\nI know what this floor takes from you.\nI also know what it gives back.\n\nThere is nothing quite like closing a deal\nat two in the morning, knowing that you built\nevery model, checked every number,\nand that the work is right.\n\nThat feeling does not get old.\n\nWork hard. Work harder than that.\nAnd we will see who is still standing.`,
];

const TOTAL = PAGES.length;

export default function BossIntro({ onBeginGame }) {
  const [page, setPage]       = useState(0);
  const [blink, setBlink]     = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 1000);
    return () => clearInterval(t);
  }, []);

  const handleBegin = () => {
    setFadeOut(true);
    setTimeout(onBeginGame, 600);
  };

  const goNext = () => { setPage(p => Math.min(p + 1, TOTAL - 1)); };
  const goPrev = () => { setPage(p => Math.max(p - 1, 0)); };

  const lines = PAGES[page].split('\n');

  return (
    <div className={`bi-screen${fadeOut ? ' bi-fadeout' : ''}`}>
      {/* Background */}
      <div className="bi-bg" />
      <div className="bi-overlay" />

      {/* Boss character */}
      <img src="/grumpyboss.png" className="bi-boss" alt="" />

      {/* Left panel: dialogue + begin button */}
      <div className="bi-left-panel">
        <div className="bi-dialogue">
          <div className="bi-speaker">Managing Director — Sweatshaw & Co</div>

          <div className="bi-text">
            {lines.map((line, i) => (
              line === ''
                ? <br key={i} />
                : <span key={i}>
                    {line}
                    {i === lines.length - 1 && (
                      <span className={`bi-cursor${blink ? '' : ' bi-cursor-hidden'}`}>|</span>
                    )}
                    <br />
                  </span>
            ))}
          </div>

          <div className="bi-controls">
            {page > 0
              ? <button className="bi-btn" onClick={goPrev}>← Back</button>
              : <span />
            }
            <span className="bi-page-ind">{page + 1} / {TOTAL}</span>
            {page < TOTAL - 1
              ? <button className="bi-btn" onClick={goNext}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {/* Begin career button — final page only */}
        {page === TOTAL - 1 && (
          <button className="bi-begin" onClick={handleBegin}>
            Begin your career at Sweatshaw &amp; Co
          </button>
        )}
      </div>
    </div>
  );
}
