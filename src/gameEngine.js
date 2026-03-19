import {
  CAREER_STAGES,
  QUARTERLY_EVENTS,
  BADGES,
} from './gameData';

// ─────────────────────────────────────────────
// TIME / STAGE HELPERS
// ─────────────────────────────────────────────
export const getStageInfo = (year) => {
  const stageIdx = Math.min(Math.floor((year - 1) / 3), CAREER_STAGES.length - 1);
  const stage = CAREER_STAGES[stageIdx];
  const stageYear = ((year - 1) % 3) + 1;  // 1, 2, or 3
  const calendarYear = 2025 + year;
  return { stage, stageYear, stageIdx, calendarYear };
};

export const getQuarterLabel = (quarter) => ['Q1', 'Q2', 'Q3', 'Q4'][quarter - 1];

export const getSeasonLabel = (quarter) => ['Jan–Mar', 'Apr–Jun', 'Jul–Sep', 'Oct–Dec'][quarter - 1];

export const getTitleDisplay = (stageId) => {
  const s = CAREER_STAGES.find(s => s.id === stageId);
  return s ? s.title : 'Analyst';
};

// ─────────────────────────────────────────────
// STAT OPERATIONS
// ─────────────────────────────────────────────
const COMP_CAP   = 999;   // Competence / Charisma / Reputation cap
const SANITY_CAP = 200;   // Sanity cap
const WEALTH_MAX = 99_999_999;

// clampStats: caps comp/char/rep at 999, sanity at [0,200], wealth at max
// No sanityFloor clamping here — that check is done separately (breakdown event)
export const clampStats = (stats) => {
  const out = { ...stats };
  ['competence', 'charisma', 'reputation'].forEach(k => {
    out[k] = Math.min(COMP_CAP, Math.max(0, out[k] || 0));
  });
  out.sanity = Math.min(SANITY_CAP, Math.max(0, out.sanity || 0));
  out.wealth = Math.min(WEALTH_MAX, Math.max(0, out.wealth || 0));
  return out;
};

// applyEffects: applies all 4 trait multipliers and returns RAW (unclamped) stats.
// Caller must check sanity < 0 for burntOut before calling clampStats.
export const applyEffects = (stats, rawEffects, multipliers = {}, currentYear = 1) => {
  const effects = { ...rawEffects };
  const {
    competenceMultiplier          = 1,
    sanityLossReduction           = 0,
    charismaMultiplierLooks       = 1,
    charismaMultiplierStreetSmart = 1,
    reputationMultiplier          = 1,
  } = multipliers;

  // Intelligence → Competence gains only
  if (effects.competence != null && effects.competence > 0) {
    effects.competence = Math.round(effects.competence * competenceMultiplier);
  }
  // Grit → Sanity losses only (losses become smaller; Rich Legacy amplified via negative value)
  // Year scaling: sanity losses grow 15% per year to reflect increasing toll of the job
  if (effects.sanity != null && effects.sanity < 0) {
    const yearMultiplier = Math.pow(1.15, currentYear - 1);
    effects.sanity = Math.round(effects.sanity * yearMultiplier * (1 - sanityLossReduction));
  }
  // Looks + Street Smart → Charisma gains (both multipliers applied multiplicatively)
  if (effects.charisma != null && effects.charisma > 0) {
    effects.charisma = Math.round(effects.charisma * charismaMultiplierLooks * charismaMultiplierStreetSmart);
  }
  // StreetSmart → Reputation gains only (losses NOT amplified)
  if (effects.reputation != null && effects.reputation > 0) {
    effects.reputation = Math.round(effects.reputation * reputationMultiplier);
  }

  const newStats = { ...stats };
  Object.entries(effects).forEach(([k, v]) => {
    newStats[k] = (newStats[k] || 0) + v;
  });
  return newStats; // unclamped — caller must clamp
};

