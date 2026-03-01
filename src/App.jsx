import { useState, useEffect } from 'react';
import IntroScreen    from './components/IntroScreen';
import CharacterSelect from './components/CharacterSelect';
import TraitAllocation from './components/TraitAllocation';
import OnboardingCard  from './components/OnboardingCard';
import MainGame        from './components/MainGame';
import GameEnding      from './components/GameEnding';
import { calculateStartingStats } from './gameData';
import { getQuarterlyRent } from './gameEngine';
import './App.css';

export const SCREENS = {
  INTRO:      'intro',
  CHARACTER:  'characterSelect',
  TRAITS:     'traitAllocation',
  ONBOARDING: 'onboarding',
  GAME:       'game',
  ENDING:     'ending',
};

const SAVE_KEY = 'ctlg_save_v3';

const buildInitialGameState = (character, traits) => {
  const s = calculateStartingStats(traits);

  // Housing setup — isRichLegacy starts in the penthouse (owned, no rent ever)
  const housingTier  = s.isRichLegacy ? 'penthouse' : 'studio';
  const mansionOwned = false; // penthouse handles rent-free via getQuarterlyRent

  // Deduct Q1 rent from starting wealth
  const q1Rent         = getQuarterlyRent(housingTier, mansionOwned);
  const wealthAfterRent = Math.max(0, s.wealth - q1Rent);

  return {
    // Identity
    characterId:    character.id,
    characterName:  character.name,
    characterPronoun: character.pronoun,
    baseTraits:     traits,
    companyName:    'Goldman Stanley',

    // Stats (wealth in dollars; comp/char/rep scale to 500, sanity to 100)
    stats: {
      competence:  s.competence,
      charisma:    s.charisma,
      reputation:  s.reputation,
      sanity:      s.sanity,
      wealth:      wealthAfterRent,
    },
    sanityFloor:     s.sanityFloor,       // grit / 2 — breakdown threshold
    traitMultipliers: s.traitMultipliers, // permanent growth multipliers
    isLegacyHire:    s.isLegacyHire,
    isRichLegacy:    s.isRichLegacy,

    // Housing
    housingTier,
    mansionOwned,
    quarterStartWealth:   s.wealth,    // pre-rent wealth for salary statement
    quarterlyRentPaid:    q1Rent,
    quarterlyExpensesLog: [],          // [{label, amount}] of one-off spends

    // Wealth tracking
    mummysHelpCount: 0,
    mustRepayMum:    false,
    secretBailout:   false,
    pendingMummysHelp: false,

    // Time
    currentYear:    1,
    currentQuarter: 1,
    currentMonth:   1,
    currentStageId: 'analyst',

    // Tracking
    activityLog:           [],
    monthActivities:       [],
    linkedInMonths:        0,
    sideProjectMonths:     0,
    eventDChoiceCount:     0,
    legacyPromotionCount:  0,
    legacyHireEventFired:  false,
    dateHistory:           { jordan: 0, sam: 0, riley: 0, alex: 0 },
    consecutiveWeekendQuarters: 0,
    weekendThisQuarter:    false,
    sanityDroppedBelow25:  false,
    quarterEndSanities:    [],
    yearStartStats:        null,
    quarterlyHistory:      [],
    titlesEarned:          [],
    allBadgesEarned:       [],

    // Event counters
    eventIndex: 0,

    // Sub-screen flow
    subScreen:         'monthPicker',
    pendingDateForMonth: null,
    currentEvent:      null,
    lastStatChanges:   null,
    salarySummary:     null,
    annualData:        null,
    specialEventType:  null,
    endingId:          null,
  };
};

// ─── Save / Load helpers ───────────────────────────────────────────────────────
const getSaveData = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const hasSaveData = () => getSaveData() !== null;

const persistSave = (payload) => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      ...payload,
      savedAt: new Date().toISOString(),
    }));
  } catch {
    // localStorage may be unavailable in some contexts
  }
};

const clearSave = () => {
  try { localStorage.removeItem(SAVE_KEY); } catch { /* noop */ }
};

// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,     setScreen]     = useState(SCREENS.INTRO);
  const [character,  setCharacter]  = useState(null);
  const [traits,     setTraits]     = useState(null);
  const [gameState,  setGameState]  = useState(null);
  const [saveExists, setSaveExists] = useState(hasSaveData);
  const [saveFlash,  setSaveFlash]  = useState(false); // brief "Saved!" indicator

  // Auto-save whenever in-game state changes
  useEffect(() => {
    if (screen !== SCREENS.GAME || !gameState) return;
    persistSave({ screen, character, traits, gameState });
    setSaveExists(true);
  }, [gameState]); // eslint-disable-line react-hooks/exhaustive-deps

  const goTo = (s) => setScreen(s);

  // ── Manual save (called from game header button) ─────────────────────────
  const handleManualSave = () => {
    persistSave({ screen, character, traits, gameState });
    setSaveExists(true);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  // ── Load game ────────────────────────────────────────────────────────────
  const handleLoadGame = () => {
    const saved = getSaveData();
    if (!saved) return;
    setCharacter(saved.character);
    setTraits(saved.traits);
    setGameState(saved.gameState);
    setScreen(saved.screen || SCREENS.GAME);
  };

  // ── New game flow ─────────────────────────────────────────────────────────
  const handleCharacterSelect = (char) => {
    setCharacter(char);
    goTo(SCREENS.TRAITS);
  };

  const handleTraitConfirm = (t) => {
    setTraits(t);
    goTo(SCREENS.ONBOARDING);
  };

  const handleBeginCareer = () => {
    const gs = buildInitialGameState(character, traits);
    gs.yearStartStats = { ...gs.stats };
    setGameState(gs);
    goTo(SCREENS.GAME);
  };

  const handleEndingReached = (endingId) => {
    setGameState(prev => ({ ...prev, endingId }));
    clearSave();
    setSaveExists(false);
    goTo(SCREENS.ENDING);
  };

  const handleRestart = () => {
    setCharacter(null);
    setTraits(null);
    setGameState(null);
    goTo(SCREENS.INTRO);
  };

  return (
    <div className="app">
      {screen === SCREENS.INTRO && (
        <IntroScreen
          onBegin={() => goTo(SCREENS.CHARACTER)}
          onLoad={handleLoadGame}
          hasSave={saveExists}
        />
      )}
      {screen === SCREENS.CHARACTER && (
        <CharacterSelect onSelect={handleCharacterSelect} />
      )}
      {screen === SCREENS.TRAITS && character && (
        <TraitAllocation character={character} onConfirm={handleTraitConfirm} />
      )}
      {screen === SCREENS.ONBOARDING && character && traits && (
        <OnboardingCard character={character} traits={traits} onBeginCareer={handleBeginCareer} />
      )}
      {screen === SCREENS.GAME && gameState && (
        <MainGame
          gameState={gameState}
          setGameState={setGameState}
          onEnding={handleEndingReached}
          onSave={handleManualSave}
          saveFlash={saveFlash}
        />
      )}
      {screen === SCREENS.ENDING && gameState && (
        <GameEnding endingId={gameState.endingId} gameState={gameState} onRestart={handleRestart} />
      )}
    </div>
  );
}
