import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EducationalCard } from '../components/EducationalCard';
import { CardMonster } from '../components/CardMonster';
import { PlayerSetup } from '../components/PlayerSetup';
import { Confetti } from '../components/Confetti';
import { cards } from '../data/cards';
import { Subject, SUBJECT_LABELS, SUBJECT_COLORS, EducationalCard as CardType } from '../types/game';
import { useProgress } from '../hooks/useProgress';
import { useProfile } from '../hooks/useProfile';
import { useSound } from '../hooks/useSound';
import { Achievement, ACHIEVEMENTS } from '../data/achievements';

function getTimeGreeting(name: string): { emoji: string; text: string; tip: string } {
  const h = new Date().getHours();
  if (h >= 5 && h < 12) return {
    emoji: '☀️',
    text: `Bonjour ${name} !`,
    tip: 'Un bon début de journée commence par réviser une carte 🃏',
  };
  if (h >= 12 && h < 18) return {
    emoji: '🌤️',
    text: `Bon après-midi ${name} !`,
    tip: "C'est le bon moment pour un Quiz Chrono ⏱️",
  };
  return {
    emoji: '🌙',
    text: `Bonsoir ${name} !`,
    tip: 'Une petite bataille avant de dormir ? ⚔️',
  };
}

const COLLECTION_SUBJECTS: { value: Subject; label: string; emoji: string; progressBg: string }[] = [
  { value: 'maths',      label: 'Maths',       emoji: '➕', progressBg: 'bg-blue-400'   },
  { value: 'sciences',   label: 'Sciences',    emoji: '🔬', progressBg: 'bg-green-400'  },
  { value: 'histoire',   label: 'Histoire',    emoji: '🏛️', progressBg: 'bg-orange-400' },
  { value: 'langues',    label: 'Langues',     emoji: '💬', progressBg: 'bg-pink-400'   },
  { value: 'géographie', label: 'Géographie',  emoji: '🗺️', progressBg: 'bg-teal-400'   },
];

// ── Mini card (possédée) ───────────────────────────────────────────────────────
function MiniCard({ card, stars, onTap }: { card: CardType; stars: 0 | 1 | 2 | 3; onTap: () => void }) {
  const colors = SUBJECT_COLORS[card.subject];
  const isMastered = stars === 3;
  return (
    <button
      onClick={onTap}
      className={`flex-shrink-0 w-[88px] rounded-xl border-2 ${colors.border} overflow-hidden active:scale-95 transition-transform shadow-md relative`}
    >
      {isMastered && (
        <div className="absolute inset-0 card-mastered-shimmer z-10 rounded-xl pointer-events-none" />
      )}
      <div className={`bg-gradient-to-b ${colors.bg} px-1 py-0.5 text-center`}>
        <p className="text-white font-extrabold text-[8px] truncate leading-tight">{card.name}</p>
      </div>
      <div className="bg-white flex items-center justify-center py-2">
        <CardMonster cardId={card.id} className="w-[52px] h-[52px]" />
      </div>
      <div className={`bg-gradient-to-t ${colors.bg} px-1 py-0.5 text-center`}>
        <span className="text-[9px]">
          {'⭐'.repeat(stars)}{'☆'.repeat(3 - stars)}
        </span>
      </div>
    </button>
  );
}

// ── Carte verrouillée ─────────────────────────────────────────────────────────
function LockedCard({ onTap }: { onTap: () => void }) {
  return (
    <button
      onClick={onTap}
      className="flex-shrink-0 w-[88px] rounded-xl border-2 border-gray-300 overflow-hidden active:scale-95 transition-transform shadow-sm"
    >
      <div className="bg-gray-300 px-1 py-0.5 text-center">
        <p className="text-gray-500 font-extrabold text-[8px]">???</p>
      </div>
      <div className="bg-gradient-to-b from-gray-200 to-gray-300 flex flex-col items-center justify-center py-2 gap-0.5 h-[62px]">
        <span className="text-2xl">🔒</span>
        <p className="text-[9px] text-gray-500 font-semibold">Débloque !</p>
      </div>
      <div className="bg-gray-300 px-1 py-0.5 text-center">
        <span className="text-[9px] text-gray-400">☆☆☆</span>
      </div>
    </button>
  );
}

// ── Badge notification popup ───────────────────────────────────────────────────
function BadgeNotification({ badge, onDone }: { badge: Achievement; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 pop-in">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-yellow-300 px-5 py-3 flex items-center gap-3 max-w-[90vw]">
        <span className="text-3xl">{badge.emoji}</span>
        <div>
          <p className="text-xs text-yellow-600 font-bold uppercase tracking-wider">Badge débloqué !</p>
          <p className="text-sm font-extrabold text-gray-800">{badge.name}</p>
          <p className="text-[11px] text-gray-500">{badge.description}</p>
        </div>
      </div>
    </div>
  );
}