// getAdjustedEffects: applies trait multipliers AND housing sanity mod to a raw effects
// object and returns the adjusted effects (does NOT accumulate into stats). Display only.
export const getAdjustedEffects = (rawEffects, multipliers = {}, housingTier = null, currentYear = 1) => {
  const effects = { ...rawEffects };
  const {
    competenceMultiplier          = 1,
    sanityLossReduction           = 0,
    charismaMultiplierLooks       = 1,
    charismaMultiplierStreetSmart = 1,
    reputationMultiplier          = 1,
  } = multipliers;

  if (effects.competence != null && effects.competence > 0)
    effects.competence = Math.round(effects.competence * competenceMultiplier);
  if (effects.sanity != null && effects.sanity < 0) {
    const yearMultiplier = Math.pow(1.15, currentYear - 1);
    effects.sanity = Math.round(effects.sanity * yearMultiplier * (1 - sanityLossReduction));
  }
  if (effects.charisma != null && effects.charisma > 0)
    effects.charisma = Math.round(effects.charisma * charismaMultiplierLooks * charismaMultiplierStreetSmart);
  if (effects.reputation != null && effects.reputation > 0)
    effects.reputation = Math.round(effects.reputation * reputationMultiplier);

  return effects;
};

export const mergeDeltas = (a, b) => {
  const out = { ...a };
  Object.entries(b).forEach(([k, v]) => { out[k] = (out[k] || 0) + v; });
  return out;
};

// ─────────────────────────────────────────────
// ACTIVITY PROCESSING
// ─────────────────────────────────────────────
// Returns { rawStats, effects, riskMessage } — rawStats is unclamped.
export const processActivity = (activityDef, currentStats, multipliers, currentYear = 1) => {
  let effects = { ...activityDef.effects };
  let riskMessage = null;

  if (activityDef.coinFlip) {
    const outcome = Math.random() < activityDef.coinFlip.chance ? 'good' : 'bad';
    Object.entries(activityDef.coinFlip[outcome]).forEach(([k, v]) => {
      effects[k] = (effects[k] || 0) + v;
    });
  } else if (activityDef.risk && Math.random() < activityDef.risk.chance) {
    Object.entries(activityDef.risk.effect).forEach(([k, v]) => {
      effects[k] = (effects[k] || 0) + v;
    });
    riskMessage = activityDef.risk.label;
  }

  const rawStats = applyEffects(currentStats, effects, multipliers, currentYear);
  return { rawStats, effects, riskMessage };
};

// ─────────────────────────────────────────────
// EVENT SELECTION
// ─────────────────────────────────────────────
export const pickQuarterlyEvent = (year, quarter, currentStageId) => {
  const stageOrder = ['analyst', 'associate', 'vp', 'director'];
  const stageIdx = stageOrder.indexOf(currentStageId);
  const eligible = QUARTERLY_EVENTS.filter(ev => {
    if (!ev.unlockFromStage) return true;
    return stageOrder.indexOf(ev.unlockFromStage) <= stageIdx;
  });
  const idx = ((year - 1) * 4 + (quarter - 1)) % eligible.length;
  return eligible[idx];
};

// ─────────────────────────────────────────────
// PROMOTION LOGIC
// ─────────────────────────────────────────────
// Returns true if all three stat thresholds are exceeded.
const meetsPromoReqs = (stats, reqs) =>
  stats.competence > reqs.competence &&
  stats.charisma   > reqs.charisma   &&
  stats.reputation > reqs.reputation;

// checkPromotion covers all four stages (Analyst → Associate → VP → Director → Partner).
// Result shape: { type: 'accelerated'|'standard'|'fail', reqs, stage }
// reqMultiplier: PE path passes 1.2 to scale all thresholds up.
export const checkPromotion = (stats, year, reqMultiplier = 1) => {
  const { stage, stageYear } = getStageInfo(year);
  if (!stage) return null;

  const { promoReqs, allowAccelerated } = stage;
  const scaledReqs = reqMultiplier === 1 ? promoReqs : {
    competence:  Math.round(promoReqs.competence  * reqMultiplier),
    charisma:    Math.round(promoReqs.charisma    * reqMultiplier),
    reputation:  Math.round(promoReqs.reputation  * reqMultiplier),
  };
  const met = meetsPromoReqs(stats, scaledReqs);

  if (stageYear === 2 && allowAccelerated && met) return { type: 'accelerated', reqs: scaledReqs, stage };
  if (stageYear === 3 && met)                     return { type: 'standard',    reqs: scaledReqs, stage };
  if (stageYear === 3 && !met)                    return { type: 'fail',        reqs: scaledReqs, stage };
  return null;
};

