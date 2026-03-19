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
    // Rich Legacy: -0.2 → formula becomes loss × (1 − −0.2) = loss × 1.2 (120% sanity damage)
    // Normal: (grit − 10) / 200 → 0.00–0.45 reduction on sanity losses
    sanityLossReduction:     isRichLegacy ? -0.2 : (grit - 10) / 200,
    charismaMultiplierLooks:       1 + (looks - 10) / 100 * 0.5,         // 1.00 – 1.45
    charismaMultiplierStreetSmart: 1 + (streetSmart - 10) / 100 * 0.3,  // 1.00 – 1.27
    reputationMultiplier:          1 + (streetSmart - 10) / 100 * 0.7,  // 1.00 – 1.63
  };

  return {
    competence:  intelligence,                              // 10–100 starting
    charisma:    looks * 3 + Math.floor(streetSmart / 2),   // 35–350 starting
    reputation:  Math.round(10 + familyBackground * 0.5),  // 15–60 starting
    sanity:      Math.min(200, Math.round(50 + grit * 0.5)), // 55–100 starting
    // Rich Legacy sanity floor is 30 — below triggers backToFamilyBusiness at quarter end
    sanityFloor: isRichLegacy ? 30 : 0,
    wealth:      startingWealth,
    traitMultipliers,
    isLegacyHire: familyBackground > 70,
    isRichLegacy,
  };
};

