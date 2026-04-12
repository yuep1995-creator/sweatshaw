import { useState, useEffect } from 'react';

// Partner-specific first lines for ghosted event
const GHOSTED_OPENER = {
  victor:    'Victor had always been measured with his words. So the silence, when it came, was surprisingly easy to mistake for thoughtfulness.',
  marco:     'Marco had always been easy to reach — quick to reply, quick to laugh, quick with a reason to see you again. Which made the silence all the more conspicuous.',
  david:     'David had always been unhurried, in his replies as in everything. But unhurried and absent are different things, and lately the difference had become very clear.',
  julien:    'Julien had always been precise. He answered on time, said what he meant, followed through. The messages you left unanswered were not like him at all.',
  adira:     'Adira had always been direct — no small talk, no delay. Which was why the sudden absence of replies felt less like distance and more like a decision.',
  anastasia: 'Anastasia had always kept you at a careful remove. You had assumed that was just how she was. It turned out that was also, eventually, how she left.',
  olivia:    'Olivia had a way of making silence feel considered. For a while you convinced yourself that was what this was.',
  emily:     'Emily had always been warm, consistently and without effort. That was what made the quiet so disorienting.',
  logan:     'Logan had been easy to read, the night you met at the fundraiser. Confident, direct, clearly interested. The silence that followed was not like him at all.',
};

const BREAKUP_PARTNER_LINE = {
  victor:    'Victor Hughes had left you.\n\nThe message was short and precise, which was, perhaps, the most Victor thing about it. No ambiguity. No room for a counter-argument.',
  marco:     'Marco Moretti had left you.\n\nHe didn\'t do it badly — no cruelty, no scene. He was warm even at the end, which somehow made it worse.',
  david:     'David Li had left you.\n\nHe sent a long, careful message. He had thought about it. He was kind about it. That, too, was the most David thing about it.',
  julien:    'Julien Laurent had left you.\n\nHe asked to meet in person. He sat across from you with the same composure he brought to every difficult conversation, and said what needed to be said.',
  adira:     'Adira Sharma had left you.\n\nDirectly, without cushioning. You had always appreciated that about her. You found it harder to appreciate in this context.',
  anastasia: 'Anastasia Orlova had left you.\n\nNot dramatically. Not with accusations. She simply, clearly, told you she was done. It was, in retrospect, exactly how you would have expected her to do it.',
  olivia:    'Olivia Beaufort had left you.\n\nShe had chosen a quiet dinner for it. She had chosen the restaurant. She had been, as always, impeccably composed.',
  emily:     'Emily Miller had left you.\n\nShe cried. You hadn\'t expected that. Or maybe you had, and that was why it had taken this long to really consider what you were losing.',
  logan:     'Logan Sterling had left you.\n\nNo drama, no ultimatum. He simply sent a message that said, with characteristic efficiency, that he didn\'t think this was going anywhere. He wished you well. He meant it.',
};

const QUIET_SEP_OPENER = {
  victor:    'Victor',
  marco:     'Marco',
  david:     'David',
  julien:    'Julien',
  adira:     'Adira',
  anastasia: 'Anastasia',
  olivia:    'Olivia',
  emily:     'Emily',
  logan:     'Logan',
};

function buildGhostedText(partnerId, playerName, subjectPronoun = 'They') {
  if (partnerId === 'adira') {
    return [
      GHOSTED_OPENER.adira,
      `At first it was easy to explain away. Work was relentless — it always was. There was always a deal, a deadline, a deck that needed to be rebuilt before morning. ${playerName} had learned to keep personal things in the margins of the schedule, and for a while the margins were enough.`,
      `But Adira had stopped replying. Not coldly. Not dramatically. Just... stopped. The last few messages sat there, unread, in a thread that had once moved fast.`,
      `${playerName} had been too busy to notice at first. Then too busy to address it. Then, one evening — between two emails and a call that ran twenty minutes over — it landed properly: that this was over, and that it had been over for weeks, and that they had been too indexed on work to see it coming.`,
      `${subjectPronoun} had felt something real with Adira. Something that didn't fit neatly into a calendar slot or a quarterly objective. Now it was gone.`,
    ].join('\n\n');
  }

  const opener = GHOSTED_OPENER[partnerId] ?? 'The messages just... stopped.';
  const partnerName = {
    victor: 'Victor', marco: 'Marco', david: 'David', julien: 'Julien',
    adira: 'Adira', anastasia: 'Anastasia', olivia: 'Olivia', emily: 'Emily',
  }[partnerId] ?? 'them';

  return [
    opener,
    `At first it was easy to explain away. Work was relentless — it always was. There was always a deal, a deadline, a deck that needed to be rebuilt before morning. ${playerName} had learned to keep personal things in the margins of the schedule, and for a while the margins were enough.`,
    `But ${partnerName} had stopped replying. Not coldly. Not dramatically. Just... stopped. The last few messages sat there, unread, in a thread that had once moved fast.`,
    `${playerName} had been too busy to notice at first. Then too busy to address it. Then, one evening — between two emails and a call that ran twenty minutes over — it landed properly: that this was over, and that it had been over for weeks, and that they had been too indexed on work to see it coming.`,
    `They had felt something real with ${partnerName}. Something that didn't fit neatly into a calendar slot or a quarterly objective. Now it was gone.\n\nAnd the worst part wasn't the loss.\n\nThe worst part was that ${playerName} had let it happen.`,
  ].join('\n\n');
}

