import { useState, useCallback, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cards } from '../data/cards';
import { EducationalCard as CardType, SUBJECT_COLORS } from '../types/game';
import { CardMonster } from '../components/CardMonster';
import { useProgress } from '../hooks/useProgress';
import { useProfile } from '../hooks/useProfile';
import { useSound } from '../hooks/useSound';

// ── Types ────────────────────────────────────────────────────────────────────
interface BattleCard extends CardType {
  currentHp: number;
}

type Phase = 'difficulty' | 'select' | 'battle' | 'result';

type Difficulty = 'facile' | 'normal' | 'legendaire';

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; emoji: string; desc: string; hpMult: number; dmgMult: number; color: string }> = {
  facile:     { label: 'Facile',      emoji: '🌱', desc: 'Ennemis avec moins de PV',         hpMult: 0.6, dmgMult: 0.8, color: 'bg-green-500' },
  normal:     { label: 'Normal',      emoji: '⚔️',  desc: 'L\'équilibre parfait',             hpMult: 1.0, dmgMult: 1.0, color: 'bg-blue-500' },
  legendaire: { label: 'Légendaire',  emoji: '🔥', desc: 'Ennemis redoutables, max de dégâts', hpMult: 1.5, dmgMult: 1.4, color: 'bg-red-600' },
};
type AnswerFeedback = null | 'correct' | 'wrong';

