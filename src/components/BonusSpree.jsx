import { useState, useEffect } from 'react';
import { formatDollars } from '../gameEngine';

const BASE_OPTIONS = [
  { id: 'sleepIn',       icon: '😴', name: 'Sleep In',       baseCost: 0,       sanity: 15,  description: 'A long weekend in bed. You have earned this.' },
  { id: 'clubbing',      icon: '🎉', name: 'Clubbing',       baseCost: 2_000,   sanity: 25,  description: 'Table booked. Dress code enforced. Inhibitions optional.',                juniorOnly: true },
  { id: 'shoppingSpree', icon: '🛍', name: 'Shopping Spree', baseCost: 8_000,   sanity: 40,  description: 'Retail therapy. The bags themselves are the healing.' },
  { id: 'cancun',        icon: '🏖', name: 'Cancun',         baseCost: 20_000,  sanity: 80,  description: 'Sun, sea, and a temporary personality transplant.' },
  { id: 'boraBora',      icon: '🌴', name: 'Bora Bora',      baseCost: 30_000,  sanity: 100, description: 'Overwater bungalow. No emails. No exceptions.' },
  { id: 'stMoritz',      icon: '⛷️', name: 'St. Moritz',     baseCost: 50_000,  sanity: 125, description: 'Chalet booked. Skis waxed. Out of office: indefinitely.',                seniorOnly: true },
];

// Maps housing tier → image filename suffix for sleep-in scene
const PROPERTY_IMAGES = {
  paige: { studio: 'paigestudio', oneBed: 'paige1bed', twoBed: 'paige2bed', mansion: 'paigeph', penthouse: 'paigeph' },
  max:   { studio: 'maxstudio',   oneBed: 'max1bed',   twoBed: 'max2bed',   mansion: 'maxph',   penthouse: 'maxph'   },
};

const SCENE_IMAGES = {
  clubbing:      '/bclub.png',
  shoppingSpree: '/bshopping.png',
  cancun:        '/bcancun.png',
  boraBora:      '/bbora.png',
  stMoritz:      '/bstmoritz.png',
};

function getSceneImage(optionId, characterId, housingTier) {
  if (optionId === 'sleepIn') {
    const charKey = characterId === 'max' ? 'max' : 'paige';
    const file    = PROPERTY_IMAGES[charKey]?.[housingTier] ?? PROPERTY_IMAGES.paige.studio;
    return `/${file}.png`;
  }
  return SCENE_IMAGES[optionId] ?? '/bcoffice.png';
}

const SCENE_TEXT = {
  max: {
    sleepIn: "First morning in nine months without an alarm. Slept until eleven, ate toast standing over the sink, and found myself mapping out next quarter's pipeline before noon. Productivity, apparently, cannot be switched off by an act of will. You call it rest. I call it active recovery — and I'm billing it as such.",
    clubbing: "Booked the table six days in advance and still arrived to find someone else had taken it — classic. Two bottles of Moët later, none of that mattered. Managed four consecutive hours without discussing a single spreadsheet, which is either a personal record or a cause for concern. Back at the desk by eight the next morning. The only way to recover is to not stop moving.",
    shoppingSpree: "Finally pulled the trigger on the Submariner I'd been eyeing since Q2. Not for vanity — for leverage. Nothing closes a room quite like the right watch on the right wrist, and frankly, I've earned this one. Picked up three suits that will pay for themselves in first impressions alone. Receipts filed under 'Professional Development'.",
    cancun: "Checked in on Friday. Had the quarterly model open by Saturday afternoon — only briefly, I told myself. The pool looked exactly like the screensaver I've been ignoring for three years, which felt oddly validating. Tanned, rested, and mildly annoyed about the Wi-Fi. Flew back Sunday. Business class. Obviously.",
    boraBora: "Overwater bungalow. Private deck. Water so clear you could see straight to the bottom, with no one asking for a revised deck. Spent four days doing precisely what I'd spent the entire year optimising myself away from — nothing at all. Came back sharper. Or at least that's the story I'm running with.",
    stMoritz: "Flew into Geneva on Thursday. The chalet had been booked since October — that's not extravagance, that's forward planning. Skied for four days with two clients, a lawyer from Zurich, and a man whose function was never made entirely clear. Three deals were discussed on the mountain. One may actually close. The altitude helps. So does the wine. I have no notes from Friday evening and I'm treating that as a feature, not a bug.",
  },
  paige: {
    sleepIn: "Turned the phone off. Actually off, not silent — the whole thing. Spent the morning horizontal, watching the ceiling do nothing in particular. By 2pm I'd already drafted an email I wouldn't send until Monday, which I'm counting as genuine restraint. Progress, apparently, is non-negotiable even on annual leave.",
    clubbing: "Wore the dress that's been hanging in the wardrobe since September. Managed three full hours without checking my phone, an achievement I intend to mention at my next performance review. The city at 2am looks exactly like a Bloomberg terminal if you squint and tilt your head. Felt human again, briefly, and on reflection that's quite enough.",
    shoppingSpree: "Row of shops, one card, no remorse whatsoever. The theory is that investment pieces hold their value — a logic that applies equally to Mayfair property and to the right handbag, as far as I'm concerned. Came home with four bags and the distinct sense of having beaten the market. I've logged the total as 'lifestyle infrastructure'.",
    cancun: "Took the earlier flight to squeeze in one more morning of sun. Lay on the beach and attempted to think about nothing — succeeded briefly, then thought about the Meridian deal, then managed nothing again for a solid twenty minutes. The margaritas helped considerably. Mexico is now a recurring item on the personal wellness strategy.",
    boraBora: "The bungalow had its own ladder into the lagoon and an espresso machine that outperformed the one on the trading floor by a considerable margin. Read two books — one was about leadership and the other was not, and I'm not elaborating further. Came back with a tan, renewed clarity of purpose, and a mildly alarming enthusiasm for the next twelve months.",
    stMoritz: "The chalet was technically a colleague's recommendation and practically the best decision I've made outside of a boardroom. Four days of skis, fondue, and the particular silence that only exists above two thousand metres. Saw precisely two people from work — we made eye contact on the chairlift, said nothing, and it was the most professional interaction I've had all year. Came back restored to something close to factory settings.",
  },
};