// ── XP toast ──────────────────────────────────────────────────────────────────
function XpToast({ xp, onDone }: { xp: number; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 1400);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div className="fixed top-20 right-4 z-50 pop-in pointer-events-none">
      <div className="bg-yellow-400 text-yellow-900 font-extrabold text-sm px-3 py-1.5 rounded-full shadow-lg">
        ✨ +{xp} XP
      </div>
    </div>
  );
}

// ── Popup passage de niveau ────────────────────────────────────────────────────
function LevelUpPopup({ level, levelName, onDone }: { level: number; levelName: string; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3500);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div className="bg-gradient-to-br from-yellow-400 to-orange-400 rounded-3xl shadow-2xl px-8 py-6 flex flex-col items-center gap-2 pop-in pointer-events-auto max-w-[85vw]">
        <span className="text-5xl">🚀</span>
        <p className="text-yellow-900 font-extrabold text-xl text-center">Niveau {level} atteint !</p>
        <p className="text-yellow-800 font-bold text-sm text-center">{levelName}</p>
        <div className="flex gap-1 mt-1">
          {Array.from({ length: Math.min(level, 5) }).map((_, i) => (
            <span key={i} className="text-yellow-900 text-lg">⭐</span>
          ))}
        </div>
      </div>
    </div>
  );
}

