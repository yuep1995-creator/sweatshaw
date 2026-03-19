import { useEffect } from 'react';
import FirstEncounterScene from './FirstEncounterScene';
import DateConversationScene from './DateConversationScene';
import ProposalScene from './ProposalScene';
import BreakupScene from './BreakupScene';
import MonthlyPicker    from './MonthlyPicker';
import DateSelection    from './DateSelection';
import QuarterlyEvent   from './QuarterlyEvent';
import QuarterlySummary from './QuarterlySummary';
import AnnualReview     from './AnnualReview';
import SpecialEvent     from './SpecialEvent';
import HousingSelect    from './HousingSelect';
import BonusSpree       from './BonusSpree';
import PromotionScene   from './PromotionScene';
import SleepInScene    from './SleepInScene';
import {
  getStageInfo, getQuarterLabel, getSeasonLabel,
  processActivity, clampStats, applyEffects, checkEndings,
  checkPromotion, getNextStage,
  computeYearBadges, pickQuarterlyEvent,
  shouldFireWakeUpCall, shouldFireLegacyHireEvent,
  mergeDeltas,
  getQuarterlySalary, computeAnnualBonus, formatDollars,
  getQuarterlyRent, getQuarterlyLifestyle, getHousingQuarterlySanityBonus, HOUSING, ANNUAL_SALARY_BY_STAGE,
  getStagePromotionMultiplier,
} from '../gameEngine';
import { ACTIVITIES, DATE_OPTIONS, CAREER_STAGES } from '../gameData';

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

// ── Relationship / intimacy constants ────────────────────────────────────────
const INTIMACY_START = {
  emily: 40, david: 40,
  adira: 25, victor: 25, julien: 25,
  marco: 15, anastasia: 15, olivia: 15,
};
const HIGH_DECAY_PARTNERS = ['olivia', 'marco', 'anastasia'];
const PARTNER_NAMES = {
  victor: 'Victor Hughes', marco: 'Marco Moretti', david: 'David Li',
  julien: 'Julien Laurent', adira: 'Adira Sharma', anastasia: 'Anastasia Orlova',
  olivia: 'Olivia Beaufort', emily: 'Emily Miller',
};

function computeRelationshipUpdates(gs, intimacyDelta) {
  if (!gs.relationshipPartnerId || !gs.relationshipStatus) return {};
  const newIntimacy = Math.max(0, gs.relationshipIntimacy + intimacyDelta);
  let newStatus    = gs.relationshipStatus;
  let everReached  = gs.relationshipEverReachedRelationship;
  if (newIntimacy > 50 && newStatus === 'entangled') {
    newStatus   = 'relationship';
    everReached = true;
  }
  if (newIntimacy <= 50 && newStatus === 'entangled' && everReached) {
    newStatus = 'relationship'; // never revert
  }
  return {
    relationshipIntimacy: newIntimacy,
    relationshipStatus:   newStatus,
    relationshipEverReachedRelationship: everReached,
  };
}

