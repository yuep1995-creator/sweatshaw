import { useState, useEffect } from 'react';

const CONVERSATIONS = {
  // ── Paige's partners ──────────────────────────────────────────────────────
  victor: {
    character: 'Victor Hughes',
    subtitle: 'Analyst — Morgan Greystone Capital',
    bgImage: '/network.png',
    charImage: '/VictorHughes.png',
    doneLabel: 'Head back',
    pages: [
      `"You were right about the Meridian deal — the leverage ratio was too aggressive. I ran the numbers again last night."\n\nHe takes a sip of his drink. His glass hasn't moved in twenty minutes.\n\n"Three different models. Same conclusion. Our MD approved it anyway."\n\nA pause.\n\n"I'm not wrong."`,
      `He doesn't look tired the way you look tired. His version of exhaustion is somehow contained.\n\n"Morrison said accelerated VP track. That was six months ago."\n\nHe looks at you steadily.\n\n"You'd have pushed back already. That's the difference between us. I'm not sure yet if it's a flaw."\n\nYou don't answer. You don't need to.`,
    ],
  },
  marco: {
    character: 'Marco Moretti',
    subtitle: 'Personal Trainer — Equinox',
    bgImage: '/nightclub.png',
    charImage: '/MarcoMoretti.png',
    doneLabel: 'Say goodnight',
    pages: [
      `"There is a new DJ at Fabric next Friday — Cassian, from Berlin. I saw him play in a basement in Milan. Maybe forty people."\n\nHe gestures with his hands.\n\n"Now he is everywhere. You know this feeling? When something is still yours, and then suddenly it isn't?"\n\nHe grins. "I already bought the tickets. I am telling you — not asking."`,
      `"My clients today — six hours back to back. They all want quick results. No process. They get frustrated when the body doesn't perform on schedule."\n\nHe looks at you steadily.\n\n"You are the same, you know. But you are learning. That is different."\n\nHe tops up your glass without asking. "Fabric. Friday. Wear something you don't mind losing."`,
    ],
  },
  david: {
    character: 'David Li',
    subtitle: 'Software Engineer — FAANG  ·  PhD Computer Science, MIT',
    bgImage: '/centralpark.png',
    charImage: '/DavidLi.png',
    doneLabel: 'Head home',
    pages: [
      `"We're building something at the moment — an LLM fine-tuned on public filings, earnings transcripts, regulatory data. The idea is that the analysis your firm charges a hundred thousand for should be accessible to anyone with a browser."\n\nHe says it without edge. Like it's obvious.\n\n"Your industry will hate it." A small smile. "That's usually a good sign."`,
      `"How are you doing? At work, I mean. Actually."\n\nYou start to give the version you give everyone else. He waits.\n\n"You don't have to perform for me."\n\nA pause. He refills your cup without asking.\n\n"You're doing well. I can tell because you're the only person I know who apologises for being tired instead of just being tired." He looks at you steadily. "Stop optimising for a minute. You're already ahead. You just won't let yourself notice."`,
    ],
  },

  julien: {
    character: 'Julien Laurent',
    subtitle: 'Partner — Linklaters  ·  Wall Street',
    bgImage: '/privateclub.png',
    charImage: '/JulienLaurent.png',
    doneLabel: 'Head home thinking',
    pages: [
      `"Can I ask you something?" He sets down his glass. "The thing with your MD — the one you mentioned last time. Have you spoken to him directly yet?"\n\nYou haven't.\n\n"I thought so." Not unkind. "The instinct to manage around difficult relationships rather than through them — it's very common in banking. Very understandable." He looks at you steadily. "Also very ineffective. The longer you leave it, the more it calcifies."`,
      `"The advice I wish someone had given me at your stage—" He pauses, as though deciding which version to share.\n\n"The most important relationships in your career are not the ones above you. They're the ones at your level, who are going to be above you in ten years. Invest in those now. People remember who was good to them before they needed to be."\n\nHe picks up his glass again. "You're good at your job. That matters less than you think at your level. The rest is relationships." A half-smile. "And you're good at those too, when you let yourself be."`,
    ],
  },

  // ── Max's partners ────────────────────────────────────────────────────────
  adira: {
    character: 'Adira Sharma',
    subtitle: 'M&A Associate — Clifford Chance  ·  Wharton, Economics (Top of Class)',
    bgImage: '/network.png',
    charImage: '/AdiraSharma.png',
    doneLabel: 'Take mental notes',
    pages: [
      `"Can I be direct with you?" She already is, but she asks anyway.\n\n"The politics in your office — the way you described the managing director situation last time — you're making a mistake." She doesn't soften it. "You're trying to be liked. Stop. You should be trying to be indispensable. They are not the same thing, and the people who confuse them never make it past VP."\n\nShe cuts her food like she's making a point.`,
      `"In M&A, the people who survive long-term are the ones who know which relationships to protect and which to let burn." She looks at you directly. "You're too careful with everyone. Pick two or three people at that firm who actually matter and make yourself essential to them. Let everyone else form their own opinion."\n\nA pause. She refills her own glass.\n\n"You're more capable than you're giving yourself credit for. That's not a compliment — it's a diagnosis. Fix it."`,
    ],
  },
  anastasia: {
    character: 'Anastasia Orlova',
    subtitle: 'Model',
    bgImage: '/privateclub.png',
    charImage: '/AnastasiaOrlova.png',
    accent: '#d4a017',
    accentAlpha: 'rgba(212, 160, 23, 0.5)',
    doneLabel: 'Agree enthusiastically',
    pages: [
      `She shows you her phone. It's a screenshot of a Bottega Veneta bag.\n\n"This one." She says it with great certainty. "I showed it to my friend Yulia and she said it was too quiet. But she has no taste. It is not too quiet. It is perfect."\n\nShe puts her phone face-down on the table and looks at you with an expression that is somehow both completely innocent and entirely calculated.\n\n"You have good taste, no? You would know it is perfect."`,
      `"There is also a dinner. In the Hamptons. Next month." She announces this the way someone announces weather. "My friend's birthday. The house is very nice. You would like it."\n\nA pause. "There is a dress code. You would need to look more—" She gestures vaguely at your appearance. "More holiday. Less office."\n\nShe smiles. It is a spectacular smile.\n\n"I think you can manage that. You are, what is the word — resourceful." Her eyes are laughing. "Yes. Resourceful."`,
    ],
  },
  olivia: {
    character: 'Olivia Beaufort',
    subtitle: 'Curator — Whitney Museum  ·  Art History, Columbia',
    bgImage: '/frenchdiner.png',
    charImage: '/OliviaBeaufort.png',
    doneLabel: 'Order dessert',
    pages: [
      `"We acquired a Basquiat last month." She says it the way she says most things — like she's been thinking about it for a long time and has finally decided to share it. "The provenance was complicated. Four months to clear. Most people would have walked away."\n\nShe looks at you. "I didn't walk away."\n\nYou tell her that sounds like a deal structure. She considers this for a moment.\n\n"Yes. I suppose it does. Perhaps we're not so different after all."`,
      `"My father called yesterday. He heard a rumour that Sweatshaw is being acquired." She watches your face as she says it. "I didn't confirm or deny. I thought you'd want to know it was circulating."\n\nA pause.\n\n"He still thinks I should have gone into finance. I still think he should have come to the gallery opening." She picks up her wine. "Some disagreements aren't meant to be resolved. They're just meant to be carried politely."\n\nShe looks at you steadily. "You understand that, I think."`,
    ],
  },
  emily: {
    character: 'Emily Miller',
    subtitle: 'Primary School Teacher — Upper Manhattan',
    bgImage: '/centralpark.png',
    charImage: '/EmilyMiller.png',
    doneLabel: 'Head back, thinking',
    pages: [
      `"How are you actually doing?" She asks it the way she always used to — like the answer genuinely matters, like she has all the time in the world for it.\n\nYou start the work version. She tilts her head.\n\n"No, I mean — are you okay? You seem tired. Not just today-tired. Tired-tired." She wraps both hands around her coffee cup. "You used to smile more. Back in Minnesota you were the most optimistic person I knew."\n\nShe says it without accusation. That somehow makes it land harder.`,
      `"I have thirty-two seven-year-olds who have absolutely no idea how to tie their shoes, and most days I go home genuinely happy." She leans forward slightly. "I'm not saying it's the same. I'm saying — is there anything that makes you feel like that? Even one thing?"\n\nYou think about it. Really think. Which you haven't done in a while.\n\n"I'm serious," she says. "I'm here if you ever want to talk. Not about deals or whatever. Just — talk." A warm smile. "I'm very good at listening. It's professionally required."`,
    ],
  },
};

