import { useState, useEffect, useRef } from 'react'; // useEffect kept for click sound
import IntroScreen     from './components/IntroScreen';
import CharacterSelect from './components/CharacterSelect';
import TraitAllocation from './components/TraitAllocation';
import OnboardingCard  from './components/OnboardingCard';
import BossIntro       from './components/BossIntro';
import MainGame        from './components/MainGame';
import GameEnding      from './components/GameEnding';
import SlotPicker      from './components/SlotPicker';
import EndingsGallery  from './components/EndingsGallery';
import { calculateStartingStats } from './gameData';
import { getQuarterlyRent } from './gameEngine';
import { pickQuarterlyItems } from './gameItems';
import './App.css';

export const SCREENS = {
  INTRO:      'intro',
  CHARACTER:  'characterSelect',
  TRAITS:     'traitAllocation',
  ONBOARDING: 'onboarding',
  BOSS_INTRO: 'bossIntro',
  GAME:       'game',
  ENDING:     'ending',
  LOAD_SLOT:  'loadSlot',
  SAVE_SLOT:  'saveSlot',
  ENDINGS:    'endings',
};

const SLOT_COUNT = 5;
const slotKey    = (n) => `ctlg_slot_v1_${n}`;

// ─── Slot helpers ──────────────────────────────────────────────────────────────
const getSlot = (n) => {
  try {
    const raw = localStorage.getItem(slotKey(n));
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const getAllSlots = () => Array.from({ length: SLOT_COUNT }, (_, i) => getSlot(i + 1));

const saveToSlot = (n, payload) => {
  try {
    localStorage.setItem(slotKey(n), JSON.stringify({ ...payload, savedAt: new Date().toISOString() }));
  } catch { /* localStorage unavailable */ }
};

const clearSlot = (n) => {
  try { localStorage.removeItem(slotKey(n)); } catch { /* noop */ }
};

const hasAnySave = () => getAllSlots().some(s => s !== null);

// ─── Initial game state ────────────────────────────────────────────────────────
const buildInitialGameState = (character, traits) => {
  const s = calculateStartingStats(traits);

  const housingTier  = s.isRichLegacy ? 'penthouse' : 'studio';
  const mansionOwned = false;

  const q1Rent          = getQuarterlyRent(housingTier, mansionOwned);
  const wealthAfterRent = Math.max(10_000, s.wealth - q1Rent);

  return {
    characterId:      character.id,
    characterName:    character.name,
    characterPronoun: character.pronoun,
    baseTraits:       traits,
    companyName:      'Sweatshaw & Co',

    stats: {
      competence:  s.competence,
      charisma:    s.charisma,
      reputation:  s.reputation,
      sanity:      s.sanity,
      wealth:      wealthAfterRent,
    },
    sanityFloor:      s.sanityFloor,
    traitMultipliers: s.traitMultipliers,
    isLegacyHire:     s.isLegacyHire,
    isRichLegacy:     s.isRichLegacy,

    housingTier,
    mansionOwned,
    quarterStartWealth:   s.wealth,
    quarterlyRentPaid:    q1Rent,
    quarterlyExpensesLog: [],

    mummysHelpCount:   0,
    mustRepayMum:      false,
    secretBailout:     false,
    pendingMummysHelp: false,

    lowSanityQuarters: 0,

    firstEncounterDone:          false,
    firstEncounterId:            null,
    dateUnlocked:                false,
    yearTwoDateChosen:           false,
    pendingFirstEncounterId:     null,
    pendingNextSubScreen:        null,
    pendingNextSpecialEventType: null,

    relationshipPartnerId:                null,
    relationshipIntimacy:                 0,
    relationshipStatus:                   null,
    relationshipEverReachedRelationship:  false,
    proposalTriggered:                    false,
    weddingYear:                          null,
    weddingQuarter:                       null,

    breakupEventType:    null,
    pendingAfterBreakup: null,

    isPEPath:           false,
    salaryMultiplier:   1,
    promoReqMultiplier: 1,
    loganDismissed:     false,

    currentYear:    1,
    currentQuarter: 1,
    currentMonth:   1,
    currentStageId: 'analyst',

    activityLog:           [],
    monthActivities:       [],
    linkedInMonths:        0,
    sideProjectMonths:     0,
    eventDChoiceCount:          0,
    cultureDefyingChoiceCount:  0,
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

    quarterlyItems:           pickQuarterlyItems('analyst'),
    itemPurchasedThisQuarter: false,

    eventIndex: 0,

    subScreen:                'monthPicker',
    pendingDateForMonth:      null,
    pendingSleepNext:         null,
    sleepInChosenThisQuarter: false,
    currentEvent:             null,
    lastStatChanges:          null,
    quarterlyStatDelta:       {},
    salarySummary:            null,
    annualData:               null,
    specialEventType:         null,
    endingId:                 null,
  };
};

// ──────────────────────────────────────────────────────────────────────────────

export default function App() {
  const [screen,       setScreen]       = useState(SCREENS.INTRO);
  const [character,    setCharacter]    = useState(null);
  const [traits,       setTraits]       = useState(null);
  const [gameState,    setGameState]    = useState(null);
  const [currentSlot,   setCurrentSlot]   = useState(null);
  const [saveExists,    setSaveExists]    = useState(hasAnySave);
  const [saveFlash,    setSaveFlash]    = useState(false);
  const audioRef       = useRef(null);
  const endingAudioRef = useRef(null);
  const [musicStarted, setMusicStarted] = useState(false);
  const [musicPaused,  setMusicPaused]  = useState(false);

  const startMusic = () => {
    if (audioRef.current) return;
    const audio = new Audio('/maintheme.mp3');
    audio.loop   = true;
    audio.volume = 0.4;
    audioRef.current = audio;
    setMusicStarted(true);
    setTimeout(() => audio.play().catch(() => {}), 2000);
  };

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (audioRef.current.paused) {
      audioRef.current.play();
      setMusicPaused(false);
    } else {
      audioRef.current.pause();
      setMusicPaused(true);
    }
  };

  // Global click sound
  useEffect(() => {
    const cache = {};
    const getAudio = (src) => {
      if (!cache[src]) { cache[src] = new Audio(src); cache[src].volume = 0.4; }
      return cache[src];
    };
    const SOUND_FILES = { accept: '/Accept.mp3', decline: '/decline.wav' };
    const handleClick = (e) => {
      const soundName = e.target.closest('[data-sound]')?.dataset.sound;
      const src = SOUND_FILES[soundName] ?? '/click.wav';
      const audio = getAudio(src);
      audio.currentTime = 0;
      audio.play().catch(() => {});
    };
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const goTo = (s) => setScreen(s);

  // ── Manual save — opens slot picker ──────────────────────────────────────
  const handleManualSave = () => goTo(SCREENS.SAVE_SLOT);

  const handleSaveToSlot = (slotNum) => {
    saveToSlot(slotNum, { screen: SCREENS.GAME, character, traits, gameState });
    setCurrentSlot(slotNum);
    setSaveExists(true);
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
    goTo(SCREENS.GAME);
  };

  // ── Load game — opens slot picker ─────────────────────────────────────────
  const handleLoadGame = () => { startMusic(); goTo(SCREENS.LOAD_SLOT); };

  const handleSlotLoad = (slotNum) => {
    const saved = getSlot(slotNum);
    if (!saved) return;
    startMusic();
    setCharacter(saved.character);
    setTraits(saved.traits);
    setGameState(saved.gameState);
    setCurrentSlot(slotNum);
    setScreen(saved.screen || SCREENS.GAME);
  };

  // ── New game flow ──────────────────────────────────────────────────────────
  const handleCharacterSelect = (char) => {
    startMusic();
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
    setCurrentSlot(null);
    goTo(SCREENS.BOSS_INTRO);
  };

  const handleBossIntroDone = () => goTo(SCREENS.GAME);

  const handleEndingReached = (endingId) => {
    setGameState(prev => ({ ...prev, endingId }));
    if (audioRef.current) { audioRef.current.pause(); }
    if (['burntOut', 'bankruptcy', 'mentalBreakdown'].includes(endingId)) {
      if (audioRef.current) audioRef.current.pause();
      const failAudio = new Audio('/fail.flac');
      failAudio.volume = 0.6;
      failAudio.play().catch(() => {});
    }
    if (['madePartner', 'madeMD', 'kingOfWallStreet'].includes(endingId)) {
      if (audioRef.current) audioRef.current.pause();
      setTimeout(() => {
        const victoryAudio = new Audio('/victory.mp3');
        victoryAudio.volume = 0.6;
        victoryAudio.play().catch(() => {});
      }, 2000);
    }
    if (['backToFamilyBusiness', 'earlyRetirement', 'startupSuccess', 'headOfCorpDev', 'professionalCoach', 'friendsFO'].includes(endingId)) {
      if (audioRef.current) audioRef.current.pause();
      const legacyAudio = new Audio('/legacy.mp3');
      endingAudioRef.current = legacyAudio;
      setTimeout(() => {
        legacyAudio.volume = 0.6;
        legacyAudio.play().catch(() => {});
      }, 2000);
    }
    if (['upOrOut', 'permanentVP', 'headOfInternalStrategy', 'startupBust', 'burntOut', 'mentalBreakdown', 'bankruptcy', 'fire', 'regulator'].includes(endingId)) {
      if (audioRef.current) audioRef.current.pause();
      const badAudio = new Audio('/badending.mp3');
      endingAudioRef.current = badAudio;
      setTimeout(() => {
        badAudio.volume = 0.6;
        badAudio.play().catch(() => {});
        setTimeout(() => {
          const steps = 40;
          const interval = 4000 / steps;
          const decrement = badAudio.volume / steps;
          const fade = setInterval(() => {
            if (!endingAudioRef.current) { clearInterval(fade); return; }
            badAudio.volume = Math.max(0, badAudio.volume - decrement);
            if (badAudio.volume <= 0) { badAudio.pause(); endingAudioRef.current = null; clearInterval(fade); }
          }, interval);
        }, 25000);
      }, 1000);
    }
    goTo(SCREENS.ENDING);
  };

  const handleNextChapter = (musicSrc) => {
    if (endingAudioRef.current) { endingAudioRef.current.pause(); endingAudioRef.current = null; }
    if (musicSrc) {
      const audio = new Audio(musicSrc);
      endingAudioRef.current = audio;
      setTimeout(() => { audio.volume = 0.6; audio.play().catch(() => {}); }, 500);
    }
  };

  const handleRestart = () => {
    if (endingAudioRef.current) { endingAudioRef.current.pause(); endingAudioRef.current = null; }
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setMusicStarted(false);
    setCharacter(null);
    setTraits(null);
    setGameState(null);
    setCurrentSlot(null);
    setSaveExists(hasAnySave());
    goTo(SCREENS.INTRO);
  };

  return (
    <div className="app">
      {musicStarted && (
        <button className="music-toggle-btn" onClick={toggleMusic} title={musicPaused ? 'Play music' : 'Pause music'}>
          {musicPaused ? '▶' : '⏸'}
        </button>
      )}

      {screen === SCREENS.INTRO && (
        <IntroScreen
          onBegin={() => { startMusic(); goTo(SCREENS.CHARACTER); }}
          onLoad={handleLoadGame}
          hasSave={saveExists}
          onViewEndings={() => goTo(SCREENS.ENDINGS)}
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
      {screen === SCREENS.BOSS_INTRO && (
        <BossIntro onBeginGame={handleBossIntroDone} />
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
        <GameEnding endingId={gameState.endingId} gameState={gameState} onRestart={handleRestart} onNextChapter={handleNextChapter} />
      )}
      {screen === SCREENS.ENDINGS && (
        <EndingsGallery onClose={() => goTo(SCREENS.INTRO)} />
      )}
      {screen === SCREENS.LOAD_SLOT && (
        <SlotPicker
          slots={getAllSlots()}
          mode="load"
          onSelect={handleSlotLoad}
          onCancel={() => goTo(SCREENS.INTRO)}
        />
      )}
      {screen === SCREENS.SAVE_SLOT && (
        <SlotPicker
          slots={getAllSlots()}
          mode="save"
          onSelect={handleSaveToSlot}
          onCancel={() => goTo(SCREENS.GAME)}
        />
      )}
    </div>
  );
}
