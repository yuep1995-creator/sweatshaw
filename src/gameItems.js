// ─── Item definitions ──────────────────────────────────────────────────────────
//
// giftMode:
//   'none'      — player-only, no gift option shown
//   'male'      — show gift option only if active date is male
//   'female'    — show gift option only if active date is female
//   'any'       — show gift option for any active date
//
// gifteeGender is used by the UI to determine visibility of the gift option.
//
// selfEffects   — applied when the player keeps/uses the item
// giftEffects   — applied when the player gifts the item (intimacy delta on partner)
//
// For female-only items (bags, bracelet, necklace):
//   selfEffects apply only if the player character is Paige.
//   Max will never see these items listed unless he has a female date (in which
//   case they still show but the 'use' option is hidden and only 'gift' appears).
//   We model this via selfForFemaleCharOnly: true.
//
// weight — relative draw weight (default 1). Higher = more likely to appear.

export const ITEM_POOL = [
  // ── Player-only consumables ────────────────────────────────────────────────
  {
    id: 'adderall',
    name: 'Adderall',
    image: '/adderall.png',
    cost: 100,
    giftMode: 'none',
    selfEffects: { sanity: -10, competence: 5 },
    weight: 4, // 20% relative weight (4 out of ~20 total base weight pool)
  },
  {
    id: 'redbull',
    name: 'Red Bull',
    image: '/redbull.png',
    cost: 50,
    giftMode: 'none',
    selfEffects: { sanity: -5, competence: 3 },
    weight: 4,
  },
  {
    id: 'vodka',
    name: 'Vodka',
    image: '/alcohol2.png',
    cost: 200,
    giftMode: 'none',
    selfEffects: { sanity: 12, competence: -5 },
    weight: 2,
  },
  {
    id: 'whiskey',
    name: 'Whiskey',
    image: '/alcohol3.png',
    cost: 500,
    giftMode: 'none',
    selfEffects: { sanity: 15, competence: -3 },
    weight: 2,
  },
  {
    id: 'cigars',
    name: 'Nice Cigars',
    image: '/cigar.png',
    cost: 5_000,
    giftMode: 'none',
    selfEffects: { sanity: 10, charisma: 5 },
    weight: 1,
  },
  {
    id: 'weightloss',
    name: 'Weight Loss Magic',
    image: '/weightloss.png',
    cost: 5_000,
    giftMode: 'none',
    selfEffects: { sanity: -10, charisma: 10 },
    weight: 1,
  },
  {
    id: 'clubMembership',
    name: 'Club Membership',
    image: '/club.png',
    cost: 20_000,
    giftMode: 'none',
    selfEffects: { reputation: 20 },
    weight: 1,
  },
  {
    id: 'golfSet',
    name: 'Golf Set',
    image: '/golf.png',
    cost: 5_000,
    giftMode: 'none',
    selfEffects: { charisma: 5 },
    weight: 1,
  },
  {
    id: 'privateJet',
    name: 'Private Jet',
    image: '/jet.png',
    cost: 5_000_000,
    giftMode: 'none',
    selfEffects: { charisma: 300, reputation: 300 },
    weight: 0.1, // ~0.5% relative
  },
  {
    id: 'yacht',
    name: 'Yacht',
    image: '/yatch1.png',
    cost: 125_000,
    giftMode: 'none',
    selfEffects: { reputation: 25, charisma: 35 },
    weight: 1,
  },
  {
    id: 'niceYacht',
    name: 'Nice Yacht',
    image: '/yatch2.png',
    cost: 500_000,
    giftMode: 'none',
    selfEffects: { reputation: 150, charisma: 150 },
    weight: 1,
  },

  // ── Male-giftable items ────────────────────────────────────────────────────
  {
    id: 'niceWatch',
    name: 'Nice Watch',
    image: '/watch1.png',
    cost: 10_000,
    giftMode: 'male',
    selfEffects: { reputation: 10 },
    giftEffects: { intimacy: 25 },
    weight: 1,
  },
  {
    id: 'poshWatch',
    name: 'Posh Watch',
    image: '/watch2.png',
    cost: 25_000,
    giftMode: 'male',
    selfEffects: { reputation: 20 },
    giftEffects: { intimacy: 40 },
    weight: 1,
  },
  {
    id: 'luxuryWatch',
    name: 'Luxury Watch',
    image: '/watch3.png',
    cost: 50_000,
    giftMode: 'male',
    selfEffects: { reputation: 50 },
    giftEffects: { intimacy: 60 },
    weight: 1,
  },
  {
    id: 'sportsMemorabilia',
    name: 'Sports Memorabilia',
    image: '/memorabilia.png',
    cost: 5_000,
    giftMode: 'male',
    selfEffects: { reputation: 8 },
    giftEffects: { intimacy: 40 },
    weight: 1,
  },

  // ── Female-giftable / Paige-usable items ──────────────────────────────────
  {
    id: 'niceBag',
    name: 'Nice Bag',
    image: '/bag4.png',
    cost: 5_000,
    giftMode: 'female',
    selfEffects: { charisma: 10 },
    selfForFemaleCharOnly: true,
    giftEffects: { intimacy: 15 },
    weight: 1,
  },
  {
    id: 'poshBag',
    name: 'Posh Bag',
    image: '/bag2.png',
    cost: 10_000,
    giftMode: 'female',
    selfEffects: { charisma: 15 },
    selfForFemaleCharOnly: true,
    giftEffects: { intimacy: 30 },
    weight: 1,
  },
  {
    id: 'luxuryBag',
    name: 'Luxury Bag',
    image: '/bag1.png',
    cost: 50_000,
    giftMode: 'female',
    selfEffects: { charisma: 25 },
    selfForFemaleCharOnly: true,
    giftEffects: { intimacy: 60 },
    weight: 1,
  },
  {
    id: 'niceBracelet',
    name: 'Nice Bracelet',
    image: '/bracelet.png',
    cost: 8_000,
    giftMode: 'female',
    selfEffects: { charisma: 12 },
    selfForFemaleCharOnly: true,
    giftEffects: { intimacy: 25 },
    weight: 1,
  },
  {
    id: 'niceNecklace',
    name: 'Nice Necklace',
    image: '/necklace.png',
    cost: 12_500,
    giftMode: 'female',
    selfEffects: { charisma: 20 },
    selfForFemaleCharOnly: true,
    giftEffects: { intimacy: 35 },
    weight: 1,
  },

  // ── Universal gift items ───────────────────────────────────────────────────
  {
    id: 'niceWine',
    name: 'Nice Wine',
    image: '/alcohol1.png',
    cost: 300,
    giftMode: 'any',
    selfEffects: { sanity: 8, competence: -2 },
    giftEffects: { intimacy: 5 },
    weight: 5, // 25% relative
  },
  {
    id: 'niceCar',
    name: 'Nice Car',
    image: '/car1.png',
    cost: 75_000,
    giftMode: 'any',
    selfEffects: { charisma: 25, reputation: 25 },
    giftEffects: { intimacy: 75 },
    weight: 1,
  },
  {
    id: 'sportsCar',
    name: 'Sports Car',
    image: '/car2.png',
    cost: 100_000,
    giftMode: 'any',
    selfEffects: { charisma: 30, reputation: 30 },
    giftEffects: { intimacy: 100 },
    weight: 1,
  },
  {
    id: 'poshCar',
    name: 'Posh Car',
    image: '/car3.png',
    cost: 300_000,
    giftMode: 'any',
    selfEffects: { charisma: 100, reputation: 100 },
    giftEffects: { intimacy: 150 },
    weight: 1,
  },
];