export const getNextStage = (currentStageId) => {
  const idx = CAREER_STAGES.findIndex(s => s.id === currentStageId);
  return idx >= 0 && idx < CAREER_STAGES.length - 1 ? CAREER_STAGES[idx + 1] : null;
};

// ─────────────────────────────────────────────
// BADGE CALCULATION
// ─────────────────────────────────────────────
export const computeYearBadges = ({
  stats, yearStartStats, activityLog, year,
  sanityDroppedBelow25, quarterEndSanities, dateHistory,
}) => {
  const earned = [];
  const yearActs = activityLog.filter(a => a.year === year);

  // Office Furniture: all 3 months of a quarter are crunchDeal
  for (let q = 1; q <= 4; q++) {
    const qActs = yearActs.filter(a => a.quarter === q);
    if (qActs.length === 3 && qActs.every(a => a.activityId === 'crunchDeal')) earned.push('officeFurniture');
  }

  // Stats now scale to 500 — thresholds adjusted proportionally
  if (stats.competence > 200 && stats.reputation > 200) earned.push('starAssociate');
  if (stats.competence - yearStartStats.competence > 50)  earned.push('spreadsheetWhisperer');

  const networkIds = ['networkInternal', 'networkExternal'];
  if (!yearActs.some(a => networkIds.includes(a.activityId))) earned.push('theGhost');
  if (sanityDroppedBelow25) earned.push('runningOnFumes');

  if (quarterEndSanities.length === 4 && quarterEndSanities.every(s => s >= 70)) earned.push('actuallyOkay');

  const maxDateCount = Math.max(...Object.values(dateHistory));
  if (maxDateCount >= 3) earned.push('taken');

  return [...new Set(earned)];
};

// ─────────────────────────────────────────────
// SALARY, TAX & HOUSING
// ─────────────────────────────────────────────
export const ANNUAL_SALARY_BY_STAGE = {
  analyst:   100_000,
  associate: 180_000,
  vp:        250_000,
  director:  350_000,
};

export const getTaxRate = (_stageId) => 0.45;

export const getQuarterlySalary = (stageId) => {
  const annual      = ANNUAL_SALARY_BY_STAGE[stageId] || 75_000;
  const gross       = Math.round(annual / 4);
  const taxRate     = getTaxRate(stageId);
  const taxWithheld = Math.round(gross * taxRate);
  return { gross, taxRate, taxWithheld, net: gross - taxWithheld };
};

// Returns 1.4^n promotion multiplier for Pitch New Clients effects.
export const getStagePromotionMultiplier = (stageId) => {
  const map = { analyst: 1, associate: 1.4, vp: 1.96, director: 2.744 };
  return map[stageId] || 1;
};

// Bonus = % of base salary based on work activities done in the year.
// extraResponsibilities: +10% each | crunchDeal: +15% each
// pitchClients: +10% (Analyst/Associate), +15% (VP), +25% (Director); 20% chance pitch doubles contribution
// Base 25%; caps: Analyst 125%, Associate 150%, VP 150%, Director 200%.
export const computeAnnualBonus = (stageId, activityLog, year) => {
  const annual    = ANNUAL_SALARY_BY_STAGE[stageId] || 100_000;
  const taxRate   = getTaxRate(stageId);

  const capByStage  = { analyst: 1.25, associate: 1.50, vp: 1.50, director: 2.00 };
  const cap         = capByStage[stageId] || 1.25;
  const pitchRateByStage = { analyst: 0.10, associate: 0.10, vp: 0.15, director: 0.25 };
  const pitchRate   = pitchRateByStage[stageId] || 0.10;

  const yearActs    = activityLog.filter(a => a.year === year);
  const extraCount  = yearActs.filter(a => a.activityId === 'extraResponsibilities').length;
  const crunchCount = yearActs.filter(a => a.activityId === 'crunchDeal').length;
  const pitchActs   = yearActs.filter(a => a.activityId === 'pitchClients');
  const pitchBonus  = pitchActs.reduce((sum, a) => sum + pitchRate * (a.pitchSuccess ? 2 : 1), 0);

  const bonusPct    = Math.min(0.25 + extraCount * 0.10 + crunchCount * 0.15 + pitchBonus, cap);
  const gross       = Math.round(annual * bonusPct);
  const taxWithheld = Math.round(gross * taxRate);
  return { gross, taxWithheld, net: gross - taxWithheld, taxRate, bonusPct };
};

