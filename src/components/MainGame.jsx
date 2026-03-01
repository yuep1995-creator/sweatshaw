import { useEffect } from 'react';
import MonthlyPicker    from './MonthlyPicker';
import DateSelection    from './DateSelection';
import QuarterlyEvent   from './QuarterlyEvent';
import QuarterlySummary from './QuarterlySummary';
import AnnualReview     from './AnnualReview';
import SpecialEvent     from './SpecialEvent';
import HousingSelect    from './HousingSelect';
import {
  getStageInfo, getQuarterLabel, getSeasonLabel,
  processActivity, clampStats, applyEffects, checkEndings,
  checkPromotion, checkPartnerPromotion, getNextStage,
  computeYearBadges, pickQuarterlyEvent,
  shouldFireWakeUpCall, shouldFireLegacyHireEvent,
  mergeDeltas,
  getQuarterlySalary, computeAnnualBonus, formatDollars,
  getQuarterlyRent, applyHousingSanityMod, HOUSING,
} from '../gameEngine';
import { ACTIVITIES, DATE_OPTIONS } from '../gameData';

const STAT_COLOURS = {
  competence: '#4f6ef7', charisma: '#a78bfa',
  reputation: '#f59e0b', sanity: '#22c55e',
};
const STAT_ICONS  = {
  competence: '🧠', charisma: '✨', reputation: '🌟', sanity: '🧘',
};
const STAT_LABELS = {
  competence: 'Competence', charisma: 'Charisma',
  reputation: 'Reputation', sanity: 'Sanity',
};

// Colour for comp/char/rep bars (0–500 scale)
function getHighStatColour(value) {
  if (value <= 100) return '#ef4444'; // red
  if (value <= 200) return '#f59e0b'; // amber
  if (value <= 350) return '#e2e8f0'; // neutral white
  return '#d4a017';                   // gold
}

function getPortrait(characterId, sanity) {
  const base = characterId === 'paige' ? 'paige' : 'max';
  if (sanity < 20) return `/${base === 'paige' ? 'zombiepaige' : 'zombiemax'}.png`;
  if (sanity < 30) return `/${base === 'paige' ? 'tiredpaige' : 'tiredmax'}.png`;
  return `/${base}.png`;
}

function StatBar({ statKey, value }) {
  if (statKey === 'sanity') {
    const pct    = Math.min(value, 100);
    const colour = value < 25 ? '#ef4444' : value < 50 ? '#f59e0b' : '#22c55e';
    const pulse  = value < 25;
    return (
      <div className="gs-stat">
        <div className="gs-stat-header">
          <span className="gs-stat-icon">{STAT_ICONS.sanity}</span>
          <span className="gs-stat-label">Sanity</span>
          <span className="gs-stat-value" style={{ color: colour }}>{value} / 100</span>
        </div>
        <div className="gs-stat-bar-outer">
          <div
            className={`gs-stat-bar-inner ${pulse ? 'pulse-red' : ''}`}
            style={{ width: `${pct}%`, background: colour }}
          />
        </div>
      </div>
    );
  }

  // Competence / Charisma / Reputation — scale to 500
  const pct    = Math.min((value / 500) * 100, 100);
  const colour = getHighStatColour(value);
  return (
    <div className="gs-stat">
      <div className="gs-stat-header">
        <span className="gs-stat-icon">{STAT_ICONS[statKey]}</span>
        <span className="gs-stat-label">{STAT_LABELS[statKey]}</span>
        <span className="gs-stat-value" style={{ color: colour }}>{value} / 500</span>
      </div>
      <div className="gs-stat-bar-outer">
        <div
          className="gs-stat-bar-inner"
          style={{ width: `${pct}%`, background: colour }}
        />
      </div>
    </div>
  );
}

