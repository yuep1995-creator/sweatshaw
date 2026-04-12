import { useState, useEffect } from 'react';

const COZY_PARTNERS = ['david', 'marco', 'emily'];

const WEDDING_COSTS = { emily: 80_000, david: 80_000, marco: 80_000 };
const getWeddingCost = (partnerId) => WEDDING_COSTS[partnerId] ?? 150_000;

const PROPOSAL_NARRATIVE = {
  emily: (cost) =>
    `You asked Emily to meet at the park where you used to walk home from school. She thought you were going to talk about work.\n\nYou didn't.\n\nYou set aside $${cost.toLocaleString()} for the wedding — something small, something real. You were very excited for the ceremony.`,
  david: (cost) =>
    `You asked David to meet at the farmers' market on a Sunday morning — the same one where you first ran into each other, quite literally. He brought coffee. You brought a question.\n\nYou set aside $${cost.toLocaleString()} for the wedding — something quiet, something you'd both remember. You were very excited for the ceremony.`,
  marco: (cost) =>
    `You took Marco to the Hampshire beach — the kind of weekend he'd been suggesting for months. The sun was low when you stopped walking.\n\nYou set aside $${cost.toLocaleString()} for the wedding — something warm, something real. You were very excited for the ceremony.`,
  victor: (cost) =>
    `You booked the private dining room. Victor arrived precisely on time. The table was set. The moment had been chosen well in advance.\n\nYou decided to put aside $${cost.toLocaleString()} into your wedding pot. The ceremony would be everything it should be. You were very excited for what was to come.`,
  julien: (cost) =>
    `You suggested somewhere different tonight — not the usual restaurant, not the usual evening. Julien noticed you were nervous before the starters arrived. He waited.\n\nYou decided to put aside $${cost.toLocaleString()} into your wedding pot. The ceremony would be everything it should be. You were very excited for what was to come.`,
  adira: (cost) =>
    `You took Adira to the rooftop bar where you first had a proper conversation — not about deals, not about work. Just the two of you, looking out over the city.\n\nYou decided to put aside $${cost.toLocaleString()} into your wedding pot. The ceremony would be everything it should be. You were very excited for what was to come.`,
  anastasia: (cost) =>
    `You arranged a table at the Carlyle — private, quiet. Anastasia dressed for the occasion without knowing what it was. She often seemed to know things before you told her.\n\nYou decided to put aside $${cost.toLocaleString()} into your wedding pot. The ceremony would be everything it should be. You were very excited for what was to come.`,
  olivia: (cost) =>
    `You took Olivia back to the Whitney — the same gallery where everything had properly started. The evening collection was on loan and the room was nearly empty.\n\nYou decided to put aside $${cost.toLocaleString()} into your wedding pot. The ceremony would be everything it should be. You were very excited for what was to come.`,
  logan: (cost) =>
    `You were at dinner — the usual restaurant, the usual table — when Logan set down his glass, reached into his jacket, and produced a ring.\n\nYou had not seen this coming. He seemed to know that. He seemed, if anything, slightly pleased about it.\n\n"I've been carrying this for three months," he said. "I kept looking for the right moment and then I realised — there is no right moment. There's just the decision. And I've made it."\n\nYou set aside $${cost.toLocaleString()} for the wedding. He had already had preliminary thoughts on the venue. You were not surprised. You were very excited for what was to come.`,
};