// ─────────────────────────────────────────────
// PSYCHOLOGICAL PROFILE
// ─────────────────────────────────────────────
export const getProfile = (traits) => {
  const { intelligence, looks, streetSmart, grit, familyBackground } = traits;
  const coreVals = [intelligence, looks, streetSmart, grit];
  const allVals = Object.values(traits);
  const maxCore = Math.max(...coreVals);
  const allBalanced = allVals.every(v => v >= 20 && v <= 40);

  if (familyBackground === 100)
    return `"Candidate's father plays golf with our CEO every third Sunday.\nInterview scores were recorded as a matter of procedure.\nThe desk has already been assigned."`;

  if (intelligence > 49 && intelligence === maxCore)
    return `"Analytically exceptional. Finished the technical case study\nthirty minutes early and then corrected a typo in our question.\nFrankly, a little embarrassing for everyone involved."`;

  if (looks > 49 && looks === maxCore)
    return `"Impeccably presented. Three interviewers described the candidate\nas 'very polished' without being asked.\nClient-facing placement. Immediately."`;

  if (streetSmart > 49 && streetSmart === maxCore)
    return `"Knew which interviewer had the real decision-making power\nwithin five minutes of sitting down.\nWe are still discussing whether this is impressive or concerning."`;

  if (grit > 49 && grit === maxCore)
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
    name: 'Deal Crunch',
    description: 'A live deal just landed. You know what that means.',
    category: 'Work',
    cost: 0,
    effects: { competence: 8, reputation: 4, sanity: -10 },
    risk: { chance: 0.15, effect: { sanity: -5 }, label: 'Burnout Warning triggered.' },
  },
  {
    id: 'pitchClients',
    icon: '📊',
    name: 'Client Pitch',
    description: 'Showtime.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 4, charisma: 4, sanity: -5 },
    promotionScaled: true,
  },
  {
    id: 'extraResponsibilities',
    icon: '🙋',
    name: 'Take On Extra Responsibilities',
    description: '"Sure," you said. "Happy to help," you said.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 8, competence: 6, sanity: -12 },
  },
  {
    id: 'slackLookBusy',
    icon: '💤',
    name: 'Slack and Look Busy',
    description: 'Perfecting the art of visible idleness.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 4, sanity: 2 },
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
    id: 'linkedInPosting',
    icon: '📱',
    name: 'LinkedIn Posting',
    description: 'Sharing your journey. Either people care, or they don\'t.',
    category: 'Social',
    cost: 0,
    effects: { sanity: -1 },
    coinFlip: { chance: 0.5, good: { reputation: 10 }, bad: { reputation: -2 } },
    charismaScaled: true,
    trackAs: 'linkedInMonths',
  },
  {
    id: 'yachtParty',
    icon: '🛥️',
    name: 'Yacht Party',
    description: 'You know someone who knows someone. The champagne is cold. The networking is warmer.',
    category: 'Social',
    cost: 50_000,
    effects: { reputation: 40, charisma: 20 },
  },
  {
    id: 'therapy',
    icon: '🧘',
    name: 'Therapy',
    description: 'Radical self-awareness. Slightly career-limiting. Highly recommended.',
    category: 'Recovery',
    cost: 5_000,
    effects: { sanity: 50 },
  },
  {
    id: 'hitGym',
    icon: '🏃',
    name: 'Hit the Gym',
    description: 'The only place where your work phone doesn\'t follow. In theory.',
    category: 'Recovery',
    cost: 2_000,
    effects: { sanity: 15, charisma: 3 },
    charismaScaled: true,
  },
  {
    id: 'sleepIn',
    icon: '😴',
    name: 'Sleep In',
    description: 'You cancelled everything. You regret nothing. You\'re slightly behind.',
    category: 'Recovery',
    cost: 0,
    effects: { sanity: 30, charisma: -2, competence: -2 },
  },
  {
    id: 'goOnDate',
    icon: '💝',
    name: 'Date Night',
    description: 'Someone is interested. The question is whether you have the bandwidth.',
    category: 'Recovery',
    cost: 0,
    variableCost: true,
    effects: {},
    variableEffects: true,
    requiresDateFromYear: 2,
    minYear: 2,
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
  // ── First Encounter dates (Paige — unlocked via First Encounter event) ──
  {
    id: 'victor',
    name: 'Victor Hughes',
    description: 'The rival analyst. He made an impression at the IBD networking event.',
    dateCost: 500,
    requires: {},
    effects: { competence: 7 },
    flavour: 'You picked the restaurant. He picked a better one. You went to his choice. Neither of you mentioned it.',
    milestoneText: 'Victor messages you before the conference even starts. "I need an ally in enemy territory."',
    encounterOnly: true,
  },
  {
    id: 'marco',
    name: 'Marco Moretti',
    description: 'The Equinox trainer. Dance floor energy. Surprisingly good at listening.',
    dateCost: 500,
    requires: {},
    effects: { sanity: 5, charisma: 5 },
    flavour: 'He already made a reservation when you texted him. Of course he had.',
    milestoneText: 'Marco sends a voice note. You play it twice.',
    encounterOnly: true,
  },
  {
    id: 'david',
    name: 'David Li',
    description: 'The MIT PhD who works at FAANG. Different pace. Better questions.',
    dateCost: 300,
    requires: {},
    effects: { sanity: 10, competence: 3 },
    flavour: 'He listened properly. You forgot that was a thing people could do.',
    milestoneText: 'David sends you a paper he thought you\'d like. He was right.',
    encounterOnly: true,
  },

  {
    id: 'julien',
    name: 'Julien Laurent',
    description: 'The Wall Street partner. Mature, charming, and already knows how you think.',
    dateCost: 1_000,
    requires: {},
    effects: { sanity: 5, reputation: 5 },
    flavour: 'He listened to the whole story before saying anything. That alone felt unusual.',
    milestoneText: 'Julien mentions your name in a room you weren\'t in. You find out three days later.',
    encounterOnly: true,
  },

  // ── First Encounter dates (Max — unlocked via First Encounter event) ──
  {
    id: 'adira',
    name: 'Adira Sharma',
    description: 'The M&A lawyer. Sharp, competitive, and dangerously good advice.',
    dateCost: 500,
    requires: {},
    effects: { competence: 7 },
    flavour: 'She ordered for the table before you finished reading the menu. She was right about everything.',
    milestoneText: 'Adira forwards you a draft term sheet. "Tell me what\'s wrong with it." There are three things.',
    encounterOnly: true,
  },
  {
    id: 'anastasia',
    name: 'Anastasia Orlova',
    description: 'The model. Spectacular. Expensive. Worth it.',
    dateCost: 5_000,
    requires: {},
    effects: { sanity: 5, charisma: 5 },
    flavour: 'She mentioned the bag twice. You bought it. She mentioned it once more, approvingly.',
    milestoneText: 'Anastasia tags you in a story from the Hamptons. Your phone does not stop.',
    encounterOnly: true,
  },
  {
    id: 'olivia',
    name: 'Olivia Beaufort',
    description: 'The art curator. Posh, elegant, and quietly well-connected.',
    dateCost: 2_000,
    requires: {},
    effects: { sanity: 5, reputation: 7 },
    flavour: 'She corrected the sommelier. Politely. He thanked her.',
    milestoneText: 'Olivia leaves you a voicemail about a private view. It\'s not the kind of thing you get invited to.',
    encounterOnly: true,
  },
  {
    id: 'emily',
    name: 'Emily Miller',
    description: 'The childhood friend. Warm, grounding, and genuinely glad to see you.',
    dateCost: 300,
    requires: {},
    effects: { sanity: 15 },
    flavour: 'She asked three times if you were okay. The third time, you told her the truth.',
    milestoneText: 'Emily texts to check in. Not about work. Just you.',
    encounterOnly: true,
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
export const getManagerNote = (endStats, yearStartStats, name) => {
  if (endStats.sanity < 30) {
    return `Shows exceptional commitment. We would like to remind ${name} that the Employee Assistance Programme exists.`;
  }

  const compDelta = endStats.competence - (yearStartStats?.competence ?? 0);
  const charDelta = endStats.charisma   - (yearStartStats?.charisma   ?? 0);
  const repDelta  = endStats.reputation - (yearStartStats?.reputation ?? 0);

  if (compDelta + charDelta + repDelta < 100) {
    return `Year-on-year performance metrics are below expectations. ${name}'s output requires significant improvement. A structured development plan is being prepared.`;
  }

  const deltas  = { competence: compDelta, charisma: charDelta, reputation: repDelta };
  const topStat = Object.keys(deltas).reduce((a, b) => deltas[a] >= deltas[b] ? a : b);
  const notes   = {
    competence: `Technical output this year has been exemplary. ${name} continues to build a compelling and differentiated skills profile.`,
    charisma:   `Stakeholder management and interpersonal presence have shown marked improvement. ${name} is becoming a trusted face across the floor.`,
    reputation: `Profile and visibility within the firm have grown substantially. ${name}'s name is being mentioned in the right rooms.`,
  };
  return notes[topStat];
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
    text: (name) => `${name} has decided to stop playing the Wall Street game.\n\nBanking had been an interesting detour. Genuinely interesting. The models, the deals, the architecture of money moving at speed — there was something honest about learning how it all worked from the inside, rather than simply inheriting the outcome. But the promotion cycle, the performance scores calibrated to two decimal places, the annual review where someone who earned a fraction of the family's quarterly dividend explained ${name}'s "development areas" — none of that had ever really been the point.\n\n${name} did not consider this a failure. The game had been interesting. ${name} had simply decided to stop playing it.\n\n${name} called the parents, messaged old friends from private school, and chartered a jet to Bora Bora. Two weeks in Bora Bora became three. Then there was talk of Switzerland — the Verbier chalet had been sitting largely unused since Covid, which was practically a waste.\n\nOf course the IBD recovery vacation did not go on forever. The family's European acquisition needed oversight. The Hong Kong office was in the middle of a restructure that required someone who understood both the balance sheet and the family's expectations for it. There was a board seat. There had always been going to be a board seat. The chair had been figuratively upholstered and waiting since before ${name} could read a P&L.\n\n"When you're ready," ${name}'s father said.\n\nHe did not ask if ${name} was ready. He had not asked because the answer had never really been in question.`,
    epilogue: (name) => `The game had been interesting. ${name} had simply been playing a different one all along.`,
  },
  burntOut: {
    title: 'Burnt Out.',
    colour: '#ef4444',
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
  fire: {
    title: 'F.I.R.E.',
    colour: '#8b90b0',
    text: (name) => `${name} had more than enough — more, honestly, than they knew what to do with.\n\nFor the better part of a year, the sanity numbers had been quietly, consistently low. Not a crisis. No dramatic collapse. Just a steady grey dimming that made every Tuesday feel like a Monday.\n\nOn a Wednesday morning, they submitted a leaving notice. HR acknowledged it with a calendar invite. No counteroffer was entertained. The farewell drinks were cordial. Someone said "we'll stay in touch" and everyone nodded. The role was posted internally the following week, and had someone in the seat in six.\n\n${name} landed in Bangkok with a carry-on bag and nothing scheduled. They moved slowly — temples, markets, a ten-day silent retreat in Chiang Mai they nearly abandoned on day three but didn't. They read things they'd bookmarked years ago. They learned what it felt like to not check the time.\n\nWhat came next remained an open question. A small bakery in lower Manhattan, maybe. Or a country where the savings outlast the ambition and the pace of life doesn't require a recovery plan. For now, the question itself felt like a luxury they had finally earned.`,
    epilogue: 'The Wi-Fi was unreliable in most places. That turned out to be fine.',
  },
  goldenHandcuffs: {
    title: 'The Golden Cage.',
    colour: '#8b90b0',
    text: (name) => `${name} could leave. The number in the account made it possible.\n\nThe number in the account also made it feel impossible. The walls had gotten comfortable. Or maybe just familiar.`,
    epilogue: 'The flat is very nice. The 4am emails, less so.',
  },
  regulator: {
    title: 'Out of Office (Permanently).',
    colour: '#8b90b0',
    text: (name) => `It happened on a Wednesday. No dramatic final straw — just 1am, a deck revised for the ninth time at the request of someone who would ask for a tenth.\n\n${name} finally clicked 'send' on the email draft that had been sitting in the drafts folder for months.\n\n${name} sent out the next email with a light exhale.\nIt starts with 'Thank you & Farewell'.\n\nWhat came next was uncertain in all the best ways — no calendar, no quarterly review, no deck requiring a ninth revision by someone who would ask for a tenth. Just a Wednesday that had become a Thursday that had become, improbably, the first morning in three years with absolutely nowhere to be.\n\n${name} made coffee. Watched the city from the office window for the last time.\nIt's time for the next chapter.`,
    epilogue: (name, _sanity, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'his' : 'her';
      return `${name} did not forget to update ${pronoun} OOO message before dashing out: "Dear sender, I am currently ooo, indefinitely."`;
    },
  },
  madePartner: {
    title: 'Corner Office.',
    colour: '#d4a017',
    text: (name) => `After years at Darkstone & Partners, ${name} made Partner.\n\nThe announcement came on a Tuesday. The equity split was favourable. The office had a view that required no explanation.\n\nPrivate equity rewards a specific kind of person. ${name} had always suspected they were that person. The carry distribution confirmed it.`,
    epilogue: (_name, sanity) =>
      sanity > 70 ? 'The work was hard. The returns were real. Not every trade-off made sense at the time. Most of them do now.'
      : sanity > 40 ? 'The work was relentless. The money made the relentlessness easier to justify. Most days.'
      : 'You made Partner. The number is very large. You\'ll feel something about it eventually.',
  },
  hollowVictory: {
    title: 'Empty Table.',
    colour: '#d4a017',
    text: (name) => `${name} made Partner at Darkstone & Partners. The celebration dinner had three people. Two were from IR.\n\nThe canapés were very good.`,
    epilogue: '"Effective. Strategic. Results-driven." The review always said the same things. They meant them. That was the strangest part.',
  },
  madeMD: {
    title: 'Managing Director.',
    colour: '#d4a017',
    text: (name) => `The letter came on a Thursday. Managing Director, effective the first of the month.\n\n${name} read it twice, set it down, and went back to the deck they were working on. The announcement could wait twenty minutes.\n\nFifteen years. The title had always been there in the distance, the way landmarks look closer than they are. Then one morning it simply wasn't in the distance anymore. It was on a piece of paper. It was a signature. It was theirs.\n\nSweatshaw & Co said nothing had changed, which was technically true and practically meaningless. Everything had changed. The way people walked into meetings. The calls that got returned. The decisions that no longer needed sign-off from anyone in the building.`,
    epilogue: (_name, sanity) =>
      sanity > 70 ? 'The title is real. So is the work. Neither of those things are going away. That is, on balance, fine.'
      : sanity > 40 ? 'Managing Director. The words look right on the door. The hours remain what they were. You\'re working on that.'
      : 'You made it. You\'re not entirely sure who you are outside of this building. That\'s a question for another year.',
  },
  hollowMD: {
    title: 'Managing Director. (The Desk is Very Clean.)',
    colour: '#d4a017',
    text: (name) => `${name} was promoted to Managing Director on a Tuesday.\n\nThe email went to the floor. There were twelve replies. Ten were from direct reports, which is to say, required.\n\nThe office is large. The windows are good. The calendar is, at this point, more of a philosophical position than a scheduling tool.`,
    epilogue: 'The results were excellent. The results were always excellent. Nobody asks what the results cost anymore. That stopped being a question some years ago.',
  },
  bankruptcy: {
    title: 'The Money Ran Out.',
    colour: '#ef4444',
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
      } else {
        p3 = `The industry was smaller than it looked from the inside. ${name} learned this the slow way. They pivoted eventually — something adjacent, something quieter. It was fine. Fine was enough for a while.`;
      }

      const p4 = `Sweatshaw & Co filled the position within six weeks. The new hire sat at the same desk. They did not know whose it had been. That is how it works.`;

      return [p1, p2, p2b, p3, p4].filter(Boolean).join('\n\n');
    },
    epilogue: 'HR sent a survey two weeks later asking how the offboarding experience could be improved.',
  },
  startupBust: {
    title: 'Zero to Zero.',
    colour: '#8b90b0',
    text: (name) => `${name} joined the startup with a lot of conviction and a cap table that, in retrospect, should have raised questions.\n\nThe idea wasn't bad. The timing wasn't catastrophic. The execution — somewhere between the pivot and the re-pivot — is where things became difficult to explain at dinner parties.\n\nThey ran out of runway on a Friday. The final all-hands was on a Google Meet. Seventeen people. The CEO said the word "learnings" four times.\n\nBack at a desk that wasn't theirs, in an office that smelled like every other office, ${name} updated a CV that now had an eighteen-month gap labelled "Founder." That turned out to mean more than expected — just not in the way expected.`,
    epilogue: 'The next job came through a former colleague who said the startup experience showed "initiative." It did, technically.',
  },
  startupSuccess: {
    title: 'Series A.',
    colour: '#8b90b0',
    text: (name) => `The timing was right. The team was right. ${name} had spent four years understanding what the market actually needed — not what the pitch deck said it needed.\n\nThe product launched quietly. Then less quietly. Then there was a term sheet on the table from a fund that had previously declined to take a meeting.\n\nThe Series A closed on a Tuesday. ${name} told almost no one. There was too much to do.\n\nSweatshaw & Co sent a LinkedIn congratulations. ${name} liked the post. It seemed like the right thing to do.`,
    epilogue: 'Series B is in progress. The office has a foosball table nobody uses and a coffee machine that costs more than a monthly salary. The work is the same work. That\'s the point.',
  },
  mentalBreakdown: {
    title: 'Mental Breakdown.',
    colour: '#ef4444',
    text: (name) => `The relationship ending was the last straw.\n\n${name} had been running on fumes for longer than they would admit — the kind of tired that sleep doesn't fix, the kind of empty that no deal or promotion reaches. The loss was the crack that let everything else in.\n\nThey called in sick on a Monday. Then Tuesday. By Wednesday, they stopped checking their phone. The out-of-office wasn't set. Nobody set it for two days.\n\nWhen ${name} finally opened their laptop, there was a calendar invite from HR. Subject: "Check-in." The kind of meeting that has a format and a conclusion already drafted before it begins.\n\nThe conversation was careful, measured, humane in the way large institutions are when they have practised it. The word "wellbeing" appeared four times. The phrase "not a fit right now" appeared once.\n\nHR suggested that perhaps it was best, for everyone, if ${name} took some time. There was a leave package. There was a therapist referral. There was a card signed by the team that said nothing specific and everything general.\n\nOutside the building, ${name} stood on the pavement for a long time. The city moved. ${name} didn't.\n\nFor the first time in years, there was nothing to do. No meeting to prepare for. No deck to revise. No number to hit.\n\nJust a question that had been waiting very patiently in the back of every late night and missed anniversary and unanswered message:\n\nWhat was it all for?`,
    epilogue: 'The therapist had a whiteboard and a calm voice. The answer took longer than expected. The question, it turned out, was worth asking.',
  },
};
