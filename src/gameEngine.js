import {
  CAREER_STAGES,
  PARTNER_WEIGHTS,
  PARTNER_STANDARD_THRESHOLD,
  PARTNER_ACCELERATED_THRESHOLD,
  LEGACY_HIRE_STANDARD_REDUCTION,
  LEGACY_HIRE_ACCELERATED_REDUCTION,
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
const COMP_CAP   = 500;   // Competence / Charisma / Reputation cap
const WEALTH_MAX = 99_999_999;

// clampStats: caps comp/char/rep at 500, sanity at [0,100], wealth at max
// No sanityFloor clamping here — that check is done separately (breakdown event)
export const clampStats = (stats) => {
  const out = { ...stats };
  ['competence', 'charisma', 'reputation'].forEach(k => {
    out[k] = Math.min(COMP_CAP, Math.max(0, out[k] || 0));
  });
  out.sanity = Math.min(100, Math.max(0, out.sanity || 0));
  out.wealth = Math.min(WEALTH_MAX, Math.max(0, out.wealth || 0));
  return out;
};

// applyEffects: applies all 4 trait multipliers and returns RAW (unclamped) stats.
// Caller must check sanity < 0 for americanPsycho before calling clampStats.
export const applyEffects = (stats, rawEffects, multipliers = {}, isSocialActivity = false) => {
  const effects = { ...rawEffects };
  const {
    competenceMultiplier   = 1,
    sanityLossReduction    = 0,
    charismaMultiplierLooks = 1,
    reputationMultiplier   = 1,
  } = multipliers;

  // Intelligence → Competence gains only
  if (effects.competence != null && effects.competence > 0) {
    effects.competence = Math.round(effects.competence * competenceMultiplier);
  }
  // Grit → Sanity losses only (losses become smaller)
  if (effects.sanity != null && effects.sanity < 0) {
    effects.sanity = Math.round(effects.sanity * (1 - sanityLossReduction));
  }
  // Looks → Charisma gains; social activities get extra +0.5× boost
  if (effects.charisma != null && effects.charisma > 0) {
    const mult = isSocialActivity
      ? charismaMultiplierLooks + 0.5
      : charismaMultiplierLooks;
    effects.charisma = Math.round(effects.charisma * mult);
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

export const mergeDeltas = (a, b) => {
  const out = { ...a };
  Object.entries(b).forEach(([k, v]) => { out[k] = (out[k] || 0) + v; });
  return out;
};

// ─────────────────────────────────────────────
// ACTIVITY PROCESSING
// ─────────────────────────────────────────────
// Returns { rawStats, effects, riskMessage } — rawStats is unclamped.
export const processActivity = (activityDef, currentStats, multipliers) => {
  let effects = { ...activityDef.effects };
  let riskMessage = null;

  if (activityDef.risk && Math.random() < activityDef.risk.chance) {
    Object.entries(activityDef.risk.effect).forEach(([k, v]) => {
      effects[k] = (effects[k] || 0) + v;
    });
    riskMessage = activityDef.risk.label;
  }

  const isSocial = !!activityDef.socialActivity;
  const rawStats = applyEffects(currentStats, effects, multipliers, isSocial);
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
export const calculatePromotionScore = (stats, weights) =>
  (stats.competence * weights.competence) +
  (stats.charisma   * weights.charisma)   +
  (stats.reputation * weights.reputation);

export const checkPromotion = (stats, year, isLegacyHire) => {
  const { stage, stageYear } = getStageInfo(year);
  if (!stage) return null;

  const score = calculatePromotionScore(stats, stage.weights);
  let std = stage.standardThreshold;
  let acc = stage.acceleratedThreshold;
  if (isLegacyHire) { std -= LEGACY_HIRE_STANDARD_REDUCTION; acc -= LEGACY_HIRE_ACCELERATED_REDUCTION; }

  if (stageYear === 2 && score >= acc) return { type: 'accelerated', score: Math.round(score), threshold: acc, stage };
  if (stageYear === 3 && score >= std) return { type: 'standard',    score: Math.round(score), threshold: std, stage };
  if (stageYear === 3 && score < std)  return { type: 'fail',        score: Math.round(score), threshold: std, stage };
  return null;
};

export const checkPartnerPromotion = (stats, isLegacyHire, stageYear) => {
  const score = calculatePromotionScore(stats, PARTNER_WEIGHTS);
  let std = PARTNER_STANDARD_THRESHOLD;
  let acc = PARTNER_ACCELERATED_THRESHOLD;
  if (isLegacyHire) { std -= LEGACY_HIRE_STANDARD_REDUCTION; acc -= LEGACY_HIRE_ACCELERATED_REDUCTION; }
  if (stageYear === 2 && score >= acc) return { type: 'accelerated', score: Math.round(score), threshold: acc };
  if (stageYear === 3 && score >= std) return { type: 'standard',    score: Math.round(score), threshold: std };
  if (stageYear === 3)                 return { type: 'fail',        score: Math.round(score), threshold: std };
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

  const liCount = yearActs.filter(a => a.activityId === 'linkedInPosting').length;
  if (liCount >= 4) earned.push('linkedInInfluencer');
  if (quarterEndSanities.length === 4 && quarterEndSanities.every(s => s >= 70)) earned.push('actuallyOkay');

  const maxDateCount = Math.max(...Object.values(dateHistory));
  if (maxDateCount >= 3) earned.push('taken');

  return [...new Set(earned)];
};

// ─────────────────────────────────────────────
// SALARY, TAX & HOUSING
// ─────────────────────────────────────────────
export const ANNUAL_SALARY_BY_STAGE = {
  analyst:   75_000,
  associate: 180_000,
  vp:        300_000,
  director:  500_000,
};

export const getTaxRate = (stageId) =>
  (ANNUAL_SALARY_BY_STAGE[stageId] || 75_000) > 120_000 ? 0.45 : 0.30;

export const getQuarterlySalary = (stageId) => {
  const annual      = ANNUAL_SALARY_BY_STAGE[stageId] || 75_000;
  const gross       = Math.round(annual / 4);
  const taxRate     = getTaxRate(stageId);
  const taxWithheld = Math.round(gross * taxRate);
  return { gross, taxRate, taxWithheld, net: gross - taxWithheld };
};

// Competence now scales to 500, so bonus scales against 500
export const computeAnnualBonus = (stageId, competence, roll) => {
  const annual      = ANNUAL_SALARY_BY_STAGE[stageId] || 75_000;
  const taxRate     = getTaxRate(stageId);
  const gross       = Math.round((competence / 500) * annual * roll);
  const taxWithheld = Math.round(gross * taxRate);
  return { gross, taxWithheld, net: gross - taxWithheld, taxRate };
};

export const formatDollars = (n) => {
  if (n >= 99_999_999) return '$99,999,999+';
  const abs = Math.abs(Math.round(n));
  return (n < 0 ? '-$' : '$') + abs.toLocaleString('en-US');
};

export const HOUSING = {
  studio: {
    id: 'studio', label: 'Studio Apartment',
    monthlyRent: 3_500, quarterlyRent: 10_500, sanityMod: 0,
    flavour: "It's small. The walls are thin. You can hear your neighbour's alarm.",
  },
  oneBed: {
    id: 'oneBed', label: 'One-Bedroom Flat',
    monthlyRent: 6_000, quarterlyRent: 18_000, sanityMod: 0.15,
    flavour: 'You have a door for the bedroom. This matters more than you expected.',
  },
  mansion: {
    id: 'mansion', label: 'Mansion',
    monthlyRent: 20_000, quarterlyRent: 60_000, sanityMod: 0.35,
    flavour: "The bathtub alone has done more for your mental health than three years of therapy.",
  },
  penthouse: {
    id: 'penthouse', label: 'Penthouse (Owned)',
    monthlyRent: 0, quarterlyRent: 0, sanityMod: 0.35,
    flavour: "Owned outright. Your London W1 address is doing more for your brand than your entire LinkedIn presence.",
  },
};

export const getQuarterlyRent = (housingTier, mansionOwned) => {
  if (housingTier === 'penthouse') return 0;
  if (housingTier === 'mansion' && mansionOwned) return 0;
  return HOUSING[housingTier]?.quarterlyRent ?? HOUSING.studio.quarterlyRent;
};

export const applyHousingSanityMod = (sanityGain, housingTier) => {
  if (sanityGain <= 0) return sanityGain;
  const mod = HOUSING[housingTier]?.sanityMod ?? 0;
  return mod > 0 ? Math.round(sanityGain * (1 + mod)) : sanityGain;
};

// ─────────────────────────────────────────────
// ENDING CHECKS
// ─────────────────────────────────────────────
export const checkEndings = (gs) => {
  const {
    stats, currentYear, currentStageId,
    sideProjectMonths, linkedInMonths, eventDChoiceCount,
    consecutiveWeekendQuarters, sanityFloor,
  } = gs;

  // Sanity breakdown (hits or drops below grit-based floor)
  if (stats.sanity <= (sanityFloor || 5)) return 'mentalHealthCollapse';
  // Fired for terminal underperformance
  if (stats.competence < 40 && stats.reputation < 25) return 'fired';
  // Golden handcuffs
  if (stats.wealth >= 500_000 && stats.sanity < 20 && currentStageId === 'director') return 'goldenHandcuffs';
  // Early retirement: very wealthy but mentally depleted
  if (stats.wealth > 10_000_000 && stats.sanity < 30) return 'earlyRetirement';
  // Graceful exit
  if (stats.sanity > 85 && stats.wealth > 200_000 && currentYear >= 8 && (consecutiveWeekendQuarters || 0) >= 4) return 'gracefulExit';
  if (sideProjectMonths >= 6) return 'founder';
  if (linkedInMonths >= 8 && stats.charisma > 200) return 'linkedInInfluencer';
  if (stats.reputation > 300 && eventDChoiceCount >= 5) return 'regulator';
  return null;
};

// ─────────────────────────────────────────────
// SPECIAL EVENT TRIGGERS
// ─────────────────────────────────────────────
export const shouldFireWakeUpCall = (year, quarter) => year === 4 && quarter === 4;

export const shouldFireLegacyHireEvent = (year, quarter, isLegacyHire, legacyPromotionCount, legacyHireEventFired) =>
  isLegacyHire && year === 10 && quarter === 2 && legacyPromotionCount >= 3 && !legacyHireEventFired;
