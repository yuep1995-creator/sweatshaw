import { useState, useEffect } from 'react';

const PAGES = [
  `I don't usually do the welcome speech.\nI find them a bit performative.\nBut someone has to do it, and I was nominated,\nso here we are.\n\nFirst of all, congratulations —\nyou survived the most competitive recruiting process\non Wall Street.\nTop of your class, best internships, every box ticked.\n\nNone of that matters here.\nWhat matters is what you deliver at your job.`,

  `The deal flow is intense here.\nThe hours are the baseline.\nIf you think eighty hours is a lot,\nyou have already made a category error\nabout what you signed up for.\n\nInvesting is a craft.\nModelling a business, running a process,\nsitting across a management team\nand knowing whether they are the real thing —\nthese are skills you develop slowly,\nthrough repetition and failure and feedback.\nThe hours matter not because suffering is virtuous,\nbut because depth comes from volume.`,

  `Now — statistically speaking,\nfewer than half of you will be sitting at this table as a VP.\n\nI am not telling you that to be harsh.\nI am telling you because the ones who internalize it early,\nand treat every day as if their seat is not guaranteed,\nare the ones who keep it.\nThe ones who assume tenure will be fine —\nthey are typically the ones who are not.`,

  `Hard work here is not just rewarded — it is transformative.\nI have watched people come in as green analysts\nand become genuine investors, business builders, thought leaders.\nI've watched people clear seven, eight figures in carry.\nThat's real. That's available to you.\n\nBut you have to earn it.\nEvery. Single. Day.\n\nI will see you on the floor.\nWelcome to the firm.`,
];

const TOTAL = PAGES.length;

export default function PEIntroScene({ onDone }) {
  const [page, setPage]       = useState(0);
  const [blink, setBlink]     = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDone = () => {
    setFadeOut(true);
    setTimeout(onDone, 600);
  };

  const goNext = () => { setPage(p => Math.min(p + 1, TOTAL - 1)); };
  const goPrev = () => { setPage(p => Math.max(p - 1, 0)); };

  const lines = PAGES[page].split('\n');

  return (
    <div className={`bi-screen${fadeOut ? ' bi-fadeout' : ''}`}>
      <div
        className="bi-bg"
        style={{ backgroundImage: "url('/peoffice.png')" }}
      />
      <div className="bi-overlay" />

      <img src="/PEbossgrumpy.png" className="bi-boss" alt="" />

      <div className="bi-left-panel">
        <div className="bi-dialogue">
          <div className="bi-speaker">Partner — Darkstone &amp; Partners</div>

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

        {page === TOTAL - 1 && (
          <button className="bi-begin" onClick={handleDone}>
            Begin your career at Darkstone &amp; Partners
          </button>
        )}
      </div>
    </div>
  );
}