const PROPOSALS = {
  victor: {
    playerVow: `"I've spent three years competing with you. Apparently that's my version of courtship.\n\nI'd rather spend the rest of them not doing that."`,
    partnerVow: `Victor is quiet for a moment — the particular quiet of someone choosing words with precision.\n\n"When I outscored you on that midterm, I did not anticipate this outcome." A pause. A rare, unguarded smile. "I'm pleased to report it is the only competition I've lost where the result is entirely in my favour.\n\nYes."`,
  },
  marco: {
    playerVow: `"You made fun of me for going clubbing in a suit. You asked me to dance anyway.\n\nI've never been more grateful to look ridiculous."`,
    partnerVow: `He laughs — the real one, not the charming one. Then he holds your face in both hands.\n\n"You walked in looking like a man with fourteen meetings in the morning. I thought: this one is trouble.\n\nI was completely right. Sì. Yes. A thousand times."`,
  },
  david: {
    playerVow: `"You saved my number as 'The Collision.' I've been running that dataset ever since.\n\nThe conclusion has been obvious for a while. I just wanted to get the confidence interval right."`,
    partnerVow: `He smiles — the unhurried kind, the one that has never once been in a rush.\n\n"I told you dinner was a lower-risk environment. I may have significantly underestimated the variance." A beat. "I wouldn't change a single observation.\n\nYes. Obviously yes."`,
  },
  julien: {
    playerVow: `"You said 'call me — not about work.' I've been thinking about that ever since.\n\nEvery room is better with you in it. I'd like to stop making that an intermittent variable."`,
    partnerVow: `He doesn't reach for a speech. He just looks at you — the full, measured attention he gives to things that matter.\n\n"I said it wasn't about work because I already knew it was about something far more important." A quiet half-smile. "I have been waiting for you to get there.\n\nYes."`,
  },
  adira: {
    playerVow: `"You told me you were competitive to a fault. You weren't wrong.\n\nI want to win this with you. I want to win everything with you."`,
    partnerVow: `She looks at you steadily — the same look she gave the room at that networking event, the one that meant she'd already decided.\n\n"I told you I'd stopped caring what people thought of my qualities." A pause. Her voice, quieter now. "I care very much what you think.\n\nYes. And I intend to make it the best decision either of us has ever made."`,
  },
  anastasia: {
    playerVow: `"You said you don't follow back. I'm asking you to make one exception.\n\nA permanent one."`,
    partnerVow: `She is still for a moment — the composed, unreadable stillness that is usually armour.\n\nThen, softly: "Most people see only the surface. You kept looking. I did not expect that."\n\nShe takes your hand. "I did not expect any of this. But here — with you —" A breath. "Yes."`,
  },
  olivia: {
    playerVow: `"You told me I'd need to dress properly. I've been trying to measure up ever since.\n\nI'd like to spend the rest of my life attempting it."`,
    partnerVow: `She is quiet in the way of someone who understands how much weight a word can carry.\n\n"Art is the study of what lasts. What endures under examination." Her eyes on yours. "You have lasted. More than that — you have compounded.\n\nI would like to keep observing that. For a very long time. Yes."`,
  },
  emily: {
    playerVow: `"You saved me as 'Max from Minnesota.'\n\nThat's still who I am, when I'm with you. I want to be that person — your person — for good."`,
    partnerVow: `She's already smiling — has been since you started.\n\n"I've been checking in since middle school. I'm not planning to stop."\n\nShe squeezes your hand.\n\n"I love you. That's — that's the whole vow. Yes."`,
  },
  logan: {
    playerVow: `"You were the only person in that building who never needed to prove anything. You were just — good. Better than you knew.\n\nI've been thinking about how to say this since the year we worked that first cycle. I'm done waiting for the right quarter.\n\nI'm asking you to marry me."`,
    partnerVow: `You are quiet for a moment. The restaurant continues around you.\n\nThen: "You rehearsed that."\n\nHe does not deny it. He just looks at you — the steady, unhurried way he has when he's already decided.\n\n"I did," he says. "I wanted to get it right. Because you deserve someone who gets it right."\n\nA beat.\n\n"Yes. Obviously yes."`,
  },
};

export default function ProposalScene({ gameState: gs, onDone }) {
  const [page, setPage]         = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const partnerId   = gs.relationshipPartnerId;
  const partnerName = {
    victor: 'Victor Hughes', marco: 'Marco Moretti', david: 'David Li',
    julien: 'Julien Laurent', adira: 'Adira Sharma', anastasia: 'Anastasia Orlova',
    olivia: 'Olivia Beaufort', emily: 'Emily Miller', logan: 'Logan Sterling',
  }[partnerId] ?? 'your partner';

  const proposal      = PROPOSALS[partnerId] ?? PROPOSALS.emily;
  const weddingCost   = getWeddingCost(partnerId);
  const bgImage       = COZY_PARTNERS.includes(partnerId) ? '/proposal1.png' : '/proposal2.png';
  const narrativeFn   = PROPOSAL_NARRATIVE[partnerId] ?? PROPOSAL_NARRATIVE.emily;
  const narrativeText = narrativeFn(weddingCost);

  const pages = [
    {
      tag:  'THE PROPOSAL',
      text: narrativeText,
      btn:  'Continue →',
    },
    {
      tag:  'THE QUESTION',
      text: proposal.playerVow,
      btn:  'Continue →',
    },
    {
      tag:  partnerName.toUpperCase(),
      text: proposal.partnerVow,
      btn:  '[ SAY YES ]',
    },
  ];

  const current = pages[page];
  const isLast  = page === pages.length - 1;
  const lines   = current.text.split('\n');

  return (
    <div className="proposal-screen" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className="proposal-overlay" style={{ opacity: revealed ? 1 : 0 }} />
      <div
        className="proposal-card"
        style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="proposal-tag">{current.tag}</div>

        <div className="proposal-text">
          {lines.map((line, i) =>
            line === '' ? <br key={i} /> : <p key={i} className="proposal-para">{line}</p>
          )}
        </div>

        <button
          className="btn btn-primary btn-large proposal-btn"
          onClick={isLast ? onDone : () => setPage(p => p + 1)}
        >
          {current.btn}
        </button>
      </div>
    </div>
  );
}
