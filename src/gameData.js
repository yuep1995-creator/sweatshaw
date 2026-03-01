// ─────────────────────────────────────────────
// CHARACTERS
// ─────────────────────────────────────────────
export const CHARACTERS = [
  {
    id: 'paige',
    name: 'Paige Turner',
    pronoun: 'She/Her',
    quote: '"I didn\'t come this far to only come this far."',
    subtext: '(She has no idea what that means. She saw it on a motivational poster.)',
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
    sanity:      Math.min(100, 50 + Math.floor(grit * 0.3)), // 53–80 starting
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
export const getProfile = (traits, characterName) => {
  const dominant = Object.entries(traits).sort((a, b) => b[1] - a[1])[0][0];
  const profiles = {
    intelligence: `"A technically strong candidate with moderate interpersonal presence and a notable absence of industry connections. Management anticipates a steady if unspectacular trajectory. We have been wrong before."`,
    grit: `"Demonstrates exceptional resilience and work ethic. Will almost certainly still be here at midnight. We are monitoring this."`,
    looks: `"Strong first impression. Excellent client-facing potential. Technical assessments pending."`,
    streetSmart: `"Perceptive. Adaptable. Possibly too aware of office dynamics for their own good."`,
    familyBackground: `"Comes highly recommended. References were... enthusiastic. We look forward to seeing independent contributions."`,
  };
  return profiles[dominant];
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
    weights: { competence: 0.50, charisma: 0.25, reputation: 0.25 },
    standardThreshold: 100,
    acceleratedThreshold: 130,
  },
  {
    id: 'associate',
    title: 'Associate',
    gameYears: [4, 5, 6],
    calendarYears: [2029, 2030, 2031],
    weights: { competence: 0.45, charisma: 0.25, reputation: 0.30 },
    standardThreshold: 160,
    acceleratedThreshold: 195,
  },
  {
    id: 'vp',
    title: 'VP',
    gameYears: [7, 8, 9],
    calendarYears: [2032, 2033, 2034],
    weights: { competence: 0.35, charisma: 0.30, reputation: 0.35 },
    standardThreshold: 235,
    acceleratedThreshold: 275,
  },
  {
    id: 'director',
    title: 'Director',
    gameYears: [10, 11, 12],
    calendarYears: [2035, 2036, 2037],
    weights: { competence: 0.25, charisma: 0.40, reputation: 0.35 },
    standardThreshold: 318,
    acceleratedThreshold: 365,
  },
];

export const PARTNER_WEIGHTS = { competence: 0.20, charisma: 0.45, reputation: 0.35 };
export const PARTNER_STANDARD_THRESHOLD = 318;
export const PARTNER_ACCELERATED_THRESHOLD = 365;
export const LEGACY_HIRE_STANDARD_REDUCTION = 8;
export const LEGACY_HIRE_ACCELERATED_REDUCTION = 6;

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
  fired: {
    title: 'Effective Immediately.',
    colour: '#ef4444',
    text: (name) => `The meeting was scheduled with no agenda. That was the first sign.\n\n${name} sat across from HR and someone from Legal. The letter was already printed.\n\nThree years of work. One envelope.`,
    epilogue: 'The reference was professional and cold. Like the handshake.',
  },
  mentalHealthCollapse: {
    title: 'Out of Office.',
    colour: '#f59e0b',
    text: (name) => `${name} stared at the ceiling for three hours.\n\nThen booked a flight. The out-of-office said "personal leave." The truth was simpler: it was time to go.`,
    epilogue: 'The therapist said it wasn\'t a breakdown. Just a breakthrough wearing a scary costume.',
  },
  obsolescence: {
    title: 'Head of Strategic Initiatives.',
    colour: '#8b90b0',
    text: (name) => `They didn't fire ${name}. They couldn't.\n\nInstead, there was a new title, a different floor, a project with a vague brief and no headcount. "Strategic Initiatives." The words said prestige. The reality said parking lot.`,
    epilogue: 'The corner office had a beautiful view. No one came to visit.',
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
    text: (name) => `The side project had been running for two years before ${name} admitted it was actually a company.\n\nThe day they registered it was a Thursday. Nobody noticed them leave Goldman Stanley three months later.`,
    epilogue: 'Seed round closed. The pitch deck had one slide that just said "we\'ve been doing this anyway."',
  },
  linkedInInfluencer: {
    title: 'The Thought Leader.',
    colour: '#a78bfa',
    text: (name) => `${name} didn't mean for it to go this far.\n\nThe post about "lessons from the trading floor" got 40,000 impressions. The one about "why I quit" got 400,000. The speaking fee now covers rent.`,
    epilogue: '"Career speaker & consultant. Goldman Stanley alum." The pinned post has 2.1k likes.',
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
    text: (name) => `After twelve years, Goldman Stanley offered ${name} a partnership.\n\nThe ceremony was understated. The cake was good. The office faced east, which meant you saw the sunrise most mornings, whether you wanted to or not.`,
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
  americanPsycho: {
    title: 'THE MACHINE BREAKS',
    colour: '#e2e8f0',
    isAmericanPsycho: true,
    text: (name, stats) => {
      const p1 = `There was no single moment. That is what nobody tells you, and what ${name} could not have explained even if someone had thought to ask. There was no morning they woke up and decided to stop being okay. It was more like a dimmer switch than a light going out — so gradual that by the time the room was dark, they had forgotten what the light looked like.`;
      const p2 = `The hours had always been long. That was the agreement, unwritten and non-negotiable, signed somewhere between the first all-nighter and the first time they missed something that mattered to skip something that didn't. Goldman Stanley did not ask for their weekends. It simply made the alternative feel unthinkable. ${name} had been very good at not thinking about it.`;

      let p3 = '';
      if ((stats?.competence || 0) > 300) {
        p3 = `The cruelest part was the competence. They were exceptional at the work — genuinely, measurably exceptional. The models were cleaner, the decks sharper, the analysis more precise than almost anyone on the floor. None of this had protected them. If anything, it had accelerated everything. The better you are, the more they give you. The more they give you, the less of yourself remains.`;
      } else if ((stats?.charisma || 0) > 300) {
        p3 = `People liked ${name}. That was the part that made it harder to explain. They were warm in meetings, generous with junior staff, quick with a joke at exactly the right moment. The performance was flawless until it wasn't, and when it stopped, the people who liked them most were the ones who hadn't seen it coming.`;
      } else if ((stats?.wealth || 0) > 500_000) {
        p3 = `The money was real. That much was undeniable. The apartment was real. The account balance was real. ${name} lay on the floor of the real apartment and looked at the ceiling and understood, with perfect clinical clarity, that none of it was a reason to get up.`;
      }

      const p4 = `They left the industry quietly. Not dramatically — there was no outburst, no resignation letter, no moment of cinematic clarity. They simply stopped going in. Stopped answering. Stopped performing the version of themselves that Goldman Stanley had required. What was left underneath took a long time to find. Some of it was still there. That turned out to be enough to start with.`;
      const p5 = `Goldman Stanley released a statement confirming that employee wellbeing was their highest priority. The statement was four paragraphs long. It had been approved by legal.`;

      return [p1, p2, p3, p4, p5].filter(Boolean).join('\n\n');
    },
    epilogue: '',
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
        p2 = `The frustrating thing — the part that kept ${name} up at night — was that they were good at the job. Genuinely good. The work was never the problem. The numbers just hadn't kept up with the city, with the rent, with the version of life that Goldman Stanley quietly required you to maintain.`;
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

      const p4 = `Goldman Stanley filled the position within six weeks. The new hire sat at the same desk. They did not know whose it had been. That is how it works.`;

      return [p1, p2, p2b, p3, p4].filter(Boolean).join('\n\n');
    },
    epilogue: '',
  },
};
