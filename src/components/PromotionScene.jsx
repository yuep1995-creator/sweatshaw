import { useState, useEffect } from 'react';

const SPEECHES = {
  associate: [
    `I won't pretend I expected this from you.\nActually, I did. I keep notes.\n\nYou passed the Analyst years.\nThat is not nothing.\nMost people manage two. A few manage one.\nA small number manage it and still look like they're sleeping enough.\n\nYou are being promoted to Associate.\nYou've earned it. Barely, in some quarters.\nComfortably, in others.`,

    `The work changes now.\nLess doing. More thinking.\nMore managing up, which is a polite way of\nsaying more managing me.\n\nAssociates are the connective tissue of this firm.\nYou are expected to know everything the Analysts know,\nplus everything the VPs need,\nplus approximately half of what the clients are thinking\nbefore they think it.\n\nNo one said it would be straightforward.\nYou knew that when you signed.`,
  ],

  vp: [
    `Vice President.\n\nThree years ago you were calculating EBITDA adjustments at 1am.\nNow you're the one deciding which Analyst\ncalculates them at 1am.\n\nThis is what progression looks like at Sweatshaw & Co.\nOne day you are the problem.\nThen you become the person who delegates the problem.\n\nThe salary increase has been processed.\nDon't mention it.`,

    `VPs run deals. Not support deals. Run them.\n\nYou will have direct client contact,\nwhich means you will be the one in the room when things go wrong.\nBecause things go wrong.\n\nThe question is whether you are the kind of person\nwho finds a solution in that room,\nor the kind who needs to make a call first.\n\nI expect the first kind. I hire selectively.`,
  ],

  director: [
    `Director.\n\nI've been doing this for a long time.\nLong enough to have promoted people\nwho went on to run firms.\nLong enough to have promoted people\nwho ran themselves into the ground six months later.\n\nThe title does not decide which category you fall into.\nYou do.`,

    `At this level, the metrics shift.\nIt is not about what you can do.\nEveryone here can do.\nIt is about what you make happen.\n\nDeals originated. Clients retained.\nThe right people promoted\nand the wrong ones moved on.\n\nYou are not an employee anymore.\nYou are an owner of this culture.\n\nDon't make me regret saying that.`,
  ],
};

const TITLE_LABELS = {
  associate: 'Associate',
  vp:        'Vice President',
  director:  'Director',
};

export default function PromotionScene({ newStageId, onDone }) {
  const [page,    setPage]    = useState(0);
  const [blink,   setBlink]   = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const pages = SPEECHES[newStageId] ?? SPEECHES.associate;
  const total = pages.length;

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 1000);
    return () => clearInterval(t);
  }, []);

  const handleAccept = () => {
    setFadeOut(true);
    setTimeout(onDone, 600);
  };

  const lines = pages[page].split('\n');

  return (
    <div className={`ps-screen${fadeOut ? ' ps-fadeout' : ''}`}>
      <div className="ps-bg" />
      <div className="ps-overlay" />

      <img src="/happyboss.png" className="ps-boss" alt="" />

      <div className="ps-left-panel">
        <div className="ps-dialogue">
          <div className="ps-tag">PROMOTION — {(TITLE_LABELS[newStageId] ?? newStageId).toUpperCase()}</div>
          <div className="ps-speaker">Managing Director — Sweatshaw &amp; Co</div>

          <div className="ps-text">
            {lines.map((line, i) => (
              line === ''
                ? <br key={i} />
                : <span key={i}>
                    {line}
                    {i === lines.length - 1 && (
                      <span className={`ps-cursor${blink ? '' : ' ps-cursor-hidden'}`}>|</span>
                    )}
                    <br />
                  </span>
            ))}
          </div>

          <div className="ps-controls">
            {page > 0
              ? <button className="ps-btn" onClick={() => setPage(p => p - 1)}>← Back</button>
              : <span />
            }
            <span className="ps-page-ind">{page + 1} / {total}</span>
            {page < total - 1
              ? <button className="ps-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {page === total - 1 && (
          <button className="ps-accept" onClick={handleAccept}>
            [ Accept Promotion ]
          </button>
        )}
      </div>
    </div>
  );
}
