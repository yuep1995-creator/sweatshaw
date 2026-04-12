import { useState, useEffect } from 'react';

const CAPTION = `The LinkedIn caption, for the record, read: "Grateful. Humbled. 26.2. Giving everything, on the course and off it."`;

const TEXT_IB = `The Marathon was fun. You actually think you enjoyed the pain — guess it is the same way this job works on you.\n\nYou went home and posted your photo where you are wearing a Sweatshaw stash on LinkedIn, and tagged all the MDs that went as well.\n\n${CAPTION}`;

const TEXT_PE = `The Marathon was fun. You actually think you enjoyed the pain — guess it is the same way this job works on you.\n\nYou went home and posted your photo where you are wearing a Darkstone stash on LinkedIn, and tagged all the Partners that went as well.\n\n${CAPTION}`;

export default function MarathonScene({ isPEPath = false, onDone }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  const text = isPEPath ? TEXT_PE : TEXT_IB;

  return (
    <div className="si-screen" style={{ backgroundImage: "url('/marathon.png')" }}>
      <div className={`si-overlay ${visible ? 'si-visible' : ''}`}>
        <div className="si-card">
          <div className="si-tag">NYC Marathon — Q3</div>
          {text.split('\n\n').map((para, i) => (
            <p key={i} className="si-para">{para}</p>
          ))}
          <button className="btn btn-primary si-btn" onClick={onDone}>
            [ Continue ]
          </button>
        </div>
      </div>
    </div>
  );
}
