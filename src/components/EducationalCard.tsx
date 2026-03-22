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
  /** 0–3 stars earned via the progress system */
  stars?: 0 | 1 | 2 | 3;
  /** Called whenever the player correctly answers an attack question */
  onCorrectAnswer?: (attackIndex: number) => void;
}

const MONSTER_ANIM: Record<string, string> = {
  maths: 'monster-float',
  sciences: 'monster-float-slow',
  histoire: 'monster-float',
  langues: 'monster-float-slow',
};

export function EducationalCard({
  card,
  flipped = false,
  onClick,
  showAttacks = false,
  stars = 0,
  onCorrectAnswer,
}: Props) {
  const [isFlipped, setIsFlipped] = useState(flipped);
  const [answeredMap, setAnsweredMap] = useState<Record<number, number>>({});
  const colors = SUBJECT_COLORS[card.subject];
  const hpPercent = card.currentHp !== undefined ? (card.currentHp / card.hp) * 100 : 100;
  const hpBarColor =
    hpPercent > 50 ? 'bg-green-500' : hpPercent > 25 ? 'bg-yellow-500' : 'bg-red-500';

  const handleCardClick = () => {
    if (onClick) {
      onClick();
    } else {
      setIsFlipped((prev) => {
        if (prev) setAnsweredMap({});
        return !prev;
      });
    }
  };

  const handleAnswer = (e: React.MouseEvent, attackIdx: number, answerIdx: number) => {
    e.stopPropagation();
    if (answeredMap[attackIdx] !== undefined) return;
    setAnsweredMap((prev) => ({ ...prev, [attackIdx]: answerIdx }));
    if (answerIdx === card.attacks[attackIdx].correctIndex) {
      onCorrectAnswer?.(attackIdx);
    }
  };

  const anim = MONSTER_ANIM[card.subject] ?? 'monster-float';
  const isMastered = stars === 3;

  return (
    <div
      className="relative w-full cursor-pointer select-none"
      style={{ perspective: '1000px', aspectRatio: '2/3' }}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleCardClick()}
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
          className={`absolute inset-0 rounded-2xl border-4 ${colors.border} shadow-xl overflow-hidden flex flex-col ${
            isMastered ? 'ring-2 ring-yellow-400 ring-offset-1' : ''
          }`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {/* Shimmer doré sur carte maîtrisée */}
          {isMastered && (
            <div className="absolute inset-0 z-20 rounded-2xl card-mastered-shimmer pointer-events-none" />
          )}

          {/* Mastery badge */}
          {stars > 0 && (
            <div
              className={`absolute top-1 right-1 z-10 rounded-full px-1.5 py-0.5 text-[10px] font-extrabold shadow leading-none ${
                isMastered
                  ? 'bg-yellow-400 text-yellow-900 star-pulse'
                  : 'bg-white/90 text-yellow-500 border border-yellow-300'
              }`}
            >
              {'⭐'.repeat(stars)}
            </div>
          )}

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

          {/* Illustration */}
          <div
            className="bg-white/90 mx-2 mt-1.5 rounded-xl border-2 border-gray-200 overflow-hidden flex-shrink-0 flex items-center justify-center"
            style={{ height: '38%' }}
          >
            <div className={`w-full h-full ${anim}`}>
              <CardMonster cardId={card.id} className="w-full h-full" />
            </div>
          </div>

          {/* Corps */}
          <div className="bg-amber-50 px-2 pt-1 pb-1 flex flex-col flex-1 min-h-0">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[10px] leading-none">{DIFFICULTY_STARS[card.difficulty]}</span>
              <span className="text-[10px] font-bold text-gray-700 leading-none">
                PV {card.currentHp ?? card.hp}/{card.hp}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
              <div className={`${hpBarColor} h-1.5 rounded-full transition-all`} style={{ width: `${hpPercent}%` }} />
            </div>
            <p className="text-[10px] text-gray-700 leading-tight mb-1 line-clamp-2 flex-shrink-0">
              {card.description}
            </p>
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
          <div className={`bg-gradient-to-b ${colors.bg} text-center py-1`}>
            <span className="text-white text-[9px] font-bold">
              {isMastered ? '🏆 Carte maîtrisée !' : stars > 0 ? `⭐ En cours — retourne pour apprendre !` : '👆 Appuie pour le quiz !'}
            </span>
          </div>
        </div>

        {/* ── FACE ARRIÈRE — quiz interactif ── */}
        <div
          className={`absolute inset-0 rounded-2xl border-4 ${colors.border} shadow-xl overflow-hidden bg-white flex flex-col`}
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
        >
          <div className={`bg-gradient-to-b ${colors.bg} px-2 py-1.5 text-center flex-shrink-0`}>
            <p className="text-white font-extrabold text-xs drop-shadow line-clamp-1">{card.name}</p>
          </div>

          <div className="p-2 flex flex-col gap-1.5 flex-1 overflow-auto">
            {card.attacks.map((attack, i) => {
              const chosen = answeredMap[i];
              const isAnswered = chosen !== undefined;
              const isCorrect = isAnswered && chosen === attack.correctIndex;

              return (
                <div
                  key={i}
                  className={`rounded-xl border p-2 transition-colors ${
                    isAnswered
                      ? isCorrect
                        ? 'bg-green-50 border-green-300'
                        : 'bg-red-50 border-red-300'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <p className="text-[10px] font-bold text-gray-800 mb-1">
                    ⚡ {attack.name} · <span className="text-red-600">{attack.damage} dégâts</span>
                  </p>
                  <p className="text-[10px] text-gray-700 mb-1.5">{attack.question}</p>

                  <div className="grid grid-cols-2 gap-1.5">
                    {attack.answers.map((ans, j) => {
                      let btnStyle = 'bg-white border-gray-300 text-gray-700 active:scale-95 active:bg-purple-50';
                      if (isAnswered) {
                        if (j === attack.correctIndex)
                          btnStyle = 'bg-green-200 border-green-500 text-green-900 font-bold';
                        else if (j === chosen)
                          btnStyle = 'bg-red-200 border-red-500 text-red-900 line-through opacity-70';
                        else btnStyle = 'bg-white border-gray-200 text-gray-400 opacity-50';
                      }
                      return (
                        <button
                          key={j}
                          disabled={isAnswered}
                          onClick={(e) => handleAnswer(e, i, j)}
                          className={`border-2 rounded-xl px-1.5 py-2 text-[10px] text-left transition-all leading-tight ${btnStyle}`}
                        >
                          <span className="font-extrabold text-purple-500">{String.fromCharCode(65 + j)}.</span> {ans}
                        </button>
                      );
                    })}
                  </div>

                  {isAnswered && (
                    <p className={`text-[10px] font-extrabold text-center mt-1.5 pop-in ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                      {isCorrect
                        ? `✅ Bravo ! +${attack.damage} 💥`
                        : `❌ Réponse : ${String.fromCharCode(65 + attack.correctIndex)}`}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div className={`bg-gradient-to-b ${colors.bg} text-center py-0.5`}>
            <span className="text-white text-[9px] font-medium opacity-80">Appuie pour retourner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
