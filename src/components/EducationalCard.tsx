import { useState } from 'react';
import {
  EducationalCard as CardType,
  SUBJECT_COLORS,
  SUBJECT_LABELS,
  DIFFICULTY_STARS,
  LEVEL_LABELS,
} from '../types/game';

interface Props {
  card: CardType;
  flipped?: boolean;
  onClick?: () => void;
  showAttacks?: boolean;
}

export function EducationalCard({ card, flipped = false, onClick, showAttacks = false }: Props) {
  const [isFlipped, setIsFlipped] = useState(flipped);
  const colors = SUBJECT_COLORS[card.subject];
  const hpPercent = card.currentHp !== undefined ? (card.currentHp / card.hp) * 100 : 100;

  const hpBarColor =
    hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsFlipped((prev) => !prev);
    }
  };

  return (
    <div
      className="relative w-48 h-72 cursor-pointer select-none"
      style={{ perspective: '1000px' }}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-label={`Carte ${card.name}`}
    >
      <div
        className="relative w-full h-full transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* ── FACE AVANT ── */}
        <div
          className={`absolute inset-0 rounded-2xl border-4 ${colors.border} shadow-xl overflow-hidden`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* En-tête coloré */}
          <div className={`bg-gradient-to-b ${colors.bg} p-2`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
                {SUBJECT_LABELS[card.subject]}
              </span>
              <span className="text-xs font-bold text-white bg-black/30 px-2 py-0.5 rounded-full">
                {LEVEL_LABELS[card.level]}
              </span>
            </div>
            <p className="text-white font-extrabold text-sm text-center leading-tight drop-shadow">
              {card.name}
            </p>
          </div>

          {/* Illustration */}
          <div className="bg-white/90 flex items-center justify-center h-16 mx-2 mt-2 rounded-xl border-2 border-gray-200">
            <span className="text-4xl" role="img" aria-label={card.name}>
              {card.emoji}
            </span>
          </div>

          {/* Corps de la carte */}
          <div className="bg-amber-50 mx-0 px-2 pt-2 pb-1 flex-1">
            {/* Rareté & HP */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs">{DIFFICULTY_STARS[card.difficulty]}</span>
              <span className="text-xs font-bold text-gray-700">PV {card.currentHp ?? card.hp}/{card.hp}</span>
            </div>

            {/* Barre HP */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`${hpBarColor} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Description */}
            <p className="text-xs text-gray-700 leading-tight mb-2 line-clamp-2">
              {card.description}
            </p>

            {/* Attaques */}
            {(showAttacks ? card.attacks : card.attacks.slice(0, 1)).map((attack, i) => (
              <div key={i} className="flex justify-between items-center bg-white/70 rounded-lg px-2 py-1 mb-1">
                <span className="text-xs font-semibold text-gray-800 truncate">{attack.name}</span>
                <span className="text-xs font-bold text-red-600 ml-1">{attack.damage}</span>
              </div>
            ))}
          </div>

          {/* Pied de carte */}
          <div className={`bg-gradient-to-b ${colors.bg} text-center py-1`}>
            <span className="text-white text-[10px] font-medium opacity-80">
              Clique pour retourner
            </span>
          </div>
        </div>

        {/* ── FACE ARRIÈRE (question) ── */}
        <div
          className={`absolute inset-0 rounded-2xl border-4 ${colors.border} shadow-xl overflow-hidden bg-white`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className={`bg-gradient-to-b ${colors.bg} p-2 text-center`}>
            <p className="text-white font-extrabold text-xs drop-shadow">{card.name}</p>
          </div>

          <div className="p-3 flex flex-col gap-2 h-[calc(100%-40px)] overflow-auto">
            {card.attacks.map((attack, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-2">
                <p className="text-xs font-bold text-gray-800 mb-1">
                  ⚡ {attack.name} ({attack.damage} dégâts)
                </p>
                <p className="text-xs text-gray-700 mb-2">{attack.question}</p>
                <div className="grid grid-cols-2 gap-1">
                  {attack.answers.map((ans, j) => (
                    <span
                      key={j}
                      className="text-[10px] bg-white border border-gray-300 rounded-lg px-1 py-0.5 text-center text-gray-700"
                    >
                      {String.fromCharCode(65 + j)}. {ans}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
