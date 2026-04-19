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
    isPEPath                      = false,
  } = multipliers;

  // Intelligence → Competence gains only
  if (effects.competence != null && effects.competence > 0) {
    effects.competence = Math.round(effects.competence * competenceMultiplier);
  }
  // Grit → Sanity losses only (losses become smaller; Rich Legacy amplified via negative value)
  // Year scaling: +10%/yr every year. PE path: additional 1.1× stress multiplier.
  if (effects.sanity != null && effects.sanity < 0) {
    const yearMultiplier = Math.pow(1.10, currentYear - 1);
    const peMultiplier   = isPEPath ? 1.1 : 1;
    effects.sanity = Math.round(effects.sanity * yearMultiplier * peMultiplier * (1 - sanityLossReduction));
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
    isPEPath                      = false,
  } = multipliers;

  if (effects.competence != null && effects.competence > 0)
    effects.competence = Math.round(effects.competence * competenceMultiplier);
  if (effects.sanity != null && effects.sanity < 0) {
    const yearMultiplier = Math.pow(1.10, currentYear - 1);
    const peMultiplier   = isPEPath ? 1.1 : 1;
    effects.sanity = Math.round(effects.sanity * yearMultiplier * peMultiplier * (1 - sanityLossReduction));
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

  // bypassSanityMultiplier: apply sanity as a flat value, skip year/trait/PE scaling
  if (activityDef.bypassSanityMultiplier && effects.sanity != null) {
    const rawSanity = effects.sanity;
    const { sanity: _s, ...effectsWithoutSanity } = effects;
    const rawStats = applyEffects(currentStats, effectsWithoutSanity, multipliers, currentYear);
    rawStats.sanity += rawSanity;
    return { rawStats, effects, riskMessage };
  }

  const rawStats = applyEffects(currentStats, effects, multipliers, currentYear);
  return { rawStats, effects, riskMessage };
};

// ─────────────────────────────────────────────
// EVENT SELECTION
// ─────────────────────────────────────────────
export const pickQuarterlyEvent = (year, quarter, currentStageId, hasActiveRelationship = false, hadTherapyThisQuarter = false, seenOnceEvents = [], urgentClientFollowUpDue = false, opts = {}) => {
  const stageOrder = ['analyst', 'associate', 'vp', 'director'];
  const stageIdx = stageOrder.indexOf(currentStageId);

  // Y1Q1 always triggers Humble Bragging
  if (year === 1 && quarter === 1) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'humbleBragging');
  }

  // Therapy this quarter always triggers Therapy Time
  if (hadTherapyThisQuarter) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'therapyTime');
  }

  // Headhunter follow-up fires 2 quarters after urgentClientSituation option 1
  if (urgentClientFollowUpDue) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'headhunterFollowUp');
  }

  // Q1 from year 2 onwards: 30% chance of Après-ski
  if (quarter === 1 && year >= 2 && Math.random() < 0.30) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'apresSki');
  }

  // Q2 + Director (once only) triggers The Offsite
  if (quarter === 2 && currentStageId === 'director' && !seenOnceEvents.includes('theOffsite')) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'theOffsite');
  }

  // Q2 + VP or Director + 25% chance triggers The Hot Intern
  if (quarter === 2 && ['vp', 'director'].includes(currentStageId) && Math.random() < 0.25) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'theHotIntern');
  }

  // Q3 + active relationship + 25% coin flip triggers the Birthday Deal
  if (quarter === 3 && hasActiveRelationship && Math.random() < 0.25) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'birthdayDeal');
  }

  // Y2 Q4 only: 40% chance of Promotion Trap if looks > 50 (once only)
  if (year === 2 && quarter === 4 && (opts?.looks ?? 0) > 50 && Math.random() < 0.40 && !seenOnceEvents.includes('promotionTrap')) {
    return QUARTERLY_EVENTS.find(ev => ev.id === 'promotionTrap');
  }

  // Q4 only: single roll → 25% Feedback Sandwich, 25% Christmas Party, 50% normal rotation
  if (quarter === 4) {
    const q4Roll = Math.random();
    if (q4Roll < 0.25) return QUARTERLY_EVENTS.find(ev => ev.id === 'feedbackSandwich');
    if (q4Roll < 0.50) return QUARTERLY_EVENTS.find(ev => ev.id === 'christmasParty');
    // else fall through to normal rotation
  }

  const eligible = QUARTERLY_EVENTS.filter(ev => {
    if (ev.firstQuarterOnly) return false;    // only fires at Y1Q1
    if (ev.therapyOnly) return false;         // only fires when therapy was chosen this quarter
    if (ev.q3RelationshipOnly) return false;  // only fires at Q3 with relationship
    if (ev.q4Only) return false;              // only fires via Q4 roll above
    if (ev.q1FromYear2Only) return false;     // only fires via Q1 year≥2 roll above
    if (ev.q2VpPlusOnly) return false;        // only fires via Q2 VP+ roll above
    if (ev.headhunterFollowUpOnly) return false; // only fires via urgentClientFollowUpDue
    if (ev.directorQ2OffsiteOnly) return false;  // only fires via Q2 Director dedicated check
    if (ev.loganQ4Only) return false;            // retired — Logan now has its own scene
    if (ev.promotionTrapOnly) return false;      // only fires via Y2 Q4 dedicated check
    if (ev.onceOnly && seenOnceEvents.includes(ev.id)) return false; // already seen
    if (ev.maxStage && stageOrder.indexOf(ev.maxStage) < stageIdx) return false; // stage ceiling
    if (!ev.unlockFromStage) return true;
    return stageOrder.indexOf(ev.unlockFromStage) <= stageIdx;
  });
  const pool = eligible.flatMap(ev => Array(ev.weight ?? 1).fill(ev));
  const idx = ((year - 1) * 4 + (quarter - 1)) % pool.length;
  return pool[idx];
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

  const networkIds = ['networkInternal', 'networkExternal', 'playingPolitics', 'clientEntertainment'];
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
  associate: 175_000,
  vp:        225_000,
  director:  300_000,
};

