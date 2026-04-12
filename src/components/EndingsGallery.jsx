import { useState, useRef } from 'react';
import { ENDINGS } from '../gameData';

// Placeholder values for rendering dynamic ending text
const PREVIEW_NAME  = 'Protagonist';
const PREVIEW_STATS = { competence: 65, sanity: 75, charisma: 65, reputation: 65, wealth: 5_000_000 };
const PREVIEW_GS    = { characterId: 'max', isRichLegacy: false };

const ENDING_LIST = [
  { id: 'backToFamilyBusiness',   category: 'Legacy' },
  { id: 'fire',                   category: 'Exit' },
  { id: 'regulator',              category: 'Exit' },
  { id: 'startupSuccess',         category: 'Exit' },
  { id: 'startupBust',            category: 'Exit' },
  { id: 'permanentVP',            category: 'Plateau' },
  { id: 'headOfInternalStrategy', category: 'Plateau' },
  { id: 'madeMD',                 category: 'Victory' },
  { id: 'hollowMD',               category: 'Victory' },
  { id: 'madePartner',            category: 'Victory' },
  { id: 'hollowVictory',          category: 'Victory' },
  { id: 'burntOut',               category: 'Failure' },
  { id: 'upOrOut',                category: 'Failure' },
  { id: 'bankruptcy',             category: 'Failure' },
  { id: 'mentalBreakdown',        category: 'Failure' },
];

// Endings that have a corresponding background graphic (preview uses Max placeholder for character-specific ones)
const ENDING_IMAGES = {
  backToFamilyBusiness:   '/backtofamilybusiness.png',
  fire:                   '/firemax.png',
  burntOut:               '/burntoutmax.png',
  upOrOut:                '/uporoutmax.png',
  regulator:              '/regulatormax.png',
  bankruptcy:             '/bankruptcy.png',
  permanentVP:            '/vpmax.png',
  headOfInternalStrategy: '/internalstratmax.png',
  mentalBreakdown:        '/mentalmax.png',
  madeMD:                 '/madeMDmax.png',
  hollowMD:               '/hollowmax.png',
  hollowVictory:          '/hollowpemax.png',
  madePartner:            '/madepartnermax.png',
  startupSuccess:         '/startupsuc.png',
  startupBust:            '/startupbust.png',
};

const ENDING_AUDIO = {
  backToFamilyBusiness:   '/legacy.mp3',
  startupSuccess:         '/legacy.mp3',
  burntOut:               '/fail.flac',
  bankruptcy:             '/fail.flac',
  madePartner:            '/victory.mp3',
  madeMD:                 '/victory.mp3',
  upOrOut:                '/badending.mp3',
  permanentVP:            '/badending.mp3',
  headOfInternalStrategy: '/badending.mp3',
  startupBust:            '/badending.mp3',
  mentalBreakdown:        '/fail.flac',
};

const CATEGORY_COLOURS = {
  Legacy:  '#d4a017',
  Exit:    '#8b90b0',
  Plateau: '#8b90b0',
  Victory: '#d4a017',
  Failure: '#ef4444',
};

function resolveText(ending) {
  return typeof ending.text === 'function'
    ? ending.text(PREVIEW_NAME, PREVIEW_STATS, PREVIEW_GS)
    : ending.text;
}

function resolveEpilogue(ending) {
  if (!ending.epilogue) return '';
  return typeof ending.epilogue === 'function'
    ? ending.epilogue(PREVIEW_NAME, PREVIEW_STATS.sanity, PREVIEW_GS)
    : ending.epilogue;
}

export default function EndingsGallery({ onClose }) {
  const [selectedId, setSelectedId] = useState(ENDING_LIST[0].id);
  const [playing, setPlaying] = useState(false);
  const audioRef = useRef(null);

  const playEndingAudio = () => {
    const src = ENDING_AUDIO[selectedId];
    if (!src) return;
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    const audio = new Audio(src);
    audio.volume = 0.6;
    audio.play().catch(() => {});
    audio.onended = () => setPlaying(false);
    audioRef.current = audio;
    setPlaying(true);
  };

  const stopEndingAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
  };

  const handleSelect = (id) => {
    stopEndingAudio();
    setSelectedId(id);
  };

  const selected   = ENDINGS[selectedId];
  const text       = selected ? resolveText(selected) : '';
  const epilogue   = selected ? resolveEpilogue(selected) : '';
  const cat        = ENDING_LIST.find(e => e.id === selectedId)?.category ?? '';
  const catColour  = CATEGORY_COLOURS[cat] ?? '#f1f5f9';
  const previewImg = ENDING_IMAGES[selectedId] ?? null;

  return (
    <div className="eg-screen">
      <div className="eg-layout">

        {/* Left panel — list */}
        <div className="eg-sidebar">
          <div className="eg-sidebar-header">
            <div className="eg-sidebar-tag">SWEATSHAW & CO</div>
            <div className="eg-sidebar-title">CASE FILES</div>
            <div className="eg-sidebar-sub">{ENDING_LIST.length} possible outcomes</div>
          </div>

          <div className="eg-list">
            {ENDING_LIST.map(({ id, category }) => {
              const e = ENDINGS[id];
              if (!e) return null;
              return (
                <button
                  key={id}
                  className={`eg-item ${selectedId === id ? 'eg-item-active' : ''}`}
                  style={{ '--eg-colour': CATEGORY_COLOURS[category] }}
                  onClick={() => handleSelect(id)}
                >
                  <span className="eg-item-dot" />
                  <div className="eg-item-body">
                    <div className="eg-item-title">{e.title}</div>
                    <div className="eg-item-cat">
                      {category}
                      {ENDING_IMAGES[id] && <span className="eg-item-img-tag">IMG</span>}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          <button className="btn btn-secondary eg-close" onClick={onClose}>
            [ BACK ]
          </button>
        </div>

        {/* Right panel — preview */}
        <div className="eg-preview">
          <div className="eg-preview-inner">
            <div className="eg-preview-cat" style={{ color: catColour }}>{cat}</div>
            <h1 className="eg-preview-title" style={{ color: catColour }}>{selected?.title}</h1>
            <div className="eg-preview-stamp">CASE CLOSED</div>

            {ENDING_AUDIO[selectedId] && (
              <button
                className="eg-audio-btn"
                onClick={playing ? stopEndingAudio : playEndingAudio}
              >
                {playing ? '⏹ Stop' : '▶ Play Audio'}
              </button>
            )}

            <div className="eg-preview-body">
              {text.split('\n\n').map((para, i) => (
                <p key={i} className="eg-preview-para">{para}</p>
              ))}
            </div>

            {epilogue && (
              <>
                <div className="eg-preview-divider" />
                <p className="eg-preview-epilogue">{epilogue}</p>
              </>
            )}

            {previewImg && (
              <img src={previewImg} alt="" className="eg-preview-img" />
            )}

            <div className="eg-preview-note">
              Preview uses placeholder values. Exact text varies based on your stats.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
