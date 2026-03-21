import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { EducationalCard } from '../components/EducationalCard';
import { PlayerSetup } from '../components/PlayerSetup';
import { Confetti } from '../components/Confetti';
import { cards } from '../data/cards';
import { Subject, SUBJECT_LABELS, LEVEL_LABELS, SchoolLevel } from '../types/game';
import { useProgress } from '../hooks/useProgress';
import { useProfile } from '../hooks/useProfile';
import { useSound } from '../hooks/useSound';
import { Achievement } from '../data/achievements';

type SubjectFilter = Subject | 'all';
type LevelFilter = SchoolLevel | 'all';

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

const SUBJECT_OPTIONS: { value: SubjectFilter; label: string; emoji: string }[] = [
  { value: 'all',          label: 'Toutes',                       emoji: '🌟' },
  { value: 'maths',        label: SUBJECT_LABELS.maths,           emoji: '➕' },
  { value: 'sciences',     label: SUBJECT_LABELS.sciences,        emoji: '🔬' },
  { value: 'histoire',     label: SUBJECT_LABELS.histoire,        emoji: '🏛️' },
  { value: 'langues',      label: SUBJECT_LABELS.langues,         emoji: '💬' },
  { value: 'géographie',   label: SUBJECT_LABELS['géographie'],   emoji: '🗺️' },
];

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 1,     label: LEVEL_LABELS[1] },
  { value: 2,     label: LEVEL_LABELS[2] },
  { value: 3,     label: LEVEL_LABELS[3] },
  { value: 4,     label: LEVEL_LABELS[4] },
];

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
    pendingBadges, clearPendingBadges,
    xp, streak, level, levelName, levelProgress,
  } = useProgress();
  const { profile, saveProfile } = useProfile();
  const { playSuccess, playBadge, playLevelUp } = useSound();

  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [search, setSearch] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<Achievement | null>(null);
  const [xpToast, setXpToast] = useState<number | null>(null);
  const [levelUpData, setLevelUpData] = useState<{ level: number; name: string } | null>(null);

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

  const filtered = cards.filter((c) => {
    const matchSubject = subjectFilter === 'all' || c.subject === subjectFilter;
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    const q = search.toLowerCase();
    const matchSearch =
      q === '' ||
      c.name.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      SUBJECT_LABELS[c.subject].toLowerCase().includes(q);
    return matchSubject && matchLevel && matchSearch;
  });

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

        {/* Filter strips */}
        <div className="px-3 pb-2 space-y-1.5">
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {SUBJECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSubjectFilter(opt.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border-2 ${
                  subjectFilter === opt.value
                    ? 'bg-white text-purple-700 border-white shadow'
                    : 'bg-purple-700/40 text-white border-transparent'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-none">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevelFilter(opt.value)}
                className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all border-2 ${
                  levelFilter === opt.value
                    ? 'bg-white text-blue-700 border-white shadow'
                    : 'bg-blue-700/40 text-white border-transparent'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 px-3 py-3 flex flex-col gap-2">

        {/* Search bar */}
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm pointer-events-none">
            🔍
          </span>
          <input
            type="search"
            placeholder="Chercher une carte…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white rounded-xl border-2 border-gray-200 pl-8 pr-3 py-2 text-sm focus:outline-none focus:border-purple-400 shadow-sm"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-lg leading-none"
            >
              ×
            </button>
          )}
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 bg-white/70 rounded-xl px-3 py-1.5 text-xs text-gray-600 shadow-sm">
          {/* Progress bar */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="whitespace-nowrap font-semibold">📚 {stats.masteredCount}/{cards.length}</span>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div
                className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${(stats.masteredCount / cards.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Battle wins */}
          {stats.battleTotal > 0 && (
            <span className="whitespace-nowrap font-semibold flex-shrink-0">
              ⚔️ {stats.battleWins}/{stats.battleTotal}
            </span>
          )}

          {/* Badges button */}
          <button
            onClick={() => setShowBadges((v) => !v)}
            className="flex-shrink-0 font-semibold text-purple-600 border border-purple-200 rounded-full px-2 py-0.5 text-[10px] active:scale-95 transition-transform"
          >
            🏅 Badges
          </button>

          {/* Espace Parents */}
          <button
            onClick={() => navigate('/parents')}
            className="flex-shrink-0 text-gray-400 text-base leading-none"
            title="Espace parents"
          >
            👨‍👩‍👧
          </button>

          {/* Reset */}
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
        {showBadges && <BadgesPanel unlockedBadges={[]} currentUnlocked={[]} />}

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

        {/* Card count */}
        <p className="text-center text-xs text-gray-500">
          {filtered.length} carte{filtered.length !== 1 ? 's' : ''}
          {search && ` pour "${search}"`}
        </p>

        {/* Cards grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-4">{search ? '🔍' : '🃏'}</span>
            <p>{search ? `Aucune carte pour "${search}"` : 'Aucune carte pour cette sélection.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((card, idx) => (
              <div
                key={card.id}
                className="card-enter"
                style={{ animationDelay: `${Math.min(idx * 40, 600)}ms` }}
              >
                <EducationalCard
                  card={card}
                  stars={getStars(card.id, card.attacks.length)}
                  onCorrectAnswer={(attackIdx) => handleCorrectAnswer(card.id, attackIdx)}
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-3 text-gray-400 text-[10px]">
        Pokedex-Pals — Jeu éducatif pour les élèves du primaire 🎓
        <span className="ml-2 bg-gray-100 text-gray-400 px-1.5 py-0.5 rounded font-mono">v1.5.0</span>
      </footer>
    </div>
  );
};

// ── Badges panel (mini vue) ────────────────────────────────────────────────────
import { ACHIEVEMENTS } from '../data/achievements';
import { useProgress as useProgressForBadges } from '../hooks/useProgress';

function BadgesPanel({ unlockedBadges: _u, currentUnlocked: _c }: { unlockedBadges: string[]; currentUnlocked: string[] }) {
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