export default function BonusSpree({ gameState: gs, onChosen }) {
  const [chosen,      setChosen]      = useState(null); // { optionId, cost, sanity }
  const [textVisible, setTextVisible] = useState(false);

  // gs.currentYear already incremented; yearIndex 0 = first bonus spree (after Year 1)
  const yearIndex  = gs.currentYear - 2;
  const multiplier = Math.pow(1.2, Math.max(0, yearIndex));
  const wealth     = gs.stats.wealth;

  const isSenior = ['vp', 'director'].includes(gs.currentStageId);
  const options  = BASE_OPTIONS.filter(opt => {
    if (opt.juniorOnly && isSenior)  return false;
    if (opt.seniorOnly && !isSenior) return false;
    return true;
  });

  // After option is chosen, wait 1 s before fading in the text box
  useEffect(() => {
    if (!chosen) return;
    const timer = setTimeout(() => setTextVisible(true), 1000);
    return () => clearTimeout(timer);
  }, [chosen]);

  // ── SCENE (after option chosen) ───────────────────────────────────────────
  if (chosen) {
    const bgImage = getSceneImage(chosen.optionId, gs.characterId, gs.housingTier);
    const charKey = gs.characterId === 'max' ? 'max' : 'paige';
    const text    = SCENE_TEXT[charKey]?.[chosen.optionId] ?? '';

    return (
      <div className="bs-scene" style={{ backgroundImage: `url(${bgImage})` }}>
        <div className={`bs-scene-content ${textVisible ? 'visible' : ''}`}>
          <div className="bs-scene-box">
            <p className="bs-scene-text">{text}</p>
            <button
              className="btn btn-primary btn-large bs-scene-btn"
              onClick={() => onChosen(chosen.optionId, chosen.cost, chosen.sanity)}
            >
              [ GET BACK TO WORK ]
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── OPTION PICKER ─────────────────────────────────────────────────────────
  return (
    <div className="bs-screen">
      <div className="bs-overlay" />

      <div className="bs-card-wrap">
        <div className="bs-tag">YEAR-END BONUS RECEIVED</div>
        <h2 className="bs-title">The bonus just landed.<br />How are you spending it?</h2>
        <div className="bs-balance">Current balance: {formatDollars(wealth)}</div>

        <div className="bs-grid">
          {options.map(opt => {
            const rawCost   = opt.baseCost * multiplier;
            const cost      = opt.baseCost === 0 ? 0 : Math.round(rawCost / 1_000) * 1_000;
            const canAfford = wealth >= cost;

            return (
              <button
                key={opt.id}
                className={`bs-option ${!canAfford ? 'unaffordable' : ''}`}
                onClick={() => setChosen({ optionId: opt.id, cost, sanity: opt.sanity })}
                disabled={!canAfford}
                data-sound="decline"
              >
                <span className="bs-option-icon">{opt.icon}</span>
                <div className="bs-option-body">
                  <div className="bs-option-name">{opt.name}</div>
                  <div className="bs-option-desc">{opt.description}</div>
                  <div className="bs-option-footer">
                    <span className="bs-option-cost">
                      {cost === 0 ? 'Free' : formatDollars(cost)}
                    </span>
                    <span className="bs-option-effect">Sanity +{opt.sanity}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