function WealthDisplay({ wealth, housingTier, mansionOwned, currentQuarter }) {
  const nextRent   = getQuarterlyRent(housingTier, mansionOwned);
  const low        = wealth < 20_000;
  const amber      = wealth >= 20_000 && wealth < 50_000;
  const critical   = nextRent > 0 && wealth < nextRent;
  const colour     = critical ? '#ef4444' : low ? '#ef4444' : amber ? '#f59e0b' : '#e2e8f0';
  const nextQ      = currentQuarter < 4 ? currentQuarter + 1 : 1;
  const ownedLabel = housingTier === 'penthouse' ? 'Penthouse owned — no rent'
    : 'Mansion owned — no rent';

  return (
    <div className={`gs-wealth-display ${critical ? 'pulse-red-text' : ''}`}>
      <div className="gs-wealth-header">
        <span className="gs-wealth-icon">💰</span>
        <span className="gs-wealth-label">Balance</span>
        <span className="gs-wealth-val" style={{ color: colour }}>{formatDollars(wealth)}</span>
      </div>
      {nextRent > 0 && (
        <div className={`gs-wealth-rent ${critical ? 'gs-wealth-rent-critical' : ''}`}>
          Next rent: {formatDollars(nextRent)} (Q{nextQ} start)
        </div>
      )}
      {nextRent === 0 && (
        <div className="gs-wealth-rent">{ownedLabel}</div>
      )}
    </div>
  );
}

