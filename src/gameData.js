// ─────────────────────────────────────────────
// CHARACTERS
// ─────────────────────────────────────────────
export const CHARACTERS = [
  {
    id: 'paige',
    name: 'Paige Turner',
    pronoun: 'She/Her',
    quote: '"I don\'t have work-life balance. I have work-work balance."',
    subtext: '(She regularly has her laptop with her during weekend outings. She showed up to her best friend\'s birthday dinner forty minutes late, opened her laptop at the table to "just check one thing," and left before dessert.)',
    emoji: '👩‍💼',
    colour: '#7c6bef',
  },
  {
    id: 'max',
    name: 'Max Grind',
    pronoun: 'He/Him',
    quote: '"I don\'t stop. I don\'t slow down. I don\'t do weekends."',
    subtext: '(His idea of leisure reading is scrolling LinkedIn at midnight and feeling personally attacked by other people\'s promotions.)',
    emoji: '👨‍💼',
    colour: '#2e86c1',
  },
];

// ─────────────────────────────────────────────
// TRAITS
// ─────────────────────────────────────────────
export const TRAITS = [
  {
    id: 'intelligence',
    icon: '🧠',
    name: 'Intelligence',
    subtitle: '"The Brain"',
    description: 'You can solve problems, spot patterns, and understand the quarterly report without pretending. Whether anyone notices is another matter entirely.',
    tooltip: 'Converts directly to starting Competence.',
  },
  {
    id: 'grit',
    icon: '💪',
    name: 'Grit',
    subtitle: '"The Can-Do Mentality"',
    description: 'You don\'t quit. You don\'t complain. You will redo that presentation at 11pm with a smile on your face and murderous thoughts in your heart.',
    tooltip: 'Raises starting Sanity and sets your Sanity Floor (how low you can go).',
  },
  {
    id: 'looks',
    icon: '💅',
    name: 'Looks',
    subtitle: '"The First Impression"',
    description: 'People say looks don\'t matter in the workplace. Those people are lying. It\'s not everything — but it opens doors that shouldn\'t require a key.',
    tooltip: 'Contributes to starting Charisma. Boosts Charisma growth multiplier if > 20.',
    finePrint: (name) => `The game is aware this is uncomfortable. So is ${name}.`,
  },
  {
    id: 'streetSmart',
    icon: '🦊',
    name: 'Street Smart',
    subtitle: '"The Gut"',
    description: 'You can read a room. You know who actually has power and who just has the corner office.',
    tooltip: 'Contributes to starting Charisma. Unlocks startup path if >= 30.',
  },
  {
    id: 'familyBackground',
    icon: '🏠',
    name: 'Family Background',
    subtitle: '"The Head Start"',
    description: 'Did someone in your family know someone? Money and connections don\'t guarantee success. They just make failure more optional.',
    tooltip: 'Boosts starting Reputation and Wealth. Score >= 35 = Legacy Hire status.',
    finePrint: () => 'High scores here make early game easier. The game tracks this. So do your coworkers.',
  },
];

// ─────────────────────────────────────────────
// SNARKY COMMENTS
// ─────────────────────────────────────────────
export const getSnarkyComment = (traits) => {
  const { intelligence, grit, looks, streetSmart, familyBackground } = traits;
  const vals = Object.values(traits);
  const max = Math.max(...vals);
  const min = Math.min(...vals);

  if (looks > 40) return "You walk into rooms and people just... move. You'll figure out the spreadsheets later. Maybe.";
  if (intelligence > 40) return 'Technically brilliant. Socially invisible. This will be fine.';
  if (familyBackground > 40) return 'The nepotism speedrun. Bold. Effective. Controversial.';
  if (max - min <= 5) return 'A well-rounded individual. Impressive. Boring at parties.';
  if (familyBackground < 15) return 'Self-made. Everything you earn, you actually earned. The game respects this. Slightly.';
  if (grit > 40) return 'You will survive things that should not be survived.';
  if (streetSmart > 40 && looks > 30) return "You walk into rooms and people just... move. You'll figure out the spreadsheets later. Maybe.";
  if (streetSmart > 40) return "You'll never be the smartest person in the room. You'll just know who is.";
  if (grit >= 35 && intelligence >= 25) return "Relentless and capable. HR has flagged you as a Flight Risk. This is a compliment.";
  if (intelligence >= 30 && looks >= 25 && grit <= 15) return "Brilliant. Presentable. Absolutely not getting out of bed for this. Relatable.";
  if (familyBackground >= 30 && streetSmart >= 25) return "Connections and cunning. VP by year three or a documentary. No in-between.";
  if (looks <= 12 && streetSmart <= 12 && intelligence >= 30) return "You have the social grace of a spreadsheet and twice the utility. This is enough.";
  return "Points remaining: allocate wisely. Or don't. This is your origin story.";
};