const Index = () => {
  const navigate = useNavigate();
  const {
    markCorrect, getStars, stats, resetProgress, isDailyDone,
    pendingBadges, clearPendingBadges, ownedCards,
    xp, streak, level, levelName, levelProgress,
  } = useProgress();
  const { profile, saveProfile } = useProfile();
  const { playSuccess, playBadge, playLevelUp } = useSound();

  const [showReset, setShowReset] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Achievement | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; name: string } | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [lockedHint, setLockedHint] = useState(false);

  const prevLevelRef = useRef(level);
  const badgeQueueRef = useRef<Achievement[]>([]);
  const showingBadgeRef = useRef(false);

  // Afficher les badges en file d'attente
  useEffect(() => {
    if (pendingBadges.length > 0) {
      badgeQueueRef.current = [...badgeQueueRef.current, ...pendingBadges];
      clearPendingBadges();
      showNextBadge();
    }
  }, [pendingBadges]);

  function showNextBadge() {
    if (showingBadgeRef.current || badgeQueueRef.current.length === 0) return;
    showingBadgeRef.current = true;
    const next = badgeQueueRef.current.shift()!;
    setCurrentBadge(next);
    playBadge();
  }

  function onBadgeDone() {
    setCurrentBadge(null);
    showingBadgeRef.current = false;
    setTimeout(showNextBadge, 300);
  }

  // Détecter un passage de niveau → popup
  useEffect(() => {
    if (level > prevLevelRef.current) {
      prevLevelRef.current = level;
      playLevelUp();
      setLevelUpData({ level, name: levelName });
    }
  }, [level, levelName]);

  // Masquer le hint carte verrouillée
  useEffect(() => {
    if (!lockedHint) return;
    const t = setTimeout(() => setLockedHint(false), 2500);
    return () => clearTimeout(t);
  }, [lockedHint]);

  const handleCorrectAnswer = (cardId: string, attackIdx: number) => {
    markCorrect(cardId, attackIdx);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
    playSuccess();
    setXpToast(5);
  };

  if (!profile) {
    return <PlayerSetup onSave={saveProfile} />;
  }

  const selectedCard = selectedCardId ? cards.find((c) => c.id === selectedCardId) ?? null : null;

  const handleReset = () => {
    resetProgress();
    setShowReset(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex flex-col">
      <Confetti active={showConfetti} duration={1800} />

      {/* Badge notification */}
      {currentBadge && <BadgeNotification badge={currentBadge} onDone={onBadgeDone} />}

      {/* Level-up popup */}
      {levelUpData && (
        <LevelUpPopup
          level={levelUpData.level}
          levelName={levelUpData.name}
          onDone={() => setLevelUpData(null)}
        />
      )}

      {/* XP toast */}
      {xpToast !== null && (
        <XpToast xp={xpToast} onDone={() => setXpToast(null)} />
      )}

      {/* Hint carte verrouillée */}
      {lockedHint && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 pop-in pointer-events-none">
          <div className="bg-gray-800 text-white text-xs font-semibold px-4 py-2 rounded-full shadow-lg whitespace-nowrap">
            🔒 Joue en Entraînement pour débloquer !
          </div>
        </div>
      )}

      {/* Modal carte sélectionnée */}
      {selectedCard && (
        <div
          className="fixed inset-0 z-40 bg-black/60 flex items-end justify-center page-fade"
          onClick={() => setSelectedCardId(null)}
        >
          <div
            className="max-h-[92vh] overflow-y-auto scrollbar-none pb-6 px-4 w-full max-w-sm slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center mt-3 mb-2">
              <div className="w-10 h-1 bg-white/40 rounded-full" />
            </div>
            <EducationalCard
              card={selectedCard}
              stars={getStars(selectedCard.id, selectedCard.attacks.length)}
              onCorrectAnswer={(attackIdx) => handleCorrectAnswer(selectedCard.id, attackIdx)}
            />
            <button
              onClick={() => setSelectedCardId(null)}
              className="mt-3 w-full bg-white/20 text-white font-bold py-2.5 rounded-xl text-sm active:scale-95 transition-transform border border-white/30"
            >
              Fermer ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex-1 min-w-0">
            {/* Nom + niveau */}
            <div className="flex items-center gap-2">
              <h1 className="text-base font-extrabold text-white leading-tight truncate">
                🃏 {profile.name}
              </h1>
              <span className="bg-yellow-400 text-yellow-900 font-extrabold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0">
                Niv.{level}
              </span>
              {streak >= 2 && (
                <span className="bg-orange-500 text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full flex-shrink-0 flex items-center gap-0.5">
                  🔥{streak}
                </span>
              )}
            </div>
            {/* Barre XP */}
            <div className="flex items-center gap-1.5 mt-1">
              <div className="flex-1 bg-white/20 rounded-full h-1.5">
                <div
                  className="bg-yellow-400 h-1.5 rounded-full transition-all duration-700"
                  style={{ width: `${levelProgress * 100}%` }}
                />
              </div>
              <span className="text-purple-200 text-[10px] flex-shrink-0">{levelName}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 ml-2">
            <button
              onClick={() => navigate('/entrainement')}
              className="bg-green-500 active:bg-green-400 text-white font-extrabold px-2.5 py-1.5 rounded-full text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap"
            >
              🌱 Entraîne
            </button>
            <button
              onClick={() => navigate('/quiz')}
              className="bg-indigo-500 active:bg-indigo-400 text-white font-extrabold px-2.5 py-1.5 rounded-full text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap"
            >
              🎯 Quiz
            </button>
            <button
              onClick={() => navigate('/battle')}
              className="bg-yellow-400 active:bg-yellow-300 text-yellow-900 font-extrabold px-2.5 py-1.5 rounded-full text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap"
            >
              ⚔️ Bataille
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 py-3 flex flex-col gap-3">

        {/* Stats bar */}
        <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3 py-1.5 text-xs text-gray-600 shadow-sm">
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="whitespace-nowrap font-semibold">🃏 {ownedCards.length}/{cards.length}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(ownedCards.length / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {stats.battleTotal > 0 && (
            <span className="whitespace-nowrap font-semibold flex-shrink-0">
              ⚔️ {stats.battleWins}/{stats.battleTotal}
            </span>
          )}

          <button
            onClick={() => setShowBadges((v) => !v)}
            className="flex-shrink-0 font-semibold text-purple-600 border border-purple-200 rounded-full px-2 py-0.5 text-[10px] active:scale-95 transition-transform"
          >
            🏅 Badges
          </button>

          <button
            onClick={() => navigate('/parents')}
            className="flex-shrink-0 text-gray-400 text-base leading-none"
            title="Espace parents"
          >
            👨‍👩‍👧
          </button>

          <button
            onClick={() => setShowReset(true)}
            className="flex-shrink-0 text-gray-400 text-base leading-none"
            title="Réinitialiser la progression"
          >
            ⚙️
          </button>
        </div>

        {/* Salutation personnalisée */}
        {(() => {
          const g = getTimeGreeting(profile.name);
          return (
            <div className="flex items-center gap-3 bg-white/80 rounded-xl px-3 py-2.5 shadow-sm">
              <span className="text-2xl flex-shrink-0">{g.emoji}</span>
              <div className="min-w-0">
                <p className="font-extrabold text-sm text-gray-800 leading-tight">{g.text}</p>
                <p className="text-xs text-gray-500 leading-tight">{g.tip}</p>
              </div>
            </div>
          );
        })()}

        {/* Daily challenge banner */}
        <button
          onClick={() => navigate('/quiz')}
          className={`w-full flex items-center gap-3 rounded-xl px-4 py-3 text-left active:scale-95 transition-transform shadow-sm ${
            isDailyDone
              ? 'bg-green-100 border-2 border-green-300'
              : 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white'
          }`}
        >
          <span className="text-2xl flex-shrink-0">{isDailyDone ? '✅' : '🎯'}</span>
          <div className="flex-1 min-w-0">
            <p className={`font-extrabold text-sm ${isDailyDone ? 'text-green-700' : 'text-white'}`}>
              {isDailyDone ? 'Défi du jour accompli !' : 'Défi du jour — Quiz Chrono'}
            </p>
            <p className={`text-xs ${isDailyDone ? 'text-green-600' : 'text-indigo-100'}`}>
              {isDailyDone ? 'Reviens demain pour un nouveau défi 🌅' : '10 questions · 15s · +25 XP bonus'}
            </p>
          </div>
          {!isDailyDone && <span className="text-white font-bold text-lg flex-shrink-0">→</span>}
        </button>

        {/* Badges panel */}
        {showBadges && <BadgesPanel />}

        {/* Reset confirmation */}
        {showReset && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm slide-up">
            <p className="font-semibold text-red-700 mb-2">Effacer toute la progression ?</p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="bg-red-500 text-white font-bold px-4 py-1.5 rounded-full text-xs active:scale-95"
              >
                Oui, tout effacer
              </button>
              <button
                onClick={() => setShowReset(false)}
                className="bg-gray-200 text-gray-700 font-bold px-4 py-1.5 rounded-full text-xs active:scale-95"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* ── Ma Collection ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-extrabold text-gray-700">🃏 Ma Collection</h2>
            <span className="text-xs text-gray-400">{ownedCards.length}/{cards.length} cartes</span>
          </div>

          {/* Bannière vide */}
          {ownedCards.length === 0 && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl px-4 py-4 mb-3 text-center slide-up">
              <div className="text-3xl mb-2">🃏</div>
              <p className="font-extrabold text-sm text-indigo-700">Ta collection est vide !</p>
              <p className="text-xs text-indigo-500 mt-1">
                Joue en mode Entraînement<br />pour gagner tes premières cartes
              </p>
              <button
                onClick={() => navigate('/entrainement')}
                className="mt-3 bg-indigo-500 text-white font-extrabold px-4 py-2 rounded-full text-xs active:scale-95 transition-transform shadow-md"
              >
                🌱 Commencer l'entraînement
              </button>
            </div>
          )}

          {/* Piles par matière */}
          {COLLECTION_SUBJECTS.map((subject) => {
            const subCards = cards.filter((c) => c.subject === subject.value);
            const ownedInSubject = subCards.filter((c) => ownedCards.includes(c.id));
            const lockedInSubject = subCards.filter((c) => !ownedCards.includes(c.id));
            const isComplete = lockedInSubject.length === 0;

            return (
              <div key={subject.value} className="mb-5">
                {/* En-tête matière */}
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-base">{subject.emoji}</span>
                  <span className="font-extrabold text-xs text-gray-700">{subject.label}</span>
                  {isComplete && (
                    <span className="text-[9px] font-extrabold text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">
                      ✓ Complet !
                    </span>
                  )}
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 mx-1">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ${subject.progressBg}`}
                      style={{ width: `${(ownedInSubject.length / subCards.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-gray-500 flex-shrink-0">
                    {ownedInSubject.length}/{subCards.length}
                  </span>
                </div>

                {/* Rangée de cartes */}
                <div className="flex gap-2 overflow-x-auto scrollbar-none pb-1">
                  {[...ownedInSubject, ...lockedInSubject].map((card) => {
                    const isOwned = ownedCards.includes(card.id);
                    if (isOwned) {
                      return (
                        <MiniCard
                          key={card.id}
                          card={card}
                          stars={getStars(card.id, card.attacks.length)}
                          onTap={() => setSelectedCardId(card.id)}
                        />
                      );
                    }
                    return (
                      <LockedCard
                        key={card.id}
                        onTap={() => setLockedHint(true)}
                      />
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <footer className="text-center py-3 text-gray-400 text-[10px]">
        Pokedex-Pals — Jeu éducatif pour les élèves du primaire 🎓
        <span className="ml-2 bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono">v1.6.0</span>
      </footer>
    </div>
  );
};

// ── Badges panel (mini vue) ────────────────────────────────────────────────────
import { useProgress as useProgressForBadges } from '../hooks/useProgress';

function BadgesPanel() {
  const { unlockedBadges } = useProgressForBadges();
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm px-3 py-3 slide-up">
      <p className="text-xs font-extrabold text-gray-600 mb-2">
        🏅 Badges — {unlockedBadges.length}/{ACHIEVEMENTS.length} débloqués
      </p>
      <div className="grid grid-cols-4 gap-2">
        {ACHIEVEMENTS.map((ach) => {
          const unlocked = unlockedBadges.includes(ach.id);
          return (
            <div
              key={ach.id}
              title={`${ach.name} — ${ach.description}`}
              className={`flex flex-col items-center gap-0.5 rounded-xl py-2 px-1 border ${
                unlocked ? `${ach.color} border-transparent` : 'bg-gray-50 border-gray-100 opacity-40'
              }`}
            >
              <span className={`text-xl ${!unlocked && 'grayscale'}`}>{ach.emoji}</span>
              <span className="text-[9px] font-bold text-gray-600 text-center leading-tight line-clamp-1">{ach.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Index;
