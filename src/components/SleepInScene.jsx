import { useState, useEffect } from 'react';

const HOUSING_KEY = {
  studio:    'studio',
  oneBed:    'onebed',
  twoBed:    'twobed',
  mansion:   'mansion',
  penthouse: 'penthouse',
};

const TEXT_MAX = [
  "It's 9:07am. On a Saturday. Your phone shows 47 unread messages. You put it face down. This is, technically, a form of self-harm.",
  "You sleep for ten hours. You dream about Excel. You correct a pivot table in the dream. You feel satisfied about this. When you wake up, you are briefly horrified by what that means about you.",
  "Your body has forgotten what rested feels like. It takes ninety minutes to remember. You lie there running through the sensation like a man who has forgotten how to swim and is doing it anyway.",
  "At 11am, your VP texts: \"Hope the weekend's been productive.\" You stare at the message for thirty seconds. You type: \"Absolutely, just reviewing a few things.\" You send it. You close your eyes again. The ceiling does not care. Neither, you are starting to understand, do you.",
];

const TEXT_PAIGE = [
  "It's 9:07am. On a Saturday. Paige silences her alarm. Then silences it again. The third snooze feels like a statement she isn't quite ready to make.",
  "She sleeps for ten hours. She dreams about a deal she hasn't been staffed on. In the dream, she's the one who closes it. She knows, even in the dream, that the credit will go elsewhere. She closes it anyway.",
  "She wakes up feeling something close to human. She immediately feels guilty about it. There is a specific tax that applies to women who feel good on a Saturday, and it is collected promptly.",
  "A colleague texts: \"Quick one — did you get a chance to look at those slides?\" It's Saturday. It is always Saturday. She types \"Not yet, will look later.\" She does not look later. This is the most radical thing she has done all year.",
];

export default function SleepInScene({ gameState: gs, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const housingKey = HOUSING_KEY[gs.housingTier] ?? 'studio';
  const bgImage = `/${gs.characterId}${housingKey}.png`;
  const text = gs.characterId === 'max' ? TEXT_MAX : TEXT_PAIGE;

  return (
    <div className="si-screen" style={{ backgroundImage: `url('${bgImage}')` }}>
      <div className={`si-overlay ${visible ? 'si-visible' : ''}`}>
        <div className="si-card">
          <div className="si-tag">Saturday Morning</div>
          {text.map((para, i) => (
            <p key={i} className="si-para">{para}</p>
          ))}
          <button className="btn btn-primary si-btn" onClick={onDone}>
            [ Back to Reality ]
          </button>
        </div>
      </div>
    </div>
  );
}