// ─────────────────────────────────────────────
// STAT CONVERSION
// ─────────────────────────────────────────────
export const calculateStartingStats = (traits) => {
  const { intelligence, grit, looks, streetSmart, familyBackground } = traits;

  const isRichLegacy = familyBackground === 100; // 100 is the max allocatable score
  // familyBackground × $1,000; all-in (100) → $1,000,000
  const startingWealth = isRichLegacy ? 1_000_000 : familyBackground * 1_000;

  // Derived multipliers — calculated once at game start, stored in gs.traitMultipliers
  const traitMultipliers = {
    competenceMultiplier:    1 + (intelligence - 10) / 100, // 1.00 – 1.90
    sanityLossReduction:     (grit - 10) / 100,             // 0.00 – 0.90
    charismaMultiplierLooks: 1 + (looks - 10) / 100,        // 1.00 – 1.90
    reputationMultiplier:    1 + (streetSmart - 10) / 100,  // 1.00 – 1.90
  };

  return {
    competence:  intelligence,                              // 10–100 starting
    charisma:    looks,                                     // 10–100 starting
    reputation:  10 + Math.floor(familyBackground * 0.3),  // 13–40 starting
    sanity:      Math.min(200, 50 + Math.floor(grit * 0.3)), // 53–80 starting
    sanityFloor: Math.floor(grit / 2),                     // 5–50 breakdown threshold
    wealth:      startingWealth,
    traitMultipliers,
    isLegacyHire: familyBackground >= 35,
    isRichLegacy,
  };
};

// ─────────────────────────────────────────────
// PSYCHOLOGICAL PROFILE
// ─────────────────────────────────────────────
export const getProfile = (traits) => {
  const { intelligence, looks, streetSmart, grit, familyBackground } = traits;
  const vals = Object.values(traits);
  const allBalanced = vals.every(v => v >= 31 && v <= 60);

  if (familyBackground === 100)
    return `"Candidate's father plays golf with our CEO every third Sunday.\nInterview scores were recorded as a matter of procedure.\nThe desk has already been assigned."`;

  if (intelligence > 60)
    return `"Analytically exceptional. Finished the technical case study\nthirty minutes early and then corrected a typo in our question.\nFrankly, a little embarrassing for everyone involved."`;

  if (looks > 60)
    return `"Impeccably presented. Three interviewers described the candidate\nas 'very polished' without being asked.\nClient-facing placement. Immediately."`;

  if (streetSmart > 60)
    return `"Knew which interviewer had the real decision-making power\nwithin five minutes of sitting down.\nWe are still discussing whether this is impressive or concerning."`;

  if (grit > 60)
    return `"Demonstrates exceptional resilience and work ethic.\nWill almost certainly still be here at midnight.\nWe are monitoring this."`;

  if (allBalanced)
    return `"Solid across the board. Nothing that alarmed us,\nnothing that particularly thrilled us either.\nThe backbone of every great firm. We mean that sincerely."`;

  return `"Completed the interview process without incident.\nA decision was reached. Here we are.\nWe look forward to seeing what emerges."`;
};

