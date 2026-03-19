import { useState } from 'react';

const COZY_PARTNERS = ['david', 'marco', 'emily'];

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
};

export default function ProposalScene({ gameState: gs, onDone }) {
  const [page, setPage] = useState(0);

  const partnerId   = gs.relationshipPartnerId;
  const partnerName = {
    victor: 'Victor Hughes', marco: 'Marco Moretti', david: 'David Li',
    julien: 'Julien Laurent', adira: 'Adira Sharma', anastasia: 'Anastasia Orlova',
    olivia: 'Olivia Beaufort', emily: 'Emily Miller',
  }[partnerId] ?? 'your partner';

  const proposal  = PROPOSALS[partnerId] ?? PROPOSALS.emily;
  const bgImage   = COZY_PARTNERS.includes(partnerId) ? '/cozyproposal.png' : '/poshproposal.png';

  const pages = [
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

  const lines = current.text.split('\n');

  return (
    <div className="proposal-screen" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className="proposal-overlay" />
      <div className="proposal-card">
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