interface Floater {
  id: number;
  text: string;
  color: string; // Tailwind text color class
  target: 'enemy' | 'player';
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function randomEnemy(excludeId: string, hpMult: number, pool: CardType[]): BattleCard {
  const filtered = pool.filter((c) => c.id !== excludeId);
  const fallback = filtered.length > 0 ? filtered : pool;
  const base = fallback[Math.floor(Math.random() * fallback.length)];
  const scaledHp = Math.round(base.hp * hpMult);
  return { ...base, hp: scaledHp, currentHp: scaledHp };
}

// ── Damage floater ────────────────────────────────────────────────────────────
function DamageFloater({ floater }: { floater: Floater }) {
  return (
    <div
      key={floater.id}
      className={`absolute pointer-events-none font-extrabold text-xl drop-shadow-lg pop-in z-30 ${floater.color} ${
        floater.target === 'enemy' ? 'top-2 left-1/2 -translate-x-1/2' : 'bottom-2 left-1/2 -translate-x-1/2'
      }`}
    >
      {floater.text}
    </div>
  );
}

// ── Streak badge ─────────────────────────────────────────────────────────────
function StreakBadge({ streak }: { streak: number }) {
  if (streak < 2) return null;
  const bonus = streak >= 3;
  return (
    <div className={`flex items-center justify-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold pop-in ${
      bonus ? 'bg-orange-500 text-white shadow-lg' : 'bg-orange-100 text-orange-700 border border-orange-300'
    }`}>
      🔥 Série x{streak}{bonus ? ' · +50% dégâts !' : ''}
    </div>
  );
}

// ── Arena card (monster + HP bar) ────────────────────────────────────────────
function ArenaCard({ card, hit, label }: { card: BattleCard; hit: boolean; label: 'Ennemi' | 'Toi' }) {
  const colors = SUBJECT_COLORS[card.subject];
  const hpPct = Math.max(0, (card.currentHp / card.hp) * 100);
  const hpColor = hpPct > 50 ? 'bg-green-400' : hpPct > 25 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="flex items-center gap-3 px-4">
      <div className={`flex-shrink-0 w-20 h-20 ${hit ? 'monster-shake' : 'monster-float'}`}>
        <CardMonster cardId={card.id} className="w-full h-full" />
      </div>
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

// ── Mini selection card ───────────────────────────────────────────────────────
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
  const { recordBattle, pendingBadges, clearPendingBadges } = useProgress();
  const { currentProfile } = useProfile();
  const { playSuccess, playError, playVictory, playDefeat, playBadge } = useSound();
  const levelCards = cards.filter((c) => c.level === (currentProfile?.level ?? 1));
  const floaterIdRef = useRef(0);

  useEffect(() => {
    if (pendingBadges.length > 0) {
      playBadge();
      clearPendingBadges();
    }
  }, [pendingBadges]);

  const [phase, setPhase] = useState<Phase>('difficulty');
  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [playerCard, setPlayerCard] = useState<BattleCard | null>(null);
  const [enemyCard, setEnemyCard] = useState<BattleCard | null>(null);
  const [attackIndex, setAttackIndex] = useState(0);
  const [feedback, setFeedback] = useState<AnswerFeedback>(null);
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [winner, setWinner] = useState<'player' | 'enemy' | null>(null);
  const [playerHit, setPlayerHit] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [streak, setStreak] = useState(0);
  const [floaters, setFloaters] = useState<Floater[]>([]);
  const [resultRecorded, setResultRecorded] = useState(false);

  const addFloater = useCallback((text: string, color: string, target: 'enemy' | 'player') => {
    const id = ++floaterIdRef.current;
    setFloaters((prev) => [...prev, { id, text, color, target }]);
    setTimeout(() => setFloaters((prev) => prev.filter((f) => f.id !== id)), 1000);
  }, []);

  const selectCard = useCallback((card: CardType) => {
    const cfg = DIFFICULTY_CONFIG[difficulty];
    setPlayerCard({ ...card, currentHp: card.hp });
    setEnemyCard(randomEnemy(card.id, cfg.hpMult, levelCards));
    setAttackIndex(0);
    setFeedback(null);
    setChosenIndex(null);
    setWinner(null);
    setStreak(0);
    setFloaters([]);
    setResultRecorded(false);
    setPhase('battle');
  }, [difficulty]);

  const handleAnswer = useCallback(
    (chosen: number) => {
      if (!playerCard || !enemyCard || feedback !== null) return;

      const attack = playerCard.attacks[attackIndex % playerCard.attacks.length];
      const correct = chosen === attack.correctIndex;
      const newStreak = correct ? streak + 1 : 0;
      const streakMult = correct && streak >= 2 ? 1.5 : 1;
      const diffMult = DIFFICULTY_CONFIG[difficulty].dmgMult;
      const damage = Math.round(attack.damage * streakMult * diffMult);

      setChosenIndex(chosen);
      setFeedback(correct ? 'correct' : 'wrong');
      setStreak(newStreak);

      if (correct) {
        playSuccess();
        setEnemyHit(true);
        addFloater(`-${damage} 💥`, 'text-red-400', 'enemy');
        setTimeout(() => setEnemyHit(false), 600);

        const newEnemyHp = Math.max(0, enemyCard.currentHp - damage);
        setTimeout(() => {
          setEnemyCard((prev) => (prev ? { ...prev, currentHp: newEnemyHp } : null));
          if (newEnemyHp <= 0) {
            setWinner('player');
            setTimeout(() => setPhase('result'), 600);
            return;
          }
          setAttackIndex((i) => i + 1);
          setFeedback(null);
          setChosenIndex(null);
        }, 1200);
      } else {
        playError();
        setPlayerHit(true);
        addFloater(`-${attack.damage} 💔`, 'text-pink-400', 'player');
        setTimeout(() => setPlayerHit(false), 600);

        const newPlayerHp = Math.max(0, playerCard.currentHp - attack.damage);
        setTimeout(() => {
          setPlayerCard((prev) => (prev ? { ...prev, currentHp: newPlayerHp } : null));
          if (newPlayerHp <= 0) {
            setWinner('enemy');
            setTimeout(() => setPhase('result'), 600);
            return;
          }
          setAttackIndex((i) => i + 1);
          setFeedback(null);
          setChosenIndex(null);
        }, 1200);
      }
    },
    [playerCard, enemyCard, attackIndex, feedback, streak, difficulty, addFloater],
  );

  // ── DIFFICULTY PHASE ──────────────────────────────────────────────────────
  if (phase === 'difficulty') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex flex-col items-center justify-center p-6 text-center page-fade">
        <div className="text-6xl mb-3 pop-in">⚔️</div>
        <h1 className="text-3xl font-extrabold text-white mb-1 slide-up">Choisir la difficulté</h1>
        <p className="text-purple-300 text-sm mb-8 slide-up">Plus c'est dur, plus c'est gloire !</p>

        <div className="w-full max-w-sm space-y-3 mb-8">
          {(Object.entries(DIFFICULTY_CONFIG) as [Difficulty, typeof DIFFICULTY_CONFIG[Difficulty]][]).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => { setDifficulty(key); setPhase('select'); }}
              className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 border-2 transition-all active:scale-95 ${
                difficulty === key
                  ? 'border-yellow-400 bg-white/20 shadow-lg'
                  : 'border-white/20 bg-white/10'
              }`}
            >
              <span className="text-3xl flex-shrink-0">{cfg.emoji}</span>
              <div className="flex-1 text-left">
                <p className="text-white font-extrabold text-base">{cfg.label}</p>
                <p className="text-purple-300 text-xs">{cfg.desc}</p>
              </div>
              <div className={`w-3 h-3 rounded-full flex-shrink-0 ${cfg.color}`} />
            </button>
          ))}
        </div>

        <button
          onClick={() => navigate('/')}
          className="text-purple-300 text-sm underline"
        >
          ← Retour à la collection
        </button>
      </div>
    );
  }

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
          {levelCards.map((card) => (
            <SelectCard key={card.id} card={card} onSelect={() => selectCard(card)} />
          ))}
        </div>
      </div>
    );
  }

  // ── RESULT PHASE ─────────────────────────────────────────────────────────
  if (phase === 'result') {
    const won = winner === 'player';
    const xpGained = won ? 30 : 10;
    // Record once
    if (!resultRecorded) {
      recordBattle(won);
      setResultRecorded(true);
      if (won) playVictory(); else playDefeat();
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-purple-900 flex flex-col items-center justify-center p-6 text-center">
        <div className="text-7xl mb-3 pop-in" style={won ? { filter: 'drop-shadow(0 0 20px rgba(255,220,0,0.6))' } : {}}>
          {won ? '🏆' : '💀'}
        </div>

        <h2 className="text-3xl font-extrabold text-white mb-1 slide-up">
          {won ? 'VICTOIRE !' : 'DÉFAITE…'}
        </h2>
        <p className="text-purple-300 mb-2 slide-up">
          {won ? `Tu as mis K.O. ${enemyCard?.name} !` : `${enemyCard?.name} t'a eu cette fois !`}
        </p>
        <div className="bg-yellow-400/20 border border-yellow-400/50 rounded-2xl px-5 py-1.5 mb-4 pop-in">
          <p className="text-yellow-300 font-extrabold text-sm">✨ +{xpGained} XP</p>
        </div>

        {/* Winning monster */}
        {(won ? playerCard : enemyCard) && (
          <div className="mb-4 monster-float pop-in">
            <CardMonster cardId={(won ? playerCard! : enemyCard!).id} className="w-32 h-32 mx-auto" />
          </div>
        )}

        <div className={`rounded-2xl px-6 py-3 mb-8 border pop-in ${
          won
            ? 'bg-yellow-400/20 border-yellow-400 text-yellow-300'
            : 'bg-white/10 border-white/20 text-white/60'
        }`}>
          <p className="text-2xl font-extrabold">{won ? '⭐ ⭐ ⭐' : '☆ ☆ ☆'}</p>
          <p className="text-sm font-semibold mt-1">
            {won ? 'Bravo, tu es un champion !' : 'Entraîne-toi encore !'}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setPhase('difficulty')}
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
    <div className="min-h-screen bg-gradient-to-b from-slate-800 via-purple-900 to-slate-900 flex flex-col overflow-hidden relative">