// ─────────────────────────────────────────────
// CAREER STAGES
// ─────────────────────────────────────────────
export const CAREER_STAGES = [
  {
    id: 'analyst',
    title: 'Analyst',
    gameYears: [1, 2, 3],
    calendarYears: [2026, 2027, 2028],
    promoReqs: { competence: 250, charisma: 120, reputation: 120 },
    allowAccelerated: true,
  },
  {
    id: 'associate',
    title: 'Associate',
    gameYears: [4, 5, 6],
    calendarYears: [2029, 2030, 2031],
    promoReqs: { competence: 500, charisma: 300, reputation: 300 },
    allowAccelerated: true,
  },
  {
    id: 'vp',
    title: 'VP',
    gameYears: [7, 8, 9],
    calendarYears: [2032, 2033, 2034],
    promoReqs: { competence: 700, charisma: 600, reputation: 600 },
    allowAccelerated: false,
  },
  {
    id: 'director',
    title: 'Director',
    gameYears: [10, 11, 12],
    calendarYears: [2035, 2036, 2037],
    promoReqs: { competence: 800, charisma: 850, reputation: 850 },
    allowAccelerated: false,
  },
];

// ─────────────────────────────────────────────
// ACTIVITIES
// ─────────────────────────────────────────────
export const ACTIVITIES = [
  {
    id: 'crunchDeal',
    icon: '💼',
    name: 'Crunch Deal',
    description: 'A live deal just landed. You know what that means.',
    category: 'Work',
    cost: 0,
    effects: { competence: 8, reputation: 4, sanity: -10 },
    risk: { chance: 0.15, effect: { sanity: -5 }, label: 'Burnout Warning triggered.' },
  },
  {
    id: 'pitchClients',
    icon: '📊',
    name: 'Pitch New Clients',
    description: 'Showtime.',
    category: 'Work',
    cost: 0,
    effects: { charisma: 6, reputation: 3, competence: 3, sanity: -5 },
    charismaScaled: true,
    socialActivity: true,
  },
  {
    id: 'deepSkillWork',
    icon: '🎓',
    name: 'Deep Skill Work',
    description: 'Head down. Doing the actual work.',
    category: 'Work',
    cost: 500,
    effects: { competence: 10, sanity: -3 },
  },
  {
    id: 'extraResponsibilities',
    icon: '🙋',
    name: 'Take On Extra Responsibilities',
    description: '"Sure," you said. "Happy to help," you said.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 7, competence: 5, sanity: -8 },
  },
  {
    id: 'networkInternal',
    icon: '🤝',
    name: 'Network (Internal)',
    description: 'Another coffee chat. Another person to not remember your name.',
    category: 'Social',
    cost: 200,
    effects: { charisma: 4, reputation: 5, sanity: -2 },
    charismaScaled: true,
    socialActivity: true,
  },
  {
    id: 'networkExternal',
    icon: '🍸',
    name: 'Network (External)',
    description: 'Technically work. Functionally a Wednesday at a bar.',
    category: 'Social',
    cost: 800,
    effects: { charisma: 6, reputation: 2, sanity: -3 },
    charismaScaled: true,
    socialActivity: true,
  },
  {
    id: 'therapy',
    icon: '🧘',
    name: 'Therapy',
    description: 'Radical self-awareness. Slightly career-limiting. Highly recommended.',
    category: 'Recovery',
    cost: 1_000,
    effects: { sanity: 10, reputation: 2 },
  },
  {
    id: 'hitGym',
    icon: '🏃',
    name: 'Hit the Gym',
    description: 'The only place where your work phone doesn\'t follow. In theory.',
    category: 'Recovery',
    cost: 300,
    effects: { sanity: 7, charisma: 3 },
    charismaScaled: true,
  },
  {
    id: 'takeWeekend',
    icon: '🛋️',
    name: 'Take a Weekend',
    description: 'You\'ve earned this. The emails will survive. Probably.',
    category: 'Recovery',
    cost: 500,
    effects: { sanity: 12 },
    requiresDateFromYear: 2,
    socialActivity: true,
  },
  {
    id: 'officeGossip',
    icon: '💬',
    name: 'Office Gossip',
    description: 'Information gathering. Obviously.',
    category: 'Wild Card',
    cost: 0,
    effects: { sanity: 2 },
    risk: { chance: 0.10, effect: { reputation: -2 }, label: 'Word got back to you.' },
  },
  {
    id: 'sideProject',
    icon: '💻',
    name: 'Work on Side Project',
    description: 'Your newsletter / app / Substack. The dream.',
    category: 'Wild Card',
    cost: 300,
    // income handled by MainGame based on sideProjectMonths counter
    effects: { sanity: -4, competence: 3 },
    trackAs: 'sideProjectMonths',
  },
  {
    id: 'linkedInPosting',
    icon: '📱',
    name: 'LinkedIn Posting',
    description: 'Sharing your journey. People are engaging.',
    category: 'Wild Card',
    cost: 0,
    effects: { charisma: 2, reputation: -3, sanity: 1 },
    charismaScaled: true,
    trackAs: 'linkedInMonths',
  },
  {
    id: 'doNothing',
    icon: '😶',
    name: 'Do Nothing',
    description: 'Look busy. Stare at the middle distance. Think about your choices.',
    category: 'Wild Card',
    cost: 0,
    effects: { sanity: 4 },
    risk: { chance: 0.05, effect: { reputation: -3 }, label: 'Someone noticed.' },
  },
];

