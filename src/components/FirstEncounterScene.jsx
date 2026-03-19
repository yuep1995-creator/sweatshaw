import { useState, useEffect } from 'react';

const ENCOUNTERS = {
  // ── Paige encounters ──────────────────────────────────────────────────────
  victor: {
    character: 'Victor Hughes',
    subtitle: 'Analyst — Morgan Greystone Capital',
    bgImage: '/network.png',
    charImage: '/VictorHughes.png',
    pages: [
      `You're at an Investment Banking networking event tonight — hosted by a law firm, predictably over-catered, and full of analysts performing confidence at each other.\n\nYou're halfway through a drink you don't need when someone across the room makes eye contact and doesn't look away.\n\nVictor Hughes. You recognise him from Wharton — same year, different circles. Sharp, competitive, the kind of person who always seemed to be measuring the room. He's at Morgan Greystone now. You'd heard his name on a deal last quarter.\n\nHe's already walking over.`,
      `"You know, I almost didn't come tonight. These things are all the same — same analysts, same pitches, same canapés."\n\nHe pauses. His eyes haven't left yours since you made eye contact across the room.\n\n"And then I saw you. You're at Sweatshaw now, aren't you? I heard good things. I don't usually say that about people at rival firms."`,
      `"Victor Hughes." He extends his hand. "You might remember me from Dr Hargreaves' seminar. Third year. I believe I outscored you on the midterm."\n\nHe smiles — the kind that knows exactly what it's doing.\n\n"Just barely. Don't let it bother you. You've clearly recovered.\n\n"Can I get you a drink? I'd like to know what you've been working on. Professional curiosity, naturally."`,
      `You've been talking for forty minutes. The networking event has dissolved around you. Neither of you noticed.\n\nHe reaches into his jacket and hands you a card — the personal one, not the work one.\n\n"Let's do this properly next time," he says. "Somewhere that isn't sponsored by a prime brokerage."\n\nYou don't say no.`,
    ],
    doneLabel: 'Exchange numbers',
  },
  marco: {
    character: 'Marco Moretti',
    subtitle: 'Personal Trainer — Equinox',
    bgImage: '/nightclub.png',
    charImage: '/MarcoMoretti.png',
    pages: [
      `You finished work at 1am on a Friday — which is, technically, still Friday, so you decide to make something of it.\n\nYou walk into the club still in your work clothes. Suit jacket, the shirt that's been through a twelve-hour day, shoes that belong in a boardroom. The music is loud. Nobody cares. You're three drinks in and starting to relax when someone appears beside you and looks you up and down with visible amusement.\n\n"You came straight from the office, didn't you."`,
      `"Excuse me—"\n\nHe leans in just enough to be heard over the music. No agenda to it. Just directness.\n\n"You move like someone who's had a very bad week and needs the music to fix it."\n\nHe grins. "I'm Marco. I won't ask what you do tonight. Here you're just someone who dances well and looks like they needed to escape something."`,
      `"In Italy, we say — bella figura. How you carry yourself through the world. You have it naturally."\n\nHe takes your hand to spin you around. You let him.\n\n"I've been coming here six months. I've asked maybe four people to dance. I don't ask if I'm not sure."\n\nHe looks at you steadily.\n\n"I'm very sure."`,
      `The music changes. You both stay.\n\nHe buys you a drink — something you didn't ask for and somehow exactly what you wanted. By 1am you know he's from Milan, thinks finance people look tired, and laughs easily.\n\nYou told him he wasn't wrong about the tired part. He said the rest of you didn't look tired at all.\n\nHe asks for your number at the door. You give it to him without hesitating.`,
    ],
    doneLabel: 'Give him your number',
  },
  david: {
    character: 'David Li',
    subtitle: 'Software Engineer — FAANG  ·  PhD Computer Science, MIT',
    bgImage: '/centralpark.png',
    charImage: '/DavidLi.png',
    pages: [
      `It's 7am on a Tuesday and you're running through Central Park because it's the only hour of the day that belongs to you.\n\nEarphones in. Head down. Not looking where you're going.\n\nThis is the part where you spill your coffee.`,
      `Your coffee hits his shirt at 7:04am.\n\nYou are already apologising as he looks down at the stain.\n\n"It's—" He pauses. "It's actually fine. I've had worse Monday mornings."\n\nHe smiles. No edge to it at all.\n\n"Honestly, this is probably the most interesting thing that's happened on this run and I'm fifty minutes in. I'm David."`,
      `"You're in finance? My lab at MIT always said finance was just machine learning with worse data and higher stakes."\n\nA pause.\n\n"I defended that argument for three years. I still don't know if they were right."\n\nHe glances at his shirt again. "The dry-cleaning — genuinely, don't worry. But if you want to make it up to me, have dinner with me instead. No coffee involved. Lower-risk environment."`,
      `You stand there longer than makes sense.\n\nHe's unhurried in a way that people in your world aren't — not checked out, just genuinely calm. Like he has somewhere to be and isn't in a rush to get there.\n\nHe shows you his phone after saving your number.\n\n"The Collision," he says. "Descriptive. I work in data."\n\nYou find yourself smiling the whole run home.`,
    ],
    doneLabel: 'Head home smiling',
  },
  julien: {
    character: 'Julien Laurent',
    subtitle: 'Partner — Linklaters  ·  Wall Street',
    bgImage: '/privateclub.png',
    charImage: '/JulienLaurent.png',
    pages: [
      `A colleague pulled you to an Uptown members' club after a client dinner — "just one drink, don't be boring." You came. One drink turned into two.\n\nYou're scanning the room out of habit when you place him. Julien Laurent. Three months ago the two of you were on opposite sides of a restructuring deal that nearly didn't close — brutal hours, positions that didn't move, and then somehow it did. He was the sharpest person in every room during that process.\n\nYou hadn't thought about him since the deal closed. Now he's ten feet away, and he's already seen you.`,
      `You almost walked past him.\n\nJulien Laurent. You worked with him for three months on the Thornfield restructuring — brilliant, measured, the kind of lawyer who made you feel like the deal was going to be fine even at 2am when it very much wasn't.\n\nHe looks up and recognises you before you say anything.\n\n"I was wondering when I'd see you again." He says it as though he'd been expecting it. As though the city is smaller than it looks.`,
      `"Partner at thirty-four." He says it with mild amusement, not pride. "They promoted me in February. I'm still not sure whether to be pleased or alarmed."\n\nHe has a way of holding a room without seeming to try. Everyone in it is peripherally aware of him, and he appears completely unaware of all of them.\n\n"You've done well since Thornfield. I heard about the Carrington deal. The structure was clean." A pause. "I noticed."`,
      `The evening slips past without either of you accounting for it.\n\nAt some point the room has emptied around you. He glances at his watch — the unhurried kind of look that means he hasn't been watching the time at all.\n\n"I should let you go." He doesn't move immediately. "Although I'd rather not."\n\nHe gives you his number. No card. Just his phone, screen facing you.\n\n"Call me. Not about work." A half-smile. "We've done enough of that already."`,
    ],
    doneLabel: 'Save his number',
  },

  // ── Max encounters ────────────────────────────────────────────────────────
  adira: {
    character: 'Adira Sharma',
    subtitle: 'M&A Associate — Clifford Chance  ·  Wharton, Economics (Top of Class)',
    bgImage: '/network.png',
    charImage: '/AdiraSharma.png',
    pages: [
      `Clifford Chance is hosting a cross-firm M&A networking event. You're there because skipping it would be noticed.\n\nThe room is full of people performing their credentials at each other. You're three minutes in when you clock her — she's simultaneously holding court with two partners on opposite sides of her, switching between conversations without breaking stride. No notes, no pauses, total control. The kind of social fluency that looks effortless and absolutely isn't.\n\nSomeone nearby says her name: Adira Sharma. M&A associate. Wharton, top of her year. You'd seen her name on the other side of the Carrington deal and made a mental note.\n\nShe wraps up both conversations in under a minute, scans the room once, and looks directly at you.`,
      `The room is full of people who want to talk to her. She's talking to you.\n\n"You were on the Carrington acquisition, weren't you? I read the credit memo." She has a drink in one hand and a business card in the other that isn't hers. "The structure was clean. Whoever did the intercreditor analysis knew what they were doing."\n\nShe looks at you directly. No warmup, no small talk.\n\n"Was that you?"`,
      `"Adira Sharma." She shakes hands like she means it. "I invited you tonight because I needed someone in that room who would actually understand what was being said. Most of the bankers here are performing. You weren't."\n\nShe says it like a compliment. It lands like one.\n\n"I should warn you — I'm competitive to a fault, I argue for sport, and I have extremely strong opinions about waterfall structures." A slight smile. "I've been told these are not endearing qualities. I've stopped caring."`,
      `By the end of the evening you realise you've been debating deal structures for over an hour and neither of you checked your phones.\n\n"I should go." She says it without moving. "I have a filing at 7am."\n\nShe writes her personal number on the back of a firm card and hands it to you.\n\n"Don't use that for work." A pause. "Call me when you have a take on the Meridian situation that doesn't come from Bloomberg."\n\nYou already have one. You call her the next day.`,
    ],
    doneLabel: 'Exchange cards',
  },
  anastasia: {
    character: 'Anastasia Orlova',
    subtitle: 'Model',
    bgImage: '/privateclub.png',
    charImage: '/AnastasiaOrlova.png',
    accent: '#d4a017',
    accentAlpha: 'rgba(212, 160, 23, 0.5)',
    pages: [
      `A colleague dragged you to a members' club on the Upper East Side. "You need to be seen somewhere that isn't your desk," she said. You put up the usual argument. She ignored it.\n\nYou're on your second drink, halfway through a conversation you've already forgotten, when the room shifts slightly. Not loudly. Just — the way rooms do when someone walks in who changes the temperature of it.\n\nYou turn around.`,
      `She turns before you reach her.\n\n"You are going to tell me I look like a model."\n\nA pause. She takes a sip of her drink without looking at you.\n\n"You are the fourth banker tonight who has approached me. The third one told me exactly that." Her accent is soft — Eastern European, somewhere between elegant and untraceable. "I am, in fact, a model. So the observation, while accurate, is not the compliment you think it is."`,
      `"You are different." She says it slowly, like she's deciding whether she believes it.\n\n"I am Anastasia." She takes a sip of something that almost certainly costs more than your dinner. "Most men here think a membership to this club is a personality. It is not."\n\nShe glances around the room once, then back at you with a look that is somehow both entirely innocent and perfectly calculated.\n\n"Buy me another drink. Then perhaps you can have my Instagram."`,
      `She gives you her handle at the end of the night. Just her name. No numbers, no underscores. Of course.\n\n"I don't follow back." She says it without apology, without cruelty — simply as a fact about herself, like her height or her accent.\n\n"But I will know if you don't follow me immediately."\n\nYou follow her immediately.\n\nShe posts a story forty minutes later. You are not in it. You are somehow fine with this.`,
    ],
    doneLabel: 'Follow her immediately',
  },
  olivia: {
    character: 'Olivia Beaufort',
    subtitle: 'Curator — Whitney Museum  ·  Art History, Columbia',
    bgImage: '/frenchdiner.png',
    charImage: '/OliviaBeaufort.png',
    pages: [
      `A client invited you to a charity gala. You said yes before checking the date, which is how you end up in black tie on a Thursday evening.\n\nThe event is polished and slightly airless — the kind where the cause is real but the room is mostly there to be seen. You're reading the programme when you notice one of the organizers moving through the crowd with the particular ease of someone who has always known how to work a room.\n\nShe looks impeccably put-together. Poised in the way that some people just are — effortlessly, infuriatingly.\n\nIt takes you a moment. Then it lands. Art History. The year below you at university. She always looked exactly like this.`,
      `You recognise her before she recognises you.\n\nOlivia Beaufort. Same year, same university, different world. She studied art history. You studied finance. She always seemed like she was from a different century — in the best possible way.\n\nShe looks up from her menu.\n\n"Oh." She says it quietly, like you're a painting she'd catalogued and forgotten. "It's you. You look—" A pause. "Different. The same. Both."`,
      `"I'm at the Whitney now." She says it the way people say things when they don't need to impress you. "Acquisitions. Modern and contemporary." She touches the stem of her wine glass without lifting it. "Father wanted me at the fund. He still brings it up at Christmas."\n\nShe looks at you with steady, dark eyes.\n\n"You're still at Sweatshaw? I always thought you were too interesting for investment banking." A pause. "That was perhaps naive of me."`,
      `You ask her to dinner. Not this dinner — a real one.\n\nShe considers you for a moment. The kind of consideration that means she's already decided.\n\n"Thursday," she says. "I know a place. You'll need to dress properly." It isn't a suggestion.\n\nShe leaves first. You watch her cross the room like she knows every eye in it is on her.\n\nShe does.\n\nYou are still at your table when the waiter comes to clear her glass.`,
    ],
    doneLabel: 'Clear your schedule for Thursday',
  },
  emily: {
    character: 'Emily Miller',
    subtitle: 'Primary School Teacher — Upper Manhattan',
    bgImage: '/centralpark.png',
    charImage: '/EmilyMiller.png',
    pages: [
      `It's a Sunday morning and you're cutting through Central Park — the city is quiet for once, and your phone has been in your pocket for an unbroken forty minutes, which is either a personal record or a cause for concern.\n\nYou're not paying attention to anything in particular. Just the path, the trees, the unusual absence of a deadline.\n\nThen someone shouts your name.`,
      `"Oh my God. Max?"\n\nYou turn. For a second you don't place her — and then you do, all at once.\n\nEmily Miller. Minnesota. Middle school. The girl who used to leave notes in your locker when you had a bad week.\n\n"It is you!" She's already smiling like she's been smiling for years without stopping. "I heard your family moved to New York — I always thought one day I'd just bump into you somewhere."\n\nShe looks exactly the same. That's actually the only thing that surprises you.`,
      `She's a primary school teacher. Upper Manhattan. Four years now.\n\n"I love it," she says, and she means it entirely. "The kids are chaotic and exhausting and I wouldn't do anything else."\n\nShe tilts her head at you. "And you? Finance? You always were the maths guy."\n\nYou give her the short version. She listens like it matters.\n\n"That sounds incredibly stressful." Not unkind. Just true. "Are you sleeping? You look like you haven't slept."`,
      `"We should get coffee." She says it exactly the way she means it — like it's obvious, like there's no reason not to.\n\n"I know a good place near here. They do the coffee properly. No oat milk foam art, just actual coffee." She grins. "I know that's somehow important to finance people."\n\nYou exchange numbers. She saves you as "Max from Minnesota."\n\nYou save her as "Emily." You don't add anything else. You don't need to.`,
    ],
    doneLabel: 'Exchange numbers',
  },
};

