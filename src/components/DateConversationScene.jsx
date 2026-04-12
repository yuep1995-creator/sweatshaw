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
    engagedBgImage: '/longisland.png',
    engagedDoneLabel: 'Head back inside',
    engagedPages: [
      `The deck overlooks the water and Victor is still standing at the railing when you come out with your drink. He doesn't turn around immediately.\n\n"I made the switch in January. Industrials — power infrastructure, logistics, boring things that actually run the economy." A pause. "The hours are worse than banking. Last week was a hundred and twelve."\n\nHe says it the way you both used to say things to each other at the beginning. Like a fact. Like reporting.`,
      `"I'm originating now. That's the part I didn't expect to like as much." He turns to face you. "Sourcing deals. Building relationships. Coming into a room and making people believe you're the right person before you've proven it."\n\nA long beat.\n\n"Partner track is eight years if you're good. Six if you're exceptional and the timing is right." He looks at you steadily. "I think I can do seven."\n\nYou don't doubt him. You never have. That's always been the thing about Victor — not that he's the smartest in the room, but that the alternative has simply never occurred to him.`,
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
    engagedBgImage: '/festival.png',
    engagedDoneLabel: 'Black out gracefully',
    engagedPages: [
      `The bass hit the moment you walked in and hasn't stopped since. It's the kind of sound you feel in your chest before you register it with your ears — low, relentless, structural.\n\nMarco is already moving. He was moving before you got through the gate. He knows half the people here and greets them all the same way: full eye contact, both hands, like each person is the only one in a field of four thousand.\n\n"You feel it?" he shouts over the music. He doesn't wait for you to answer. He can see that you do.\n\nThe crowd is young — younger than you expected, younger than you're comfortable admitting makes you feel anything. The adrenaline is already up. You're not sure if it's the music, the crowd, or the drink in your hand that appeared from somewhere without your asking.`,
      `He appears at your shoulder three hours later — still moving, still sharp in a way that should be illegal after this many drinks.\n\n"You're having fun," he says. Not a question. He can tell.\n\nHe leans closer. "See? I told you. Every time."\n\nYou lose track of the time somewhere around the second DJ. The energy in the crowd is building toward something — the same quality as a deal in its final hours: momentum, noise, the narrowing of everything down to this one moment.\n\nSomewhere around 3am, with Marco still dancing next to you and the lights doing something extraordinary overhead, a thought surfaces through the haze: God, this feels just like closing a deal.\n\nThe last coherent thing you remember is thinking that this was probably not a healthy observation to have about a music festival.`,
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
    engagedBgImage: '/bearmountain.png',
    engagedDoneLabel: 'Head back down',
    engagedPages: [
      `He's slightly ahead of you on the trail, which is how it usually goes. Not because he's in a hurry — because he moves like someone who isn't thinking about being watched.\n\n"How was the week?" he asks without turning around.\n\nYou start the abbreviated version — the version you give everyone.\n\n"No," he says. "The real one."\n\nYou slow down. He slows down with you. The city is forty miles behind you and presently uncontactable, which is the entire point.`,
      `You sit on a flat rock above the treeline. He's been quiet for a minute in the way he gets when he's thinking something through before he says it.\n\n"You're ahead," he says finally. "I know you don't feel like it right now. That's fine. The people who feel like it aren't the ones I'd rely on."\n\nA beat. A hawk somewhere above, banking in the wind.\n\n"You came here today. On a Saturday. That matters." He hands you half of a sandwich he packed without asking. "You're already doing great. I'll keep saying it until it sticks."`,
    ],
  },

  julien: {
    character: 'Julien Laurent',
    subtitle: 'Partner — Linklaters  ·  Wall Street',
    bgImage: '/steakhouse.png',
    charImage: '/JulienLaurent.png',
    doneLabel: 'Head home thinking',
    pages: [
      `"Can I ask you something?" He sets down his glass. "The thing with your MD — the one you mentioned last time. Have you spoken to him directly yet?"\n\nYou haven't.\n\n"I thought so." Not unkind. "The instinct to manage around difficult relationships rather than through them — it's very common in banking. Very understandable." He looks at you steadily. "Also very ineffective. The longer you leave it, the more it calcifies."`,
      `"The advice I wish someone had given me at your stage—" He pauses, as though deciding which version to share.\n\n"The most important relationships in your career are not the ones above you. They're the ones at your level, who are going to be above you in ten years. Invest in those now. People remember who was good to them before they needed to be."\n\nHe picks up his glass again. "You're good at your job. That matters less than you think at your level. The rest is relationships." A half-smile. "And you're good at those too, when you let yourself be."`,
    ],
    engagedBgImage: '/privateclub.png',
    engagedDoneLabel: 'Head home smiling',
    engagedPages: [
      `The corner table is set for four. Julien's friends are exactly what you'd expect, and also, somehow, exactly what you'd hope for: a barrister, an architect, someone in private equity who listens more than he speaks.\n\nJulien catches your eye across the table and raises his glass just slightly. You've seen him do it in boardrooms. He does it the same way here.\n\n"She closed the Meridian restructuring in six weeks," he tells the barrister. "Don't ask her about it. She'll be modest. Ask the other side."`,
      `The conversation moves without effort — through a deal that collapsed at closing, through a building in Lisbon the architect is converting, through a theory about why mid-market funds are outperforming this cycle. Julien holds the thread without appearing to.\n\nHe has that quality, you've noticed: making everyone feel accurately interesting rather than merely flattered. It's rarer than it sounds.\n\nOn the way out, the architect leans over and says quietly: "He talks about you all the time, you know." She says it like it's nothing.\n\nIt isn't nothing.`,
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
    engagedBgImage: '/longisland.png',
    engagedDoneLabel: 'Head back inside',
    engagedPages: [
      `She checks her phone once, then turns it face-down with a decisiveness that feels like a small act of discipline.\n\n"I made Junior Partner in April." She says it without flourish. "It's official now. Which means the real work starts."\n\nYou ask what the real work is.\n\n"Origination. I need to become someone people call before they know they have a problem." She takes a sip. "Six years of being the best in the room at execution. Now I have three years to become someone who brings the work in."`,
      `"I'm rebuilding my network properly — not the people who matter now, but the ones who'll matter in five years. Junior in-house counsel. Chiefs of Staff. People who are going to be GCs and CFOs, and I want them thinking of me before they think of the firm."\n\nShe says it with the focus of someone who has already made the decision and is now in the execution phase.\n\n"You understand this," she says. Not a question. "You're doing the same thing. You just don't give yourself credit for the strategy behind it."\n\nShe picks up her fork. "That, by the way, was a compliment."`,
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
    engagedBgImage: '/hamptonsclub.png',
    engagedDoneLabel: 'Agree enthusiastically',
    engagedPages: [
      `She has been describing the spa in Turks and Caicos for several minutes. The detail is extraordinary.\n\n"The treatment room is built over the water. You can hear the ocean through the floor while they work on you. It is very — how do you say — immersive."\n\nShe looks at you with the eyes that are always slightly laughing.\n\n"You need this. You look like someone who has not been horizontal for a non-work reason in several weeks." A pause. "I am booking it. You will thank me. You always thank me."`,
      `"Also," she says, "I have been looking at the schools here. In the Hamptons." She announces this the way she announces most things — like weather. "One has equestrian facilities. Another has a very serious arts programme. Both are very — thorough."\n\nYou look at her.\n\n"I am only gathering information. It is not a plan. It is research." The smile she gives you is technically innocent. "I mention it because you will want to have an opinion, and you will be annoyed later if you did not know I was already thinking about it."\n\nShe picks up her drink. "This is me including you. You are welcome."`,
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
    engagedBgImage: '/hampstons.png',
    engagedDoneLabel: 'Walk down to the water',
    engagedPages: [
      `The house has been in the family since her grandparents' time — you can tell from the way she moves through it. Not casually, but with the ease of someone who has always known where the light switches are.\n\n"We came every summer when I was young," she says, standing at the window. "My grandmother would be on the terrace by seven. I'd find her already there, reading. She said the Hamptons light in the morning was the best argument against sleeping in."\n\nShe smiles at something she's seeing that you can't.`,
      `"My parents were rarely here." She says it without bitterness — a fact she processed long ago. "My father was an MD at an IBD house. My mother was a principal at a PE firm. Summer weekends didn't feature in either trajectory."\n\nShe picks up a piece of sea glass from the windowsill — something her grandmother collected, you'd guess.\n\n"My grandmother raised me, in practice. Which is why I have all of this." She means the house, the glass, the view, the memory. "And also why I work the hours I do. I wanted to understand what they chose instead."\n\nShe looks at you. "I think I finally do."`,
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
    engagedBgImage: '/bearmountain.png',
    engagedDoneLabel: 'Head back, hand in hand',
    engagedPages: [
      `She's been walking slightly behind you on the trail, looking up through the canopy.\n\n"I love this," she says. Not to anyone in particular. Just to the air, to the trees, to the fact of being here.\n\nYou ask her what specifically.\n\nShe gestures at all of it — the trail, the light, the fact that you're both here on a Saturday instead of wherever else you could be.\n\n"You took the weekend off," she says. "Do you know how long it's been?" She squeezes your hand. "Don't answer that. Just know that I noticed."`,
      `You find a clearing and stop without deciding to. She sits on a fallen log and tilts her face up toward the light, eyes closed for a moment.\n\n"I'm happy," she says. Simply, like checking something and confirming it.\n\n"Are you? Actually?"\n\nYou tell her you are.\n\nShe looks at you — the long, steady look she has. Then she smiles.\n\n"Good. Then this is already the best weekend." She reaches over and takes your hand. "Tell me something you haven't told anyone else about your week. The real version. We've got miles left to go."`,
    ],
  },

  // ── Hidden / both characters ──────────────────────────────────────────
  logan: {
    character: 'Logan Sterling',
    subtitle: 'Associate — Darkstone Partners  ·  TMT, Former Sweatshaw & Co',
    bgImage: '/frenchdiner.png',
    charImage: '/logansterling.png',
    doneLabel: 'Head home',
    pages: [
      `"We closed the Altair deal last week — $4.2 billion, full auction. I ran the process from the PE side." He takes a sip of his wine without checking the label. "The sell-side was good. You'd know them. They left about forty basis points on the table." He says it the way someone says it when they are very pleased about it.\n\n"What are you working on?" He asks it genuinely, which surprises you slightly. "I love your space. The advisory side has a clarity that the fund side loses once you're inside it. You're still in the game, not running a portfolio."`,
      `He refills your glass before asking. "I've been thinking about the next move — carry is compounding nicely but I want to be on the other side of the table eventually. A fund of my own, maybe. Fifteen years." He looks at you steadily. "You've got a trajectory I respect. Genuinely. Not a lot of people at your level move the way you do."\n\nA pause.\n\n"I love your ambitious mindset, by the way." He says it simply, like it's a fact he's been meaning to state for a while. "I don't say that to many people. But I mean it."`,
    ],
    engagedBgImage: '/hamptons.png',
    engagedDoneLabel: 'Head back inside',
    engagedPages: [
      `He's been quieter this morning, standing at the water's edge with a coffee that has gone slightly cold. He doesn't seem to mind.\n\n"I've been thinking about what we're building," he says. Not to you specifically — more to the horizon. "The fund. The life. All of it." He turns. "We're good at this. Both of us. That's not nothing."\n\nYou ask what he means by 'this.'\n\n"The discipline. The long game." A half-smile. "Most people I know are optimising for the next twelve months. We're the only two I trust to be thinking in decades."`,
      `"I want to take a week off in October. Properly off — no inbox." He says it the way someone announces something they have been thinking about for a while and have finally decided to commit to. "I want to take you somewhere you haven't been. Somewhere with no signal and excellent food."\n\nHe looks at you.\n\n"I know. I know what you're about to say. The timing." He holds up a hand. "I'll handle the timing. You just say yes."\n\nHe reaches across the table and takes your hand.\n\n"You make me better at the things that matter," he says. "That's the whole thing, really."`,
    ],
  },
};

export default function DateConversationScene({ encounterId, onDone, isEngaged = false }) {
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

  const useEngaged = isEngaged && !!conv.engagedPages;
  const bgImage    = useEngaged ? conv.engagedBgImage : conv.bgImage;
  const pages      = useEngaged ? conv.engagedPages   : conv.pages;
  const doneLabel  = useEngaged ? conv.engagedDoneLabel : conv.doneLabel;

  const lines  = pages[page].split('\n');
  const isLast = page === pages.length - 1;

  const accentStyle = conv.accent ? {
    '--fe-accent': conv.accent,
    '--fe-accent-alpha': conv.accentAlpha || 'rgba(212, 160, 23, 0.5)',
  } : {};

  return (
    <div className={`fe-screen${fadeOut ? ' fe-fadeout' : ''}`} style={accentStyle}>
      <div className="fe-bg" style={{ backgroundImage: `url('${bgImage}')` }} />
      <div className="fe-overlay" />

      <img src={conv.charImage} className="fe-char" alt={conv.character} />

      <div className="fe-left-panel">
        <div className="fe-tag">{useEngaged ? 'DATE NIGHT' : 'DATE NIGHT'}</div>

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
            <span className="fe-page-ind">{page + 1} / {pages.length}</span>
            {!isLast
              ? <button className="fe-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {isLast && (
          <button className="fe-done" onClick={handleDone}>
            {doneLabel}
          </button>
        )}
      </div>
    </div>
  );
}
