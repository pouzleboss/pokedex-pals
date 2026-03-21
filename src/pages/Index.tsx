import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EducationalCard } from '../components/EducationalCard';
import { PlayerSetup } from '../components/PlayerSetup';
import { Confetti } from '../components/Confetti';
import { cards } from '../data/cards';
import { Subject, SUBJECT_LABELS, LEVEL_LABELS, SchoolLevel } from '../types/game';
import { useProgress } from '../hooks/useProgress';
import { useProfile } from '../hooks/useProfile';

type SubjectFilter = Subject | 'all';
type LevelFilter = SchoolLevel | 'all';

const SUBJECT_OPTIONS: { value: SubjectFilter; label: string; emoji: string }[] = [
  { value: 'all', label: 'Toutes', emoji: '🌟' },
  { value: 'maths', label: SUBJECT_LABELS.maths, emoji: '➕' },
  { value: 'sciences', label: SUBJECT_LABELS.sciences, emoji: '🔬' },
  { value: 'histoire', label: SUBJECT_LABELS.histoire, emoji: '🏛️' },
  { value: 'langues', label: SUBJECT_LABELS.langues, emoji: '💬' },
  { value: 'géographie', label: SUBJECT_LABELS['géographie'], emoji: '🗺️' },
];

const LEVEL_OPTIONS: { value: LevelFilter; label: string }[] = [
  { value: 'all', label: 'Tous' },
  { value: 1, label: LEVEL_LABELS[1] },
  { value: 2, label: LEVEL_LABELS[2] },
  { value: 3, label: LEVEL_LABELS[3] },
  { value: 4, label: LEVEL_LABELS[4] },
];

const Index = () => {
  const navigate = useNavigate();
  const { markCorrect, getStars, stats, resetProgress, isDailyDone } = useProgress();
  const { profile, saveProfile } = useProfile();
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');
  const [search, setSearch] = useState('');
  const [showReset, setShowReset] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleCorrectAnswer = (cardId: string, attackIdx: number) => {
    markCorrect(cardId, attackIdx);
    setShowConfetti(true);
    setTimeout(() => setShowConfetti(false), 100);
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

      {/* ── Sticky header ── */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-extrabold text-white leading-tight tracking-wide">
              🃏 {profile.name}
            </h1>
            <p className="text-purple-200 text-[11px] leading-tight">
              Apprends en jouant !
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/quiz')}
              className="bg-indigo-500 active:bg-indigo-400 text-white font-extrabold px-3 py-2 rounded-full text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap"
            >
              🎯 Quiz
            </button>
            <button
              onClick={() => navigate('/battle')}
              className="bg-yellow-400 active:bg-yellow-300 text-yellow-900 font-extrabold px-3 py-2 rounded-full text-xs shadow-md active:scale-95 transition-transform whitespace-nowrap"
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

          {/* Reset */}
          <button
            onClick={() => setShowReset(true)}
            className="flex-shrink-0 text-gray-400 text-base leading-none"
            title="Réinitialiser la progression"
          >
            ⚙️
          </button>
        </div>

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
              {isDailyDone ? 'Reviens demain pour un nouveau défi' : '10 questions · 15s par question'}
            </p>
          </div>
          {!isDailyDone && <span className="text-white font-bold text-lg flex-shrink-0">→</span>}
        </button>

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
            {filtered.map((card) => (
              <EducationalCard
                key={card.id}
                card={card}
                stars={getStars(card.id, card.attacks.length)}
                onCorrectAnswer={(attackIdx) => handleCorrectAnswer(card.id, attackIdx)}
              />
            ))}
          </div>
        )}
      </main>

      <footer className="text-center py-3 text-gray-400 text-[10px]">
        Pokedex-Pals — Jeu éducatif pour les élèves du primaire 🎓
      </footer>
    </div>
  );
};

export default Index;
