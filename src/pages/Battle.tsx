import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cards } from '../data/cards';
import { EducationalCard as CardType, SUBJECT_COLORS } from '../types/game';
import { CardMonster } from '../components/CardMonster';

// ── Types ────────────────────────────────────────────────────────────────────
interface BattleCard extends CardType {
  currentHp: number;
}

type Phase = 'select' | 'battle' | 'result';
type AnswerFeedback = null | 'correct' | 'wrong';

// ── Helpers ──────────────────────────────────────────────────────────────────
function randomEnemy(excludeId: string): BattleCard {
  const pool = cards.filter((c) => c.id !== excludeId);
  const base = pool[Math.floor(Math.random() * pool.length)];
  return { ...base, currentHp: base.hp };
}

// ── Mini card used in battle arena ───────────────────────────────────────────
function ArenaCard({
  card,
  hit,
  label,
}: {
  card: BattleCard;
  hit: boolean;
  label: 'Ennemi' | 'Toi';
}) {
  const colors = SUBJECT_COLORS[card.subject];
  const hpPct = Math.max(0, (card.currentHp / card.hp) * 100);
  const hpColor = hpPct > 50 ? 'bg-green-400' : hpPct > 25 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="flex items-center gap-3 px-4">
      {/* Monster */}
      <div className={`flex-shrink-0 w-20 h-20 ${hit ? 'monster-shake' : 'monster-float'}`}>
        <CardMonster cardId={card.id} className="w-full h-full" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <span className="text-white/60 text-[10px] font-bold uppercase tracking-wider">{label}</span>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
            {card.name.length > 14 ? card.name.slice(0, 13) + '…' : card.name}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-white/20 rounded-full h-3">
            <div
              className={`${hpColor} h-3 rounded-full transition-all duration-500`}
              style={{ width: `${hpPct}%` }}
            />
          </div>
          <span className="text-white text-[10px] font-bold w-14 text-right flex-shrink-0">
            {card.currentHp}/{card.hp} PV
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Mini preview card for selection screen ───────────────────────────────────
function SelectCard({ card, onSelect }: { card: CardType; onSelect: () => void }) {
  const colors = SUBJECT_COLORS[card.subject];
  return (
    <button
      onClick={onSelect}
      className={`rounded-2xl border-4 ${colors.border} overflow-hidden shadow-md active:scale-95 transition-transform text-left w-full`}
    >
      <div className={`bg-gradient-to-b ${colors.bg} px-2 py-1 text-center`}>
        <p className="text-white font-extrabold text-[10px] line-clamp-1">{card.name}</p>
      </div>
      <div className="bg-white flex items-center justify-center py-3 monster-float-slow">
        <CardMonster cardId={card.id} className="w-16 h-16" />
      </div>
      <div className="bg-amber-50 px-2 py-1.5">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-green-500 h-2 rounded-full" style={{ width: '100%' }} />
        </div>
        <p className="text-[9px] text-center text-gray-500 mt-0.5 font-semibold">PV {card.hp}</p>
      </div>
    </button>
  );
}

// ── Main Battle component ─────────────────────────────────────────────────────
export default function Battle() {
  const navigate = useNavigate();
  const [phase, setPhase] = useState<Phase>('select');
  const [playerCard, setPlayerCard] = useState<BattleCard | null>(null);
  const [enemyCard, setEnemyCard] = useState<BattleCard | null>(null);
  const [attackIndex, setAttackIndex] = useState(0);
  const [feedback, setFeedback] = useState<AnswerFeedback>(null);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);

  const selectCard = useCallback((card: CardType) => {
    const player: BattleCard = { ...card, currentHp: card.hp };
    const enemy = randomEnemy(card.id);
    setPlayerCard(player);
    setEnemyCard(enemy);
    setAttackIndex(0);
    setFeedback(null);
    setChosenIndex(null);
    setWinner(null);
    setPhase('battle');
  }, []);

  const handleAnswer = useCallback(
    (chosen: number) => {
      if (!playerCard || !enemyCard || feedback !== null) return;

      const attack = playerCard.attacks[attackIndex % playerCard.attacks.length];
      const correct = chosen === attack.correctIndex;

      setChosenIndex(chosen);
      setFeedback(correct ? 'correct' : 'wrong');

      if (correct) {
        setEnemyHit(true);
        const newEnemyHp = Math.max(0, enemyCard.currentHp - attack.damage);
        setTimeout(() => setEnemyHit(false), 600);
        setTimeout(() => {
          setEnemyCard((prev) => (prev ? { ...prev, currentHp: newEnemyHp } : null));
          if (newEnemyHp <= 0) {
            setWinner('player');
            setTimeout(() => setPhase('result'), 800);
            return;
          }
          // Next turn
          setAttackIndex((i) => i + 1);
          setFeedback(null);
          setChosenIndex(null);
        }, 1200);
      } else {
        setPlayerHit(true);
        const newPlayerHp = Math.max(0, playerCard.currentHp - attack.damage);
        setTimeout(() => setPlayerHit(false), 600);
        setTimeout(() => {
          setPlayerCard((prev) => (prev ? { ...prev, currentHp: newPlayerHp } : null));
          if (newPlayerHp <= 0) {
            setWinner('enemy');
            setTimeout(() => setPhase('result'), 800);
            return;
          }
          // Next turn
          setAttackIndex((i) => i + 1);
          setFeedback(null);
          setChosenIndex(null);
        }, 1200);
      }
    },
    [playerCard, enemyCard, attackIndex, feedback],
  );

  // ── SELECT PHASE ─────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
        <header className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg px-4 py-3 flex items-center gap-3">
          <button onClick={() => navigate('/')} className="text-white text-xl leading-none">←</button>
          <div>
            <h1 className="text-base font-extrabold text-white leading-tight">⚔️ Choisis ta carte !</h1>
            <p className="text-purple-200 text-[10px]">Celle qui va au combat…</p>
          </div>
        </header>
        <div className="p-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {cards.map((card) => (
            <SelectCard key={card.id} card={card} onSelect={() => selectCard(card)} />
          ))}
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ─────────────────────────────────────────────────────────
  if (phase === 'result') {
    const won = winner === 'player';
    const loser = won ? enemyCard : playerCard;
    const winner_card = won ? playerCard : enemyCard;

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex flex-col items-center justify-center p-6 text-center">
        <div className={`text-7xl mb-3 pop-in`}>{won ? '🏆' : '💀'}</div>

        <h2 className="text-3xl font-extrabold text-white mb-1 slide-up">
          {won ? 'VICTOIRE !' : 'DÉFAITE…'}
        </h2>
        <p className="text-purple-300 mb-6 slide-up">
          {won
            ? `Tu as mis K.O. ${enemyCard?.name} !`
            : `${enemyCard?.name} t'a eu cette fois !`}
        </p>

        {/* Winner monster */}
        {winner_card && (
          <div className="mb-4 monster-float pop-in">
            <CardMonster cardId={winner_card.id} className="w-32 h-32 mx-auto" />
          </div>
        )}

        {/* Stars */}
        <div
          className={`rounded-2xl px-6 py-3 mb-8 border pop-in ${
            won
              ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
              : 'bg-white/10 border-white/20 text-white/70'
          }`}
        >
          <p className="text-2xl font-extrabold">{won ? '⭐ ⭐ ⭐' : '☆ ☆ ☆'}</p>
          <p className="text-sm font-semibold mt-1">
            {won ? 'Bravo, tu es un champion !' : 'Entraîne-toi encore !'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('select')}
            className="bg-yellow-400 text-yellow-900 font-extrabold px-6 py-3 rounded-full text-base shadow-lg active:scale-95 transition-transform"
          >
            ⚔️ Rejouer
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-white/15 text-white font-bold px-6 py-3 rounded-full text-base border border-white/30 active:scale-95 transition-transform"
          >
            🏠 Retour
          </button>
        </div>
      </div>
    );
  }

  // ── BATTLE PHASE ─────────────────────────────────────────────────────────
  if (!playerCard || !enemyCard) return null;

  const attack = playerCard.attacks[attackIndex % playerCard.attacks.length];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-purple-900 to-slate-900 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1 active:bg-white/10"
        >
          ✕ Quitter
        </button>
        <span className="text-white font-extrabold text-sm tracking-widest">⚔️ BATAILLE</span>
        <span className="text-white/50 text-xs">Tour {attackIndex + 1}</span>
      </div>

      {/* Enemy */}
      <div className="py-2 flex-shrink-0">
        <ArenaCard card={enemyCard} hit={enemyHit} label="Ennemi" />
      </div>

      {/* VS divider */}
      <div className="flex items-center gap-2 px-6 my-1 flex-shrink-0">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/40 text-xs font-bold">VS</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Question zone */}
      <div className="mx-3 my-2 flex-shrink-0">
        <div className="bg-white rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-purple-600">⚡ {attack.name}</span>
            <span className="ml-auto text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              {attack.damage} dégâts
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-3 leading-snug">{attack.question}</p>

          <div className="grid grid-cols-2 gap-2">
            {attack.answers.map((ans, j) => {
              let style =
                'bg-gray-50 border-gray-200 text-gray-800 active:scale-95 active:bg-purple-50 active:border-purple-400';
              if (feedback !== null) {
                if (j === attack.correctIndex)
                  style = 'bg-green-100 border-green-500 text-green-800 font-bold';
                else if (j === chosenIndex)
                  style = 'bg-red-100 border-red-500 text-red-800 line-through opacity-70';
                else style = 'bg-white border-gray-100 text-gray-400 opacity-50';
              }
              return (
                <button
                  key={j}
                  disabled={feedback !== null}
                  onClick={() => handleAnswer(j)}
                  className={`border-2 rounded-xl px-3 py-2.5 text-xs font-semibold text-left transition-all ${style}`}
                >
                  <span className="font-extrabold mr-1 text-purple-500">{String.fromCharCode(65 + j)}.</span>
                  {ans}
                </button>
              );
            })}
          </div>

          {/* Feedback message */}
          {feedback === 'correct' && (
            <p className="text-center text-green-600 font-extrabold text-sm mt-2 pop-in">
              ✅ +{attack.damage} dégâts à l'ennemi !
            </p>
          )}
          {feedback === 'wrong' && (
            <p className="text-center text-red-600 font-extrabold text-sm mt-2 pop-in">
              ❌ -{attack.damage} PV perdus…
            </p>
          )}
        </div>
      </div>

      {/* VS divider */}
      <div className="flex items-center gap-2 px-6 my-1 flex-shrink-0">
        <div className="flex-1 h-px bg-white/10" />
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Player */}
      <div className="py-2 flex-shrink-0 mt-auto">
        <ArenaCard card={playerCard} hit={playerHit} label="Toi" />
      </div>
    </div>
  );
}