// ─────────────────────────────────────────────
// DATE OPTIONS
// ─────────────────────────────────────────────
export const DATE_OPTIONS = [
  {
    id: 'jordan',
    name: 'Jordan',
    description: 'The charming rival at a competing firm.',
    dateCost: 400,
    effects: { sanity: 10, charisma: 3, reputation: 2 },
    charismaScaled: true,
    flavour: 'They order for the table without asking. You\'re annoyed. You\'re impressed. You\'re confused.',
    milestoneText: 'Jordan texts first this time. Progress? Complication? Both.',
  },
  {
    id: 'sam',
    name: 'Sam',
    description: 'The quietly competent colleague from your floor.',
    dateCost: 100,
    effects: { sanity: 14, reputation: 3, charisma: 2 },
    charismaScaled: true,
    flavour: 'You talk for four hours. About nothing important. It was exactly what you needed.',
    milestoneText: 'Sam remembers how you take your coffee. You didn\'t know you needed that.',
  },
  {
    id: 'riley',
    name: 'Riley',
    description: "Your manager's assistant.",
    dateCost: 200,
    effects: { sanity: 8, charisma: 4 },
    charismaScaled: true,
    flavour: 'Riley knows things. Useful things. You\'re not sure if this is dating or intelligence gathering.',
    milestoneText: 'Riley mentions a name in passing. You file it away. You can\'t help it.',
  },
  {
    id: 'alex',
    name: 'Alex',
    description: 'A university friend. Not in finance.',
    dateCost: 50,
    effects: { sanity: 18, competence: -1 },
    flavour: 'You remembered you have a personality. It was in storage.',
    milestoneText: 'Alex asks how you\'re actually doing. The honest answer surprises you.',
  },
];