function buildBreakupText(partnerId, playerName) {
  const opener = BREAKUP_PARTNER_LINE[partnerId] ?? `Your partner had left you.`;

  return [
    opener,
    `${playerName} sat with it for a long time afterwards.\n\nWas it the messages that went unanswered because a client had called? Was it the birthday dinner that had to be rescheduled — then rescheduled again — then quietly dropped? Was it the anniversary that ${playerName} had genuinely forgotten, not out of indifference but out of the particular exhaustion that makes entire months disappear?`,
    `Or was it something more gradual — the slow accumulation of missed moments, of conversations started and not finished, of a presence that was there in theory but somewhere else in practice?`,
    `Maybe there was someone else. Maybe there wasn't. At this point it didn't matter. The relationship had been losing oxygen for a long time, and ${playerName} had been too busy to notice the room getting smaller.`,
    `They had loved this person, in the way that people love things they consistently deprioritise: genuinely, but not enough.`,
    `It was too late now.`,
  ].join('\n\n');
}

function buildQuietSepText(partnerId, playerName, partnerFullName) {
  const firstName = QUIET_SEP_OPENER[partnerId] ?? partnerFullName;

  return [
    `One day, ${partnerFullName} asked to have a talk. It was out of the blue, and ${playerName} did not see it coming.`,
    `${firstName} didn't raise their voice. There was no accusation, no catalogue of grievances. Just a calm, considered observation: that they had been in this for a long time now, and that ${playerName} had always — always — had somewhere more important to be.`,
    `"I'm not angry," ${firstName} said. "I just don't think this is going anywhere. I think you know that too."`,
    `${firstName} quietly suggested that maybe it was for the best that they part ways. The relationship had been real. What they had felt had been real. But a relationship requires two people to show up for it, and ${playerName} had been showing up for everything else instead.`,
    `${playerName} had no good answer. The deck that had been open on the laptop an hour ago felt, for the first time in years, genuinely irrelevant.`,
    `${firstName} left first. ${playerName} sat at the table for a long time, looking at a future that had just quietly closed a door.`,
  ].join('\n\n');
}

function buildEarlyGhostedText(partnerId, playerName) {
  const firstName = {
    victor: 'Victor', marco: 'Marco', david: 'David', julien: 'Julien',
    adira: 'Adira', anastasia: 'Anastasia', olivia: 'Olivia', emily: 'Emily', logan: 'Logan',
  }[partnerId] ?? 'them';

  return [
    `${playerName} had meant to follow up. That was the honest thing — there had been a real moment, a genuine spark, and at the time it had felt like the start of something worth pursuing.`,
    `But there was always a reason not to act on it. A live deal. A late model. A week that evaporated before anything personal got addressed. The draft stayed unsent. The window stayed open. The days compounded into weeks, and then into a quarter, and then another.`,
    `${firstName} had stopped reaching out. ${playerName} couldn't blame them. Silence is its own kind of answer, and ${playerName} had been very, very quiet.`,
    `It was nobody's fault, really. That was the most uncomfortable version of this — no villain, no mistake. Just the simple arithmetic of someone who kept choosing the job over everything else, until there was very little else left.`,
    `The door had been open.\n\n${playerName} had been too busy to walk through it.\n\nNow it wasn't open anymore.`,
  ].join('\n\n');
}

