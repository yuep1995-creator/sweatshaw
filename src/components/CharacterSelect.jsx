import { useState } from 'react';
import { CHARACTERS } from '../gameData';

const SELECT_IMAGES = {
  paige: '/paigedetail.png',
  max:   '/maxdetail.png',
};

export default function CharacterSelect({ onSelect }) {
  const [hovered, setHovered] = useState(null);
  const [selected, setSelected] = useState(null);

  const handleSelect = (char) => {
    setSelected(char.id);
    setTimeout(() => onSelect(char), 600);
  };

  return (
    <div className="screen character-select-screen">
      <div className="screen-header">
        <h1 className="screen-title">SELECT YOUR EMPLOYEE</h1>
        <p className="screen-subtitle">
          Choose your avatar. Choose your destiny. Choose your excuse.
        </p>
      </div>

      <div className="character-cards">
        {CHARACTERS.map((char) => (
          <div
            key={char.id}
            className={`character-card ${hovered === char.id ? 'hovered' : ''} ${
              selected === char.id ? 'selected' : ''
            } ${selected && selected !== char.id ? 'dimmed' : ''}`}
            style={{ '--char-colour': char.colour }}
            onMouseEnter={() => setHovered(char.id)}
            onMouseLeave={() => setHovered(null)}
            onClick={() => handleSelect(char)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleSelect(char)}
          >
            <div className="card-accent-bar" />
            <div className="card-avatar">
              <img
                src={SELECT_IMAGES[char.id] ?? `/${char.id}.png`}
                alt={char.name}
                className="card-avatar-img"
              />
            </div>
            <div className="card-body">
              <h2 className="card-name">{char.name}</h2>
              <span className="card-pronoun">{char.pronoun}</span>
              <blockquote className="card-quote">{char.quote}</blockquote>
              <p className="card-subtext">{char.subtext}</p>
            </div>
            <div className="card-select-indicator">
              {selected === char.id ? '✓ SELECTED' : 'CLICK TO SELECT'}
            </div>
          </div>
        ))}
      </div>

      <div className="character-disclaimer">
        <span className="disclaimer-icon">ℹ️</span>
        Both characters share the same core game. Some dialogue and events differ — reflecting the
        different (often unfair) social dynamics each faces in the workplace.
      </div>
    </div>
  );
}
