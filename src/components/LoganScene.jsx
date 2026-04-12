import { useState, useEffect } from 'react';

// Per-year Logan encounter content.
// Y1–Y4: kitchen.png background — office check-ins.
// Y5:    nightclub.png background — the fundraiser confession + choices.
const LOGAN_DATA = {
  1: {
    title:     'KITCHEN CATCH-UP',
    subtitle:  'Analyst — TMT Group',
    bgImage:   '/kitchen.png',
    doneLabel: 'Leave him to it',
    pages: [
      `You're making coffee in the kitchen when Logan Sterling walks in — TMT group, your cohort from the summer internship. He's carrying a printed model and has the look of someone who hasn't slept since September and has decided this makes him interesting.\n\n"TMT is the most lucrative arm in the building — everyone knows it." He pours without looking. "My staffer told me I'm on the star analyst shortlist. Four-point-oh at Princeton. It's just — what happens next, you know?"`,
    ],
  },
  2: {
    title:     'THE BONUS CHAT',
    subtitle:  'Analyst — TMT Group',
    bgImage:   '/kitchen.png',
    pages: [
      `Logan walked into the print room just as you were binding another pitch book the client will never read. He looks, if anything, more self-assured than last year.\n\nHe asks how your bonus treated you in the tone of someone who already knows the answer will be less than his.\n\n"Mine was 150%. I think that's the cap for Analyst, right? I can't recall — but doesn't really matter."`,
      `"Hey — let me tell you something, just between the two of us. My line manager told me it's not public yet.\n\nThe accelerated promotion list is out… and guess who's on it?"\n\nThe answer is clear. He shrugs: "Not that I'm too surprised — I've been the star analyst in our cohort for two years, after all."`,
    ],
    choices: [
      {
        id:        'congrats',
        isLoganY2: true,
        label:     '"Congrats. I\'m happy for you."',
        effects:   { sanity: 10, charisma: 5 },
      },
      {
        id:        'fakesmile',
        isLoganY2: true,
        label:     'Fake smile. "Your MD parents must be proud of you."',
        effects:   { sanity: -10 },
      },
    ],
  },
  3: {
    title:     'THE VERBIER UPDATE',
    subtitle:  'Associate — TMT Group',
    bgImage:   '/kitchen.png',
    pages: [
      `You were making your third double espresso in the kitchen when Logan walked in. His team has been busy over the LTM and you haven't spoken to him for a while.\n\n"Deal flow has been insane. I'm on my third 100-hour week this month.\n\nBut you know what — it's sweet to be able to staff my own analyst and get some operating leverage."`,
      `"So — what are you doing for Christmas this year?\n\nMe? My family does Verbier every Christmas. We have a family chalet there, it's pretty decent.\n\nI haven't made it in two years, so this year I actually blocked the calendar." He tilts his head. "Nothing beats quality family time."`,
    ],
    choices: [
      {
        id:        'workThrough',
        isLoganY3: true,
        label:     '"I\'m on a live deal so probably working through the whole break."',
        effects:   { sanity: -10, competence: 6 },
      },
      {
        id:        'timeOff',
        isLoganY3: true,
        label:     '"Take some time off, spend my bonus and recharge for next year."',
        effects:   { sanity: 10 },
      },
    ],
  },
  4: {
    title:     'THE ANNOUNCEMENT',
    subtitle:  'Associate — TMT Group',
    bgImage:   '/kitchen.png',
    doneLabel: 'Wish him well',
    pages: [
      `Logan finds you in the lift lobby in Q4. He's wearing a slightly different suit — not the firm's tailor, something personal. He has the look of a man about to deliver news he has rehearsed.\n\n"I'm out. Darkstone Partners — joining as a new Associate in January. PE was always the plan. The carry, the platform — it was a no-brainer." A beat. "You should think about it. Seriously. It's the next chapter."`,
    ],
  },
  5: {
    title:     'OLD FACES',
    subtitle:  'Associate — Darkstone & Partners',
    bgImage:   '/nightclub.png',
    pages: [
      `You're at a fundraiser event — low lighting, expensive drinks, the usual crowd. Someone touches your arm from behind.\n\nIt's Logan Sterling.\n\nHe looks good. He's holding a glass of something amber and watching you with the quiet, slightly too-composed expression of a man who has been working up to something.\n\n"Turner. I didn't think I'd see you here. I've been thinking about you since the summer internship, honestly. I didn't know how to say it then." A pause. "But now — I mean. Look at us."`,
    ],
    choices: [
      {
        id:              'accept',
        label:           '"Okay, Logan. Let\'s see where the night takes us."',
        isLoganY5Accept: true,
        effects:         { sanity: -5 },
      },
      {
        id:               'decline',
        label:            '"I\'m flattered. But let\'s keep this professional."',
        isLoganY5Decline: true,
        effects:          { charisma: 10 },
      },
      {
        id:             'laugh',
        label:          '"You waited five years to say that?" You can\'t help but laugh.',
        isLoganY5Laugh: true,
        effects:        { charisma: 20, sanity: 20 },
      },
    ],
  },
};

export default function LoganScene({ gameState: gs, onDone }) {
  const [page,     setPage]     = useState(0);
  const [blink,    setBlink]    = useState(true);
  const [fadeOut,  setFadeOut]  = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(t);
  }, []);

  const year  = gs.currentYear;
  const data  = LOGAN_DATA[year] ?? LOGAN_DATA[1];
  const pages = data.pages;
  const isLast    = page === pages.length - 1;
  const hasChoices = !!data.choices;

  const handleDone = (choice = null) => {
    setFadeOut(true);
    setTimeout(() => onDone(choice), 500);
  };

  const lines = pages[page].split('\n');

  return (
    <div className={`fe-screen${fadeOut ? ' fe-fadeout' : ''}`}
         style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease' }}>
      <div className="fe-bg" style={{ backgroundImage: `url('${data.bgImage}')` }} />
      <div className="fe-overlay" />

      <img src="/logansterling.png" className="fe-char" alt="Logan Sterling" />

      <div className="fe-left-panel">
        <div className="fe-tag">{data.title}</div>

        <div className="fe-dialogue">
          <div className="fe-speaker">Logan Sterling</div>
          <div className="fe-speaker-sub">{data.subtitle}</div>

          <div className="fe-text" key={page}>
            {lines.map((line, i) =>
              line === ''
                ? <br key={i} />
                : <span key={i}>
                    {line}
                    {i === lines.length - 1 && (
                      <span className={`fe-cursor${blink ? '' : ' fe-cursor-hidden'}`}>|</span>
                    )}
                    <br />
                  </span>
            )}
          </div>

          <div className="fe-controls">
            {page > 0
              ? <button className="fe-btn" onClick={() => setPage(p => p - 1)}>← Back</button>
              : <span />
            }
            <span className="fe-page-ind">{page + 1} / {pages.length}</span>
            {!isLast
              ? <button className="fe-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {isLast && (
          hasChoices ? (
            <div className="logan-choices">
              {data.choices.map(c => (
                <button key={c.id} className="logan-choice-btn" onClick={() => handleDone(c)}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <button className="fe-done" onClick={() => handleDone(null)}>
              {data.doneLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
