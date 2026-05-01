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
    promoReqs: { competence: 650, charisma: 600, reputation: 600 },
    allowAccelerated: false,
  },
  {
    id: 'director',
    title: 'Director',
    gameYears: [10, 11, 12],
    calendarYears: [2035, 2036, 2037],
    promoReqs: { competence: 750, charisma: 850, reputation: 850 },
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
    effects: { competence: 10, reputation: 3, sanity: -10 },
    risk: { chance: 0.15, effect: { sanity: -5 }, label: 'Burnout Warning triggered.' },
  },
  {
    id: 'pitchClients',
    icon: '📊',
    name: 'Client Pitch',
    peName: 'Target Pitch',
    description: 'Showtime.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 3, charisma: 3, sanity: -6 },
    promotionScaled: true,
  },
  {
    id: 'extraResponsibilities',
    icon: '🙋',
    name: 'Take On Extra Responsibilities',
    description: '"Sure," you said. "Happy to help," you said.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 7, competence: 4, sanity: -12 },
    stageOnly: ['analyst', 'associate'],
  },
  {
    id: 'projectManagement',
    icon: '📋',
    name: 'Project Management',
    description: 'Delegating work instead of doing them.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 8, sanity: -8 },
    stageOnly: ['vp', 'director'],
  },
  {
    id: 'slackLookBusy',
    icon: '💤',
    name: 'Slack and Look Busy',
    description: 'Perfecting the art of visible idleness.',
    category: 'Work',
    cost: 0,
    effects: { reputation: 3, sanity: 3 },
  },
  {
    id: 'networkInternal',
    icon: '🤝',
    name: 'Network (Internal)',
    description: 'Another coffee chat. Another person to not remember your name.',
    category: 'Social',
    cost: 200,
    effects: { reputation: 5, charisma: 2, sanity: -4 },
    charismaScaled: true,
    socialActivity: true,
    stageOnly: ['analyst', 'associate'],
  },
  {
    id: 'playingPolitics',
    icon: '🎭',
    name: 'Playing Politics',
    description: 'The higher you climb, the more this matters.',
    category: 'Social',
    cost: 200,
    effects: { reputation: 6, charisma: 4, sanity: -12 },
    risk: { chance: 0.20, effect: { sanity: -5 }, label: 'Office politics backfired.' },
    charismaScaled: true,
    socialActivity: true,
    stageOnly: ['vp', 'director'],
  },
  {
    id: 'networkExternal',
    icon: '🍸',
    name: 'Network (External)',
    description: 'Technically work. Functionally a Wednesday at a bar.',
    category: 'Social',
    cost: 800,
    effects: { charisma: 6, reputation: 3, sanity: -5 },
    charismaScaled: true,
    socialActivity: true,
    stageOnly: ['analyst', 'associate'],
  },
  {
    id: 'clientEntertainment',
    icon: '🥂',
    name: 'Client Entertainment',
    description: 'Expensed dinners, box seats, and conversations you will barely remember.',
    category: 'Social',
    cost: 500,
    effects: { charisma: 8, reputation: 4, sanity: -12 },
    risk: { chance: 0.20, effect: { sanity: -5 }, label: 'A client dinner that went on too long.' },
    charismaScaled: true,
    socialActivity: true,
    stageOnly: ['vp', 'director'],
  },
  {
    id: 'linkedInPosting',
    icon: '📱',
    name: 'LinkedIn Posting',
    description: 'Sharing your journey. Either people care, or they don\'t.',
    category: 'Social',
    cost: 0,
    effects: { sanity: -5 },
    coinFlip: { chance: 0.5, good: { reputation: 12 }, bad: { reputation: -4 } },
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
    effects: { reputation: 25, charisma: 25 },
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
    id: 'nycMarathon',
    icon: '🏅',
    name: 'NYC Marathon',
    description: 'You signed up because you heard your big boss did as well.',
    category: 'Recovery',
    cost: 2_500,
    effects: { sanity: -25 },
    sanityByStage: { analyst: -25, associate: -30, vp: -35, director: -40 },
    bypassSanityMultiplier: true,
    q3Only: true,
    oncePerQuarter: true,
    gritGain: 5,
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
    engagedEffects: { sanity: 20, reputation: 5 },
    flavour: 'She asked three times if you were okay. The third time, you told her the truth.',
    milestoneText: 'Emily texts to check in. Not about work. Just you.',
    encounterOnly: true,
  },

  // ── Hidden / encounter-only (both characters) ─────────────────────────
  {
    id: 'logan',
    name: 'Logan Sterling',
    description: 'The ambitious TMT analyst from your internship cohort. High achiever. Higher opinion of himself.',
    dateCost: 500,
    requires: {},
    effects: { competence: 10, sanity: -5 },
    engagedEffects: { competence: 10, reputation: 10, sanity: -5 },
    flavour: 'He mentioned his deal count twice. You let him. The food was excellent.',
    milestoneText: 'Logan texts to share an article. It is extremely well-timed. He knows it.',
    encounterOnly: true,
  },
];

// ─────────────────────────────────────────────
// QUARTERLY EVENTS
// ─────────────────────────────────────────────
const _inRelationship = (gs) =>
  gs?.relationshipStatus != null &&
  ['entangled', 'relationship', 'engaged', 'married'].includes(gs.relationshipStatus);