export default function DateConversationScene({ encounterId, onDone }) {
  const [page, setPage]       = useState(0);
  const [blink, setBlink]     = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const conv = CONVERSATIONS[encounterId];

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDone = () => {
    setFadeOut(true);
    setTimeout(onDone, 600);
  };

  if (!conv) return null;

  const lines  = conv.pages[page].split('\n');
  const isLast = page === conv.pages.length - 1;

  const accentStyle = conv.accent ? {
    '--fe-accent': conv.accent,
    '--fe-accent-alpha': conv.accentAlpha || 'rgba(212, 160, 23, 0.5)',
  } : {};

  return (
    <div className={`fe-screen${fadeOut ? ' fe-fadeout' : ''}`} style={accentStyle}>
      <div className="fe-bg" style={{ backgroundImage: `url('${conv.bgImage}')` }} />
      <div className="fe-overlay" />

      <img src={conv.charImage} className="fe-char" alt={conv.character} />

      <div className="fe-left-panel">
        <div className="fe-tag">DATE NIGHT</div>

        <div className="fe-dialogue">
          <div className="fe-speaker">{conv.character}</div>
          <div className="fe-speaker-sub">{conv.subtitle}</div>

          <div className="fe-text" key={page}>
            {lines.map((line, i) => (
              line === ''
                ? <br key={i} />
                : <span key={i}>
                    {line}
                    {i === lines.length - 1 && (
                      <span className={`fe-cursor${blink ? '' : ' fe-cursor-hidden'}`}>|</span>
                    )}
                    <br />
                  </span>
            ))}
          </div>

          <div className="fe-controls">
            {page > 0
              ? <button className="fe-btn" onClick={() => setPage(p => p - 1)}>← Back</button>
              : <span />
            }
            <span className="fe-page-ind">{page + 1} / {conv.pages.length}</span>
            {!isLast
              ? <button className="fe-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {isLast && (
          <button className="fe-done" onClick={handleDone}>
            {conv.doneLabel}
          </button>
        )}
      </div>
    </div>
  );
}