export default function FirstEncounterScene({ encounterId, onDone }) {
  const [page, setPage]       = useState(0);
  const [blink, setBlink]     = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  const enc = ENCOUNTERS[encounterId];

  useEffect(() => {
    const t = setInterval(() => setBlink(b => !b), 1000);
    return () => clearInterval(t);
  }, []);

  const handleDone = () => {
    setFadeOut(true);
    setTimeout(onDone, 600);
  };

  if (!enc) return null;

  const lines  = enc.pages[page].split('\n');
  const isLast = page === enc.pages.length - 1;

  const accentStyle = enc.accent ? {
    '--fe-accent': enc.accent,
    '--fe-accent-alpha': enc.accentAlpha || 'rgba(212, 160, 23, 0.5)',
  } : {};

  return (
    <div className={`fe-screen${fadeOut ? ' fe-fadeout' : ''}`} style={accentStyle}>
      <div className="fe-bg" style={{ backgroundImage: `url('${enc.bgImage}')` }} />
      <div className="fe-overlay" />

      <img src={enc.charImage} className="fe-char" alt={enc.character} />

      <div className="fe-left-panel">
        <div className="fe-tag">FIRST ENCOUNTER</div>

        <div className="fe-dialogue">
          <div className="fe-speaker">{enc.character}</div>
          <div className="fe-speaker-sub">{enc.subtitle}</div>

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
            <span className="fe-page-ind">{page + 1} / {enc.pages.length}</span>
            {!isLast
              ? <button className="fe-btn" onClick={() => setPage(p => p + 1)}>Next →</button>
              : <span />
            }
          </div>
        </div>

        {isLast && (
          <button className="fe-done" onClick={handleDone}>
            {enc.doneLabel}
          </button>
        )}
      </div>
    </div>
  );
}