export const formatDollars = (n) => {
  if (n >= 99_999_999) return '$99,999,999+';
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? '-$' : '$') + abs.toLocaleString('en-US');
};

export const HOUSING = {
  studio: {
    id: 'studio', label: 'Studio Apartment',
    monthlyRent: 3_500, quarterlyRent: 10_500, quarterlySanityBonus: 0,
    flavour: "It's small. The walls are thin. You can hear your neighbour's alarm.",
  },
  oneBed: {
    id: 'oneBed', label: 'One-Bedroom Flat',
    monthlyRent: 6_000, quarterlyRent: 18_000, quarterlySanityBonus: 3,
    flavour: 'You have a door for the bedroom. This matters more than you expected.',
  },
  twoBed: {
    id: 'twoBed', label: 'Two-Bedroom Flat',
    monthlyRent: 8_000, quarterlyRent: 24_000, quarterlySanityBonus: 5,
    flavour: 'The second bedroom is currently a wardrobe. You have plans to change this.',
  },
  mansion: {
    id: 'mansion', label: 'Penthouse',
    monthlyRent: 20_000, quarterlyRent: 60_000, quarterlySanityBonus: 10,
    flavour: "The bathtub alone has done more for your mental health than three years of therapy.",
  },
  penthouse: {
    id: 'penthouse', label: 'Penthouse (Owned)',
    monthlyRent: 0, quarterlyRent: 0, quarterlySanityBonus: 0,
    flavour: "Owned outright. Your London W1 address is doing more for your brand than your entire LinkedIn presence.",
  },
};

export const getQuarterlyRent = (housingTier, mansionOwned) => {
  if (housingTier === 'penthouse') return 0;
  if (housingTier === 'mansion' && mansionOwned) return 0;
  return HOUSING[housingTier]?.quarterlyRent ?? HOUSING.studio.quarterlyRent;
};

// Quarterly lifestyle cost by stage; Rich Legacy pays $100k regardless of stage.
export const QUARTERLY_LIFESTYLE = {
  analyst:   5_000,
  associate: 10_000,
  vp:        12_500,
  director:  15_000,
};

export const getQuarterlyLifestyle = (stageId, isRichLegacy) => {
  if (isRichLegacy) return 100_000;
  return QUARTERLY_LIFESTYLE[stageId] ?? 5_000;
};

export const getHousingQuarterlySanityBonus = (housingTier) =>
  HOUSING[housingTier]?.quarterlySanityBonus ?? 0;

// ─────────────────────────────────────────────
// ENDING CHECKS
// ─────────────────────────────────────────────
export const checkEndings = (gs) => {
  const {
    stats, currentYear, currentStageId,
    sideProjectMonths, linkedInMonths, eventDChoiceCount,
    consecutiveWeekendQuarters, sanityFloor, baseTraits,
    lowSanityQuarters, allBadgesEarned,
  } = gs;

  // Golden handcuffs
  if (stats.wealth >= 500_000 && stats.sanity < 20 && currentStageId === 'director') return 'goldenHandcuffs';
  // F.I.R.E. — wealthy, sanity low for 3+ quarters, late game, no serious relationship
  if (stats.wealth > 2_000_000 && (lowSanityQuarters || 0) >= 3 && currentYear > 6 && !(allBadgesEarned || []).includes('taken')) return 'fire';
  if (stats.reputation > 300 && eventDChoiceCount >= 7 && (baseTraits?.grit ?? 100) < 15 && (lowSanityQuarters || 0) >= 3) return 'regulator';
  return null;
};

// ─────────────────────────────────────────────
// SPECIAL EVENT TRIGGERS
// ─────────────────────────────────────────────
export const shouldFireWakeUpCall = (year, quarter) => year === 4 && quarter === 4;

export const shouldFireLegacyHireEvent = (year, quarter, isLegacyHire, legacyPromotionCount, legacyHireEventFired) =>
  isLegacyHire && year === 10 && quarter === 2 && legacyPromotionCount >= 3 && !legacyHireEventFired;
