import { useState, useEffect } from 'react';
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
import PEIntroScene     from './PEIntroScene';
import PromotionScene   from './PromotionScene';
import SleepInScene    from './SleepInScene';
import MarathonScene   from './MarathonScene';
import {
  getStageInfo, getQuarterLabel, getSeasonLabel,
  processActivity, clampStats, applyEffects, checkEndings,
  checkPromotion, getNextStage,
  computeYearBadges, pickQuarterlyEvent,
  shouldFireLegacyHireEvent,
  mergeDeltas,
  getQuarterlySalary, computeAnnualBonus, formatDollars,
  getQuarterlyRent, getQuarterlyLifestyle, getHousingQuarterlySanityBonus, HOUSING, ANNUAL_SALARY_BY_STAGE,
  getStagePromotionMultiplier,
} from '../gameEngine';
import { ACTIVITIES, DATE_OPTIONS, CAREER_STAGES } from '../gameData';
import { pickQuarterlyItems, PARTNER_GENDER } from '../gameItems';
import LoganScene from './LoganScene';
import PersonalDevNote from './PersonalDevNote';

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
  logan: 25,
};
const HIGH_DECAY_PARTNERS = ['olivia', 'marco', 'anastasia'];
const PARTNER_NAMES = {
  victor: 'Victor Hughes', marco: 'Marco Moretti', david: 'David Li',
  julien: 'Julien Laurent', adira: 'Adira Sharma', anastasia: 'Anastasia Orlova',
  olivia: 'Olivia Beaufort', emily: 'Emily Miller', logan: 'Logan Sterling',
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

const ACTIVE_RELATIONSHIP_STATUSES = ['entangled', 'relationship', 'engaged', 'married'];

function hasActiveRelationship(gs) {
  return !!(gs.relationshipPartnerId && ACTIVE_RELATIONSHIP_STATUSES.includes(gs.relationshipStatus));
}

// Resolve any event whose text/choice labels/effects are functions, injecting game state context
function resolveEvent(event, gs) {
  if (!event) return event;
  const resolvedText = typeof event.text === 'function'
    ? (event.id === 'birthdayDeal'
        ? event.text(PARTNER_NAMES[gs.relationshipPartnerId] ?? 'your date')
        : event.text(gs))
    : event.text;
  const resolvedChoices = event.choices?.map(choice => ({
    ...choice,
    ...(typeof choice.label   === 'function' ? { label:   choice.label(gs)   } : {}),
    ...(typeof choice.effects === 'function' ? { effects: choice.effects(gs) } : {}),
  }));
  return { ...event, text: resolvedText, choices: resolvedChoices ?? event.choices };
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

const COZY_WEDDING_PARTNERS = ['emily', 'david', 'marco'];

const WEDDING_NARRATIVE = {
  emily: (name, partner) =>
    `${name} and ${partner} got married on a Saturday morning at a small venue outside the city. Forty guests. No seating chart disputes — ${name} had built a solver for it the week before and deployed it at 11pm on a Wednesday.\n\nThe vows were genuine. ${name} had written them in a notes app between two calls and a model review, and somehow they were the most honest thing said all year.\n\n${partner} cried. ${name} almost did. The phone stayed in the jacket pocket for the full ceremony, which ${name}'s team would later describe, in a message that arrived during the first dance, as "unprecedented."`,
  david: (name, partner) =>
    `${name} and ${partner} had approached the wedding with characteristic rigour. The venue was selected using a weighted scoring model. The seating plan was stress-tested for social compatibility across three scenarios.\n\n${partner} had insisted on flowers. ${name} had agreed immediately and then spent forty minutes researching seasonal availability and margin uplift at florists within a two-mile radius.\n\nThe ceremony itself was efficient and, by all accounts, beautiful. ${name} kept the phone on silent. It buzzed eleven times. ${name} checked it twice, which ${partner} had pre-approved as part of what they referred to, privately, as the wedding SLA.`,
  marco: (name, partner) =>
    `${name} and ${partner} got married on a beach in Hampshire on a Sunday in late summer. ${partner} had wanted this for two years. ${name} had agreed in principle eighteen months ago and then spent the intervening time quietly hoping the logistics would sort themselves out.\n\nThey did not sort themselves out. ${name} sorted them out, in six days, between a live deal and a board prep, at a level of execution that several guests described as "professionally impressive" and ${partner} described as "just like you."\n\nThe ceremony was warm and unpolished in the best way. ${name}'s phone was off. ${partner} had asked, and ${name} had said yes without checking the calendar first, which ${partner} later said was the most romantic thing about the whole day.`,
  victor: (name, partner) =>
    `${name} and ${partner} got married at a private members' club in Midtown on a Friday evening, because Saturday would have conflicted with a closing dinner and neither of them seriously considered rescheduling the closing dinner.\n\n${name} kept the phone on vibrate throughout the ceremony. By the reception, ${partner} had also checked theirs twice. A Managing Director from ${name}'s floor sent congratulations followed, seventeen seconds later, by a 47-slide deck marked urgent.\n\n${partner} gave a speech that was precise, controlled, and — for those who knew them well — unusually warm. ${name} returned the favour. The room agreed it was an exceptionally well-run event. Three attendees left before dessert to take calls. No one found this unusual.`,
  julien: (name, partner) =>
    `${name} and ${partner} were married at a venue in the West Village, chosen for its discretion as much as its aesthetic. The guest list was curated. The flowers were arranged by someone whose name the florist had not been given.\n\n${partner}'s speech was brief, considered, and exactly right. ${name}'s was longer than planned, because ${name} had not, in the end, been able to edit it down to the original draft. ${partner} smiled throughout in a way that suggested they had expected this.\n\nTwo MDs and a client sent messages during the ceremony. ${name} did not check them until the car ride to the reception, at which point ${partner} observed, mildly, that the ceremony was technically still ongoing. ${name} put the phone away. It was the correct call. Both of them knew it.`,
  adira: (name, partner) =>
    `${name} and ${partner} had negotiated the wedding the way they negotiated everything: directly, without sentiment, and with a shared acknowledgement that the final terms would be better than the opening positions.\n\n${partner} had wanted a large ceremony. ${name} had wanted a small one. They settled on medium, with an efficient programme and a hard stop at ten. The catering was excellent. The speeches ran over, and both of them timed this privately from opposite sides of the room.\n\n${name} kept the phone on and visible throughout the reception. ${partner} did the same. At one point they were both typing simultaneously at the table, on separate matters, and two guests took a photo. It was, by some margin, the most accurate portrait of the relationship anyone had produced.`,
  anastasia: (name, partner) =>
    `${name} and ${partner} were married at a private estate in the Hamptons on a Saturday in late September, a date selected in part because it fell outside earnings season and in part because the light at that hour was, according to ${partner}, exceptional.\n\nThe coverage was extensive. Three publications ran photographs before the ceremony had concluded. ${name}'s phone received 340 notifications between the vows and the first course, which ${name} described to ${partner} as "manageable" and ${partner} described to no one, because ${partner} had already seen it coming.\n\nThe evening was spectacular. ${name} was present for most of it. ${partner} later confirmed, in a tone that permitted no further discussion, that this was enough.`,
  olivia: (name, partner) =>
    `${name} and ${partner} were married in a gallery space in the West Village on a Sunday afternoon in April. ${partner} had designed every detail of the event with the same attention brought to a major acquisition. The flowers referenced a Hockney. The lighting had been consulted on.\n\n${name} had contributed the guest list, the caterer, and a speech that ${partner} had read in advance and quietly revised without comment, returning it as "a suggestion." ${name} had used ${partner}'s version in full.\n\nDuring the reception, an MD sent two messages requesting a revised deck by Tuesday. ${name} replied with "congratulations received, deck Tuesday confirmed," which ${partner} read over ${name}'s shoulder and, after a pause, chose not to address. This, too, was a form of understanding.`,
  logan: (name, partner) =>
    `${name} and ${partner} were married at a private venue in Tribeca on a Friday evening, which ${partner} had selected on the basis that Friday closings were, as he put it, the most efficient deployment of a weekend. ${name} had agreed. They both had.\n\nThe guest list was competitive-adjacent: former colleagues, a smattering of PE principals, two managing directors who had apparently been waiting to see how this turned out. ${partner} gave a speech that was polished, slightly too short, and almost certainly rehearsed. He delivered it like a pitch, which is to say: it was very good.\n\n${name}'s phone stayed in a jacket pocket until the first dance. ${partner}'s lasted until dessert. The room agreed this was progress.\n\nThere were deal toys on the gift table, alongside a card that read: "Finally closing on something that matters." It was from ${partner}'s analyst. They kept it.`,
};

function WeddingScene({ gameState: gs, onDone }) {
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  const partnerId   = gs.relationshipPartnerId;
  const partnerName = PARTNER_NAMES[partnerId] ?? 'your partner';
  const isCozy      = COZY_WEDDING_PARTNERS.includes(partnerId);
  const bgImage     = isCozy ? '/wedding1.png' : '/wedding2.png';
  const narrativeFn = WEDDING_NARRATIVE[partnerId] ?? WEDDING_NARRATIVE.emily;
  const narrative   = narrativeFn(gs.characterName, partnerName);
  const lines       = narrative.split('\n');

  return (
    <div className="proposal-screen" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className="proposal-overlay" style={{ opacity: revealed ? 1 : 0 }} />
      <div
        className="proposal-card"
        style={{ opacity: revealed ? 1 : 0, transform: revealed ? 'translateY(0)' : 'translateY(16px)' }}
      >
        <div className="proposal-tag">THE WEDDING</div>
        <div className="proposal-text">
          {lines.map((line, i) =>
            line === '' ? <br key={i} /> : <p key={i} className="proposal-para">{line}</p>
          )}
        </div>
        <button className="btn btn-primary btn-large proposal-btn" onClick={onDone}>[ CONTINUE ]</button>
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
    // Legacy hire override — maxed familyBackground always gets the prestige date
    if (gs.isRichLegacy) {
      return characterId === 'paige' ? 'julien' : 'anastasia';
    }

    const c = stats.competence || 0;
    const h = stats.charisma   || 0;
    const r = stats.reputation || 0;
    const w = stats.wealth     || 0;

    if (characterId === 'max') {
      if (r > 125)                return 'olivia';
      if (c > 150 && r <= 125)    return 'adira';
      if (h > 125 && w > 10_000)  return 'anastasia';
      return 'emily';
    }

    // Paige — checked in priority order; marco is the fallback
    if (h > 130 && c > 150)   return 'julien';
    if (c > 150)              return 'victor';
    if (r > 130)              return 'david';
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

  const handleMarathonSceneDone = () => {
    update({ subScreen: gs.pendingAfterMarathon || 'quarterlyEvent', pendingAfterMarathon: null });
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

    // --- Grit boost from NYC Marathon (trait change, not a stat)
    let newBaseTraits = gs.baseTraits;
    let newTraitMultipliers = gs.traitMultipliers || {};
    let newMarathonGritGained = gs.marathonGritGained || 0;
    if (activityDef.id === 'nycMarathon' && (activityDef.gritGain || 0) > 0) {
      const currentGained = gs.marathonGritGained || 0;
      const currentGrit   = gs.baseTraits?.grit || 0;
      if (currentGained < 30 && currentGrit < 100) {
        const gain = Math.min(activityDef.gritGain, 30 - currentGained, 100 - currentGrit);
        if (gain > 0) {
          const newGrit = currentGrit + gain;
          newBaseTraits = { ...gs.baseTraits, grit: newGrit };
          newMarathonGritGained = currentGained + gain;
          if (!gs.isRichLegacy) {
            newTraitMultipliers = { ...gs.traitMultipliers, sanityLossReduction: (newGrit - 10) / 200 };
          }
        }
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

      const isEngagedOrMarried = ['engaged', 'married'].includes(gs.relationshipStatus);
      const engagedMult = isEngagedOrMarried ? 2 : 1;
      const baseEffects = isEngagedOrMarried && dateDef.engagedEffects
        ? dateDef.engagedEffects
        : Object.fromEntries(Object.entries(dateDef.effects).map(([k, v]) => [k, v * engagedMult]));
      const dateEffs = { ...baseEffects };
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
    const newQSD = mergeDeltas(gs.quarterlyStatDelta || {}, totalChanges);
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
        quarterlyStatDelta: newQSD,
        pendingDateForMonth: null,
        sleepInChosenThisQuarter: newSleepInChosen,
        baseTraits: newBaseTraits,
        traitMultipliers: newTraitMultipliers,
        marathonGritGained: newMarathonGritGained,
        subScreen: 'monthPicker',
        ...relUpdates,
      });
    } else {
      // Quarter over — bankruptcy if date cost pushed wealth negative
      if (finalStats.wealth < 0) {
        update({ stats: { ...finalStats, wealth: 0 } });
        onEnding(gs.isRichLegacy ? 'backToFamilyBusiness' : 'bankruptcy');
        return;
      }

      // Quarter over — check Mummy's Help, then quarterly event
      const showMummysHelp =
        gs.isRichLegacy &&
        finalStats.wealth < 10_000 &&
        gs.mummysHelpCount < 3 &&
        !gs.pendingMummysHelp;

      // Marathon scene injection: if marathon was chosen in Q3, fire marathonScene first
      const marathonChosen = gs.currentQuarter === 3 && newMonthActivities.includes('nycMarathon');
      const withMarathon = (obj) => {
        if (!marathonChosen) return obj;
        return { ...obj, pendingAfterMarathon: obj.subScreen, subScreen: 'marathonScene' };
      };

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
        quarterlyStatDelta: newQSD,
        pendingDateForMonth: null,
        sleepInChosenThisQuarter: false,
        baseTraits: newBaseTraits,
        traitMultipliers: newTraitMultipliers,
        marathonGritGained: newMarathonGritGained,
        ...relUpdates,
      };

      // Determine the intended next subscreen (may be deferred for date conversation)
      const hadDateThisQuarter = newMonthActivities.includes('goOnDate');

      if (showMummysHelp) {
        const intendedSubScreen = newSleepInChosen ? 'sleepInScene' : 'specialEvent';
        const pendingSleep      = newSleepInChosen ? 'specialEvent' : null;
        if (hadDateThisQuarter && gs.firstEncounterId) {
          update(withMarathon({
            ...baseUpdate,
            specialEventType: 'mummysHelp',
            pendingSleepNext: pendingSleep,
            pendingAfterDate: { subScreen: intendedSubScreen, specialEventType: 'mummysHelp', pendingSleepNext: pendingSleep },
            subScreen: 'dateConversation',
          }));
        } else {
          update(withMarathon({
            ...baseUpdate,
            specialEventType: 'mummysHelp',
            ...(newSleepInChosen
              ? { pendingSleepNext: 'specialEvent', subScreen: 'sleepInScene' }
              : { subScreen: 'specialEvent' }),
          }));
        }
      } else {
        const event = resolveEvent(pickQuarterlyEvent(gs.currentYear, gs.currentQuarter, gs.currentStageId, hasActiveRelationship(gs), gs.activityLog.some(a => a.year === gs.currentYear && a.quarter === gs.currentQuarter && a.activityId === 'therapy'), gs.seenOnceEvents || [], gs.urgentClientOption1Chosen && !(gs.seenOnceEvents || []).includes('headhunterFollowUp') && (gs.currentYear * 4 + gs.currentQuarter) >= ((gs.urgentClientChosenYear || 0) * 4 + (gs.urgentClientChosenQuarter || 0) + 2), { loganDismissed: gs.loganDismissed || false, isPEPath: gs.isPEPath || false }), gs);
        const intendedSubScreen = newSleepInChosen ? 'sleepInScene' : 'quarterlyEvent';
        const pendingSleep      = newSleepInChosen ? 'quarterlyEvent' : null;
        if (hadDateThisQuarter && gs.firstEncounterId) {
          update(withMarathon({
            ...baseUpdate,
            currentEvent: event,
            pendingSleepNext: pendingSleep,
            pendingAfterDate: { subScreen: intendedSubScreen, currentEvent: event, pendingSleepNext: pendingSleep },
            subScreen: 'dateConversation',
          }));
        } else {
          update(withMarathon({
            ...baseUpdate,
            currentEvent: event,
            ...(newSleepInChosen
              ? { pendingSleepNext: 'quarterlyEvent', subScreen: 'sleepInScene' }
              : { subScreen: 'quarterlyEvent' }),
          }));
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
    // Corp Dev accept — skip normal flow and trigger ending immediately
    if (choice.isCorpDevAccept) {
      onEnding('headOfCorpDev');
      return;
    }

    const m = gs.traitMultipliers || {};
    let finalStats = { ...gs.stats };
    const effects = { ...choice.effects };

    // Extract intimacyDelta before applying stat effects — it's not a stat
    const intimacyDelta = effects.intimacyDelta || 0;
    delete effects.intimacyDelta;

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

    let eventDChoiceCount          = gs.eventDChoiceCount + (choice.isD ? 1 : 0);
    let cultureDefyingChoiceCount  = (gs.cultureDefyingChoiceCount || 0) + (choice.isCultureDefying ? 1 : 0);
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

    const relationshipUpdates = intimacyDelta !== 0 ? computeRelationshipUpdates(gs, intimacyDelta) : {};

    // Track once-only events as seen
    const currentEventId = gs.currentEvent?.id;
    const isOnceOnly = gs.currentEvent?.onceOnly || gs.currentEvent?.headhunterFollowUpOnly;
    const seenOnceUpdates = isOnceOnly && currentEventId
      ? { seenOnceEvents: [...(gs.seenOnceEvents || []), currentEventId] }
      : {};

    // Track urgent client option 1 chosen (fires headhunter follow-up 2 quarters later)
    const urgentClientUpdates = choice.isUrgentClientOption1
      ? { urgentClientOption1Chosen: true, urgentClientChosenYear: gs.currentYear, urgentClientChosenQuarter: gs.currentQuarter }
      : {};

    const fullQuarterDelta = mergeDeltas(gs.quarterlyStatDelta || {}, effects);

    const commonUpdate = {
      stats: finalStats,
      eventDChoiceCount,
      cultureDefyingChoiceCount,
      sanityDroppedBelow25: sanityDropped,
      lastStatChanges: { changes: fullQuarterDelta, riskMessage: null, dateFlavour: null },
      quarterlyStatDelta: fullQuarterDelta,
      salarySummary,
      quarterlyExpensesLog: newExpensesLog,
      mustRepayMum: gs.currentQuarter === 4 && gs.mustRepayMum ? false : gs.mustRepayMum,
      ...relationshipUpdates,
      ...seenOnceUpdates,
      ...urgentClientUpdates,
    };

    // After the quarterly event, check if the Logan scene should fire next
    const loganFires = gs.currentQuarter === 4
      && gs.currentYear >= 1 && gs.currentYear <= 5
      && !gs.loganDismissed
      && !gs.isPEPath;

    update({ ...commonUpdate, subScreen: loganFires ? 'loganScene' : 'quarterlySummary' });
  };

  // ── LOGAN SCENE DONE ─────────────────────────────────────────────────────
  const handleLoganDone = (choice) => {
    // choice is null for Y1/Y4 (narrative only); a choice object for Y2, Y3, Y5

    if (!choice) {
      // Y1–Y4: nothing to resolve
      update({ subScreen: 'quarterlySummary' });
      return;
    }

    const m = gs.traitMultipliers || {};
    const raw = { ...choice.effects };
    if (raw.competence > 0) raw.competence = Math.round(raw.competence * (m.competenceMultiplier || 1));
    if (raw.sanity    < 0) raw.sanity      = Math.round(raw.sanity * (1 - (m.sanityLossReduction || 0)));
    if (raw.charisma  > 0) raw.charisma    = Math.round(raw.charisma * (m.charismaMultiplierLooks || 1));

    let newStats = { ...gs.stats };
    Object.entries(raw).forEach(([k, v]) => { newStats[k] = (newStats[k] || 0) + v; });
    newStats = clampStats(newStats);

    if (choice.isLoganY2 || choice.isLoganY3) {
      // Y2/Y3 choices — just apply stats, keep Logan active for future years
      update({ stats: newStats, subScreen: 'quarterlySummary' });
      return;
    }

    if (choice.isLoganY5Accept) {
      if (hasActiveRelationship(gs)) {
        const beType = gs.relationshipStatus === 'married' ? 'divorce'
          : ['relationship', 'engaged'].includes(gs.relationshipStatus) ? 'breakup' : 'ghosted';
        update({ stats: newStats, loganDismissed: true, breakupEventType: beType, pendingAfterBreakup: 'quarterlySummary', subScreen: 'breakupScene' });
      } else if (gs.stats.charisma > 250) {
        update({ stats: newStats, relationshipPartnerId: 'logan', relationshipStatus: 'entangled', relationshipIntimacy: INTIMACY_START.logan, firstEncounterId: 'logan', dateUnlocked: true, subScreen: 'quarterlySummary' });
      } else {
        // Low charisma — Logan ghosts after the night
        update({ stats: newStats, loganDismissed: true, subScreen: 'quarterlySummary' });
      }
      return;
    }

    // Decline or laugh — dismiss Logan, apply charisma/sanity boost
    update({ stats: newStats, loganDismissed: true, subScreen: 'quarterlySummary' });
  };

  // ── PERSONAL DEV NOTE DONE ───────────────────────────────────────────────
  const handlePersonalDevNoteDone = (option) => {
    if (option === 'startup') {
      const endingId = gs.baseTraits.streetSmart < 39 && gs.stats.competence < 400
        ? 'startupBust' : 'startupSuccess';
      onEnding(endingId);
      return;
    }

    if (option === 'sabotage') {
      const rawStats   = applyEffects(gs.stats, { competence: 40, sanity: -30 }, gs.traitMultipliers, gs.currentYear);
      const finalStats = clampStats(rawStats);
      update({
        stats: finalStats,
        pendingAfterPersonalDevNote: null,
        subScreen: gs.pendingAfterPersonalDevNote || 'monthPicker',
      });
      return;
    }

    if (option === 'pe') {
      const peItems = pickQuarterlyItems(gs.currentStageId);
      update({
        companyName:                'Darkstone & Partners',
        isPEPath:                   true,
        salaryMultiplier:           1.2,
        promoReqMultiplier:         1.1,
        currentYear:                gs.currentYear + 1,
        currentQuarter:             1,
        currentMonth:               1,
        monthActivities:            [],
        yearStartStats:             { ...gs.stats },
        quarterEndSanities:         [],
        sanityDroppedBelow25:       false,
        annualData:                 null,
        quarterlyStatDelta:         {},
        quarterlyItems:             peItems,
        itemPurchasedThisQuarter:   false,
        pendingAfterPersonalDevNote: null,
        subScreen:                  'peIntro',
      });
      return;
    }

    // Stay: proceed normally to Q4
    update({
      pendingAfterPersonalDevNote: null,
      subScreen: gs.pendingAfterPersonalDevNote || 'monthPicker',
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

    const newLowSanityQ = quarterEndSanity < 40 ? (gs.lowSanityQuarters || 0) + 1 : 0;

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
    const cozyPartner       = ['emily', 'david', 'marco'].includes(gs.relationshipPartnerId);
    const proposalWealthMin = cozyPartner ? 175_000 : 250_000;
    const canPropose =
      !breakupEventType &&
      !gs.proposalTriggered &&
      (decayUpdates.relationshipStatus ?? gs.relationshipStatus) === 'relationship' &&
      gs.relationshipIntimacy > 100 &&
      gs.stats.wealth > proposalWealthMin &&
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
        onEnding(gs.isRichLegacy ? 'backToFamilyBusiness' : 'bankruptcy');
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

      // Early ghosted: Y2 Q3, encounter done but player never went on a date
      const earlyGhostedFired =
        gs.currentYear === 2 && gs.currentQuarter === 3 &&
        !!gs.firstEncounterId && !gs.relationshipPartnerId &&
        !gs.activityLog.some(a => a.year === 2 && a.activityId === 'goOnDate');

      const effectiveBreakupType = earlyGhostedFired ? 'earlyGhosted' : breakupEventType;
      const baseNextSub  = effectiveBreakupType ? 'breakupScene' : normalNextSub;
      const afterBreakup = effectiveBreakupType ? normalNextSub : null;

      // Personal Dev Note fires after Q3 of Year 4 (first Associate year), before Q4
      const firePersonalDevNote = gs.currentYear === 4 && gs.currentQuarter === 3 && !effectiveBreakupType;
      const effectiveNextSub       = firePersonalDevNote ? 'personalDevNote' : baseNextSub;
      const pendingAfterPersonalDev = firePersonalDevNote ? baseNextSub : null;

      const nextStageId     = gs.currentStageId; // stage doesn't change mid-year
      const newQuarterItems = pickQuarterlyItems(nextStageId);

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
        quarterlyStatDelta: {},
        pendingMummysHelp: triggerMummy ? true : gs.pendingMummysHelp,
        sleepInChosenThisQuarter: false,
        quarterlyItems: newQuarterItems,
        itemPurchasedThisQuarter: false,
        subScreen:                   effectiveNextSub,
        specialEventType:            (!canPropose && !weddingFires && needsEncounter) ? null : nextEventType,
        pendingFirstEncounterId:     encounterId,
        pendingNextSubScreen:        (canPropose || weddingFires) ? (needsEncounter ? 'firstEncounter' : nextSubScreen) : (needsEncounter ? nextSubScreen : null),
        pendingNextSpecialEventType: needsEncounter ? nextEventType : null,
        breakupEventType:             effectiveBreakupType || null,
        pendingAfterBreakup:          afterBreakup,
        pendingAfterPersonalDevNote:  pendingAfterPersonalDev,
        ...(earlyGhostedFired ? { relationshipPartnerId: gs.firstEncounterId } : {}),
        ...effectiveDecayUpdates,
      });
    }
  };

  // ── PROPOSAL SCENE DONE ──────────────────────────────────────────────────
  const handleProposalDone = () => {
    const cozyPartner = ['emily', 'david', 'marco'].includes(gs.relationshipPartnerId);
    const totalCost   = cozyPartner ? 80_000 : 150_000;
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
  const BREAKUP_SANITY_PENALTY = { ghosted: 25, breakup: 50, quietSeparation: 50, divorce: 75, earlyGhosted: 15 };

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

    const earlyGhosted = gs.breakupEventType === 'earlyGhosted';
    const extraReset = earlyGhosted
      ? { firstEncounterId: null, dateUnlocked: false }
      : {};

    if (newSanity <= 0) {
      update({ stats: { ...gs.stats, sanity: 0 }, ...resetRel, ...extraReset });
      onEnding(gs.isRichLegacy ? 'backToFamilyBusiness' : 'mentalBreakdown');
      return;
    }

    const pendingSub = gs.pendingAfterBreakup || 'monthPicker';
    update({
      stats: { ...gs.stats, sanity: newSanity },
      ...resetRel,
      ...extraReset,
      subScreen: pendingSub,
    });
  };

  // ── ITEM PURCHASE ────────────────────────────────────────────────────────
  const handleItemPurchase = (item, choice) => {
    // choice: 'use' (keep for self) or 'gift' (give to active date)
    const newWealth = gs.stats.wealth - item.cost;
    if (newWealth < 0) return; // shouldn't happen, UI blocks it

    let statDeltas = {};
    let intimacyDelta = 0;

    if (choice === 'gift' && item.giftEffects) {
      intimacyDelta = item.giftEffects.intimacy ?? 0;
    } else if (choice === 'use' && item.selfEffects) {
      statDeltas = { ...item.selfEffects };
    }

    const newStats = clampStats({
      ...gs.stats,
      wealth:     newWealth,
      competence: (gs.stats.competence  || 0) + (statDeltas.competence  || 0),
      charisma:   (gs.stats.charisma    || 0) + (statDeltas.charisma    || 0),
      reputation: (gs.stats.reputation  || 0) + (statDeltas.reputation  || 0),
      sanity:     (gs.stats.sanity      || 0) + (statDeltas.sanity      || 0),
    });

    const newIntimacy = intimacyDelta > 0
      ? Math.min(200, (gs.relationshipIntimacy || 0) + intimacyDelta)
      : gs.relationshipIntimacy;

    update({
      stats: newStats,
      itemPurchasedThisQuarter: true,
      ...(intimacyDelta > 0 ? { relationshipIntimacy: newIntimacy } : {}),
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

    if (promotionResult) {
      if (promotionResult.type === 'fail') {
        if (gs.isRichLegacy) {
          onEnding('backToFamilyBusiness');
        } else if (gs.currentStageId === 'analyst') {
          onEnding('upOrOut');
        } else if (gs.currentStageId === 'associate') {
          const isFO = (gs.baseTraits?.familyBackground ?? 0) > 49;
          onEnding(isFO ? 'friendsFO' : 'upOrOut');
        } else if (gs.currentStageId === 'vp') {
          const isFO = (gs.baseTraits?.familyBackground ?? 0) > 49;
          onEnding(isFO ? 'friendsFO' : 'permanentVP');
        } else {
          const isProfCoach = gs.stats.reputation > 700 && (gs.baseTraits?.streetSmart ?? 0) > 30;
          onEnding(isProfCoach ? 'professionalCoach' : 'headOfInternalStrategy');
        }
        return;
      }
      if (promotionResult.type === 'accelerated' || promotionResult.type === 'standard') {
        if (gs.isLegacyHire) legacyPromotionCount++;
        const next = getNextStage(gs.currentStageId);
        if (next) {
          newStageId = next.id;
          titlesEarned = [...titlesEarned, next.title];
          if (promotionResult.type === 'accelerated') {
            update({ allBadgesEarned: [...new Set([...gs.allBadgesEarned, 'overachiever'])] });
          }
        } else if (gs.currentStageId === 'director') {
          const isMarried = gs.relationshipStatus === 'married';
          const isKing = isMarried && gs.stats.competence > 900 && gs.stats.reputation > 900 && gs.stats.charisma > 900;
          if (isKing) { onEnding('kingOfWallStreet'); return; }
          onEnding(gs.isPEPath ? (isMarried ? 'madePartner' : 'hollowVictory') : (isMarried ? 'madeMD' : 'hollowMD'));
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

    const newYearItems = pickQuarterlyItems(newStageId);
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
      quarterlyStatDelta: {},
      quarterlyItems: newYearItems,
      itemPurchasedThisQuarter: false,
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
      onEnding(gs.isRichLegacy ? 'backToFamilyBusiness' : 'bankruptcy');
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
      quarterlyStatDelta: {},
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
      const event = resolveEvent(pickQuarterlyEvent(gs.currentYear, gs.currentQuarter, gs.currentStageId, hasActiveRelationship(gs), gs.activityLog.some(a => a.year === gs.currentYear && a.quarter === gs.currentQuarter && a.activityId === 'therapy'), gs.seenOnceEvents || [], gs.urgentClientOption1Chosen && !(gs.seenOnceEvents || []).includes('headhunterFollowUp') && (gs.currentYear * 4 + gs.currentQuarter) >= ((gs.urgentClientChosenYear || 0) * 4 + (gs.urgentClientChosenQuarter || 0) + 2)), gs);
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
    <div className="gs-layout" style={gs.isPEPath ? { backgroundImage: "url('/peoffice.png')", backgroundSize: 'cover', backgroundPosition: 'center', backgroundAttachment: 'fixed' } : undefined}>
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
            <MonthlyPicker gameState={gs} onActivityChosen={handleActivityChosen} onItemPurchase={handleItemPurchase} />
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
              housingTier={gs.housingTier}
              currentStageId={gs.currentStageId}
              onChoice={handleEventChoice}
            />
          )}
          {gs.subScreen === 'loganScene' && (
            <LoganScene gameState={gs} onDone={handleLoganDone} />
          )}
          {gs.subScreen === 'quarterlySummary' && (
            <QuarterlySummary gameState={gs} onContinue={handleSummaryDone} />
          )}
          {gs.subScreen === 'personalDevNote' && (
            <PersonalDevNote gameState={gs} onChoice={handlePersonalDevNoteDone} />
          )}
          {gs.subScreen === 'annualReview' && gs.annualData && (
            <AnnualReview
              gameState={gs}
              annualData={gs.annualData}
              onContinue={handleAnnualReviewDone}
            />
          )}
          {gs.subScreen === 'promotionScene' && (
            <PromotionScene newStageId={gs.currentStageId} isPEPath={gs.isPEPath} onDone={handlePromotionSceneDone} />
          )}
          {gs.subScreen === 'sleepInScene' && (
            <SleepInScene gameState={gs} onDone={handleSleepInSceneDone} />
          )}
          {gs.subScreen === 'marathonScene' && (
            <MarathonScene isPEPath={gs.isPEPath} onDone={handleMarathonSceneDone} />
          )}
          {gs.subScreen === 'peIntro' && (
            <PEIntroScene onDone={() => update({ subScreen: 'bonusSpree' })} />
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
        <DateConversationScene
          encounterId={gs.firstEncounterId}
          onDone={handleDateConversationDone}
          isEngaged={['engaged', 'married'].includes(gs.relationshipStatus)}
        />
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