// ─── Partner gender lookup ─────────────────────────────────────────────────────
// Used to determine whether male/female gift options should be shown.
export const PARTNER_GENDER = {
  victor:    'male',
  marco:     'male',
  david:     'male',
  julien:    'male',
  logan:     'male',
  adira:     'female',
  anastasia: 'female',
  olivia:    'female',
  emily:     'female',
};

// ─── How many items to show per career stage ──────────────────────────────────
export const ITEMS_PER_STAGE = {
  analyst:   2,
  associate: 2,
  vp:        3,
  director:  4,
};

// ─── Pick N unique items for a quarter ────────────────────────────────────────
// Returns an array of item definitions (length = count).
// Excludes any ids in excludeIds (for no-repeat logic if needed).
export function pickQuarterlyItems(stageId, excludeIds = []) {
  const count = ITEMS_PER_STAGE[stageId] ?? 2;
  const pool  = ITEM_POOL.filter(item => !excludeIds.includes(item.id));

  // Weighted random sampling without replacement
  const selected = [];
  const remaining = [...pool];

  for (let i = 0; i < count && remaining.length > 0; i++) {
    const totalWeight = remaining.reduce((sum, item) => sum + (item.weight ?? 1), 0);
    let roll = Math.random() * totalWeight;
    let idx  = 0;
    for (; idx < remaining.length - 1; idx++) {
      roll -= remaining[idx].weight ?? 1;
      if (roll <= 0) break;
    }
    selected.push(remaining[idx]);
    remaining.splice(idx, 1);
  }

  return selected;
}