export default function MainGame({ gameState: gs, setGameState, onEnding, onSave, saveFlash }) {
  const { stage, stageYear, calendarYear } = getStageInfo(gs.currentYear);

  useEffect(() => {
    if (gs.subScreen !== 'monthPicker') return;
    const end = checkEndings(gs);
    if (end) onEnding(end);
  }, [gs.stats, gs.subScreen]); // eslint-disable-line

  const update = (patch) => setGameState(prev => ({ ...prev, ...patch }));

  // ── ACTIVITY CHOSEN ──────────────────────────────────────────────────────
  const handleActivityChosen = (activityDef) => {
    if (activityDef.requiresDateFromYear && gs.currentYear >= activityDef.requiresDateFromYear) {
      update({ pendingDateForMonth: activityDef, subScreen: 'dateSelect' });
      return;
    }
    applyActivityAndAdvance(activityDef, null);
  };

  // ── DATE CHOSEN ──────────────────────────────────────────────────────────
  const handleDateChosen = (dateDef) => {
    applyActivityAndAdvance(gs.pendingDateForMonth, dateDef);
  };

  // ── CORE ACTIVITY PROCESSOR ──────────────────────────────────────────────
  const applyActivityAndAdvance = (activityDef, dateDef) => {
    const m = gs.traitMultipliers || {};

    // --- Wealth: deduct activity cost
    const actCost = activityDef.cost || 0;
    let newWealth = gs.stats.wealth - actCost;

    // --- Side-project income
    let newSPMonths = gs.sideProjectMonths;
    if (activityDef.trackAs === 'sideProjectMonths') {
      newSPMonths++;
      if (newSPMonths >= 6)      newWealth += 2_000;
      else if (newSPMonths >= 3) newWealth += 500;
    }

    // --- Process activity stat effects via trait multipliers (returns raw/unclamped)
    const statsBefore = gs.stats;
    const { rawStats, effects: actEffects, riskMessage } =
      processActivity(activityDef, { ...statsBefore, wealth: newWealth }, m);

    // --- American Psycho check: sanity went below 0
    if (rawStats.sanity < 0) {
      const displayStats = clampStats({ ...rawStats, sanity: 0 });
      update({ stats: displayStats });
      onEnding('americanPsycho');
      return;
    }

    // --- Clamp stats
    let finalStats = clampStats(rawStats);

    // --- Apply housing sanity modifier to gains
    if (actEffects.sanity != null && actEffects.sanity > 0) {
      const boostedGain = applyHousingSanityMod(actEffects.sanity, gs.housingTier);
      const extra = boostedGain - actEffects.sanity;
      if (extra > 0) {
        finalStats.sanity = Math.min(100, finalStats.sanity + extra);
        actEffects.sanity = boostedGain;
      }
    }

    // --- Date effects
    let dateEffects = null;
    let dateFlavour = null;
    let newDateHistory = { ...gs.dateHistory };
    let weekendThisQuarter = gs.weekendThisQuarter;
    let dateCost = 0;

    if (dateDef) {
      dateCost = dateDef.dateCost || 0;
      finalStats.wealth = (finalStats.wealth || 0) - dateCost;

      const dateEffs = { ...dateDef.effects };
      // Dates are social activities — apply social charisma boost
      if (dateEffs.charisma > 0) {
        dateEffs.charisma = Math.round(dateEffs.charisma * ((m.charismaMultiplierLooks || 1) + 0.5));
      }
      if (dateEffs.reputation > 0) {
        dateEffs.reputation = Math.round(dateEffs.reputation * (m.reputationMultiplier || 1));
      }
      if (dateEffs.sanity < 0) {
        dateEffs.sanity = Math.round(dateEffs.sanity * (1 - (m.sanityLossReduction || 0)));
      }
      // Apply housing sanity mod to date sanity gains
      if (dateEffs.sanity > 0) {
        dateEffs.sanity = applyHousingSanityMod(dateEffs.sanity, gs.housingTier);
      }
      Object.entries(dateEffs).forEach(([k, v]) => {
        finalStats[k] = (finalStats[k] || 0) + v;
      });
      finalStats = clampStats(finalStats);
      dateEffects = dateEffs;
      dateFlavour = dateDef.flavour;
      newDateHistory[dateDef.id] = (newDateHistory[dateDef.id] || 0) + 1;
      weekendThisQuarter = true;
    }

    // --- Quarterly expenses log
    const newExpensesLog = [...gs.quarterlyExpensesLog];
    const totalSpend = actCost + dateCost;
    if (totalSpend > 0) {
      newExpensesLog.push({
        label: activityDef.name + (dateDef ? ` + ${dateDef.name}` : ''),
        amount: totalSpend,
      });
    }

    const totalChanges = mergeDeltas(actEffects, dateEffects || {});
    const sanityDropped = gs.sanityDroppedBelow25 || finalStats.sanity < 25;

    const newLog = [...gs.activityLog, {
      year: gs.currentYear, quarter: gs.currentQuarter,
      month: gs.currentMonth, activityId: activityDef.id,
    }];

    let linkedInMonths = gs.linkedInMonths;
    if (activityDef.trackAs === 'linkedInMonths') linkedInMonths++;

    const newMonthActivities = [...gs.monthActivities, activityDef.id];
    const nextMonth = gs.currentMonth + 1;

    if (nextMonth <= 3) {
      update({
        stats: finalStats,
        activityLog: newLog,
        monthActivities: newMonthActivities,
        currentMonth: nextMonth,
        dateHistory: newDateHistory,
        weekendThisQuarter,
        sanityDroppedBelow25: sanityDropped,
        linkedInMonths,
        sideProjectMonths: newSPMonths,
        quarterlyExpensesLog: newExpensesLog,
        lastStatChanges: { changes: totalChanges, riskMessage, dateFlavour },
        pendingDateForMonth: null,
        subScreen: 'monthPicker',
      });
    } else {
      // Quarter over — check Mummy's Help, then quarterly event
      const showMummysHelp =
        gs.isRichLegacy &&
        finalStats.wealth < 10_000 &&
        gs.mummysHelpCount < 3 &&
        !gs.pendingMummysHelp;

      if (showMummysHelp) {
        update({
          stats: finalStats,
          activityLog: newLog,
          monthActivities: newMonthActivities,
          dateHistory: newDateHistory,
          weekendThisQuarter,
          sanityDroppedBelow25: sanityDropped,
          linkedInMonths,
          sideProjectMonths: newSPMonths,
          quarterlyExpensesLog: newExpensesLog,
          lastStatChanges: { changes: totalChanges, riskMessage, dateFlavour },
          pendingDateForMonth: null,
          specialEventType: 'mummysHelp',
          subScreen: 'specialEvent',
        });
      } else {
        const event = pickQuarterlyEvent(gs.currentYear, gs.currentQuarter, gs.currentStageId);
        update({
          stats: finalStats,
          activityLog: newLog,
          monthActivities: newMonthActivities,
          dateHistory: newDateHistory,
          weekendThisQuarter,
          sanityDroppedBelow25: sanityDropped,
          linkedInMonths,
          sideProjectMonths: newSPMonths,
          quarterlyExpensesLog: newExpensesLog,
          lastStatChanges: { changes: totalChanges, riskMessage, dateFlavour },
          pendingDateForMonth: null,
          currentEvent: event,
          subScreen: 'quarterlyEvent',
        });
      }
    }
  };

  // ── QUARTERLY EVENT CHOICE ────────────────────────────────────────────────
  const handleEventChoice = (choice) => {
    const m = gs.traitMultipliers || {};
    let finalStats = { ...gs.stats };
    const effects = { ...choice.effects };

    // Apply trait multipliers to event effects
    if (effects.competence > 0) effects.competence = Math.round(effects.competence * (m.competenceMultiplier || 1));
    if (effects.sanity < 0)     effects.sanity      = Math.round(effects.sanity * (1 - (m.sanityLossReduction || 0)));
    if (effects.charisma > 0)   effects.charisma    = Math.round(effects.charisma * (m.charismaMultiplierLooks || 1));
    if (effects.reputation > 0) effects.reputation  = Math.round(effects.reputation * (m.reputationMultiplier || 1));

    Object.entries(effects).forEach(([k, v]) => { finalStats[k] = (finalStats[k] || 0) + v; });
    finalStats = clampStats(finalStats);

    // Log wealth cost from event choice
    const newExpensesLog = [...gs.quarterlyExpensesLog];
    if (effects.wealth && effects.wealth < 0) {
      newExpensesLog.push({ label: choice.label, amount: Math.abs(effects.wealth) });
    }

    let eventDChoiceCount = gs.eventDChoiceCount + (choice.isD ? 1 : 0);
    const sanityDropped   = gs.sanityDroppedBelow25 || finalStats.sanity < 25;

    // ─── Compute quarterly salary ──────────────────────────────────────────
    const salaryInfo   = getQuarterlySalary(gs.currentStageId);
    let totalDeposited = salaryInfo.net;

    // Q4 annual bonus
    let bonusInfo = null;
    if (gs.currentQuarter === 4) {
      const roll = Math.random();
      bonusInfo = computeAnnualBonus(gs.currentStageId, finalStats.competence, roll);
      totalDeposited += bonusInfo.net;

      // mustRepayMum repayment at Q4
      if (gs.mustRepayMum) {
        finalStats.wealth = Math.max(0, (finalStats.wealth || 0) - 50_000);
        newExpensesLog.push({ label: "Repaid Mum's loan", amount: 50_000 });
      }
    }

    finalStats.wealth = Math.min(99_999_999, (finalStats.wealth || 0) + totalDeposited);

    // Early retirement check — wealth > $10M and sanity < 30 after salary deposit
    if (finalStats.wealth > 10_000_000 && finalStats.sanity < 30) {
      update({ stats: finalStats });
      onEnding('earlyRetirement');
      return;
    }

    const salarySummary = {
      stageId:             gs.currentStageId,
      quarterStartWealth:  gs.quarterStartWealth,
      rentPaid:            gs.quarterlyRentPaid,
      activityExpenses:    gs.quarterlyExpensesLog.reduce((s, e) => s + e.amount, 0)
                           + (effects.wealth && effects.wealth < 0 ? Math.abs(effects.wealth) : 0),
      gross:               salaryInfo.gross,
      taxRate:             salaryInfo.taxRate,
      taxWithheld:         salaryInfo.taxWithheld,
      net:                 salaryInfo.net,
      bonusInfo,
      totalDeposited,
      closingBalance:      finalStats.wealth,
      mustRepayMumRepaid:  gs.currentQuarter === 4 && gs.mustRepayMum,
    };

    update({
      stats: finalStats,
      eventDChoiceCount,
      sanityDroppedBelow25: sanityDropped,
      lastStatChanges: { changes: effects, riskMessage: null, dateFlavour: null },
      salarySummary,
      quarterlyExpensesLog: newExpensesLog,
      mustRepayMum: gs.currentQuarter === 4 && gs.mustRepayMum ? false : gs.mustRepayMum,
      subScreen: 'quarterlySummary',
    });
  };

  // ── QUARTERLY SUMMARY DONE ───────────────────────────────────────────────
  const handleSummaryDone = () => {
    const quarterEndSanity = gs.stats.sanity;
    const newQES           = [...gs.quarterEndSanities, quarterEndSanity];
    const snap             = { year: gs.currentYear, quarter: gs.currentQuarter, stats: { ...gs.stats } };
    const newHistory       = [...gs.quarterlyHistory, snap];

    let consec = gs.consecutiveWeekendQuarters;
    if (gs.weekendThisQuarter) consec++;
    else consec = 0;

    if (gs.currentQuarter === 4) {
      proceedToAnnualReview(newQES, newHistory, consec);
    } else {
      const nextQ    = gs.currentQuarter + 1;
      const isLegacy = shouldFireLegacyHireEvent(
        gs.currentYear, nextQ, gs.isLegacyHire, gs.legacyPromotionCount, gs.legacyHireEventFired
      );

      // Deduct next quarter's rent
      const rent      = getQuarterlyRent(gs.housingTier, gs.mansionOwned);
      const newWealth = gs.stats.wealth - rent;

      if (newWealth < 0) {
        update({ stats: { ...gs.stats, wealth: 0 } });
        onEnding('bankruptcy');
        return;
      }

      const triggerMummy =
        gs.isRichLegacy && newWealth < 10_000 && gs.mummysHelpCount < 3;

      update({
        stats: { ...gs.stats, wealth: newWealth },
        currentQuarter: nextQ,
        currentMonth: 1,
        monthActivities: [],
        quarterEndSanities: newQES,
        quarterlyHistory: newHistory,
        consecutiveWeekendQuarters: consec,
        weekendThisQuarter: false,
        salarySummary: null,
        quarterStartWealth: gs.stats.wealth,
        quarterlyRentPaid: rent,
        quarterlyExpensesLog: [],
        pendingMummysHelp: triggerMummy ? true : gs.pendingMummysHelp,
        subScreen: isLegacy ? 'specialEvent' : 'monthPicker',
        specialEventType: isLegacy ? 'legacyHire' : null,
      });
    }
  };

  const proceedToAnnualReview = (qes, history, consec) => {
    const badgesThisYear = computeYearBadges({
      stats: gs.stats,
      yearStartStats: gs.yearStartStats,
      activityLog: gs.activityLog,
      year: gs.currentYear,
      sanityDroppedBelow25: gs.sanityDroppedBelow25,
      quarterEndSanities: qes,
      dateHistory: gs.dateHistory,
    });

    let promotionResult = null;
    if (gs.currentStageId === 'director') {
      promotionResult = checkPartnerPromotion(gs.stats, gs.isLegacyHire, getStageInfo(gs.currentYear).stageYear);
    } else {
      promotionResult = checkPromotion(gs.stats, gs.currentYear, gs.isLegacyHire);
    }

    const wakeUpCall = shouldFireWakeUpCall(gs.currentYear, 4);

    update({
      quarterEndSanities: qes,
      quarterlyHistory: history,
      consecutiveWeekendQuarters: consec,
      weekendThisQuarter: false,
      salarySummary: null,
      annualData: {
        year: gs.currentYear,
        yearStartStats: gs.yearStartStats,
        endStats: { ...gs.stats },
        badgesThisYear,
        promotionResult,
        wakeUpCall,
      },
      subScreen: 'annualReview',
      allBadgesEarned: [...new Set([...gs.allBadgesEarned, ...badgesThisYear])],
    });
  };

  // ── ANNUAL REVIEW DONE → HOUSING SELECT ──────────────────────────────────
  const handleAnnualReviewDone = (choice) => {
    const { promotionResult } = gs.annualData;
    let newStageId           = gs.currentStageId;
    let legacyPromotionCount = gs.legacyPromotionCount;
    let titlesEarned         = [...gs.titlesEarned];

    if (gs.annualData.wakeUpCall && choice?.wakeUpCallOption === 'pe') {
      update({
        companyName: 'Harrington Capital',
        currentYear: gs.currentYear + 1,
        currentQuarter: 1,
        currentMonth: 1,
        monthActivities: [],
        yearStartStats: { ...gs.stats },
        quarterEndSanities: [],
        sanityDroppedBelow25: false,
        annualData: null,
        subScreen: 'housingSelect',
      });
      return;
    }

    if (promotionResult) {
      if (promotionResult.type === 'fail') { onEnding('obsolescence'); return; }
      if (promotionResult.type === 'accelerated' || promotionResult.type === 'standard') {
        if (gs.isLegacyHire) legacyPromotionCount++;
        if (gs.annualData.wakeUpCall && gs.currentStageId === 'director') {
          onEnding(gs.stats.reputation < 120 ? 'hollowVictory' : 'madePartner');
          return;
        }
        const next = getNextStage(gs.currentStageId);
        if (next) {
          newStageId = next.id;
          titlesEarned = [...titlesEarned, next.title];
          if (promotionResult.type === 'accelerated') {
            update({ allBadgesEarned: [...new Set([...gs.allBadgesEarned, 'overachiever'])] });
          }
        } else if (gs.currentStageId === 'director') {
          onEnding(gs.stats.reputation < 120 ? 'hollowVictory' : 'madePartner');
          return;
        }
      }
    }

    const end = checkEndings({ ...gs, currentStageId: newStageId });
    if (end) { onEnding(end); return; }

    update({
      currentYear: gs.currentYear + 1,
      currentQuarter: 1,
      currentMonth: 1,
      monthActivities: [],
      currentStageId: newStageId,
      titlesEarned,
      legacyPromotionCount,
      yearStartStats: { ...gs.stats },
      quarterEndSanities: [],
      sanityDroppedBelow25: false,
      annualData: null,
      subScreen: 'housingSelect',
    });
  };

  // ── HOUSING CHOSEN ────────────────────────────────────────────────────────
  const handleHousingChosen = (tier) => {
    const mansionOwned = tier === 'mansion' && gs.isRichLegacy;
    const rent         = getQuarterlyRent(tier, mansionOwned);
    const newWealth    = gs.stats.wealth - rent;

    if (newWealth < 0) {
      update({ stats: { ...gs.stats, wealth: 0 }, housingTier: tier, mansionOwned });
      onEnding('bankruptcy');
      return;
    }

    const triggerMummy =
      gs.isRichLegacy && newWealth < 10_000 && gs.mummysHelpCount < 3;

    update({
      housingTier: tier,
      mansionOwned,
      stats: { ...gs.stats, wealth: newWealth },
      quarterStartWealth: gs.stats.wealth,
      quarterlyRentPaid: rent,
      quarterlyExpensesLog: [],
      pendingMummysHelp: triggerMummy ? true : gs.pendingMummysHelp,
      subScreen: 'monthPicker',
    });
  };

  // ── SPECIAL EVENT DONE ───────────────────────────────────────────────────
  const handleSpecialEventDone = (result) => {
    const m = gs.traitMultipliers || {};
    const statChanges = result?.statChanges || {};
    const flags       = result?.flags || {};

    // Apply trait multipliers to special event stat changes
    const scaledChanges = { ...statChanges };
    if (scaledChanges.competence > 0) scaledChanges.competence = Math.round(scaledChanges.competence * (m.competenceMultiplier || 1));
    if (scaledChanges.sanity < 0)     scaledChanges.sanity      = Math.round(scaledChanges.sanity * (1 - (m.sanityLossReduction || 0)));
    if (scaledChanges.charisma > 0)   scaledChanges.charisma    = Math.round(scaledChanges.charisma * (m.charismaMultiplierLooks || 1));
    if (scaledChanges.reputation > 0) scaledChanges.reputation  = Math.round(scaledChanges.reputation * (m.reputationMultiplier || 1));

    const newStats = clampStats(
      Object.entries(scaledChanges).reduce(
        (acc, [k, v]) => ({ ...acc, [k]: (acc[k] || 0) + v }),
        { ...gs.stats }
      )
    );

    const isMummy = gs.specialEventType === 'mummysHelp';

    if (isMummy) {
      const event = pickQuarterlyEvent(gs.currentYear, gs.currentQuarter, gs.currentStageId);
      update({
        stats: newStats,
        mummysHelpCount: gs.mummysHelpCount + 1,
        mustRepayMum: flags.mustRepayMum ?? gs.mustRepayMum,
        secretBailout: flags.secretBailout ?? gs.secretBailout,
        specialEventType: null,
        currentEvent: event,
        subScreen: 'quarterlyEvent',
      });
    } else {
      update({
        stats: newStats,
        legacyHireEventFired: gs.specialEventType === 'legacyHire' ? true : gs.legacyHireEventFired,
        specialEventType: null,
        subScreen: 'monthPicker',
      });
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  const nextQRent = getQuarterlyRent(gs.housingTier, gs.mansionOwned);
  const criticalBalance = nextQRent > 0 && gs.stats.wealth < nextQRent;

  return (
    <div className="gs-layout">
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="gs-header">
        <div className="gs-header-left">
          <img src="/gslogo.png" alt="Goldman Stanley" className="gs-header-logo" />
          <span className="gs-header-company">{gs.companyName}</span>
        </div>
        <div className="gs-header-center">
          <span className="gs-header-time">
            {getQuarterLabel(gs.currentQuarter)} {calendarYear}
            <span className="gs-header-season"> — {getSeasonLabel(gs.currentQuarter)}</span>
          </span>
        </div>
        <div className="gs-header-right">
          <span className="gs-header-title">{stage?.title || 'Analyst'}</span>
          <span className="gs-header-track">Year {stageYear} of 3 on track</span>
          <button className={`gs-save-btn ${saveFlash ? 'saved' : ''}`} onClick={onSave}>
            {saveFlash ? '✓ SAVED' : '💾 SAVE'}
          </button>
        </div>
      </header>

      {/* ── BODY ────────────────────────────────────────────────────── */}
      <div className="gs-body">
        {/* Sidebar */}
        <aside className="gs-sidebar">
          <div className="gs-sidebar-portrait">
            <img
              src={getPortrait(gs.characterId, gs.stats.sanity)}
              alt={gs.characterName}
              className="gs-portrait-img"
            />
            {gs.stats.sanity < 30 && (
              <div className="gs-portrait-status">
                {gs.stats.sanity < 20 ? '🧟 CRITICAL' : '😮‍💨 EXHAUSTED'}
              </div>
            )}
          </div>
          <div className="gs-sidebar-name">{gs.characterName}</div>
          <div className="gs-sidebar-company">{gs.companyName}</div>

          {criticalBalance && (
            <div className="gs-balance-warning pulse-red-text">
              ⚠ Balance cannot cover next quarter's rent!
            </div>
          )}

          <div className="gs-stats-list">
            {Object.keys(gs.stats).filter(k => k !== 'wealth').map(k => (
              <StatBar key={k} statKey={k} value={gs.stats[k]} />
            ))}
            <WealthDisplay
              wealth={gs.stats.wealth}
              housingTier={gs.housingTier}
              mansionOwned={gs.mansionOwned}
              currentQuarter={gs.currentQuarter}
            />
          </div>

          {gs.allBadgesEarned.length > 0 && (
            <div className="gs-badges">
              <div className="gs-badges-label">BADGES</div>
              <div className="gs-badges-list">
                {gs.allBadgesEarned.map(id => {
                  const b = { officeFurniture:'🪑', starAssociate:'⭐', spreadsheetWhisperer:'🧠', theGhost:'👻', runningOnFumes:'🫠', linkedInInfluencer:'🤡', actuallyOkay:'🧘', taken:'💌', overachiever:'🏆' };
                  return <span key={id} className="gs-badge-icon" title={id}>{b[id] || '🏅'}</span>;
                })}
              </div>
            </div>
          )}
          <div className="gs-progress-info">
            <div className="gs-progress-label">CAREER PROGRESS</div>
            <div className="gs-progress-year">Year {gs.currentYear} / 12</div>
            <div className="gs-progress-bar-outer">
              <div className="gs-progress-bar-inner" style={{ width: `${(gs.currentYear / 12) * 100}%` }} />
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="gs-main">
          {gs.subScreen === 'monthPicker' && (
            <MonthlyPicker gameState={gs} onActivityChosen={handleActivityChosen} />
          )}
          {gs.subScreen === 'dateSelect' && (
            <DateSelection gameState={gs} onDateChosen={handleDateChosen} />
          )}
          {gs.subScreen === 'quarterlyEvent' && gs.currentEvent && (
            <QuarterlyEvent
              event={gs.currentEvent}
              stats={gs.stats}
              characterId={gs.characterId}
              onChoice={handleEventChoice}
            />
          )}
          {gs.subScreen === 'quarterlySummary' && (
            <QuarterlySummary gameState={gs} onContinue={handleSummaryDone} />
          )}
          {gs.subScreen === 'annualReview' && gs.annualData && (
            <AnnualReview
              gameState={gs}
              annualData={gs.annualData}
              onContinue={handleAnnualReviewDone}
            />
          )}
          {gs.subScreen === 'housingSelect' && (
            <HousingSelect gameState={gs} onHousingChosen={handleHousingChosen} />
          )}
          {gs.subScreen === 'specialEvent' && (
            <SpecialEvent eventType={gs.specialEventType} gameState={gs} onDone={handleSpecialEventDone} />
          )}
        </main>
      </div>
    </div>
  );
}
