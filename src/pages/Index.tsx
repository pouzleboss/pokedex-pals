import { useState } from 'react';
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
  { value: 'all', label: 'Tous niveaux' },
  { value: 1, label: LEVEL_LABELS[1] },
  { value: 2, label: LEVEL_LABELS[2] },
  { value: 3, label: LEVEL_LABELS[3] },
  { value: 4, label: LEVEL_LABELS[4] },
];

const Index = () => {
  const [subjectFilter, setSubjectFilter] = useState<SubjectFilter>('all');
  const [levelFilter, setLevelFilter] = useState<LevelFilter>('all');

  const filtered = cards.filter((c) => {
    const matchSubject = subjectFilter === 'all' || c.subject === subjectFilter;
    const matchLevel = levelFilter === 'all' || c.level === levelFilter;
    return matchSubject && matchLevel;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 via-blue-50 to-pink-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-blue-600 shadow-lg py-6 px-4 text-center">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md tracking-wide">
          🃏 Pokedex-Pals
        </h1>
        <p className="text-purple-100 mt-1 text-lg">
          Apprends en jouant avec tes cartes éducatives !
        </p>
        <div className="mt-4">
          <button className="bg-yellow-400 hover:bg-yellow-300 text-yellow-900 font-extrabold px-8 py-3 rounded-full text-lg shadow-md transition-all hover:scale-105 active:scale-95">
            ⚔️ Commencer une Bataille
          </button>
        </div>
      </header>

      {/* Filters */}
      <section className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white/80 backdrop-blur rounded-2xl shadow-md p-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Subject filter */}
          <div className="flex flex-wrap gap-2 justify-center">
            {SUBJECT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSubjectFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${
                  subjectFilter === opt.value
                    ? 'bg-purple-600 text-white border-purple-700 shadow'
                    : 'bg-white text-gray-700 border-gray-200 hover:border-purple-400'
                }`}
              >
                {opt.emoji} {opt.label}
              </button>
            ))}
          </div>

          {/* Level filter */}
          <div className="flex gap-2 flex-wrap justify-center">
            {LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLevelFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all border-2 ${
                  levelFilter === opt.value
                    ? 'bg-blue-600 text-white border-blue-700 shadow'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats bar */}
        <p className="text-center text-sm text-gray-500 mt-3">
          {filtered.length} carte{filtered.length !== 1 ? 's' : ''} disponible{filtered.length !== 1 ? 's' : ''}
        </p>
      </section>

      {/* Cards grid */}
      <section className="max-w-5xl mx-auto px-4 pb-12">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <span className="text-5xl block mb-4">🔍</span>
            <p className="text-lg">Aucune carte pour cette sélection.</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-6 justify-center">
            {filtered.map((card) => (
              <EducationalCard key={card.id} card={card} />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="text-center py-4 text-gray-400 text-xs">
        Pokedex-Pals — Jeu éducatif pour les élèves du primaire 🎓
      </footer>
    </div>
  );
};

export default Index;