export const QUARTERLY_EVENTS = [
  {
    id: 'theHotIntern',
    location: 'office',
    title: 'The Hot Intern',
    text: "The new summer interns are here. They look at you eagerly and appear keen for your wisdom. They are all well-educated, well-dressed, and highly attractive. You notice one of them is particularly so.",
    q2VpPlusOnly: true,
    choices: [
      {
        label: 'Offer to provide an unsolicited "modelling workshop" after hours.',
        effects: (gs) => ({ sanity: -5, ...(_inRelationship(gs) ? { intimacyDelta: -10 } : {}) }),
      },
      {
        label: 'Flirt at the onboarding drinks.',
        effects: (gs) => ({ sanity: -5, charisma: -10, ...(_inRelationship(gs) ? { intimacyDelta: -10 } : {}) }),
      },
      {
        label: (gs) => gs?.characterId === 'paige'
          ? 'Walk around his desk frequently in a tight dress.'
          : 'Walk around her desk frequently in a tight shirt.',
        effects: (gs) => (_inRelationship(gs) ? { charisma: -5 } : { charisma: 3 }),
      },
      { label: 'Do nothing.', effects: { reputation: 5 }, isD: true },
    ],
  },
  {
    id: 'apresSki',
    location: 'remote',
    title: 'Après-ski',
    text: "You are at your company's annual ski trip. The snow is excellent this year and you have some grand plans.",
    q1FromYear2Only: true,
    choices: [
      { label: 'Ski all day and party all night. DUI is illegal but drunk skiing is phenomenal.', effects: { sanity: -5, competence: 2, charisma: 5 } },
      { label: (gs) => gs?.isPEPath ? 'Talk to every Partner you can — show off your ski expertise and your deal contributions.' : 'Talk to every MD you can — show off your ski expertise and your deal contributions.', effects: { sanity: -3, reputation: 5 } },
      { label: 'Work all trip. Make sure your boss takes note of it.', effects: { sanity: -10, competence: 8 } },
      { label: 'Ski all day, spa in the evening, party until midnight. Eight hours of sleep — what a luxury.', effects: { sanity: 10 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'christmasParty',
    location: 'office',
    title: 'King of Christmas Party',
    text: "The firm Christmas Party is tonight. You are strategising your action plan before you get too drunk.",
    q4Only: true,
    choices: [
      { label: 'Get absolutely smashed and go out with your team all night long.', effects: { charisma: 6, sanity: -5 } },
      { label: (gs) => gs?.isPEPath ? 'Talk to every Partner about the deals you worked on this year.' : 'Talk to every MD about the deals you worked on this year.', effects: { sanity: -3, reputation: 6 } },
      { label: 'Hang around until midnight and peace out.', effects: { sanity: 5 } },
      { label: 'Hang around until midnight, then go back to the office to finish deal work. Make sure you say goodbye to your boss — and tell him where you\'re headed.', effects: { sanity: -10, reputation: 5, competence: 5 }, isD: true },
    ],
  },
  {
    id: 'therapyTime',
    location: 'remote',
    title: 'Therapy Time',
    text: (gs) => {
      const title = gs?.characterId === 'paige' ? 'Miss Turner' : 'Mr Grind';
      return `You walked into the therapy room. "What would you like to talk about today, ${title}?" the therapist asked.`;
    },
    therapyOnly: true,
    choices: [
      { label: 'Your struggle with perfectionism and how your impeccable standards are actually dragging you behind at work.', effects: { competence: 5 } },
      { label: "You think you have a crush on your boss, but you can't tell if this is really just your daddy issues.", effects: { charisma: 5 } },
      { label: 'How to optimise your mental state so you are 100% focused at work 24/7.', effects: { competence: 5 } },
      { label: "Issues with poor sleep quality — though she corrected you: the main issue is really just quantity.", effects: { sanity: 5 }, isD: true },
    ],
  },
  {
    id: 'humbleBragging',
    location: 'remote',
    title: 'Humble Bragging',
    text: (gs) => `You just finished Analyst onboarding and are at a fancy midtown club with everyone from your cohort. It's a night out and you've spotted a hottie on the dance floor.`,
    firstQuarterOnly: true,
    choices: [
      { label: (gs) => `Go and whisper into the hottie's ear: "Hey cutie, I'm ${gs?.characterName ?? 'me'} — I'm an Investment Banker at Sweatshaw..."`, effects: { sanity: -5, reputation: 3 } },
      { label: 'Approach the hottie and attempt to explain the mechanics of an LBO.', effects: { sanity: -5, competence: 5 } },
      { label: 'Approach the hottie and offer to buy them a drink.', effects: { charisma: 3 } },
      { label: "Walk away. You don't need a hottie. You want to dedicate 100% of your time to your investment banking career.", effects: { competence: 5 }, isD: true },
    ],
  },
  {
    id: 'birthdayDeal',
    location: 'office',
    title: 'The Birthday Deal',
    text: (partnerName) => `It's ${partnerName}'s birthday tonight. Your boss drops a live deal on your desk at 5pm. The deal closes at midnight.`,
    q3RelationshipOnly: true,
    choices: [
      { label: 'Work the deal. Miss the birthday.', effects: { competence: 10, reputation: 4, sanity: -8, intimacyDelta: -15 } },
      { label: 'Call them, then work the deal.', effects: { charisma: 2, sanity: -4, reputation: 2, competence: 6, intimacyDelta: -5 } },
      { label: 'Delegate to a junior.', effects: { competence: 3, reputation: -2, sanity: 2, intimacyDelta: 5 }, requiresStage: 'associate', requiresLabel: 'Associate or above' },
      { label: 'Go to the birthday.', effects: { sanity: 6, reputation: -4, wealth: -200, intimacyDelta: 5 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'creditThief',
    location: 'office',
    title: 'The Credit Thief',
    maxStage: 'associate',
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
    maxStage: 'vp',
    text: "Your MD asks everyone to stay for a 'quick' Saturday call. It is not quick. It is never quick.",
    choices: [
      { label: 'Stay for the whole call.', effects: { competence: 4, sanity: -8 } },
      { label: 'Stay for the first hour then leave.', effects: { sanity: -3, reputation: 2 } },
      { label: 'Dial in from somewhere more interesting.', effects: { sanity: 4, reputation: -2 } },
      { label: 'Send a very professional apology email.', effects: { charisma: 3, reputation: -4 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'timeOff',
    location: 'remote',
    title: 'Time Off',
    text: "Your best friends from college are doing a trip exploring all the National Parks on the West Coast. They invited you to join.",
    choices: [
      { label: "Politely decline and tell them you are working on a very important live deal.", effects: { sanity: -10, competence: 8 } },
      { label: "Express strong interest but propose going somewhere with good internet access so you can monitor your inbox 24/7.", effects: { sanity: -10, competence: 5 } },
      { label: "Accept the invite and bring your laptop. You plan to work in the car while your friends drive.", effects: { sanity: -5, competence: 5 } },
      { label: "Submit annual leave. Draft an out-of-office message. Peace out.", effects: { sanity: 15 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'feedbackSandwich',
    location: 'office',
    title: 'The Feedback Sandwich',
    q4Only: true,
    text: (gs) => {
      const senior = gs?.isPEPath ? 'Your line manager review has arrived. He tells you' : 'Your annual review has arrived. The MD tells you';
      return `${senior}: "You're one of the brightest in your cohort." Pause. "But." The but lasts 14 minutes. He finishes with: "Overall, really promising." You are handed a printed copy. You notice it is mostly red tracked changes. He is smiling.`;
    },
    choices: [
      { label: 'Nod throughout. Say "noted" 11 times. Go home and reread it four times looking for the part where it gets better.', effects: { sanity: -5, competence: 5 } },
      { label: 'Ask, calmly, what a promotion trajectory looks like given this feedback. Watch him visibly recalibrate his opinion of you upward.', effects: { sanity: -3, reputation: 3 } },
      { label: 'Send a 9-point action plan responding to every criticism by 8am the next day. It is a Saturday.', effects: { sanity: -10, competence: 8 } },
      { label: 'Bluntly respond to the negative feedback points where you disagree.', effects: { reputation: -5, sanity: 10 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'fomo',
    location: 'office',
    title: 'FOMO',
    text: "It's 8pm on a Wednesday and you realise you have finished all your work. This is rare. This is impossible. You feel... wrong.",
    choices: [
      { label: 'Email the staffer asking to be put on anything. Anything at all. You miss the pain.', effects: { sanity: -8, competence: 8 } },
      { label: 'Spend the evening building an unsolicited "sector overview" deck and send it to the MD as "something I put together."', effects: { sanity: -8, reputation: 8 } },
      { label: 'Go outside. Touch grass. Call your mum. Feel briefly like a person. Panic when you enjoy it.', effects: { sanity: 10 }, isCultureDefying: true },
      { label: 'Suspect a restructuring. Refresh Outlook 10 times. Browse LinkedIn. Hit up every headhunter you know.', effects: { sanity: -4 }, isD: true },
    ],
  },
  {
    id: 'theTombstone',
    location: 'remote',
    title: 'The Tombstone',
    text: "Your new deal toy just arrived at your desk. Where do you plan to place it?",
    choices: [
      { label: 'On your office desk (alongside all your other deal toys) to remind your boss of your contribution.', effects: { reputation: 6, sanity: -2 } },
      { label: 'On your bedstand so you can tell your date "I closed a $1 billion deal last Friday..."', effects: { sanity: -4, charisma: 5 } },
      { label: 'Send it to your parents with a message: "Thank you for making me who I am today..."', effects: { sanity: -6 } },
      { label: 'In the attic where all your other toys are collecting dust.', effects: { sanity: 8 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'promotionTrap',
    location: 'office',
    title: 'Promotion Trap',
    text: `It's 11:12pm on a Friday. You're the only one in the office kitchen waiting for the microwave to finish on what is technically your dinner. A senior MD walked in. You greeted him flatly, you worked together last quarter and noticed, more than once, that his eyes stayed on you a beat longer than they needed to. He leans over: "Accelerated promotion list is coming out next month. I've got some influence over it. We should grab a drink tonight — I think it could be good for you."`,
    promotionTrapOnly: true,
    onceOnly: true,
    choices: [
      {
        id: 'accept',
        label: 'Take on the offer, who doesn\'t like a free drink?',
        effects: { reputation: -50, sanity: -25 },
        isPromotionTrapAccept: true,
        specialResultMessage: `Later that night, your phone buzzed with a calendar from HR. You\'ve been placed on the accelerated promotion list. You\'ll be made Associate at year-end.\n\nThe drink was exactly what you expected. You haven\'t thought about it since.\n\nOr so you tell yourself.`,
      },
      {
        id: 'deflect',
        label: 'Smile neutrally. Say you\'d love to discuss your promotion trajectory — and suggest a formal catch-up Monday, copying your line manager in the calendar invite.',
        effects: { reputation: 5 },
      },
      {
        id: 'report',
        label: 'Write down the time, the location, the exact words used, and what he was wearing. Report to HR.',
        effects: { reputation: 20 },
        isPromotionTrapReport: true,
        specialResultMessage: `Three days later, an email arrived from HR to the entire floor:\n\n"We write to let you know that [MD] has decided to leave Sweatshaw & Co due to health conditions. We thank him for his contributions and wish him well."\n\nHe never appeared in the office again.`,
      },
      {
        id: 'flee',
        label: 'Smile awkwardly, "Sorry... I really need to get back to work." Run away from the kitchen.',
        effects: { sanity: -15 },
      },
    ],
  },
  {
    id: 'cryptoCrypto',
    location: 'office',
    title: 'Crypto Crypto Crypto',
    text: "Crypto is going through the roof and you came across a new coin called Memecoin from a colleague. How much are you putting in?",
    isCryptoEvent: true,
    weight: 2,
    choices: [],
  },
  {
    id: 'linkedInPost',
    location: 'office',
    title: 'The LinkedIn Post',
    text: (gs) => {
      const senior = gs?.isPEPath ? 'Partner' : 'MD';
      return `Your ${senior} has just posted on LinkedIn: "Proud to announce we've closed [deal you worked 90 hours a week on for 4 months]. Incredible work by the deal team." He has not named you. He has named himself three times. It has 847 likes.`;
    },
    choices: [
      { label: 'Like the post. Go home. Stare at the wall. This is the job.', effects: { sanity: -5 } },
      { label: '"Fantastic deal — great learning experience as part of the team!"', effects: { reputation: 5 } },
      { label: 'Post your own LinkedIn update about the deal with your full role described in granular detail. Don\'t tag him. Let the algorithm do the work.', effects: { charisma: 3, reputation: 3 } },
      { label: '"Thanks for the shoutout [MD name]!" — as if he already did. Maintain composure.', effects: { charisma: 4, reputation: -4 }, isD: true },
    ],
  },
  {
    id: 'clientWhooper',
    location: 'office',
    title: 'The Client Whooper',
    text: "It's 8:53am. Pitch is at 9:30. You open the PDF you sent the client last night and realise slide 14 says \"[INSERT TARGET COMPANY NAME HERE]\" in 36pt font.",
    maxStage: 'associate',
    choices: [
      { label: 'Email the client "Please use the attached revised version" with a corrected deck and no further explanation, praying they haven\'t opened it yet.', effects: { charisma: -2, competence: 5 } },
      { label: 'Call the client\'s PA, claim there was a "version control issue" and a "more current deck" is coming. Use the word "dynamic" twice.', effects: { charisma: -1, competence: 5 } },
      { label: 'Forward the original email to the MD with "just flagging" and let him decide. Watch the read receipt hit at 9:01am.', effects: { charisma: -4 } },
      { label: 'Go to the pitch anyway. If they mention it, say it was intentional — a "client-first customisation placeholder" to confirm their name was correct. Maintain eye contact.', effects: { charisma: 4 }, isD: true },
    ],
  },
  {
    id: 'theHangover',
    location: 'office',
    title: 'The Hangover',
    text: "You had a crazy night out for your friend's birthday. It is now 3am, you are drunk and you have a morning meeting at 8:30am. What do you do?",
    choices: [
      { label: 'Stay on the dance floor until 8am, grab a coffee and head straight to the office.', effects: { sanity: -8, charisma: 5 } },
      { label: 'Call it a night and go to bed.', effects: { sanity: 2, competence: 2 } },
      { label: 'Go back to the office and sleep there to save time commuting.', effects: { sanity: -5, charisma: -2 } },
      { label: "Go back to the office and work — can't fall asleep anyway, might as well grind.", effects: { sanity: -12, competence: 5, reputation: 5 }, isD: true },
    ],
  },
  {
    id: 'burningOutJunior',
    location: 'office',
    title: 'The Burning Out Junior',
    text: 'A junior analyst on your team is clearly burning out. You recognise the signs. You were them once.',
    unlockFromStage: 'vp',
    choices: [
      { label: 'Say nothing. Not your problem.', effects: { sanity: -10 } },
      { label: 'Check in privately.', effects: { reputation: 6, sanity: 3 } },
      { label: 'Tell him inspirational stories of how you worked 100hr weeks in your junior years', effects: { sanity: -5, reputation: 5 } },
      { label: 'Give them a day off unofficially.', effects: { reputation: 10, competence: -5 }, isD: true, isCultureDefying: true },
    ],
  },
  {
    id: 'theAIDeck',
    location: 'office',
    title: 'The AI Deck',
    text: (gs) => gs?.isPEPath
      ? `You just presented a 30-page pitch to a potential target. The CEO pointed at a text box with 3 instances of "—" and asked bluntly: "Is this deck generated by AI?"`
      : `You just presented a 30-page pitch to a potential client. The CEO pointed at a text box with 3 instances of "—" and asked bluntly: "Is this deck generated by AI?"`,
    unlockFromStage: 'vp',
    choices: [
      { label: 'Start sweating and smile awkwardly. Move on swiftly to another topic.', effects: { sanity: -5, reputation: -10 } },
      { label: 'Laugh out confidently and tell him this is actually the standard writing style at your firm as per the latest brand strategy guidance.', effects: { reputation: 5, charisma: 10, sanity: -5 } },
      { label: 'Say, quietly but with full conviction: "Those dashes were written by my analyst. He\'s Romanian. They all write like that." Your analyst is from Guildford. He is in the room.', effects: { reputation: 10, charisma: -5 } },
      { label: '"We use a range of tools to ensure the highest quality output for our clients." It means nothing. It sounds like everything.', effects: { reputation: 5 }, isD: true },
    ],
  },
  {
    id: 'theOffsite',
    location: 'office',
    title: 'The Offsite',
    text: (gs) => gs?.isPEPath
      ? `The firm has organised a 2-day leadership offsite in the Hamptons. There is a "trust exercise." You are asked to share "one authentic personal vulnerability" with the group of 14 Directors and Partners. A Partner goes first and says he "struggles to delegate." Everyone nods. It is your turn.`
      : `The bank has organised a 2-day leadership offsite in the Hamptons. There is a "trust exercise." You are asked to share "one authentic personal vulnerability" with the group of 14 Directors and MDs. A Managing Director goes first and says he "struggles to delegate." Everyone nods. It is your turn.`,
    directorQ2OffsiteOnly: true,
    onceOnly: true,
    choices: [
      { label: '"I sometimes take on too much." It is the same answer. Nobody minds. This exercise was never real.', effects: {} },
      { label: 'You go slightly too real. The room goes quiet. The facilitator says "thank you for your openness."', effects: { reputation: -5, sanity: -10 } },
      { label: 'Share something that is technically personal but also subtly positions you as indispensable. "I care too much about outcomes for my team."', effects: { reputation: 5, charisma: 5 } },
      { label: 'Stand up. Look around the room slowly. Say: "I don\'t believe in vulnerability as a competitive advantage." Sit down. Do not elaborate.', effects: { charisma: 15, sanity: -5 }, isD: true },
    ],
  },
  {
    id: 'boardQuestion',
    location: 'office',
    title: 'The Board Question',
    text: "The CEO asks for your honest opinion in front of the board. He does not want your honest opinion.",
    unlockFromStage: 'director',
    choices: [
      { label: '"Based on the work we\'ve done, we believe this transaction represents a compelling opportunity given current market conditions, subject to the assumptions outlined on page 14."', effects: { reputation: 5, charisma: -5, competence: 5 } },
      { label: 'Give him 85% of the truth. Acknowledge one real risk — a small one, already known, already in the deck — with enough gravity that it reads as candour.', effects: { charisma: 10, reputation: 10 } },
      { label: 'Give your honest opinion. The synergies are optimistic. The multiple is full. The integration assumptions on slide 22 would not survive contact with reality.', effects: { reputation: -10, charisma: 10, competence: -5 } },
      { label: '"That\'s exactly the right question to be asking — and honestly, the fact that you\'re asking it in this room, at this stage, tells me what I need to know about how you run a business."', effects: { charisma: 5, reputation: 5 }, isD: true },
    ],
  },
  {
    id: 'theWADrama',
    location: 'office',
    title: 'The WA Drama',
    text: "The junior group chat has been active since 10pm. Memes, complaints, light MD roasting. At 11:43pm you notice the MD has been added to the group. Nobody knows how. Nobody has said anything for 6 minutes. Three people are shown as typing. Then stopping.",
    onceOnly: true,
    maxStage: 'associate',
    choices: [
      { label: (gs) => `Type "Hi ${gs?.isPEPath ? 'Partner' : 'MD'}, wrong chat, ignore everything above 😂." You take the grenade. You are a hero.`, effects: { reputation: -25, charisma: 10 } },
      { label: 'Quietly leave the group. Not your circus. Someone else will deal with it. You were barely active anyway.', effects: {} },
      { label: "Send a completely normal, professional message about tomorrow's 8am call as if none of the previous 200 messages exist. Force a reset through sheer audacity.", effects: { sanity: 5 } },
      { label: "Take a screenshot. You're not sure what you're saving this for. But you're saving it.", effects: { sanity: 5, reputation: -5 }, isD: true },
    ],
  },
  {
    id: 'urgentClientSituation',
    location: 'office',
    title: 'Urgent Client Situation',
    text: (gs) => gs?.isPEPath
      ? "You are just about to leave your office on a Friday evening. You get an urgent call from a public target company, PubliCo's CFO — they just received a hostile takeover bid. The emergency board presentation is on Monday and the deck needs to be finalised by Saturday EOD for CEO review."
      : "You are just about to leave your office on a Friday evening. You get an urgent call from PubliCo's CFO to help them prepare a financial presentation for a tender offer that just arrived on the company's desk. The emergency board presentation is on Monday and the deck needs to be finalised by Saturday EOD for CEO review.",
    onceOnly: true,
    unlockFromStage: 'vp',
    choices: [
      { label: 'Start acting on the situation right away. Cancel all Friday and weekend plans.', effects: { sanity: -10, reputation: 8 }, isUrgentClientOption1: true },
      { label: "Promise you can help take a look if they share the materials, but you don't have capacity to get fully involved.", effects: { reputation: 2, sanity: -2 } },
      { label: 'Send a team of analysts on the situation and rush off to your Friday dinner plans.', effects: { reputation: -5 } },
      { label: 'Tell him you need to consult your boss internally first and will get back to him on Monday.', effects: { reputation: -10, sanity: 5 }, isD: true },
    ],
  },
  {
    id: 'headhunterFollowUp',
    location: 'office',
    title: 'An Unexpected Call',
    text: "A headhunter reaches out. The PubliCo deal never closed in the end — but the CFO remembered exactly how you showed up that Friday night. The board has decided they need a dedicated Head of Corporate Development, and the CFO has named you as their top pick. The role is yours if you want it.",
    headhunterFollowUpOnly: true,
    choices: [
      { label: 'Accept the offer. A different kind of career starts now.', effects: { sanity: 10 }, isCorpDevAccept: true },
      { label: 'Politely decline. You have unfinished business here.', effects: { sanity: 5 }, isD: true },
    ],
  },

  // ── Logan Sterling Q4 encounters (years 1–5) ─────────────────────────
  {
    id: 'loganY1',
    location: 'office',
    title: 'Kitchen Catch-Up',
    text: `The office kitchen is quiet. You're pouring a third coffee for the day when the door swings open with a little too much confidence.\n\nIt's Logan Sterling, arguably the most "memorable" guy from your summer analyst cohort. He graduated with a 4.0 GPA at Harvard, his parents are both senior MDs in Bulge Brackets — the guy ticks off every box for the song "finance, trust fund, 6' 5", blue eyes".\n\n"Hey, it's been a while, how's the IB life treating you?"\n\n...\n\n"Me? Just closed a $1.7bn deal last week, so not bad. Honestly, I've been sitting in on deal calls since I was fourteen. So when I got here — I don't want to sound arrogant — but it wasn't exactly a learning curve. More like... confirmation."\n\nHe glanced at his Patek Philippe and wrapped up the conversation with a smile that didn't quite reach his eyes. "Time to get back to work."`,
    loganQ4Only: true,
    choices: [
      { label: '"Loving it." It\'s 5pm — just halfway through your day.', effects: { sanity: -5, competence: 5 } },
      { label: '"Can\'t complain."', effects: { charisma: 5 } },
    ],
  },
  {
    id: 'loganY2',
    location: 'office',
    title: 'The Bonus Chat',
    text: `Logan catches you by the printer in Q4. He looks, if anything, more self-assured than last year. He asks how your bonus treated you in the tone of someone who already knows the answer will be less than his.\n\n"Mine was 150% of cap. Not that I asked — they just — you know. And they're putting me on an accelerated track. Two-year associate promo. They basically said I had no choice." He shrugs. "What can you do?"`,
    loganQ4Only: true,
    choices: [
      { label: '"150% of cap. They clearly rate you." Smile. Mean it slightly less than it sounds.', effects: { charisma: 3 } },
      { label: '"Good for you, Logan." Collect your document. Leave.', effects: { competence: 3 } },
    ],
  },
  {
    id: 'loganY3',
    location: 'office',
    title: 'The Verbier Update',
    text: `Logan finds you near the coffee machine in December. He hasn't been visible on the floor much this year, and he leads with this as though it's a flex.\n\n"Deal flow has been insane. I'm finally staffing my own analysts — three of them. My family does Verbier every Christmas. I haven't made it in three years, so this year I actually blocked the calendar." He tilts his head. "What are you doing for the holidays?"`,
    loganQ4Only: true,
    choices: [
      { label: `"Taking some time. I've earned it."`, effects: { sanity: 5 } },
      { label: '"Still working through a few live deals."', effects: { competence: 3 } },
    ],
  },
  {
    id: 'loganY4',
    location: 'office',
    title: 'The Announcement',
    text: `Logan finds you in the lift lobby in Q4. He's wearing a slightly different suit — not the firm's tailor, something personal. He has the look of a man about to deliver news he has rehearsed.\n\n"I'm out. Darkstone Partners — joining as a new Associate in January. PE was always the plan. The carry, the platform — it was a no-brainer." A beat. "You should think about it. Seriously. It's the next chapter."`,
    loganQ4Only: true,
    choices: [
      { label: '"Big move. Good luck over there."', effects: { reputation: 3 } },
      { label: `"I'm focused on the path I'm on." Firm handshake.`, effects: { competence: 3 } },
    ],
  },
  {
    id: 'loganY5',
    location: 'office',
    title: 'Old Faces',
    text: `You're at a fundraiser event — low lighting, expensive drinks, the usual crowd. Someone touches your arm from behind.\n\nIt's Logan Sterling.\n\nHe looks good. He's holding a glass of something amber and watching you with the quiet, slightly too-composed expression of a man who has been working up to something.\n\n"Turner. I didn't think I'd see you here. I've been thinking about you since the summer internship, honestly. I didn't know how to say it then." A pause. "But now — I mean. Look at us."`,
    loganQ4Only: true,
    choices: [
      { label: '"Okay, Logan. Let\'s see where the night takes us."', effects: { sanity: -5 }, isLoganY5Accept: true },
      { label: '"I\'m flattered. But let\'s keep this professional."', effects: { charisma: 10 }, isLoganY5Decline: true },
      { label: '"You waited five years to say that?" You can\'t help but laugh.', effects: { charisma: 20, sanity: 20 }, isLoganY5Laugh: true },
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
  walkOfShame: {
    title: 'Walk of Shame.',
    colour: '#ef4444',
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'      : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'      : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his'     : 'her';
      const pron5   = gs?.characterId === 'max' ? 'himself' : 'herself';
      return `The news moved faster than it should have.\n\nBy Monday morning, ${name} could feel it — the hallway glances that didn't quite land, conversations that paused a beat too long before resuming. Someone had seen something on Friday night. Someone always did.\n\nHR called ${name} in on Tuesday. The meeting was held in a conference room booked under a vague title, with two people from the team sitting across the table as though they'd rehearsed the arrangement. ${name} explained, carefully, that the evening had been a blur — too much wine, a moment ${pron2} didn't remember clearly, nothing ${pron2} had sought out or invited. ${pronoun} said it the way people say things when they need to be believed: slowly, and without embellishment.\n\nThe MD was gone by Friday. An all-staff email arrived at 11am: he had "decided to pursue opportunities outside the firm." No one said anything publicly. No one needed to.\n\n${name} kept ${pron3} job.\n\nWhat followed was harder to describe than losing it would have been. The promotion came through as expected — a small victory that landed in silence, acknowledged by no one with any warmth. In the open-plan office, ${pron2} would catch fragments: a lowered voice near the coffee machine, a laugh that cut off too quickly. ${pronoun} told ${pron5} ${pron2} was imagining it. ${pronoun} was not imagining it.\n\nThe breakdown, when it came, was not a single moment. It was a slow erosion — a Tuesday where ${pron2} sat at ${pron3} desk for two hours without opening a single file. A morning where the commute felt physically impossible. A call with a friend ${pron2} hadn't spoken to in months, during which ${pron2} said almost nothing and then stood in the work bathroom afterwards, not quite crying, not quite not.\n\n${pronoun} put in ${pron3} notice eight weeks after that Friday night. The letter was three sentences.`;
    },
    epilogue: (name, _sanity, gs) => {
      const pron3 = gs?.characterId === 'max' ? 'his' : 'her';
      return `${name} never mentioned it on ${pron3} CV. It was not the kind of thing that needed explaining.`;
    },
  },
  backToFamilyBusiness: {
    title: 'Back to the Family Business.',
    colour: '#d4a017',
    text: (name) => `${name} has decided to stop playing the Wall Street game.\n\nBanking had been an interesting detour. Genuinely interesting. The models, the deals, the architecture of money moving at speed — there was something honest about learning how it all worked from the inside, rather than simply inheriting the outcome. But the promotion cycle, the performance scores calibrated to two decimal places, the annual review where someone who earned a fraction of the family's quarterly dividend explained ${name}'s "development areas" — none of that had ever really been the point.\n\n${name} did not consider this a failure. The game had been interesting. ${name} had simply decided to stop playing it.\n\n${name} called the parents, messaged old friends from private school, and chartered a jet to Bora Bora. Two weeks in Bora Bora became three. Then there was talk of Switzerland — the Verbier chalet had been sitting largely unused since Covid, which was practically a waste.\n\nOf course the IBD recovery vacation did not go on forever. The family's European acquisition needed oversight. The Hong Kong office was in the middle of a restructure that required someone who understood both the balance sheet and the family's expectations for it. There was a board seat. There had always been going to be a board seat. The chair had been figuratively upholstered and waiting since before ${name} could read a P&L.\n\n"When you're ready," ${name}'s father said.\n\nHe did not ask if ${name} was ready. He had not asked because the answer had never really been in question.`,
    epilogue: (name) => `The game had been interesting. ${name} had simply been playing a different one all along.`,
  },
  burntOut: {
    title: 'Burnt Out.',
    colour: '#ef4444',
    text: (name, _stats, gs) => {
      const pron2 = gs?.characterId === 'max' ? 'he' : 'she';
      return `${name} didn't mean to quit. Not really. There was no grand moment of clarity, no dramatic resignation speech.\n\nOne morning, the alarm went off. ${name} stared at the ceiling. Then set the alarm again. Then again.\n\nOn the third day, ${pron2} emailed HR. The subject line said "personal leave." The body said almost nothing. The truth was simpler: there was nothing left.\n\nThe questions came later, in the silence that followed. What had it all been for? Was this what ambition was supposed to feel like when it ran out? The answers weren't forthcoming. But for the first time in years, there was time to sit with them.`;
    },
    epilogue: 'The therapist helped. Slowly. So did sleep, and weekends that felt like actual weekends.',
  },
  friendsFO: {
    title: "Friend's Family Office.",
    colour: '#d4a017',
    text: (name, _stats, gs) => {
      const pron2 = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3 = gs?.characterId === 'max' ? 'his' : 'her';
      return `${name} had done enough. The learning had been real — the modelling, the pressure, the education in how large institutions actually work. But at some point the learning stops and the enduring begins, and ${pron2} had crossed that line some time ago.\n\nThe decision to leave wasn't dramatic. ${name} told ${pron3} best friend from Wharton over dinner — the trust fund kid, the one who had always been more interested in the investing side than the banking side, who had spent the last year quietly talking about setting up a proper family office for the money that had been sitting in private bank accounts for two generations. He'd been waiting for someone to run it with.\n\n"I was going to call you this week," he said.\n\nThe new life was, objectively, very sweet. No more 8am huddle calls. No more getting yelled at for a typo on page 21. No more box-aligning, no more version control hell, no more Sunday-evening dread. Instead: a small team, a clear mandate, inbound deal flow from the private bank's network, and the occasional afternoon on the terrace with a very cold martini, reviewing a pitch deck at a pace that felt almost leisurely.\n\nThe money was different — not the salary, which was fine, but the orientation of it. This was capital that had already arrived. The job was stewardship. ${name} found, somewhat to ${pron3} surprise, that ${pron2} was rather good at it.`;
    },
    epilogue: (name, _sanity, gs) => {
      const pron2 = gs?.characterId === 'max' ? 'he' : 'she';
      return `The private bank sent a bottle of Sauternes when the first deal closed. ${name} didn't know what to do with it so ${pron2} put it on the shelf. It's still there.`;
    },
  },
  upOrOut: {
    title: 'Up or Out.',
    colour: '#ef4444',
    text: (name, _stats, gs) => `The email arrived on a Friday afternoon. Two lines. Respectful, HR-reviewed, completely devastating.\n\n${name} had been the top student. Had been. That was the word that kept surfacing: "had been." ${gs?.isPEPath ? 'Darkstone does not traffic in past tense.' : "Sweatshaw & Co didn't traffic in past tense."}\n\nThe surprise was the most humiliating part. All the late nights, the decks rebuilt at midnight, the weekends quietly surrendered — and still, somehow, this.\n\nThe grief was real. Then it passed. And somewhere on the other side of it, ${name} started to notice the world outside the building. The one that had been there all along.`,
    epilogue: 'Turned out there was quite a lot of it. The wider world. More than expected.',
  },
  permanentVP: {
    title: 'The Permanent VP.',
    colour: '#8b90b0',
    text: (name) => `There is a particular kind of stuck that only exists inside a large institution.\n\n${name} became a VP and stayed one. Not through failure — the scores were fine, the reviews were adequate, the work was solid. But "solid" and "Director" are two different conversations, and the partners had made their calculation.\n\nThe salary was good. The title was respectable. The ceiling was visible from the desk.\n\nYears later, ${name} could still describe exactly how it felt to realise this was it. That the game had not ended — it had simply become a different game, one without a winning condition.`,
    epilogue: (_name, _sanity, gs) => {
      const pron5 = gs?.characterId === 'max' ? 'him' : 'her';
      return `The junior analysts called ${pron5} "the institution." They meant it as a compliment. Probably.`;
    },
  },
  headOfInternalStrategy: {
    title: 'Head of Internal Strategy.',
    colour: '#8b90b0',
    text: (name) => `They didn't tell ${name} directly. That was never how it was done.\n\nThe signs were there — a smaller room, a meeting removed from the agenda, a project with a vague mandate and no reporting line. "Head of Internal Strategy." The title sounded important. No one came to ask for strategy.\n\n${name} had been close. Closer than most ever got. But in the final year, something had shifted — the room had changed its mind, or ${name} had, or both. The partnership had gone to someone else. The rest was just administration.`,
    epilogue: '"Director." The business card still said that. It was still true. It was also, somehow, the last true thing.',
  },
  professionalCoach: {
    title: 'The Professional Coach.',
    colour: '#a3e635',
    text: (name, _stats, gs) => {
      const pron3 = gs?.characterId === 'max' ? 'his' : 'her';
      return `The promotion announcement was made on a Thursday morning. ${name}'s name was not in it.\n\nBy Friday afternoon, ${name} had handed in ${pron3} notice.\n\nThe LinkedIn profile was updated over the weekend. The new headline read: "Performance Coach | Finance Consultant | Success Mindset Trainer | Supporting High Achievers." The banner was changed to something involving a sunrise. The profile photo was retaken in natural light.\n\nThe clientele built itself quickly — mostly analysts and associates from the same world ${name} had just left. Insecure overachievers who needed someone who truly understood the pressure. The services expanded fast: mental clarity sessions, fitness programming, boardroom politics navigation, relationship coaching for people whose relationships had quietly collapsed around their careers. ${name} understood all of it. ${name} had lived all of it.\n\nThe book came out eighteen months later. "Atomic Habits for the Ambitious." The cover was clean. The subtitle promised a system. The acknowledgements thanked the finance industry for the material.\n\nIt hit the WSJ bestseller list in its second week.`;
    },
    epilogue: (name) => `The five-star reviews kept coming in. "Changed my life." "Finally, someone who gets it." ${name} read every one.`,
  },
  fire: {
    title: 'F.I.R.E.',
    colour: '#8b90b0',
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'  : 'she';
      return `${name} had more than enough — more, honestly, than ${pron2} knew what to do with.\n\nFor the better part of a year, the sanity numbers had been quietly, consistently low. Not a crisis. No dramatic collapse. Just a steady grey dimming that made every Tuesday feel like a Monday.\n\nOn a Wednesday morning, ${pron2} submitted a leaving notice. HR acknowledged it with a calendar invite. No counteroffer was entertained. The farewell drinks were cordial. Someone said "we'll stay in touch" and everyone nodded. The role was posted internally the following week, and had someone in the seat in six.\n\n${name} landed in Bangkok with a carry-on bag and nothing scheduled. ${pronoun} moved slowly — temples, markets, a ten-day silent retreat in Chiang Mai ${pron2} nearly abandoned on day three but didn't. ${pronoun} read things ${pron2}'d bookmarked years ago. ${pronoun} learned what it felt like to not check the time.\n\nWhat came next remained an open question. A small bakery in lower Manhattan, maybe. Or a country where the savings outlast the ambition and the pace of life doesn't require a recovery plan. For now, the question itself felt like a luxury ${pron2} had finally earned.`;
    },
    epilogue: 'The Wi-Fi was unreliable in most places. That turned out to be fine.',
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
  linkedInGhost: {
    title: 'The LinkedIn Ghost.',
    colour: '#8b90b0',
    image: '/unlivedresume.png',
    text: (_name, _stats, gs) => {
      const PARTNER_NAMES = { julien: 'Julien', victor: 'Victor', logan: 'Logan' };
      const partner = PARTNER_NAMES[gs?.relationshipPartnerId] ?? 'her partner';
      return `The decision didn't arrive as a decision. It arrived as a Tuesday morning when Paige simply couldn't do it anymore — couldn't open the laptop, couldn't draft the email, couldn't locate the version of herself that had once found all of this interesting.\n\n${partner} was the one who said it plainly: take some time. So she did.\n\nThe leave of absence became a resignation. The short career break she planned to use to re-think about her longer term career was extended by a surprise proposal. She said yes without hesitating, which surprised her a little.\n\nThe short career break she planned to figure out her long-term career was extended by months of wedding planning. Which was then extended indefinitely by her pregnancy.\n\nShe told herself she could go back, whenever she was ready. The door was open. She had the credentials, the contacts, the institutional memory. Finance would still be there.\n\nAnd she meant it — mostly. There were mornings, early ones, when the city was still grey and the children were still asleep and ${partner} had already left for the office, when she stood at the window with a cooling cup of coffee and felt something she didn't have a precise word for. Not regret, exactly. More like the quiet awareness of a road not taken, visible from a distance, running parallel to the one she was on.\n\nThe feeling passed quickly. It always did.\n\nShe had everything she had been told to want: a successful husband, beautiful children, an apartment with a view of the island she had arrived in at twenty-two with a carry-on bag and a great deal of ambition.\n\nIt was a good life.`;
    },
    epilogue: (_name, _stats, gs) => {
      const PARTNER_NAMES = { julien: 'Julien', victor: 'Victor', logan: 'Logan' };
      const partner = PARTNER_NAMES[gs?.relationshipPartnerId] ?? 'her partner';
      return `Paige's LinkedIn was never updated since.`;
    },
  },
  kingOfWallStreet: {
    title: (gs) => gs?.characterId === 'paige' ? 'Queen of Wall Street.' : 'King of Wall Street.',
    colour: '#fbbf24',
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his' : 'her';
      const crown   = gs?.characterId === 'paige' ? 'Queen' : 'King';

      if (gs?.isPEPath) {
        return `The fund closed at 4.1×.\n\nNot the best multiple Darkstone had ever posted — but the largest absolute return in the firm's history, and everyone in that room knew exactly whose conviction had driven it. ${name} had sourced the deal, championed it through an internal investment committee that was sceptical at the time, and then spent four years building something the market had spectacularly underestimated.\n\nThe carry distribution was processed quietly, as these things always are. The number, when it appeared, required no commentary.\n\n${pronoun} had built something rarer than a successful fund: a reputation that preceded ${pron3} into every room ${pron2} entered. LPs called before the deck was finalised. CEOs took the meeting before the teaser arrived. The carry was the confirmation of something the market had already priced in.\n\nThere had been a time — early, when ${pron2} was still learning what private equity actually was beneath the surface of the pitch — when ${pron2} had wondered whether the game was worth the cost. The weekends. The compressed timelines. The relationships that narrowed to the dimensions of a deal room.\n\nThe honest answer, in the end, was yes. Not because of the carry, and not because of the title. But because of the quality of the decisions — and the fact that, at every fork in the road, ${name} had made the right one.\n\nDarkstone & Partners. Senior Partner. ${crown} of Wall Street.\n\nThe next fund was already oversubscribed.`;
      }

      return `The announcement came on a Tuesday morning. Three sentences in an all-staff email. By noon, ${name}'s phone had received one hundred and twelve messages — from clients, from peers, from junior analysts ${pron2} had mentored across a decade who were now sending the kind of congratulations that people send when they mean it.\n\nManaging Director. Sweatshaw & Co. One of the most sought-after seats on the Street.\n\n${pronoun} had earned more fees for the firm in the past three years than the entire division had generated in the five years before ${pron2} made VP. The league table position had moved. The client roster had moved. The culture of the team — the standard it held itself to, the calibre of work it expected — had moved. These things did not happen by accident.\n\nThe corner office had been empty for two months. Everyone on the floor had known, before the email arrived, whose name would be on the door.\n\nThere are moments, early in a career, when the ambition feels abstract — something you carry around without quite knowing its shape. ${name} had known ${pron3} shape early. Not with arrogance, but with clarity. The kind of clarity that is, in the end, the only competitive advantage that compounds.\n\n${pronoun} had run towards every difficult deal, every difficult client, every difficult room. ${pronoun} had stayed when it would have been easier to leave. ${pronoun} had built something — not just a career, but a standard.\n\n${crown} of Wall Street. The title the market gives you when the market has already decided.\n\n${name} had known it was coming. ${pronoun} had known for years.`;
    },
    epilogue: (name, _sanity, gs) => {
      const pron2 = gs?.characterId === 'max' ? 'he' : 'she';
      if (gs?.isPEPath) {
        return `The next fund was a $6 billion raise. The anchor LP committed within forty-eight hours of the first call. ${name} took that as confirmation of something ${pron2} had always suspected: in this business, track record is everything. ${pron2} had one that spoke for itself.`;
      }
      return `The summer interns this year had excellent CVs and hungry eyes. ${name} remembered the feeling exactly. ${pron2.charAt(0).toUpperCase() + pron2.slice(1)} gave them twenty minutes at the front of the room. They will be thinking about it for years.`;
    },
  },
  madePartner: {
    title: 'Corner Office.',
    colour: '#d4a017',
    text: (name, _stats, gs) => {
      const pron2 = gs?.characterId === 'max' ? 'he' : 'she';
      return `After years at Darkstone & Partners, ${name} made Partner.\n\nThe announcement came on a Tuesday. The equity split was favourable. The office had a view that required no explanation.\n\nPrivate equity rewards a specific kind of person. ${name} had always suspected ${pron2} was that person. The carry distribution confirmed it.`;
    },
    epilogue: (_name, sanity) =>
      sanity > 70 ? 'The work was hard. The returns were real. Not every trade-off made sense at the time. Most of them do now.'
      : sanity > 40 ? 'The work was relentless. The money made the relentlessness easier to justify. Most days.'
      : 'You made Partner. The number is very large. You\'ll feel something about it eventually.',
  },
  hollowVictory: {
    title: 'Empty Table.',
    colour: '#d4a017',
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his' : 'her';
      return `The Partner announcement came on a Tuesday. The equity split was favourable. The carry was real. Darkstone & Partners, in its understated way, confirmed that ${name} had arrived.\n\n${name} read the email, set it down, and — for a moment — reached for ${pron3} phone. An instinct. A reflex left over from a time when news had a recipient. The contact list was long. The number of people who would have genuinely dropped everything to hear this was not.\n\nThe friends from the analyst class had quietly reorganised themselves around different coordinates. School runs. Weekend football matches for children who had no idea what a cap table was. WhatsApp groups full of photos ${name} liked without opening. The last wedding invitation had been four years ago. ${name} had attended, briefly, between two flights, and left before the speeches.\n\nThere had been a friend from school — the one who'd walked away from finance entirely, who was apparently teaching now — who had sent a message at Christmas. Three lines. Asking how ${name} actually was. ${name} had started typing a reply and not sent it, meaning to come back when the quarter closed.\n\nThe quarter had closed. Then the next one. Then the one after that.\n\n${pronoun} sat with it for a moment — the weight of the accumulated arithmetic. The missed birthdays. The relationships that had ended not with a confrontation but with a gradual silence neither party had formally acknowledged. The trades made, finally understood clearly from the elevation of the outcome.\n\nThe thought paused.\n\nA knock at the door. The new VP — prepared, slightly nervous in the way all good VPs were slightly nervous — stepped in to walk through the portfolio company update. The room adjusted itself in the way rooms adjusted now when ${name} was in them. The deference. The attention. The particular quality of a room listening carefully to the person whose opinion was the one that mattered.\n\n${name} leaned back.\n\nYou know what? This is exactly what I wanted all along.`;
    },
    epilogue: 'The search for a portfolio CEO began the following Monday. The shortlist had one name on it.',
  },
  madeMD: {
    title: 'Managing Director.',
    colour: '#d4a017',
    text: (name, _stats, gs) => {
      const pron2   = gs?.characterId === 'max' ? 'he'      : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his'     : 'her';
      const pron4   = gs?.characterId === 'max' ? 'his'     : 'hers';
      const pron5   = gs?.characterId === 'max' ? 'himself' : 'herself';
      return `The letter came on a Thursday. Managing Director, effective the first of the month.\n\n${name} read it twice, set it down, and went back to the deck ${pron2} was working on. The announcement could wait twenty minutes.\n\nFifteen years. The title had always been there in the distance, the way landmarks look closer than they are. Then one morning it simply wasn't in the distance anymore. It was on a piece of paper. It was a signature. It was ${pron4}.\n\nSweatshaw & Co said nothing had changed, which was technically true and practically meaningless. Everything had changed. The way people walked into meetings. The calls that got returned. The decisions that no longer needed sign-off from anyone in the building.\n\nThree weeks after the announcement, ${name} was asked to give a short address to the new intake of graduate analysts.\n\nSixty-two of them. Eager, well-dressed, slightly terrified in the particular way of people who have studied very hard for something and are only now realising the studying had barely started. ${name} looked out at them and recognised something — not ${pron5} exactly, but the posture. The hunger. The careful, calibrated nerves behind polished expressions.\n\n"This is a genuinely extraordinary career," ${name} said. "I mean that without irony. What you will learn here, what you will be tested by, what you will become — there's very little like it."\n\nA pause.\n\n"Out of the cohort in this room, statistically, one of you will make Managing Director."\n\nThey had expected something more encouraging. ${name} could see the recalibration moving through the room — the quiet arithmetic, the sudden awareness of the sixty-one people sitting nearby.\n\n"I want you to understand that not as a discouragement," ${name} continued. "I want you to understand it the way I eventually did: as a reason to pay attention. To every room you're in. Every decision you make. Every year that passes."\n\nThe applause was polite. A few of them, ${name} noticed, were already scanning the room for the edge that might make them the one.\n\n${name} had worn the same expression, fifteen years ago, sitting at the back of a room exactly like this one.`;
    },
    epilogue: (_name, sanity) =>
      sanity > 70 ? 'The title is real. So is the work. Neither of those things are going away. That is, on balance, fine.'
      : sanity > 40 ? 'Managing Director. The words look right on the door. The hours remain what they were. You\'re working on that.'
      : 'You made it. You\'re not entirely sure who you are outside of this building. That\'s a question for another year.',
  },
  hollowMD: {
    title: 'Managing Director. (The Desk is Very Clean.)',
    colour: '#d4a017',
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his' : 'her';
      return `The letter came on a Thursday. Managing Director, effective the first of the month. ${name} read it, set it down, and went back to the deck. The announcement could wait twenty minutes.\n\nThe email went to the floor that afternoon. The replies came in. The work did not stop for a single hour.\n\nSomewhere in the early evening, ${pron2} reached for ${pron3} phone — instinct, reflex, the muscle memory of having people to tell things to. The contact list was long. The names were familiar. The number of people who would have genuinely dropped everything to hear this was not what it had once been.\n\nThe friends from the analyst class had, somewhere along the way, stopped being the same kind of available. School runs now. Saturday mornings with children who would never care about IBD league tables. WhatsApp groups ${name} was technically part of but rarely opened. The last birthday dinner had been two years ago. ${name} had arrived forty minutes late, left before the cake, and meant to reschedule the one-on-one catch-ups that had been pending since.\n\nThere had been a close friend from university — not finance, never finance, did something in conservation — who used to call on Sunday evenings. At some point the calls had tapered. ${name} had been on a roadshow for three of them and in back-to-back pitches for two more. The friend had stopped calling. ${name} had not called back. It had felt, at the time, like a temporary situation.\n\nThat had been years ago.\n\n${pronoun} sat with it for a moment — the full accounting of what the title had cost, seen now from the only altitude where the shape of it was finally clear. The relationships that had ended not dramatically but quietly, the way things end when no one is tending them. The milestones attended by phone. The version of life that had been running in parallel to this one, unvisited, slowly closing.\n\nThe thought paused.\n\nA knock at the door. The new VP — sharp, prepared, slightly nervous in the way all good VPs were slightly nervous — stepped in to present the deal update. The room adjusted the way rooms adjusted now when ${name} was in them. The posture of everyone present. The particular quality of attention when ${pron3} opinion was the one being waited for.\n\n${name} leaned back.\n\nYou know what? This is exactly what I wanted all along.`;
    },
    epilogue: 'The results were excellent. The results were always excellent. The question of what they cost had stopped being asked some years ago. That, too, had been a deliberate decision.',
  },
  bankruptcy: {
    title: 'The Money Ran Out.',
    colour: '#ef4444',
    isBankruptcy: true,
    text: (name, stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his' : 'her';

      const p1 = `The direct debit failed on a Tuesday morning.\n${name} knew before the notification arrived — had known for a few weeks, really, in the way you know things you are not ready to deal with.\nThe letting agent's email was polite. It always is, at first.`;

      let p2 = '';
      if ((stats?.competence ?? 0) > 60) {
        p2 = `The frustrating thing — the part that kept ${name} up at night — was that ${pron2} was good at the job. Genuinely good. The work was never the problem. The numbers just hadn't kept up with the city, with the rent, with the version of life that Sweatshaw & Co quietly required you to maintain.`;
      } else if ((stats?.sanity ?? 100) < 30) {
        p2 = `Looking back, the money was the last thing to go. Everything else had already been quietly leaving for months — the sleep, the appetite for it, the ability to care about the things ${pron2} was supposed to care about. The bank balance was just the last domino.`;
      }

      let p2b = '';
      if (gs?.isRichLegacy) {
        p2b = `There would be a call to make, eventually. To someone who would answer on the second ring and not say I told you so, at least not immediately. ${name} was not ready to make that call. ${pronoun} sat with ${pron3} phone face-down on the table for a very long time.`;
      }

      let p3 = '';
      const rep = stats?.reputation ?? 0;
      if (rep > 60) {
        p3 = `A former colleague called within the week. There was contract work, if ${name} wanted it. People remembered the good years. That turned out to matter more than expected.`;
      } else {
        p3 = `The industry was smaller than it looked from the inside. ${name} learned this the slow way. ${pronoun} pivoted eventually — something adjacent, something quieter. It was fine. Fine was enough for a while.`;
      }

      const p4 = `Sweatshaw & Co filled the position within six weeks. The new hire sat at the same desk. They did not know whose it had been. That is how it works.`;

      return [p1, p2, p2b, p3, p4].filter(Boolean).join('\n\n');
    },
    epilogue: 'HR sent a survey two weeks later asking how the offboarding experience could be improved.',
  },
  startupBust: {
    title: 'Zero to Zero.',
    colour: '#8b90b0',
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'   : 'She';
      const pron4   = gs?.characterId === 'max' ? 'his'  : 'hers';
      return `${name} joined the startup with a lot of conviction and a cap table that, in retrospect, should have raised questions.\n\nThe idea wasn't bad. The timing wasn't catastrophic. The execution — somewhere between the pivot and the re-pivot — is where things became difficult to explain at dinner parties.\n\n${pronoun} ran out of runway on a Friday. The final all-hands was on a Google Meet. Seventeen people. The CEO said the word "learnings" four times.\n\nBack at a desk that wasn't ${pron4}, in an office that smelled like every other office, ${name} updated a CV that now had an eighteen-month gap labelled "Founder." That turned out to mean more than expected — just not in the way expected.`;
    },
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
    text: (name, _stats, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2   = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3   = gs?.characterId === 'max' ? 'his' : 'her';
      return `The relationship ending was the last straw.\n\n${name} had been running on fumes for longer than ${pron2} would admit — the kind of tired that sleep doesn't fix, the kind of empty that no deal or promotion reaches. The loss was the crack that let everything else in.\n\n${pronoun} called in sick on a Monday. Then Tuesday. By Wednesday, ${pron2} stopped checking ${pron3} phone. The out-of-office wasn't set. Nobody set it for two days.\n\nWhen ${name} finally opened ${pron3} laptop, there was a calendar invite from HR. Subject: "Check-in." The kind of meeting that has a format and a conclusion already drafted before it begins.\n\nThe conversation was careful, measured, humane in the way large institutions are when they have practised it. The word "wellbeing" appeared four times. The phrase "not a fit right now" appeared once.\n\nHR suggested that perhaps it was best, for everyone, if ${name} took some time. There was a leave package. There was a therapist referral. There was a card signed by the team that said nothing specific and everything general.\n\nOutside the building, ${name} stood on the pavement for a long time. The city moved. ${name} didn't.\n\nFor the first time in years, there was nothing to do. No meeting to prepare for. No deck to revise. No number to hit.\n\nJust a question that had been waiting very patiently in the back of every late night and missed anniversary and unanswered message:\n\nWhat was it all for?`;
    },
    epilogue: 'The therapist had a whiteboard and a calm voice. The answer took longer than expected. The question, it turned out, was worth asking.',
  },
  headOfCorpDev: {
    title: 'Head of Corporate Development.',
    colour: '#4ade80',
    text: (name, _stats, gs) => {
      const pronoun  = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2    = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3    = gs?.characterId === 'max' ? 'his' : 'her';
      return `${name} left the firm quietly, on a Tuesday. No farewell drinks had been planned for that specific day — ${pron2} simply finished the day, collected ${pron3} things, and took the elevator down for the last time.\n\nThe role at PubliCo was different in the ways ${pron2} had hoped and the ways ${pron2} had not fully anticipated. The pay was lower. The work was more human, somehow. A single company, a set of people who actually built something, decisions that had visible consequences in real time rather than filtered through six layers of advisory.\n\nThe weeks had edges now. Weekends began on Friday evening and ended Sunday night without interruption. There was space to fill — a marathon, eventually, trained for properly over four months. A hobby or two. The ability to attend things that were not work things.\n\n${pronoun} did not miss the hours. ${pronoun} missed parts of the machine — the velocity of it, the sharpness of the people, the particular buzz of a deal closing at midnight. But missing something and needing it back are different calculations.\n\nIt had been a good run. This was a different one.`;
    },
    epilogue: (_name, _sanity, gs) => {
      const pronoun = gs?.characterId === 'max' ? 'His' : 'Her';
      return `${pronoun} out-of-office message on the last day read: "Thank you for everything. I'll be in touch — just not at 2am."`;
    },
  },
};

// ─────────────────────────────────────────────
// EXTENSION ENDINGS
// ─────────────────────────────────────────────
export const EXTENSION_ENDINGS = {
  workingForInLaws: {
    title: 'Working for the In-Laws.',
    colour: '#d4a017',
    bg: '/efamilyoffice.png',
    music: '/legacy.mp3',
    triggeredBy: ['burntOut', 'upOrOut', 'permanentVP', 'headOfInternalStrategy', 'friendsFO'],
    condition: (gs) =>
      gs.characterId === 'max' &&
      gs.relationshipPartnerId === 'olivia' &&
      (gs.relationshipStatus === 'engaged' || gs.relationshipStatus === 'married'),
    text: (name, _stats, gs) => {
      const company = gs?.isPEPath ? 'Darkstone' : 'Sweatshaw';
      return `${name} had been carrying the weight of it quietly — the late decks, the weekend check-ins, the gnawing sense that no amount of output would ever be quite enough. Olivia noticed before he said anything. She always did.\n\n"Babe," she said one evening while he was rereading an email he'd already sent, "there is another way out."\n\nHer father — Reginald Beaufort, whose name appeared in the kind of press releases that other people frame — was in the process of establishing a family office. A proper one. Staffed by people who understood capital, who understood discretion, and who, ideally, came with some degree of pre-existing trust. Olivia had mentioned ${name} exactly once, over dinner in Mayfair. That had been enough.\n\n${name} handed in his notice on the second day after that conversation. The ${company} exit interview lasted nine minutes. Nobody seemed particularly surprised.\n\nTwo years later, he is on first-name terms with the people who own the buildings his old colleagues still rent. The hours are his. The access is extraordinary. The work is interesting in the way that work is interesting when the stakes are real and the politics are minimal.\n\nWork-life balance, prestige, the quiet weight of influence — these things arrived not as rewards for performance, but as the natural conditions of the new life. He had not engineered it. He had simply said yes to the right person, at the right time.`;
    },
    epilogue: (name) => `Reginald Beaufort shook ${name}'s hand at the end of the first year and said, without ceremony, "You'll do." From him, that was a speech.`,
  },
  napaRetirement: {
    title: 'The Napa Retirement.',
    colour: '#a78bfa',
    bg: { paige: '/ewinerypaige.png', max: '/ewinerymax.png' },
    music: '/legacy.mp3',
    triggeredBy: ['burntOut', 'permanentVP', 'headOfInternalStrategy', 'professionalCoach'],
    condition: (gs) => gs.stats.wealth > 2_000_000 && (gs.baseTraits?.grit ?? 100) < 50,
    text: (name, _stats, gs) => {
      const pronoun  = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2    = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3    = gs?.characterId === 'max' ? 'his' : 'her';
      return `${name} had always known what ${pron2} would do with enough money. The answer had been the same since a road trip through Sonoma at twenty-three: something with land, something slow, something that did not require a laptop.\n\nThe apartment in Tribeca sold in a week. The storage unit took a weekend to clear. The goodbyes were brief — a few dinners, a lot of promises to visit that both parties understood were aspirational.\n\nThe plot in Napa was small by any reasonable standard. Seven acres, a farmhouse that needed work, and a south-facing slope that the seller described as "promising." ${name} had no idea what that meant. ${pronoun} bought it anyway.\n\nAgriculture, it turned out, was considerably less glamorous than anticipated. The soil required attention that felt nothing like due diligence and everything like physical labour. The vines did not respond to urgency. The harvest happened on its own schedule, indifferent to ${pron3} preferences.\n\n${pronoun} had not expected to love it as much as ${pron2} did.\n\nThe mornings were the thing. Coffee on the porch before six, when the light came over the ridge in that particular Napa way that made everything look like it had been photographed for a magazine. Oysters from Tomales Bay on Sundays, eaten outside, with nothing else to do. The silence, which had seemed oppressive in the first weeks, had become the point.\n\nThe first vintage was uneven. The second was better. ${name} was in no hurry.`;
    },
    epilogue: (name) => `${name}'s old MD sent a congratulations email when the winery got its first mention in a regional wine publication. ${name} replied two weeks later, when ${name} remembered to check that inbox.`,
  },
  wallStreetComedian: {
    title: 'The Wall Street Comedian.',
    colour: '#f59e0b',
    bg: { paige: '/ecomedianp.png', max: '/ecomedianm.png' },
    music: '/legacy.mp3',
    triggeredBy: ['burntOut', 'upOrOut'],
    condition: (gs) => gs.stats.reputation > 300 || (gs.baseTraits?.streetSmart ?? 0) > 40,
    text: (name, _stats, gs) => {
      const pronoun  = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2    = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3    = gs?.characterId === 'max' ? 'his' : 'her';
      const company  = gs?.isPEPath ? 'Darkstone' : 'Sweatshaw';
      return `Two months after leaving ${company}, ${name} got on stage at a midnight open mic in the East Village, three drinks in, with absolutely no plan.\n\n${pronoun} had wandered in off the street. The host was short a name on the list. Someone handed ${pron2} a microphone.\n\nThe set was called "My MD Was a Sociopath." It ran twelve minutes. ${pronoun} covered the 2am emails, the feedback given exclusively through heavy sighing, the time ${pron3} MD threw a pitch book across the room and called it "a learning moment." The audience — a mix of finance refugees, med students, and one man who appeared to be asleep — responded in a way ${name} had not experienced since the last time a deal closed: they were genuinely, audibly pleased.\n\nSomeone recorded it. The TikTok went to 400,000 views in four days.\n\nThe bookings followed. ${pronoun} became a fixture at shows across the financial district, then Midtown, then a residency at a club in the West Village that had a waiting list. The material wrote itself — ${pron2} had four years of it, carefully documented in the form of therapy invoices.\n\nThe show titles came easily: "DCF Therapy." "Carried Interest for Dummies." "Why My Bonus Was Less Than My Therapy Bill." Each one sold out.\n\nPeople from ${company} started showing up in the audience — junior analysts who had heard about it through the associate class group chat, then MDs who came to see if ${pron2} had named them. ${name} had not. But ${pron2} had described them in enough detail that they knew.`;
    },
    epilogue: (name) => `The five-star review on Eventbrite that meant the most simply read: "Finally, someone said it." ${name} framed it.`,
  },
  eliteConsultant: {
    title: 'The Elite Consultant.',
    colour: '#818cf8',
    bg: '/eeducation.png',
    music: '/legacy.mp3',
    triggeredBy: ['burntOut', 'upOrOut'],
    condition: (gs) => (gs.baseTraits?.intelligence ?? 0) > 50 && (gs.currentYear ?? 0) > 2,
    text: (name, _stats, gs) => {
      const pronoun  = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2    = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3    = gs?.characterId === 'max' ? 'his' : 'her';
      const company  = gs?.isPEPath ? 'Darkstone' : 'Sweatshaw';
      return `Reflecting on the years at ${company}, ${name} came to a conclusion that surprised ${pron2}: ${pron2} had enjoyed the preparation more than the race. The late nights before the superday. The mental frameworks built in study groups. The satisfaction of cracking a case or reverse-engineering a model before anyone else in the room. The game, it turned out, had been ${pron3} thing. The actual job had been someone else's.\n\nThe LinkedIn update took twenty minutes. "Education Consultant. Career Consultant. Mindset Coach." ${pronoun} posted it on a Wednesday. By Friday, three inbound messages had arrived from parents ${pron2} had never met.\n\nThe YouTube channel launched six weeks later. The first video: "Why I Left My High-Paying Investment Banking Job." ${pronoun} filmed it in one take, in ${pron3} living room, wearing a shirt but no shoes. It reached forty thousand views in a week. The comments were either "this is exactly what I needed" or "you're being dramatic." Both were correct.\n\nThe clients came from the network ${pron2} had always half-ignored — the UHNW families, the second-generation wealth, the Shanghai parents flying ${pron3} business class to prep ${pron3} son for Harvard. Mock interviews. Ivy League application strategy. Crash courses in financial modelling for kids who had never opened a spreadsheet and would one day inherit a portfolio.\n\nThe clients were, without exception, nicer than anyone ${pron2} had worked with at ${company}. They were grateful. They sent thank-you notes. They referred their friends.\n\nThe money was also, it turned out, not bad at all.`;
    },
    epilogue: (name) => `${name}'s second video — "How I Would Prepare for Banking Recruiting (If I Were Starting Again)" — has been watched more times than ${name} would care to admit.`,
  },
  homeTrader: {
    title: 'The Home Trader.',
    colour: '#34d399',
    bg: '/etrader.png',
    music: '/legacy.mp3',
    triggeredBy: ['burntOut', 'upOrOut', 'permanentVP'],
    condition: (gs) => gs.stats.wealth > 500_000 && !(gs.stats.wealth > 2_000_000 && (gs.baseTraits?.grit ?? 100) < 50),
    text: (name, _stats, gs) => {
      const pronoun  = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2    = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3    = gs?.characterId === 'max' ? 'his' : 'her';
      const company  = gs?.isPEPath ? 'Darkstone' : 'Sweatshaw';
      return `${name} had learned enough. The modelling, the structure, the language of capital — ${pron2} had absorbed all of it. What ${company} had never given ${pron2} was the one thing ${pron2} actually wanted: control.\n\nThe home office renovation took three weeks. A proper dual-monitor setup. A Bloomberg terminal subscription. Blackout curtains for the mornings when the Asian markets were moving. ${pronoun} updated ${pron3} LinkedIn in a single afternoon: "Investor. Angel Investor. Ex-${company} Alumnus." The endorsements came in within hours from people who had no idea what any of it meant.\n\nThe markets were choppy. They always were. The first month was flat. The second was down. The third was up enough to make the first two feel like tuition fees, which in a sense they were.\n\nBut the lifestyle was the thing. No 8am huddle call. No getting dressed for anyone. No commute through the rain to sit under fluorescent lighting and be told that slide 21 had a typo. ${pronoun} woke up when ${pron2} was ready. ${pronoun} went to bed when the positions were closed. Dinner was at a reasonable hour. The gym happened because ${pron2} felt like it, not because ${pron2} had thirty minutes before the next call.\n\nThe income was less predictable. That was the honest truth. But income and life were now pointing in the same direction, which was more than most people at ${company} could say.`;
    },
    epilogue: (name) => `The 8am calendar invite still arrives every Monday, forwarded by an old colleague as a joke. ${name} declines it, every week, from bed.`,
  },
  pastryChef: {
    title: 'The Pastry Chef.',
    colour: '#fb923c',
    bg: '/ebakery.png',
    music: '/legacy.mp3',
    triggeredBy: ['burntOut', 'mentalBreakdown'],
    condition: (gs) =>
      (gs.currentStageId === 'analyst' || gs.currentStageId === 'associate') &&
      (gs.baseTraits?.looks ?? 0) > 30 &&
      (gs.baseTraits?.grit ?? 100) < 30 &&
      gs.currentYear >= 2,
    text: (name, _stats, gs) => {
      const pronoun  = gs?.characterId === 'max' ? 'He'  : 'She';
      const pron2    = gs?.characterId === 'max' ? 'he'  : 'she';
      const pron3    = gs?.characterId === 'max' ? 'his' : 'her';
      return `${name} has made up ${pron3} mind to leave the finance industry.\n\nThere is a dream that had been there since childhood — a specific memory of a Saturday morning, flour on the counter, something warm coming out of the oven that made the whole house smell different. ${pronoun} had filed it away as impractical. Wharton does not prepare you for impractical.\n\nThe first six months at culinary school were humbling in ways that finance had never managed. The feedback was immediate and sensory. The hours were long in a different way — physically exhausting rather than mentally corrosive. ${pronoun} burned things. ${pronoun} under-proofed things. ${pronoun} was, for the first time in years, genuinely bad at something.\n\nBut the spreadsheet brain, it turned out, was not entirely useless. ${pronoun} understood yield, costing, margin. ${pronoun} could read a supplier contract in three minutes. When ${pron3} classmates were still figuring out how to talk to a landlord, ${name} was negotiating a lease on a small shop unit in the West Village.\n\nThe rest came slowly, then quickly. A pastry counter. A small following. A queue on Saturday mornings that occasionally required a rope.`;
    },
    epilogue: (name) => `The email newsletters were written at 6am, before service. ${name} kept them short. People said they were the best thing in their inbox.`,
  },
};