// ─────────────────────────────────────────────
// QUARTERLY EVENTS
// ─────────────────────────────────────────────
export const QUARTERLY_EVENTS = [
  {
    id: 'birthdayDeal',
    location: 'office',
    title: 'The Birthday Deal',
    text: "It's your mother's birthday. Your boss just dropped a live deal on your desk at 4pm. The deal closes at midnight.",
    choices: [
      { label: 'Work the deal. Miss the birthday.', effects: { competence: 5, reputation: 4, sanity: -8 } },
      { label: 'Call your mum, then work the deal.', effects: { charisma: 2, sanity: -4, reputation: 2 } },
      { label: 'Delegate to a junior.', effects: { reputation: 5, competence: 2 }, requires: { competence: 50 }, requiresLabel: 'Requires Competence 50+' },
      { label: 'Go to the birthday.', effects: { sanity: 6, reputation: -4, wealth: -200 }, isD: true },
    ],
  },
  {
    id: 'creditThief',
    location: 'office',
    title: 'The Credit Thief',
    text: "A colleague presents your analysis to the MD. He didn't even change the font.",
    choices: [
      { label: 'Say nothing. Seethe quietly.', effects: { sanity: -6 } },
      { label: 'Correct the record professionally in the meeting.', effects: { reputation: 6, charisma: 3, sanity: -3 } },
      { label: 'Speak to your manager privately after.', effects: { reputation: 4, competence: 2 } },
      { label: 'Update your CV tonight.', effects: { sanity: 4 }, isD: true, hiddenFlag: 'jobSearch' },
    ],
  },
  {
    id: 'elevatorSecret',
    location: 'office',
    title: 'The Elevator Secret',
    text: 'You overhear something in the elevator you were not supposed to hear. About the firm. About the deal. About you.',
    choices: [
      { label: 'Pretend you heard nothing.', effects: { sanity: -4 } },
      { label: 'Quietly investigate.', effects: { reputation: 3, sanity: -2 } },
      { label: 'Confront the person directly.', effects: { charisma: 4, reputation: -3 } },
      { label: 'Tell a trusted colleague.', effects: { reputation: 2, sanity: 3 }, isD: true },
    ],
  },
  {
    id: 'saturdayCall',
    location: 'remote',
    title: 'The Saturday Call',
    text: "Your MD asks everyone to stay for a 'quick' Saturday call. It is not quick. It is never quick.",
    choices: [
      { label: 'Stay for the whole call.', effects: { competence: 4, sanity: -8 } },
      { label: 'Stay for the first hour then leave.', effects: { sanity: -3, reputation: 2 } },
      { label: 'Dial in from somewhere more interesting.', effects: { sanity: 4, reputation: -2 } },
      { label: 'Send a very professional apology email.', effects: { charisma: 3, reputation: -4 }, isD: true },
    ],
  },
  {
    id: 'burningOutJunior',
    location: 'office',
    title: 'The Burning Out Junior',
    text: 'A junior analyst on your team is clearly burning out. You recognise the signs. You were them once.',
    unlockFromStage: 'vp',
    choices: [
      { label: 'Say nothing. Not your problem.', effects: { sanity: -3 } },
      { label: 'Check in privately.', effects: { reputation: 6, sanity: 3 } },
      { label: 'Escalate to HR.', effects: { reputation: 4, charisma: 3 } },
      { label: 'Give them a day off unofficially.', effects: { reputation: 8 }, isD: true },
    ],
  },
  {
    id: 'boardQuestion',
    location: 'office',
    title: 'The Board Question',
    text: "The CEO asks for your honest opinion in front of the board. He does not want your honest opinion.",
    unlockFromStage: 'director',
    choices: [
      { label: 'Give your honest opinion.', effects: { reputation: 8, charisma: -4 } },
      { label: 'Give a diplomatic non-answer.', effects: { charisma: 6, reputation: -2 } },
      { label: 'Redirect the question brilliantly.', effects: { charisma: 8, reputation: 6 }, requires: { charisma: 65 }, requiresLabel: 'Requires Charisma 65+' },
      { label: 'Ask a clarifying question to buy time.', effects: { charisma: 4, reputation: 2 }, isD: true },
    ],
  },
];

// ─────────────────────────────────────────────
// MANAGER NOTE TEMPLATES (Annual Review)
// ─────────────────────────────────────────────
export const getManagerNote = (stats, name) => {
  const candidates = ['competence', 'charisma', 'reputation', 'sanity'];
  const lowest = candidates.reduce((a, b) => stats[a] < stats[b] ? a : b);
  const map = {
    sanity: `Shows exceptional commitment. We would like to remind ${name} that the Employee Assistance Programme exists.`,
    charisma: `${name} demonstrates strong technical output and would benefit from increased visibility with senior stakeholders.`,
    reputation: `Some feedback has been received regarding team dynamics. A development conversation has been scheduled.`,
    competence: `${name} brings excellent energy to the team. Technical development remains an area of focus.`,
  };
  return map[lowest];
};

