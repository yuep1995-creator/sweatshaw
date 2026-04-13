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
      `The office kitchen is quiet. You're pouring a third coffee for the day when the door swings open with a little too much confidence.\n\nIt's Logan Sterling, arguably the most "memorable" guy from your summer analyst cohort. Logan comes from a privileged background and he makes sure everyone is aware of it. He graduated with a 4.0 GPA at Harvard, his parents are both senior MDs in Bulge Brackets — the guy ticks off every box for the song "finance, trust fund, 6' 5", blue eyes".\n\n"Hey [SURNAME], it's been a while, how's the IB life treating you?"`,
      `"Me? Just closed a $1.7bn deal last week, so not bad. Honestly, I've been sitting in on deal calls since I was fourteen. So when I got here — I don't want to sound arrogant — but it wasn't exactly a learning curve. More like... confirmation."\n\nHe glanced at his Patek Philippe and wrapped up the conversation with a smile that didn't quite reach his eyes.\n\n"Time to get back to work."`,
    ],
    midChoices: [
      {
        id:      'lovingIt',
        label:   '"Loving it." It\'s 5pm so just halfway through your day. You look forward to spending a long night over some comps.',
        effects: { sanity: -5, competence: 5 },
      },
      {
        id:      'cantComplain',
        label:   '"Can\'t complain."',
        effects: { charisma: 5 },
      },
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
      `It is Friday and you were hanging out with some friends at a Chelsea club. Someone touches your arm from behind — light, deliberate, the kind of touch that isn't accidental.\n\nYou know before you turn around. Some things register in the body before the brain catches up.\n\nLogan Sterling.\n\nHe looks good. Of course he does. He's wearing a charcoal suit that didn't come off any rack, and he's holding a glass of something amber — Scotch, probably, he was always particular about Scotch — with the easy looseness of a man who is very comfortable or working very hard to appear that way. You've never been entirely sure which with him.`,
      `"[SURNAME]." The corner of his mouth lifts. Not quite a smile. More like a decision. "I didn't think I'd see you here."\n\n"Logan." You keep your voice even. "Me neither. I thought you'd be working at this hour on a Friday. How's life on the other side?"\n\n"Better hours, better play. Different kind of pressure." He tilts his glass slightly, watching the light move through it. "I don't miss the floor. I do miss—" He stops. Seems to recalibrate. "Some things."`,
      `"I have been thinking about catching up with you since my last day, but you know..." He whispers, "Well. There was always something in the way. A deal, a deadline, another closing dinner."\n\nLogan takes half a step closer. Not crowding — just closer. Close enough that you'd have to make a choice about it, one way or the other.\n\nThe words land softly. No grand gesture, no performance. Just Logan Sterling, who could talk a room into anything, standing in front of you with something unguarded in his expression for once — waiting to see what you'll do with it.`,
    ],
    ghostText: `You woke up at Logan's place at 8:45am. He is already gone. There is a note on the bedside table: "off to gym now — last night was a blast. Btw the door locks itself on the way out, take care."\n\nThat was probably one of the poorest decisions you made in life, you humoured yourself at the thought. You never saw him again.`,
    choices: [
      {
        id:              'accept',
        label:           '"Well, guess it\'s better late than never." You leaned forward, dangerously.',
        isLoganY5Accept: true,
        effects:         { sanity: -5 },
      },
      {
        id:               'decline',
        label:            '"That\'s a kind thing to say." You take a step back, and dismiss him politely.',
        isLoganY5Decline: true,
        effects:          { charisma: 10 },
      },
      {
        id:             'laugh',
        label:          '"You have not changed at all, Logan." You take a step back and laugh at him to dissolve the tension.',
        isLoganY5Laugh: true,
        effects:        { sanity: 10, charisma: 5 },
      },
    ],
  },
};

const ACTIVE_STATUSES = ['entangled', 'relationship', 'engaged', 'married'];

export default function LoganScene({ gameState: gs, onDone }) {
  const [page,              setPage]              = useState(0);
  const [blink,             setBlink]             = useState(true);
  const [fadeOut,           setFadeOut]           = useState(false);
  const [revealed,          setRevealed]          = useState(false);
  const [midChoiceSelected, setMidChoiceSelected] = useState(null);
  const [ghostPage,         setGhostPage]         = useState(false);
  const [pendingAccept,     setPendingAccept]      = useState(null);

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
  const isLast     = page === pages.length - 1;
  const hasChoices = !!data.choices;
  const hasMidChoices = !!data.midChoices && page === 0 && !midChoiceSelected;

  const handleDone = (choice = null) => {
    setFadeOut(true);
    const effectiveChoice = midChoiceSelected ?? choice;
    setTimeout(() => onDone(effectiveChoice), 500);
  };

  const handleChoiceClick = (c) => {
    if (c.isLoganY5Accept) {
      const isInRelationship = ACTIVE_STATUSES.includes(gs.relationshipStatus);
      const meetsCriteria    = gs.stats.charisma > 250 || (gs.baseTraits?.looks ?? 0) > 50;
      if (!isInRelationship && !meetsCriteria) {
        setPendingAccept(c);
        setGhostPage(true);
        return;
      }
    }
    handleDone(c);
  };

  const handleMidChoice = (c) => {
    setMidChoiceSelected(c);
    setPage(p => p + 1);
  };

  const surname = gs.characterName?.split(' ')[1] ?? '';
  const processText = (text) => text.replace('[SURNAME]', surname);

  const lines = processText(pages[page]).split('\n');

  // Ghost aftermath page (Y5 accept with single + low charisma/looks)
  if (ghostPage && data.ghostText) {
    const ghostLines = processText(data.ghostText).split('\n');
    return (
      <div className={`fe-screen${fadeOut ? ' fe-fadeout' : ''}`}
           style={{ opacity: revealed ? 1 : 0, transition: 'opacity 0.6s ease' }}>
        <div className="fe-bg" style={{ backgroundImage: `url('${data.bgImage}')` }} />
        <div className="fe-overlay" />
        <img src="/logansterling.png" className="fe-char" alt="Logan Sterling" />
        <div className="fe-left-panel">
          <div className="fe-tag">{data.title}</div>
          <div className="fe-dialogue">
            <div className="fe-speaker">The Morning After</div>
            <div className="fe-text">
              {ghostLines.map((line, i) =>
                line === ''
                  ? <br key={i} />
                  : <span key={i}>{line}<br /></span>
              )}
            </div>
          </div>
          <button className="fe-done" onClick={() => handleDone(pendingAccept)}>Continue</button>
        </div>
      </div>
    );
  }

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
              ? <button className="fe-btn" onClick={() => { if (page === 1 && data.midChoices) setMidChoiceSelected(null); setPage(p => p - 1); }}>← Back</button>
              : <span />
            }
            <span className="fe-page-ind">{page + 1} / {pages.length}</span>
            {!isLast && !hasMidChoices
              ? <button className="fe-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {hasMidChoices && (
          <div className="logan-choices">
            {data.midChoices.map(c => (
              <button key={c.id} className="logan-choice-btn" onClick={() => handleMidChoice(c)}>
                {c.label}
              </button>
            ))}
          </div>
        )}

        {isLast && !hasMidChoices && (
          hasChoices ? (
            <div className="logan-choices">
              {data.choices.map(c => (
                <button key={c.id} className="logan-choice-btn" onClick={() => handleChoiceClick(c)}>
                  {c.label}
                </button>
              ))}
            </div>
          ) : (
            <button className="fe-done" onClick={() => handleDone(midChoiceSelected)}>
              {data.doneLabel}
            </button>
          )
        )}
      </div>
    </div>
  );
}