export const getTaxRate = (_stageId) => 0.45;

export const getQuarterlySalary = (stageId) => {
  const annual      = ANNUAL_SALARY_BY_STAGE[stageId] || 75_000;
  const gross       = Math.round(annual / 4);
  const taxRate     = getTaxRate(stageId);
  const taxWithheld = Math.round(gross * taxRate);
  return { gross, taxRate, taxWithheld, net: gross - taxWithheld };
};

// Returns promotion multiplier for Client Pitch effects.
export const getStagePromotionMultiplier = (stageId) => {
  const map = { analyst: 1, associate: 1.2, vp: 1.4, director: 1.6 };
  return map[stageId] || 1;
};

// Bonus = % of base salary based on work activities done in the year.
// extraResponsibilities/projectManagement: +10% each | crunchDeal: +15% each
// pitchClients: +5% (Analyst), +10% (Associate/VP), +15% (Director); 20% chance pitch doubles contribution
// playingPolitics (VP/Director): +8% each
// clientEntertainment: +10% (VP), +15% (Director)
// slackLookBusy: -5% each
// Base 25%; caps: Analyst 125%, Associate 150%, VP 150%, Director 200%.
export const computeAnnualBonus = (stageId, activityLog, year) => {
  const annual    = ANNUAL_SALARY_BY_STAGE[stageId] || 100_000;
  const taxRate   = getTaxRate(stageId);

  const capByStage  = { analyst: 1.25, associate: 1.50, vp: 1.50, director: 2.00 };
  const cap         = capByStage[stageId] || 1.25;
  const pitchRateByStage = { analyst: 0.05, associate: 0.10, vp: 0.10, director: 0.15 };
  const pitchRate        = pitchRateByStage[stageId] || 0.05;
  const entertainRate    = stageId === 'director' ? 0.15 : 0.10;
  const isVpPlus         = stageId === 'vp' || stageId === 'director';

  const yearActs        = activityLog.filter(a => a.year === year);
  const extraCount      = yearActs.filter(a => a.activityId === 'extraResponsibilities' || a.activityId === 'projectManagement').length;
  const crunchCount     = yearActs.filter(a => a.activityId === 'crunchDeal').length;
  const pitchActs       = yearActs.filter(a => a.activityId === 'pitchClients');
  const pitchBonus      = pitchActs.reduce((sum, a) => sum + pitchRate * (a.pitchSuccess ? 2 : 1), 0);
  const politicsCount   = isVpPlus ? yearActs.filter(a => a.activityId === 'playingPolitics').length : 0;
  const entertainCount  = isVpPlus ? yearActs.filter(a => a.activityId === 'clientEntertainment').length : 0;
  const slackCount      = yearActs.filter(a => a.activityId === 'slackLookBusy').length;

  const bonusPct    = Math.min(
    0.25
    + extraCount     * 0.10
    + crunchCount    * 0.15
    + pitchBonus
    + politicsCount  * 0.08
    + entertainCount * entertainRate
    - slackCount     * 0.05,
    cap,
  );
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
    lowSanityQuarters, allBadgesEarned, cultureDefyingChoiceCount,
  } = gs;

  // Rich Legacy characters always fall back to backToFamilyBusiness — never FIRE or Regulator
  if (gs.isRichLegacy) return null;

  // F.I.R.E. — wealthy, low-grit character, year 6+
  if (stats.wealth > 1_000_000 && currentYear > 5 && (baseTraits?.grit ?? 100) < 19) return 'fire';
  if (stats.reputation > 400 && (cultureDefyingChoiceCount || 0) >= 4 && (baseTraits?.grit ?? 100) < 19 && (lowSanityQuarters || 0) >= 2) return 'regulator';
  return null;
};

// ─────────────────────────────────────────────
// SPECIAL EVENT TRIGGERS
// ─────────────────────────────────────────────
export const shouldFireLegacyHireEvent = (year, quarter, isLegacyHire, legacyPromotionCount, legacyHireEventFired) =>
  isLegacyHire && year === 10 && quarter === 2 && legacyPromotionCount >= 3 && !legacyHireEventFired;