// ─────────────────────────────────────────────
// BADGES
// ─────────────────────────────────────────────
export const BADGES = {
  officeFurniture:      { icon: '🪑', label: 'Office Furniture',       desc: 'Crunch Deal every month of a single quarter.' },
  starAssociate:        { icon: '⭐', label: 'Star Associate',          desc: 'Competence AND Reputation both above 70 at year end.' },
  spreadsheetWhisperer: { icon: '🧠', label: 'Spreadsheet Whisperer',  desc: 'Competence grew more than 15 points in a year.' },
  theGhost:             { icon: '👻', label: 'The Ghost',               desc: 'No networking activity in a full year.' },
  runningOnFumes:       { icon: '🫠', label: 'Running on Fumes',        desc: 'Sanity dropped below 25 during the year.' },
  linkedInInfluencer:   { icon: '🤡', label: 'LinkedIn Influencer',     desc: 'Chose LinkedIn Posting 4+ times in a year.' },
  actuallyOkay:         { icon: '🧘', label: 'Actually Okay',           desc: 'Sanity above 70 at every quarter end this year.' },
  taken:                { icon: '💌', label: 'Taken',                   desc: 'Same date chosen 3+ times.' },
  overachiever:         { icon: '🏆', label: 'Overachiever',            desc: 'Met accelerated promotion criteria.' },
};

