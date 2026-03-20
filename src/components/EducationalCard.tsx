import { useState } from 'react';
import {
  EducationalCard as CardType,
  SUBJECT_COLORS,
  SUBJECT_LABELS,
  DIFFICULTY_STARS,
  LEVEL_LABELS,
} from '../types/game';
import { CardMonster } from './CardMonster';

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
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1000px', aspectRatio: '2/3' }}
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
          className={`absolute inset-0 rounded-2xl border-4 ${colors.border} shadow-xl overflow-hidden flex flex-col`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* En-tête */}
          <div className={`bg-gradient-to-b ${colors.bg} px-2 pt-2 pb-1`}>
            <div className="flex justify-between items-center mb-1">
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${colors.badge} leading-tight`}>
                {SUBJECT_LABELS[card.subject]}
              </span>
              <span className="text-[10px] font-bold text-white bg-black/30 px-1.5 py-0.5 rounded-full leading-tight">
                {LEVEL_LABELS[card.level]}
              </span>
            </div>
            <p className="text-white font-extrabold text-xs text-center leading-tight drop-shadow line-clamp-1">
              {card.name}
            </p>
          </div>

          {/* Illustration — monstre SVG */}
          <div className="bg-white/90 mx-2 mt-1.5 rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0"
            style={{ height: '38%' }}>
            <CardMonster cardId={card.id} className="w-full h-full" />
          </div>

          {/* Corps */}
          <div className="bg-amber-50 px-2 pt-1 pb-1 flex flex-col flex-1 min-h-0">
            {/* Rareté & HP */}
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[10px] leading-none">{DIFFICULTY_STARS[card.difficulty]}</span>
              <span className="text-[10px] font-bold text-gray-700 leading-none">
                PV {card.currentHp ?? card.hp}/{card.hp}
              </span>
            </div>

            {/* Barre HP */}
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div
                className={`${hpBarColor} h-1.5 rounded-full transition-all duration-300`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>

            {/* Description */}
            <p className="text-[10px] text-gray-700 leading-tight mb-1 line-clamp-2 flex-shrink-0">
              {card.description}
            </p>

            {/* Attaques */}
            <div className="flex flex-col gap-0.5 overflow-hidden">
              {(showAttacks ? card.attacks : card.attacks.slice(0, 1)).map((attack, i) => (
                <div key={i} className="flex justify-between items-center bg-white/70 rounded-lg px-1.5 py-0.5">
                  <span className="text-[10px] font-semibold text-gray-800 truncate">{attack.name}</span>
                  <span className="text-[10px] font-bold text-red-600 ml-1 flex-shrink-0">{attack.damage}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Pied */}
          <div className={`bg-gradient-to-b ${colors.bg} text-center py-0.5`}>
            <span className="text-white text-[9px] font-medium opacity-80">Appuie pour voir</span>
          </div>
        </div>

        {/* ── FACE ARRIÈRE (questions) ── */}
        <div
          className={`absolute inset-0 rounded-2xl border-4 ${colors.border} shadow-xl overflow-hidden bg-white flex flex-col`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className={`bg-gradient-to-b ${colors.bg} px-2 py-1.5 text-center flex-shrink-0`}>
            <p className="text-white font-extrabold text-xs drop-shadow line-clamp-1">{card.name}</p>
          </div>

          <div className="p-2 flex flex-col gap-1.5 flex-1 overflow-auto">
            {card.attacks.map((attack, i) => (
              <div key={i} className="bg-gray-50 rounded-xl border border-gray-200 p-2">
                <p className="text-[10px] font-bold text-gray-800 mb-1">
                  ⚡ {attack.name} ({attack.damage} dégâts)
                </p>
                <p className="text-[10px] text-gray-700 mb-1.5">{attack.question}</p>
                <div className="grid grid-cols-2 gap-1">
                  {attack.answers.map((ans, j) => (
                    <span
                      key={j}
                      className="text-[9px] bg-white border border-gray-300 rounded-lg px-1 py-0.5 text-center text-gray-700"
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