function buildDivorceText(partnerId, playerName, partnerFullName) {
  return [
    `The papers arrived on a Tuesday. ${playerName} signed them the same day. There was no dramatic final conversation — they had already had it, in fragments, over the course of several years.`,
    `${playerName} thought about where it had gone wrong. Not a single moment — nothing that clean. More a series of small surrenders. The weekend that became a working weekend. The holiday that never got booked. The evening that started as dinner and became a laptop, a report, a version sent at 11pm that nobody read until morning.`,
    `${partnerFullName} had been patient. More patient than most people would have been. They had asked for less and less over time — not because they wanted less, but because they had learned what was available.`,
    `Was it worth it? All those hours at a desk, building something — a career, a title, a number in an account — while something else quietly ran out?`,
    `${playerName} thought about the question for a long time.\n\nThe honest answer was complicated.\n\nThe honest answer was that they still didn't know.`,
  ].join('\n\n');
}

const SANITY_PENALTY = {
  ghosted:          25,
  breakup:          50,
  quietSeparation:  50,
  divorce:          75,
  earlyGhosted:     15,
};

const EVENT_TAG = {
  ghosted:         'GONE QUIET',
  breakup:         'IT\'S OVER',
  quietSeparation: 'A QUIET GOODBYE',
  divorce:         'THE END OF THE MARRIAGE',
  earlyGhosted:    'MISSED CONNECTION',
};

const EVENT_BTN = {
  ghosted:         '[ MOVE ON ]',
  breakup:         '[ MOVE ON ]',
  quietSeparation: '[ MOVE ON ]',
  divorce:         '[ MOVE ON ]',
  earlyGhosted:    '[ MOVE ON ]',
};

export default function BreakupScene({ gameState: gs, onDone }) {
  const [page, setPage] = useState(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const { breakupEventType, characterId, characterName, relationshipPartnerId } = gs;

  const partnerFullName = {
    victor: 'Victor Hughes', marco: 'Marco Moretti', david: 'David Li',
    julien: 'Julien Laurent', adira: 'Adira Sharma', anastasia: 'Anastasia Orlova',
    olivia: 'Olivia Beaufort', emily: 'Emily Miller', logan: 'Logan Sterling',
  }[relationshipPartnerId] ?? 'your partner';

  const isMax = characterId !== 'paige';
  const subjectPronoun = isMax ? 'He' : 'She';
  const bgBreakup = isMax ? '/breakupmax.png' : '/breakuppaige.png';

  const bgImage = breakupEventType === 'divorce'
    ? '/divorce.png'
    : breakupEventType === 'ghosted' || breakupEventType === 'earlyGhosted'
      ? '/ghosted.png'
      : bgBreakup;

  const narrativeText = breakupEventType === 'earlyGhosted'
    ? buildEarlyGhostedText(relationshipPartnerId, characterName)
    : breakupEventType === 'ghosted'
      ? buildGhostedText(relationshipPartnerId, characterName, subjectPronoun)
      : breakupEventType === 'breakup'
        ? buildBreakupText(relationshipPartnerId, characterName)
        : breakupEventType === 'quietSeparation'
          ? buildQuietSepText(relationshipPartnerId, characterName, partnerFullName)
          : buildDivorceText(relationshipPartnerId, characterName, partnerFullName);

  const penalty = SANITY_PENALTY[breakupEventType] ?? 50;

  const pages = [
    {
      tag:  EVENT_TAG[breakupEventType] ?? 'IT\'S OVER',
      text: narrativeText,
      btn:  'Continue →',
    },
    {
      tag:  'AFTERMATH',
      text: `Sanity ${penalty > 0 ? `−${penalty}` : ''}.\n\nSome things are harder to recover from than a bad quarter.`,
      btn:  EVENT_BTN[breakupEventType] ?? '[ MOVE ON ]',
    },
  ];

  const current = pages[page];
  const isLast  = page === pages.length - 1;
  const lines   = current.text.split('\n');

  return (
    <div className="breakup-screen" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className="breakup-overlay" style={{ opacity: revealed ? 1 : 0 }} />
      <div className="breakup-card" style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(16px)' }}>
        <div className="breakup-tag">{current.tag}</div>
        <div className="breakup-text">
          {lines.map((line, i) =>
            line === '' ? <br key={i} /> : <p key={i} className="breakup-para">{line}</p>
          )}
        </div>
        <button
          className="btn btn-primary btn-large breakup-btn"
          onClick={isLast ? onDone : () => setPage(p => p + 1)}
        >
          {current.btn}
        </button>
      </div>
    </div>
  );
}