// ─────────────────────────────────────────────
// GAME ENDINGS
// ─────────────────────────────────────────────
export const ENDINGS = {
  backToFamilyBusiness: {
    title: 'Back to the Family Business.',
    colour: '#d4a017',
    text: (name) => `The call came on a Thursday. Or perhaps a Wednesday. ${name} had stopped tracking days with any particular precision around month eight.\n\nIt was the estate lawyer. The portfolio needed attention. The properties required decisions. The businesses — plural, always plural — had been waiting patiently for the person whose name was on the succession documents.\n\n${name} sat with the phone for a long time after hanging up. Then booked a flight.\n\nBanking had been an interesting detour. Genuinely interesting. The models, the deals, the architecture of money moving at speed — there was something honest about learning how it all worked from the inside, rather than simply inheriting the outcome. But the promotion cycle, the performance scores calibrated to two decimal places, the annual review where someone who earned a fraction of the family's quarterly dividend explained ${name}'s "development areas" — none of that had ever really been the point.\n\nThe point was always going to be the same thing it had always been. The name above the door. The seat at the table that had been waiting, upholstered and empty, since before ${name} could read.\n\nThey did not consider this a failure. The game had been interesting. They had simply decided to stop playing it.`,
    epilogue: 'The handover was seamless. It always is, when the infrastructure was already there.',
  },
  burntOut: {
    title: 'Burnt Out.',
    colour: '#f59e0b',
    text: (name) => `${name} didn't mean to quit. Not really. There was no grand moment of clarity, no dramatic resignation speech.\n\nOne morning, the alarm went off. ${name} stared at the ceiling. Then set the alarm again. Then again.\n\nOn the third day, they emailed HR. The subject line said "personal leave." The body said almost nothing. The truth was simpler: there was nothing left.\n\nThe questions came later, in the silence that followed. What had it all been for? Was this what ambition was supposed to feel like when it ran out? The answers weren't forthcoming. But for the first time in years, there was time to sit with them.`,
    epilogue: 'The therapist helped. Slowly. So did sleep, and weekends that felt like actual weekends.',
  },
  upOrOut: {
    title: 'Up or Out.',
    colour: '#ef4444',
    text: (name) => `The email arrived on a Friday afternoon. Two lines. Respectful, HR-reviewed, completely devastating.\n\n${name} had been the top student. Had been. That was the word that kept surfacing: "had been." Sweatshaw & Co didn't traffic in past tense.\n\nThe surprise was the most humiliating part. All the late nights, the decks rebuilt at midnight, the weekends quietly surrendered — and still, somehow, this.\n\nThe grief was real. Then it passed. And somewhere on the other side of it, ${name} started to notice the world outside the building. The one that had been there all along.`,
    epilogue: 'Turned out there was quite a lot of it. The wider world. More than expected.',
  },
  permanentVP: {
    title: 'The Permanent VP.',
    colour: '#8b90b0',
    text: (name) => `There is a particular kind of stuck that only exists inside a large institution.\n\n${name} became a VP and stayed one. Not through failure — the scores were fine, the reviews were adequate, the work was solid. But "solid" and "Director" are two different conversations, and the partners had made their calculation.\n\nThe salary was good. The title was respectable. The ceiling was visible from the desk.\n\nYears later, ${name} could still describe exactly how it felt to realise this was it. That the game had not ended — it had simply become a different game, one without a winning condition.`,
    epilogue: 'The junior analysts called them "the institution." They meant it as a compliment. Probably.',
  },
  headOfInternalStrategy: {
    title: 'Head of Internal Strategy.',
    colour: '#8b90b0',
    text: (name) => `They didn't tell ${name} directly. That was never how it was done.\n\nThe signs were there — a smaller room, a meeting removed from the agenda, a project with a vague mandate and no reporting line. "Head of Internal Strategy." The title sounded important. No one came to ask for strategy.\n\n${name} had been close. Closer than most ever got. But in the final year, something had shifted — the room had changed its mind, or ${name} had, or both. The partnership had gone to someone else. The rest was just administration.`,
    epilogue: '"Director." The business card still said that. It was still true. It was also, somehow, the last true thing.',
  },
  gracefulExit: {
    title: 'The Clean Break.',
    colour: '#22c55e',
    text: (name) => `${name} handed in their notice on a Tuesday. No drama. No counteroffer accepted.\n\nThey felt nothing but relief — which was the most surprising thing of all.`,
    epilogue: 'The first Monday morning without a commute was very quiet. Then it was just... good.',
  },
  goldenHandcuffs: {
    title: 'The Golden Cage.',
    colour: '#d4a017',
    text: (name) => `${name} could leave. The number in the account made it possible.\n\nThe number in the account also made it feel impossible. The walls had gotten comfortable. Or maybe just familiar.`,
    epilogue: 'The flat is very nice. The 4am emails, less so.',
  },
  founder: {
    title: 'You Didn\'t Leave. You Launched.',
    colour: '#4f6ef7',
    text: (name) => `The side project had been running for two years before ${name} admitted it was actually a company.\n\nThe day they registered it was a Thursday. Nobody noticed them leave Sweatshaw & Co three months later.`,
    epilogue: 'Seed round closed. The pitch deck had one slide that just said "we\'ve been doing this anyway."',
  },
  linkedInInfluencer: {
    title: 'The Thought Leader.',
    colour: '#a78bfa',
    text: (name) => `${name} didn't mean for it to go this far.\n\nThe post about "lessons from the trading floor" got 40,000 impressions. The one about "why I quit" got 400,000. The speaking fee now covers rent.`,
    epilogue: '"Career speaker & consultant. Sweatshaw & Co alum." The pinned post has 2.1k likes.',
  },
  regulator: {
    title: 'The Rule Changer.',
    colour: '#22c55e',
    text: (name) => `${name} learned how the game worked — all of it.\n\nThen, quietly and methodically, began to change the rules. Not loudly. Just persistently.`,
    epilogue: 'Three policy changes. One industry standard. Nobody saw it coming.',
  },
  madePartner: {
    title: 'Corner Office.',
    colour: '#d4a017',
    text: (name) => `After twelve years, Sweatshaw & Co offered ${name} a partnership.\n\nThe ceremony was understated. The cake was good. The office faced east, which meant you saw the sunrise most mornings, whether you wanted to or not.`,
    epilogue: (sanity) =>
      sanity > 70 ? 'The work was hard. The life was full. Not perfect. Full. There\'s a difference.'
      : sanity > 40 ? 'The work was good. The rest of life had become something negotiated around it. You\'re working on that.'
      : 'You made it. You\'re not entirely sure what "it" was. Your therapist has opinions.',
  },
  hollowVictory: {
    title: 'Empty Table.',
    colour: '#555e80',
    text: (name) => `${name} made Partner. The celebration dinner had three people. Two were from HR.\n\nThe canapés were very good.`,
    epilogue: '"Effective. Strategic. Results-driven." The review always said the same things. They meant them. That was the strangest part.',
  },
  earlyRetirement: {
    title: 'THE EXIT',
    colour: '#d97706',
    text: (name, stats) => {
      const p1 = `${name} had more money than they knew what to do with. That sentence had once seemed like a problem they would enjoy having. It turned out to be more complicated than that.`;

      let p2 = '';
      if ((stats?.wealth || 0) > 50_000_000) {
        p2 = `Fifty million dollars. More than fifty million dollars. ${name} had not checked the exact figure in three weeks because the exact figure had stopped meaning anything in any human sense. It was a number. Numbers were what they used to feel things. Now the numbers were too large and the feelings were too small.`;
      } else {
        p2 = `The account balance had cleared eight figures sometime in the last year. ${name} remembered noticing and then immediately returning to the spreadsheet they had been working on. There had not been time to think about what it meant. There was never time.`;
      }

      const p3 = `The resignation was quiet. A conversation, a handshake, a leaving gift from a team who had genuinely liked them and would forget them in six months — not out of cruelty but out of the sheer velocity of the place they were leaving behind.`;

      let p4 = '';
      if ((stats?.sanity || 100) < 15) {
        p4 = `The first month was not the relief they had imagined. The body does not simply stop when the schedule does. ${name} woke at 5:30am for eleven weeks straight, reached for a phone that no longer needed to be checked, and lay in the silence of a morning with nowhere to be, learning slowly and with great difficulty how to find that acceptable.`;
      } else {
        p4 = `The first month was quieter than expected and better than feared. Small things returned — the ability to read a book without checking email, the memory that food could be a pleasure rather than fuel, the strange luxury of a Tuesday with nothing required of it.`;
      }

      const p5 = `${name} did not go back. Some people do — the structure, the identity, the feeling of mattering in a measurable way. ${name} had enough money to discover who they were without the job. It took longer than the money to figure out whether they liked the answer. But they had time now. For the first time in twelve years, they had nothing but time.`;

      return [p1, p2, p3, p4, p5].filter(Boolean).join('\n\n');
    },
    epilogue: '',
  },
  bankruptcy: {
    title: 'The Money Ran Out.',
    colour: '#374151',
    isBankruptcy: true,
    text: (name, stats, gs) => {
      const p1 = `The direct debit failed on a Tuesday morning.\n${name} knew before the notification arrived — had known for a few weeks, really, in the way you know things you are not ready to deal with.\nThe letting agent's email was polite. It always is, at first.`;

      let p2 = '';
      if ((stats?.competence ?? 0) > 60) {
        p2 = `The frustrating thing — the part that kept ${name} up at night — was that they were good at the job. Genuinely good. The work was never the problem. The numbers just hadn't kept up with the city, with the rent, with the version of life that Sweatshaw & Co quietly required you to maintain.`;
      } else if ((stats?.sanity ?? 100) < 30) {
        p2 = `Looking back, the money was the last thing to go. Everything else had already been quietly leaving for months — the sleep, the appetite for it, the ability to care about the things they were supposed to care about. The bank balance was just the last domino.`;
      }

      let p2b = '';
      if (gs?.isRichLegacy) {
        p2b = `There would be a call to make, eventually. To someone who would answer on the second ring and not say I told you so, at least not immediately. ${name} was not ready to make that call. They sat with their phone face-down on the table for a very long time.`;
      }

      let p3 = '';
      const rep = stats?.reputation ?? 0;
      if (rep > 60) {
        p3 = `A former colleague called within the week. There was contract work, if ${name} wanted it. People remembered the good years. That turned out to matter more than expected.`;
      } else if (rep >= 30) {
        p3 = `They updated their CV on a Thursday night and sent it to twelve places by midnight. Three replied. One became something. It took a while.`;
      } else {
        p3 = `The industry was smaller than it looked from the inside. ${name} learned this the slow way. They pivoted eventually — something adjacent, something quieter. It was fine. Fine was enough for a while.`;
      }

      const p4 = `Sweatshaw & Co filled the position within six weeks. The new hire sat at the same desk. They did not know whose it had been. That is how it works.`;

      return [p1, p2, p2b, p3, p4].filter(Boolean).join('\n\n');
    },
    epilogue: '',
  },
};