// Colour for comp/char/rep bars (0–999 scale)
function getHighStatColour(value) {
  if (value <= 200) return '#ef4444'; // red
  if (value <= 400) return '#f59e0b'; // amber
  if (value <= 700) return '#e2e8f0'; // neutral white
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
    const pct    = Math.min((value / 200) * 100, 100);
    const colour = value < 50 ? '#ef4444' : value < 100 ? '#f59e0b' : '#22c55e';
    const pulse  = value < 50;
    return (
      <div className="gs-stat">
        <div className="gs-stat-header">
          <span className="gs-stat-icon">{STAT_ICONS.sanity}</span>
          <span className="gs-stat-label">Sanity</span>
          <span className="gs-stat-value">{value}</span>
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

  // Competence / Charisma / Reputation — scale to 999
  const pct    = Math.min((value / 999) * 100, 100);
  const colour = getHighStatColour(value);
  return (
    <div className="gs-stat">
      <div className="gs-stat-header">
        <span className="gs-stat-icon">{STAT_ICONS[statKey]}</span>
        <span className="gs-stat-label">{STAT_LABELS[statKey]}</span>
        <span className="gs-stat-value">{value}</span>
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

function WeddingScene({ gameState: gs, onDone }) {
  const partnerName = PARTNER_NAMES[gs.relationshipPartnerId] ?? 'your partner';
  return (
    <div className="proposal-screen" style={{ backgroundImage: "url('/poshproposal.png')" }}>
      <div className="proposal-card">
        <div className="proposal-tag">THIS YEAR</div>
        <h1 className="proposal-title">You got married. 💐</h1>
        <p className="proposal-body">
          {gs.characterName} and {partnerName} exchanged vows in a ceremony that felt both inevitable and slightly surreal.
          The speeches were too long. The food was excellent. Afterwards, you both agreed it was the best decision you've ever made that didn't involve a spreadsheet.
        </p>
        <button className="btn btn-primary btn-large" onClick={onDone}>[ CONTINUE ]</button>
      </div>
    </div>
  );
}

function HousingUpgradeNotice({ onDone }) {
  return (
    <div className="proposal-screen" style={{ backgroundImage: "url('/poshproposal.png')" }}>
      <div className="proposal-card">
        <div className="proposal-tag">MOVING IN TOGETHER</div>
        <h1 className="proposal-title">Upgrading to a 2-bedroom flat.</h1>
        <p className="proposal-body">
          With the engagement official, you decided it was time to upgrade — a proper two-bedroom flat where your partner can actually move in.
          The extra rent is worth it. You tell yourself this every morning.
        </p>
        <button className="btn btn-primary btn-large" onClick={onDone}>[ CONTINUE ]</button>
      </div>
    </div>
  );
}

const PROMO_STAT_LABELS = { competence: 'Competence', charisma: 'Charisma', reputation: 'Reputation' };

function SidebarPromoPanel({ gs }) {
  const nextStage    = getNextStage(gs.currentStageId);
  if (!nextStage) return null;
  const currentStage = CAREER_STAGES.find(s => s.id === gs.currentStageId);
  if (!currentStage) return null;
  const mult = gs.promoReqMultiplier || 1;
  const reqs = {
    competence: Math.round(currentStage.promoReqs.competence * mult),
    charisma:   Math.round(currentStage.promoReqs.charisma   * mult),
    reputation: Math.round(currentStage.promoReqs.reputation * mult),
  };
  return (
    <div className="gs-promo-panel">
      <div className="gs-promo-heading">NEXT PROMOTION — {nextStage.title.toUpperCase()}</div>
      {Object.entries(reqs).map(([key, required]) => {
        const current = gs.stats[key] || 0;
        const met = current > required;
        return (
          <div key={key} className={`gs-promo-req ${met ? 'met' : 'unmet'}`}>
            <span className="gs-promo-req-label">{PROMO_STAT_LABELS[key]}</span>
            <span className="gs-promo-req-val">{current} / {required}</span>
            <span className="gs-promo-req-icon">{met ? '✓' : '✗'}</span>
          </div>
        );
      })}
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

  // ── FIRST ENCOUNTER ───────────────────────────────────────────────────────
  const resolveFirstEncounterId = (stats, characterId) => {
    const c = stats.competence || 0;
    const h = stats.charisma   || 0;
    const r = stats.reputation || 0;
    const w = stats.wealth     || 0;

    if (characterId === 'max') {
      const top = Math.max(c, h, r);
      if (top === c && c > 150)                    return 'adira';
      if (top === h && h > 150 && w > 10_000)      return 'anastasia';
      if (top === r && r > 175)                    return 'olivia';
      return 'emily';
    }

    // Paige — checked in priority order; marco is the fallback
    const m = Math.max(c, h, r);
    if (m === c)              return 'victor';
    if (m === h && c > 150)   return 'julien';
    if (m === r)              return 'david';
    return 'marco';
  };

  const handleFirstEncounterDone = () => {
    update({
      firstEncounterDone:          true,
      firstEncounterId:            gs.pendingFirstEncounterId,
      dateUnlocked:                true,
      pendingFirstEncounterId:     null,
      subScreen:                   gs.pendingNextSubScreen        || 'monthPicker',
      specialEventType:            gs.pendingNextSpecialEventType || null,
      pendingNextSubScreen:        null,
      pendingNextSpecialEventType: null,
    });
  };

  // ── ACTIVITY CHOSEN ──────────────────────────────────────────────────────
  const handleActivityChosen = (activityDef) => {
    if (activityDef.requiresDateFromYear && gs.currentYear >= activityDef.requiresDateFromYear) {
      if (gs.firstEncounterId) {
        // Only one possible date — skip DateSelection and apply directly
        const matchedDate = DATE_OPTIONS.find(d => d.id === gs.firstEncounterId) || null;
        if (gs.currentYear === 2) update({ yearTwoDateChosen: true });
        applyActivityAndAdvance(activityDef, matchedDate);
      } else {
        update({ pendingDateForMonth: activityDef, subScreen: 'dateSelect' });
      }
      return;
    }
    applyActivityAndAdvance(activityDef, null);
  };

  const handleSleepInSceneDone = () => {
    update({ subScreen: gs.pendingSleepNext || 'quarterlyEvent', pendingSleepNext: null });
  };

  // ── DATE CHOSEN ──────────────────────────────────────────────────────────
  const handleDateChosen = (dateDef, rejected) => {
    if (rejected) {
      // Requirements not met — date turns player down, apply −10 sanity, no date cost
      applyActivityAndAdvance(gs.pendingDateForMonth, {
        ...dateDef,
        dateCost: 0,
        effects: { sanity: -10 },
        flavour: `${dateDef.name} wasn't interested. You stared at your phone longer than you'd care to admit.`,
      });
      return;
    }
    if (gs.currentYear === 2) update({ yearTwoDateChosen: true });
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

    // --- Scale promotionScaled activities (Pitch New Clients) by current stage
    let resolvedDef = activityDef;
    if (activityDef.promotionScaled) {
      const mult = getStagePromotionMultiplier(gs.currentStageId);
      const scaledEffects = Object.fromEntries(
        Object.entries(activityDef.effects).map(([k, v]) => [k, Math.round(v * mult)])
      );
      resolvedDef = { ...activityDef, effects: scaledEffects };
    }

    // --- 20% chance pitch is a success — doubles bonus contribution this quarter
    const pitchSuccess = activityDef.id === 'pitchClients' && Math.random() < 0.20;

    // --- Process activity stat effects via trait multipliers (returns raw/unclamped)
    const statsBefore = gs.stats;
    const { rawStats, effects: actEffects, riskMessage: baseRiskMessage } =
      processActivity(resolvedDef, { ...statsBefore, wealth: newWealth }, m, gs.currentYear);
    const riskMessage = pitchSuccess
      ? `Pitch landed. Bonus contribution doubled this year.${baseRiskMessage ? ` ${baseRiskMessage}` : ''}`
      : baseRiskMessage;

    // --- Burnt out / sanity floor check
    // Rich Legacy: their floor is 30, enforced at quarter-end — don't fire burntOut inline
    if (rawStats.sanity < 0 && !gs.isRichLegacy) {
      const displayStats = clampStats({ ...rawStats, sanity: 0 });
      update({ stats: displayStats });
      onEnding('burntOut');
      return;
    }

    // --- Clamp stats
    let finalStats = clampStats(rawStats);

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
      Object.entries(dateEffs).forEach(([k, v]) => {
        finalStats[k] = (finalStats[k] || 0) + v;
      });
      finalStats = clampStats(finalStats);
      dateEffects = dateEffs;
      dateFlavour = dateDef.flavour;
      newDateHistory[dateDef.id] = (newDateHistory[dateDef.id] || 0) + 1;
      weekendThisQuarter = true;
    }

    // --- Relationship: start or boost intimacy
    let relUpdates = {};
    if (dateDef) {
      if (!gs.relationshipPartnerId) {
        // First ever date — start the relationship
        const startIntimacy = INTIMACY_START[dateDef.id] ?? 20;
        relUpdates = {
          relationshipPartnerId: dateDef.id,
          relationshipIntimacy:  startIntimacy,
          relationshipStatus:    startIntimacy > 50 ? 'relationship' : 'entangled',
          relationshipEverReachedRelationship: startIntimacy > 50,
        };
      } else {
        // Subsequent date — +15 intimacy
        relUpdates = computeRelationshipUpdates(gs, 15);
      }
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
      ...(activityDef.id === 'pitchClients' ? { pitchSuccess } : {}),
    }];

    let linkedInMonths = gs.linkedInMonths;
    if (activityDef.trackAs === 'linkedInMonths') linkedInMonths++;

    const newMonthActivities = [...gs.monthActivities, activityDef.id];
    const nextMonth = gs.currentMonth + 1;

    const newSleepInChosen = gs.sleepInChosenThisQuarter || activityDef.id === 'sleepIn';

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
        sleepInChosenThisQuarter: newSleepInChosen,
        subScreen: 'monthPicker',
        ...relUpdates,
      });
    } else {
      // Quarter over — check Mummy's Help, then quarterly event
      const showMummysHelp =
        gs.isRichLegacy &&
        finalStats.wealth < 10_000 &&
        gs.mummysHelpCount < 3 &&
        !gs.pendingMummysHelp;

      const baseUpdate = {
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
        sleepInChosenThisQuarter: false,
        ...relUpdates,
      };

      // Determine the intended next subscreen (may be deferred for date conversation)
      const hadDateThisQuarter = newMonthActivities.includes('goOnDate');

      if (showMummysHelp) {
        const intendedSubScreen = newSleepInChosen ? 'sleepInScene' : 'specialEvent';
        const pendingSleep      = newSleepInChosen ? 'specialEvent' : null;
        if (hadDateThisQuarter && gs.firstEncounterId) {
          update({
            ...baseUpdate,
            specialEventType: 'mummysHelp',
            pendingSleepNext: pendingSleep,
            pendingAfterDate: { subScreen: intendedSubScreen, specialEventType: 'mummysHelp', pendingSleepNext: pendingSleep },
            subScreen: 'dateConversation',
          });
        } else {
          update({
            ...baseUpdate,
            specialEventType: 'mummysHelp',
            ...(newSleepInChosen
              ? { pendingSleepNext: 'specialEvent', subScreen: 'sleepInScene' }
              : { subScreen: 'specialEvent' }),
          });
        }
      } else {
        const event = pickQuarterlyEvent(gs.currentYear, gs.currentQuarter, gs.currentStageId);
        const intendedSubScreen = newSleepInChosen ? 'sleepInScene' : 'quarterlyEvent';
        const pendingSleep      = newSleepInChosen ? 'quarterlyEvent' : null;
        if (hadDateThisQuarter && gs.firstEncounterId) {
          update({
            ...baseUpdate,
            currentEvent: event,
            pendingSleepNext: pendingSleep,
            pendingAfterDate: { subScreen: intendedSubScreen, currentEvent: event, pendingSleepNext: pendingSleep },
            subScreen: 'dateConversation',
          });
        } else {
          update({
            ...baseUpdate,
            currentEvent: event,
            ...(newSleepInChosen
              ? { pendingSleepNext: 'quarterlyEvent', subScreen: 'sleepInScene' }
              : { subScreen: 'quarterlyEvent' }),
          });
        }
      }
    }
  };

  // ── DATE CONVERSATION DONE ───────────────────────────────────────────────
  const handleDateConversationDone = () => {
    const pend = gs.pendingAfterDate || {};
    update({
      pendingAfterDate: null,
      subScreen:        pend.subScreen    || 'quarterlyEvent',
      ...(pend.currentEvent    ? { currentEvent: pend.currentEvent }       : {}),
      ...(pend.specialEventType ? { specialEventType: pend.specialEventType } : {}),
      ...(pend.pendingSleepNext ? { pendingSleepNext: pend.pendingSleepNext } : {}),
    });
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
    const salMult      = gs.salaryMultiplier || 1;
    const salaryInfo   = getQuarterlySalary(gs.currentStageId);
    const salaryNet    = Math.round(salaryInfo.net * salMult);
    let totalDeposited = salaryNet;

    // Q4 annual bonus
    let bonusInfo = null;
    if (gs.currentQuarter === 4) {
      const rawBonus = computeAnnualBonus(gs.currentStageId, gs.activityLog, gs.currentYear);
      bonusInfo      = { ...rawBonus, net: Math.round(rawBonus.net * salMult) };
      totalDeposited += bonusInfo.net;

      // mustRepayMum repayment at Q4
      if (gs.mustRepayMum) {
        finalStats.wealth = Math.max(0, (finalStats.wealth || 0) - 50_000);
        newExpensesLog.push({ label: "Repaid Mum's loan", amount: 50_000 });
      }
    }

    finalStats.wealth = Math.min(99_999_999, (finalStats.wealth || 0) + totalDeposited);

    // Lifestyle deduction
    const lifestyleCost = getQuarterlyLifestyle(gs.currentStageId, gs.isRichLegacy);
    finalStats.wealth = Math.max(0, finalStats.wealth - lifestyleCost);

    // Flat quarterly sanity bonus from housing
    const housingBonus = getHousingQuarterlySanityBonus(gs.housingTier);
    if (housingBonus > 0) {
      finalStats.sanity = Math.min(200, finalStats.sanity + housingBonus);
      effects.sanity = (effects.sanity || 0) + housingBonus;
    }

    const salarySummary = {
      stageId:             gs.currentStageId,
      quarterStartWealth:  gs.quarterStartWealth,
      rentPaid:            gs.quarterlyRentPaid,
      lifestyleCost,
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
    // Rich Legacy rage-quit: sanity has fallen below their floor of 30
    if (gs.isRichLegacy && gs.stats.sanity < 30) {
      onEnding('backToFamilyBusiness');
      return;
    }

    const quarterEndSanity = gs.stats.sanity;
    const newQES           = [...gs.quarterEndSanities, quarterEndSanity];
    const snap             = { year: gs.currentYear, quarter: gs.currentQuarter, stats: { ...gs.stats } };
    const newHistory       = [...gs.quarterlyHistory, snap];

    let consec = gs.consecutiveWeekendQuarters;
    if (gs.weekendThisQuarter) consec++;
    else consec = 0;

    const newLowSanityQ = quarterEndSanity < 50 ? (gs.lowSanityQuarters || 0) + 1 : 0;

    // ── Relationship: quarterly intimacy decay ────────────────────────────
    const decayAmount = HIGH_DECAY_PARTNERS.includes(gs.relationshipPartnerId) ? -7 : -5;
    const decayUpdates = computeRelationshipUpdates(gs, decayAmount);

    // ── Break-up detection ───────────────────────────────────────────────
    const newIntimacy = decayUpdates.relationshipIntimacy ?? gs.relationshipIntimacy;
    const willHitZero = gs.relationshipPartnerId && gs.relationshipStatus &&
      gs.relationshipIntimacy > 0 && newIntimacy <= 0;
    const quietSep = !willHitZero &&
      gs.relationshipPartnerId && gs.relationshipStatus &&
      !['engaged', 'married'].includes(gs.relationshipStatus) &&
      !gs.proposalTriggered &&
      gs.currentYear === 7 && gs.currentQuarter === 4;
    const breakupEventType = willHitZero
      ? (gs.relationshipStatus === 'married' ? 'divorce'
         : ['relationship', 'engaged'].includes(gs.relationshipStatus) ? 'breakup'
         : 'ghosted')
      : (quietSep ? 'quietSeparation' : null);
    // Don't apply decay to relationship state when break-up fires (keep partner info for scene)
    const effectiveDecayUpdates = breakupEventType ? {} : decayUpdates;

    // ── Proposal check (Years 5-7, any quarter) ─────────────────────────
    const canPropose =
      !breakupEventType &&
      !gs.proposalTriggered &&
      (decayUpdates.relationshipStatus ?? gs.relationshipStatus) === 'relationship' &&
      gs.relationshipIntimacy > 100 &&
      gs.stats.wealth > 250_000 &&
      [5, 6, 7].includes(gs.currentYear);

    if (gs.currentQuarter === 4) {
      proceedToAnnualReview(newQES, newHistory, consec, newLowSanityQ, effectiveDecayUpdates, canPropose, breakupEventType);
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

      const needsEncounter = gs.currentYear === 2 && gs.currentQuarter === 1
        && !gs.firstEncounterDone;
      const encounterId   = needsEncounter ? resolveFirstEncounterId(gs.stats, gs.characterId) : null;
      const nextSubScreen = isLegacy ? 'specialEvent' : 'monthPicker';
      const nextEventType = isLegacy ? 'legacyHire' : null;

      // ── Wedding check: Q2 ending → Q3 of wedding year ─────────────────
      const weddingFires =
        !breakupEventType &&
        gs.relationshipStatus === 'engaged' &&
        gs.weddingYear === gs.currentYear &&
        gs.currentQuarter === 2;

      const normalNextSub = canPropose
        ? 'proposalScene'
        : weddingFires
          ? 'weddingScene'
          : needsEncounter ? 'firstEncounter' : nextSubScreen;

      const effectiveNextSub = breakupEventType ? 'breakupScene' : normalNextSub;
      const afterBreakup = breakupEventType ? normalNextSub : null;

      update({
        stats: { ...gs.stats, wealth: newWealth },
        currentQuarter: nextQ,
        currentMonth: 1,
        monthActivities: [],
        quarterEndSanities: newQES,
        quarterlyHistory: newHistory,
        consecutiveWeekendQuarters: consec,
        lowSanityQuarters: newLowSanityQ,
        weekendThisQuarter: false,
        salarySummary: null,
        quarterStartWealth: gs.stats.wealth,
        quarterlyRentPaid: rent,
        quarterlyExpensesLog: [],
        pendingMummysHelp: triggerMummy ? true : gs.pendingMummysHelp,
        sleepInChosenThisQuarter: false,
        subScreen:                   effectiveNextSub,
        specialEventType:            (!canPropose && !weddingFires && needsEncounter) ? null : nextEventType,
        pendingFirstEncounterId:     encounterId,
        pendingNextSubScreen:        (canPropose || weddingFires) ? (needsEncounter ? 'firstEncounter' : nextSubScreen) : (needsEncounter ? nextSubScreen : null),
        pendingNextSpecialEventType: needsEncounter ? nextEventType : null,
        breakupEventType:            breakupEventType || null,
        pendingAfterBreakup:         afterBreakup,
        ...effectiveDecayUpdates,
      });
    }
  };

  // ── PROPOSAL SCENE DONE ──────────────────────────────────────────────────
  const handleProposalDone = () => {
    const isMax       = gs.characterId === 'max' || gs.characterId !== 'paige';
    const ringCost    = isMax ? 30_000 : 0;
    const depositCost = isMax ? 120_000 : 150_000;
    const totalCost   = ringCost + depositCost;
    const weddingYr   = gs.currentYear + 1;
    const housingNeedsUpgrade = ['studio', 'oneBed'].includes(gs.housingTier);
    const pendingSubScreen = gs.pendingNextSubScreen || 'monthPicker';

    update({
      proposalTriggered: true,
      relationshipStatus: 'engaged',
      weddingYear: weddingYr,
      weddingQuarter: 3,
      stats: { ...gs.stats, wealth: gs.stats.wealth - totalCost },
      housingTier: housingNeedsUpgrade ? 'twoBed' : gs.housingTier,
      pendingNextSubScreen: null,
      subScreen: housingNeedsUpgrade ? 'housingUpgradeNotice' : pendingSubScreen,
      pendingAfterHousingNotice: housingNeedsUpgrade ? pendingSubScreen : null,
    });
  };

  // ── HOUSING UPGRADE NOTICE DONE ──────────────────────────────────────────
  const handleHousingUpgradeNoticeDone = () => {
    update({
      subScreen: gs.pendingAfterHousingNotice || 'monthPicker',
      pendingAfterHousingNotice: null,
    });
  };

  // ── BREAKUP SCENE DONE ───────────────────────────────────────────────────
  const BREAKUP_SANITY_PENALTY = { ghosted: 25, breakup: 50, quietSeparation: 50, divorce: 75 };

  const handleBreakupDone = () => {
    const penalty    = BREAKUP_SANITY_PENALTY[gs.breakupEventType] ?? 50;
    const newSanity  = gs.stats.sanity - penalty;
    const resetRel   = {
      relationshipPartnerId:               null,
      relationshipIntimacy:                0,
      relationshipStatus:                  null,
      relationshipEverReachedRelationship: false,
      proposalTriggered:                   false,
      weddingYear:                         null,
      weddingQuarter:                      null,
      breakupEventType:                    null,
      pendingAfterBreakup:                 null,
    };

    if (newSanity <= 0) {
      update({ stats: { ...gs.stats, sanity: 0 }, ...resetRel });
      onEnding('mentalBreakdown');
      return;
    }

    const pendingSub = gs.pendingAfterBreakup || 'monthPicker';
    update({
      stats: { ...gs.stats, sanity: newSanity },
      ...resetRel,
      subScreen: pendingSub,
    });
  };

  // ── WEDDING SCENE DONE ───────────────────────────────────────────────────
  const handleWeddingDone = () => {
    const pendingSubScreen = gs.pendingNextSubScreen || 'monthPicker';
    update({
      relationshipStatus: 'married',
      pendingNextSubScreen: null,
      subScreen: pendingSubScreen,
    });
  };

  const proceedToAnnualReview = (qes, history, consec, lowSanityQ, decayUpdates = {}, canPropose = false, breakupEventType = null) => {
    const badgesThisYear = computeYearBadges({
      stats: gs.stats,
      yearStartStats: gs.yearStartStats,
      activityLog: gs.activityLog,
      year: gs.currentYear,
      sanityDroppedBelow25: gs.sanityDroppedBelow25,
      quarterEndSanities: qes,
      dateHistory: gs.dateHistory,
    });

    const promotionResult = checkPromotion(gs.stats, gs.currentYear, gs.promoReqMultiplier || 1);

    const wakeUpCall = shouldFireWakeUpCall(gs.currentYear, 4);
    const bonusInfo  = gs.salarySummary?.bonusInfo ?? null;

    update({
      quarterEndSanities: qes,
      quarterlyHistory: history,
      consecutiveWeekendQuarters: consec,
      lowSanityQuarters: lowSanityQ,
      weekendThisQuarter: false,
      salarySummary: null,
      annualData: {
        year: gs.currentYear,
        yearStartStats: gs.yearStartStats,
        endStats: { ...gs.stats },
        badgesThisYear,
        promotionResult,
        wakeUpCall,
        bonusInfo,
        salaryMultiplier: gs.salaryMultiplier || 1,
      },
      subScreen: breakupEventType ? 'breakupScene' : canPropose ? 'proposalScene' : 'annualReview',
      pendingNextSubScreen: canPropose ? 'annualReview' : null,
      breakupEventType: breakupEventType || null,
      pendingAfterBreakup: breakupEventType ? (canPropose ? 'proposalScene' : 'annualReview') : null,
      allBadgesEarned: [...new Set([...gs.allBadgesEarned, ...badgesThisYear])],
      ...decayUpdates,
    });
  };

  // ── ANNUAL REVIEW DONE → HOUSING SELECT ──────────────────────────────────
  const handleAnnualReviewDone = (choice) => {
    const { promotionResult } = gs.annualData;
    let newStageId           = gs.currentStageId;
    let legacyPromotionCount = gs.legacyPromotionCount;
    let titlesEarned         = [...gs.titlesEarned];

    if (gs.annualData.wakeUpCall && choice?.wakeUpCallOption === 'startup') {
      const streetSmart  = gs.baseTraits.streetSmart;
      const competence   = gs.stats.competence;
      const endingId     = streetSmart > 39 && competence > 499 ? 'startupSuccess' : 'startupBust';
      onEnding(endingId);
      return;
    }

    if (gs.annualData.wakeUpCall && choice?.wakeUpCallOption === 'sabotage') {
      const rawStats = applyEffects(gs.stats, { competence: 40, sanity: -30 }, gs.traitMultipliers, gs.currentYear);
      const finalStats = clampStats(rawStats);
      update({
        stats: finalStats,
        currentYear: gs.currentYear + 1,
        currentQuarter: 1,
        currentMonth: 1,
        monthActivities: [],
        yearStartStats: { ...finalStats },
        quarterEndSanities: [],
        sanityDroppedBelow25: false,
        annualData: null,
        subScreen: 'bonusSpree',
      });
      return;
    }

    if (gs.annualData.wakeUpCall && choice?.wakeUpCallOption === 'pe') {
      update({
        companyName:        'Darkstone & Partners',
        isPEPath:           true,
        salaryMultiplier:   1.2,
        promoReqMultiplier: 1.2,
        currentYear: gs.currentYear + 1,
        currentQuarter: 1,
        currentMonth: 1,
        monthActivities: [],
        yearStartStats: { ...gs.stats },
        quarterEndSanities: [],
        sanityDroppedBelow25: false,
        annualData: null,
        subScreen: 'bonusSpree',
      });
      return;
    }

    if (promotionResult) {
      if (promotionResult.type === 'fail') {
        if (gs.isRichLegacy) {
          onEnding('backToFamilyBusiness');
        } else if (gs.currentStageId === 'analyst' || gs.currentStageId === 'associate') {
          onEnding('upOrOut');
        } else if (gs.currentStageId === 'vp') {
          onEnding('permanentVP');
        } else {
          onEnding('headOfInternalStrategy');
        }
        return;
      }
      if (promotionResult.type === 'accelerated' || promotionResult.type === 'standard') {
        if (gs.isLegacyHire) legacyPromotionCount++;
        if (gs.annualData.wakeUpCall && gs.currentStageId === 'director') {
          const lowRep = gs.stats.reputation < 120;
          onEnding(gs.isPEPath ? (lowRep ? 'hollowVictory' : 'madePartner') : (lowRep ? 'hollowMD' : 'madeMD'));
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
          const lowRep = gs.stats.reputation < 120;
          onEnding(gs.isPEPath ? (lowRep ? 'hollowVictory' : 'madePartner') : (lowRep ? 'hollowMD' : 'madeMD'));
          return;
        }
      }
    }

    const end = checkEndings({ ...gs, currentStageId: newStageId });
    if (end) { onEnding(end); return; }

    const wasPromoted = newStageId !== gs.currentStageId;
    // If year 2 ends with no dates taken, lock Date Night permanently
    const newDateUnlocked = gs.currentYear === 2
      ? (gs.yearTwoDateChosen || false)
      : gs.dateUnlocked;

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
      dateUnlocked: newDateUnlocked,
      yearTwoDateChosen: false,
      subScreen: wasPromoted ? 'promotionScene' : 'bonusSpree',
    });
  };

  // ── BONUS SPREE CHOSEN ────────────────────────────────────────────────────
  const handleBonusSpreeChosen = (optionId, cost, sanityGain) => {
    const newWealth = gs.stats.wealth - cost;
    const newSanity = Math.min(200, gs.stats.sanity + sanityGain);
    update({
      stats: { ...gs.stats, wealth: newWealth, sanity: newSanity },
      subScreen: 'housingSelect',
    });
  };

  // ── PROMOTION SCENE DONE ─────────────────────────────────────────────────
  const handlePromotionSceneDone = () => {
    update({ subScreen: 'bonusSpree' });
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
  const { net: quarterlySalaryNet } = getQuarterlySalary(gs.currentStageId);
  const criticalBalance = nextQRent > 0 && (gs.stats.wealth + quarterlySalaryNet) < nextQRent;

  return (
    <div className="gs-layout">
      {/* ── HEADER ──────────────────────────────────────────────────── */}
      <header className="gs-header">
        <div className="gs-header-left">
          <img src={gs.isPEPath ? '/dplogo.png' : '/sclogo.png'} alt={gs.companyName} className="gs-header-logo" />
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
          <div className="gs-sidebar-title">{stage?.title || 'Analyst'} · Year {stageYear}</div>
          <div className="gs-sidebar-salary">{formatDollars(ANNUAL_SALARY_BY_STAGE[gs.currentStageId] || 75_000)} / yr</div>

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
            <SidebarPromoPanel gs={gs} />
          </div>

          {gs.allBadgesEarned.length > 0 && (
            <div className="gs-badges">
              <div className="gs-badges-label">BADGES</div>
              <div className="gs-badges-list">
                {gs.allBadgesEarned.map(id => {
                  const b = { officeFurniture:'🪑', starAssociate:'⭐', spreadsheetWhisperer:'🧠', theGhost:'👻', runningOnFumes:'🫠', actuallyOkay:'🧘', taken:'💌', overachiever:'🏆' };
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

          {gs.relationshipStatus && gs.relationshipPartnerId && (() => {
            const statusLabel = {
              entangled: 'Entangled',
              relationship: 'In a Relationship',
              engaged: 'Engaged 💍',
              married: 'Married 💐',
            }[gs.relationshipStatus] ?? gs.relationshipStatus;
            return (
              <div className="gs-relationship-panel">
                <div className="gs-rel-label">RELATIONSHIP</div>
                <div className="gs-rel-partner">💝 {PARTNER_NAMES[gs.relationshipPartnerId]}</div>
                <div className="gs-rel-intimacy-row">
                  <span className="gs-rel-intimacy-label">Intimacy</span>
                  <span className="gs-rel-intimacy-val">{gs.relationshipIntimacy}</span>
                </div>
                <div className="gs-rel-intimacy-bar-outer">
                  <div
                    className="gs-rel-intimacy-bar-inner"
                    style={{ width: `${Math.min(100, (gs.relationshipIntimacy / 150) * 100)}%` }}
                  />
                </div>
                <div className="gs-rel-status">{statusLabel}</div>
              </div>
            );
          })()}
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
              isPEPath={gs.isPEPath}
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
          {gs.subScreen === 'promotionScene' && (
            <PromotionScene newStageId={gs.currentStageId} onDone={handlePromotionSceneDone} />
          )}
          {gs.subScreen === 'sleepInScene' && (
            <SleepInScene gameState={gs} onDone={handleSleepInSceneDone} />
          )}
          {gs.subScreen === 'bonusSpree' && (
            <BonusSpree gameState={gs} onChosen={handleBonusSpreeChosen} />
          )}
          {gs.subScreen === 'housingSelect' && (
            <HousingSelect gameState={gs} onHousingChosen={handleHousingChosen} />
          )}
          {gs.subScreen === 'specialEvent' && (
            <SpecialEvent eventType={gs.specialEventType} gameState={gs} onDone={handleSpecialEventDone} />
          )}
        </main>
      </div>

      {gs.subScreen === 'firstEncounter' && (
        <FirstEncounterScene encounterId={gs.pendingFirstEncounterId} onDone={handleFirstEncounterDone} />
      )}
      {gs.subScreen === 'dateConversation' && (
        <DateConversationScene encounterId={gs.firstEncounterId} onDone={handleDateConversationDone} />
      )}
      {gs.subScreen === 'breakupScene' && (
        <BreakupScene gameState={gs} onDone={handleBreakupDone} />
      )}
      {gs.subScreen === 'proposalScene' && (
        <ProposalScene gameState={gs} onDone={handleProposalDone} />
      )}
      {gs.subScreen === 'weddingScene' && (
        <WeddingScene gameState={gs} onDone={handleWeddingDone} />
      )}
      {gs.subScreen === 'housingUpgradeNotice' && (
        <HousingUpgradeNotice onDone={handleHousingUpgradeNoticeDone} />
      )}
    </div>
  );
}
