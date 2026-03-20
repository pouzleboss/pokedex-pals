import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EducationalCard } from '../components/EducationalCard';
import { cards } from '../data/cards';
import { Subject, SUBJECT_LABELS, LEVEL_LABELS, SchoolLevel } from '../types/game';

type SubjectFilter = Subject | 'all';
type LevelFilter = SchoolLevel | 'all';

const SUBJECT_OPTIONS: { value: SubjectFilter; label: string; emoji: string }[] = [
  { value: 'all', label: 'Toutes', emoji: '🌟' },
  { value: 'maths', label: SUBJECT_LABELS.maths, emoji: '➕' },
  { value: 'sciences', label: SUBJECT_LABELS.sciences, emoji: '🔬' },
  { value: 'histoire', label: SUBJECT_LABELS.histoire, emoji: '🏛️' },
  { value: 'langues', label: SUBJECT_LABELS.langues, emoji: '💬' },
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
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

  const filtered = cards.filter((c) => {
    const matchSubject = subjectFilter === 'all' || c.subject === subjectFilter;
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchSubject && matchLevel;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100 flex flex-col">

      {/* ── Header compact mobile ── */}
      <header className="sticky top-0 z-20 bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3">
          <div>
            <h1 className="text-xl font-extrabold text-white leading-tight tracking-wide">
              🃏 Pokedex-Pals
            </h1>
            <p className="text-purple-200 text-[11px] leading-tight hidden sm:block">
              Apprends en jouant avec tes cartes !
            </p>
          </div>
          <button
            onClick={() => navigate('/battle')}
            className="bg-yellow-400 active:bg-yellow-300 text-yellow-900 font-extrabold px-4 py-2 rounded-full text-sm shadow-md active:scale-95 transition-transform whitespace-nowrap"
          >
            ⚔️ Bataille
          </button>
        </div>

        {/* ── Filters — horizontal scroll strips ── */}
        <div className="px-3 pb-2 space-y-1.5">
          {/* subjects */}
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

          {/* levels */}
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

      {/* ── Cards ── */}
      <main className="flex-1 px-3 py-3">
        <p className="text-center text-xs text-gray-500 mb-3">
          {filtered.length} carte{filtered.length !== 1 ? 's' : ''}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <span className="text-5xl block mb-4">🔍</span>
            <p>Aucune carte pour cette sélection.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
            {filtered.map((card) => (
              <EducationalCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="text-center py-3 text-gray-400 text-[10px]">
        Pokedex-Pals — Jeu éducatif pour les élèves du primaire 🎓
      </footer>
    </div>
  );
};

export default Index;