      {/* Damage floaters (absolute, full-screen) */}
      {floaters.map((f) => <DamageFloater key={f.id} floater={f} />)}

      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-2 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1 active:bg-white/10"
        >
          ✕ Quitter
        </button>
        <span className="text-white font-extrabold text-sm tracking-widest">⚔️ BATAILLE</span>
        <span className={`text-white text-xs font-bold px-2 py-0.5 rounded-full ${DIFFICULTY_CONFIG[difficulty].color}`}>
          {DIFFICULTY_CONFIG[difficulty].emoji} Tour {attackIndex + 1}
        </span>
      </div>

      {/* Enemy */}
      <div className="py-2 flex-shrink-0">
        <ArenaCard card={enemyCard} hit={enemyHit} label="Ennemi" />
      </div>

      {/* Divider */}
      <div className="flex items-center gap-2 px-6 my-1 flex-shrink-0">
        <div className="flex-1 h-px bg-white/10" />
        <span className="text-white/30 text-xs font-bold">VS</span>
        <div className="flex-1 h-px bg-white/10" />
      </div>

      {/* Question zone */}
      <div className="mx-3 my-2 flex-shrink-0">
        <div className="bg-white rounded-2xl p-3 shadow-2xl">

          {/* Streak badge */}
          {streak >= 2 && (
            <div className="mb-2">
              <StreakBadge streak={streak} />
            </div>
          )}

          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-extrabold text-purple-600">⚡ {attack.name}</span>
            <span className="ml-auto text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              {streak >= 2 ? Math.round(attack.damage * 1.5) : attack.damage} dégâts
              {streak >= 2 && <span className="text-orange-500"> 🔥</span>}
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

          {feedback === 'correct' && (
            <p className="text-center text-green-600 font-extrabold text-sm mt-2 pop-in">
              ✅ {streak >= 3 ? `Série x${streak} !` : 'Bien joué !'} −{streak >= 2 ? Math.round(attack.damage * 1.5) : attack.damage} PV à l'ennemi !
            </p>
          )}
          {feedback === 'wrong' && (
            <p className="text-center text-red-600 font-extrabold text-sm mt-2 pop-in">
              ❌ Raté… −{attack.damage} PV perdus.
            </p>
          )}
        </div>
      </div>

      {/* Divider */}
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
