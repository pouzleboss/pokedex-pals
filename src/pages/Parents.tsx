import { useNavigate } from 'react-router-dom';
import { cards } from '../data/cards';
import { useProgress, getLevelInfo } from '../hooks/useProgress';
import { useProfile } from '../hooks/useProfile';
import { ACHIEVEMENTS, checkAchievement } from '../data/achievements';
import { Subject, SUBJECT_LABELS } from '../types/game';

const SUBJECT_LIST: { key: Subject; label: string; emoji: string; color: string }[] = [
  { key: 'maths',       label: 'Maths',       emoji: '➕', color: 'bg-blue-100 border-blue-200' },
  { key: 'sciences',    label: 'Sciences',     emoji: '🔬', color: 'bg-green-100 border-green-200' },
  { key: 'histoire',    label: 'Histoire',     emoji: '🏛️', color: 'bg-orange-100 border-orange-200' },
  { key: 'langues',     label: 'Langues',      emoji: '💬', color: 'bg-pink-100 border-pink-200' },
  { key: 'géographie',  label: 'Géographie',   emoji: '🗺️', color: 'bg-teal-100 border-teal-200' },
];

export default function Parents() {
  const navigate = useNavigate();
  const { profile } = useProfile();
  const {
    stats, xp, streak, level, levelName, levelProgress, xpInLevel, xpNeededForNext,
    nextLevelName, unlockedBadges,
  } = useProgress();

  const levelInfo = getLevelInfo(xp);

  // Progression par matière
  const subjectProgress = SUBJECT_LIST.map(({ key, label, emoji, color }) => {
    const subjectCards = cards.filter((c) => c.subject === key);
    const masteredCards = subjectCards.filter(
      (c) => (stats.cardAnswers[c.id] ?? []).length >= c.attacks.length,
    );
    const totalAttacks = subjectCards.reduce((s, c) => s + c.attacks.length, 0);
    const answeredAttacks = subjectCards.reduce(
      (s, c) => s + (stats.cardAnswers[c.id] ?? []).length, 0,
    );
    return {
      key, label, emoji, color,
      masteredCards: masteredCards.length,
      totalCards: subjectCards.length,
      answeredAttacks,
      totalAttacks,
      pct: totalAttacks > 0 ? Math.round((answeredAttacks / totalAttacks) * 100) : 0,
    };
  });

  // Badges débloqués
  const achievementStats = {
    totalAnswered: stats.totalAnswered,
    masteredCount: stats.masteredCount,
    masteredBySubject: Object.fromEntries(
      SUBJECT_LIST.map(({ key }) => {
        const mc = cards
          .filter((c) => c.subject === key)
          .filter((c) => (stats.cardAnswers[c.id] ?? []).length >= c.attacks.length).length;
        return [key, mc];
      }),
    ) as Record<Subject, number>,
    battleWins: stats.battleWins,
    battleTotal: stats.battleTotal,
    bestQuizScore: stats.bestQuizScore,
    xp,
    level,
    streak,
  };

  const unlockedAchs = ACHIEVEMENTS.filter((a) => unlockedBadges.includes(a.id));
  const lockedAchs = ACHIEVEMENTS.filter((a) => !unlockedBadges.includes(a.id));

  // Analyse des points forts et axes de progrès
  const sorted = [...subjectProgress].sort((a, b) => b.pct - a.pct);
  const best = sorted[0];
  const weakest = sorted[sorted.length - 1];
  const hasPlayed = stats.totalAnswered > 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex flex-col page-fade">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-800 text-sm font-semibold border border-gray-200 rounded-full px-3 py-1.5 active:scale-95 transition-transform"
          >
            ← Retour
          </button>
          <div>
            <h1 className="text-base font-extrabold text-gray-800">Espace Parents</h1>
            <p className="text-[11px] text-gray-400">Progrès de {profile?.name ?? 'votre enfant'}</p>
          </div>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full space-y-4">

        {/* Analyse personnalisée */}
        {hasPlayed && (
          <section className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200 p-4">
            <h2 className="text-sm font-extrabold text-green-800 mb-3">📊 Analyse personnalisée</h2>
            <div className="space-y-2">
              {best.pct > 0 && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">🌟</span>
                  <p className="text-xs text-green-800">
                    <span className="font-bold">Point fort :</span> {profile?.name} réussit particulièrement bien en{' '}
                    <span className="font-extrabold">{best.label}</span> ({best.pct}% de réussite).
                    Encouragez cette curiosité !
                  </p>
                </div>
              )}
              {weakest.pct < 60 && weakest.key !== best.key && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">💪</span>
                  <p className="text-xs text-green-800">
                    <span className="font-bold">À renforcer :</span>{' '}
                    <span className="font-extrabold">{weakest.label}</span> ({weakest.pct}%) — faites
                    explorer cette matière ensemble pour booster la confiance.
                  </p>
                </div>
              )}
              {streak >= 2 && (
                <div className="flex items-start gap-2.5">
                  <span className="text-lg flex-shrink-0">🔥</span>
                  <p className="text-xs text-green-800">
                    <span className="font-bold">Super régularité !</span> {profile?.name} joue depuis{' '}
                    <span className="font-extrabold">{streak} jours de suite</span>. La constance est la clé du succès !
                  </p>
                </div>
              )}
              {!hasPlayed && (
                <p className="text-xs text-green-700 italic">
                  Aucune donnée encore — invitez votre enfant à retourner quelques cartes !
                </p>
              )}
            </div>
          </section>
        )}

        {/* Bannière de confiance */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl px-4 py-3 flex gap-3 items-start">
          <span className="text-2xl flex-shrink-0">🔒</span>
          <div>
            <p className="text-sm font-bold text-blue-800">100% privé — aucune donnée partagée</p>
            <p className="text-xs text-blue-600 mt-0.5">
              Toutes les données sont stockées uniquement sur cet appareil. Aucun compte, aucun serveur, aucune pub.
            </p>
          </div>
        </div>

        {/* Profil enfant */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-extrabold text-gray-700 mb-3">Profil joueur</h2>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center text-2xl flex-shrink-0">
              🎮
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-lg font-extrabold text-gray-800">{profile?.name ?? '—'}</p>
              <p className="text-sm text-purple-600 font-semibold">Niveau {level} — {levelName}</p>
              <div className="mt-1">
                <div className="flex justify-between text-[10px] text-gray-500 mb-0.5">
                  <span>{xpInLevel} XP</span>
                  <span>{nextLevelName ? `→ ${nextLevelName} (${xpNeededForNext} XP)` : 'Niveau max !'}</span>
                </div>
                <div className="bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-purple-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${levelProgress * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <StatTile emoji="⭐" value={`${xp} XP`} label="Total gagné" />
            <StatTile emoji="🔥" value={streak > 0 ? `${streak} j.` : '—'} label="Streak" />
            <StatTile emoji="📚" value={`${stats.masteredCount}/${cards.length}`} label="Cartes maîtrisées" />
          </div>
        </section>

        {/* Progression par matière */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-extrabold text-gray-700 mb-3">Progrès par matière</h2>
          <div className="space-y-3">
            {subjectProgress.map((s) => (
              <div key={s.key} className={`rounded-xl border px-3 py-2.5 ${s.color}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-bold text-gray-700">{s.emoji} {s.label}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {s.masteredCards}/{s.totalCards} cartes maîtrisées
                  </span>
                </div>
                <div className="bg-white/60 rounded-full h-2.5">
                  <div
                    className="bg-current h-2.5 rounded-full transition-all duration-500"
                    style={{ width: `${s.pct}%`, backgroundColor: s.pct >= 80 ? '#22c55e' : s.pct >= 40 ? '#f59e0b' : '#94a3b8' }}
                  />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  {s.answeredAttacks}/{s.totalAttacks} questions répondues ({s.pct}%)
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats globales */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-extrabold text-gray-700 mb-3">Statistiques globales</h2>
          <div className="grid grid-cols-2 gap-3">
            <StatCard
              emoji="🎯"
              title="Meilleur score Quiz"
              value={stats.bestQuizScore > 0 ? `${stats.bestQuizScore}/100` : 'Pas encore joué'}
              sub={stats.bestQuizScore >= 80 ? 'Champion !' : stats.bestQuizScore >= 50 ? 'En progrès' : ''}
            />
            <StatCard
              emoji="⚔️"
              title="Batailles"
              value={stats.battleTotal > 0 ? `${stats.battleWins}/${stats.battleTotal}` : 'Pas encore'}
              sub={stats.battleTotal > 0 ? `${Math.round((stats.battleWins / stats.battleTotal) * 100)}% de victoires` : ''}
            />
            <StatCard
              emoji="💡"
              title="Questions répondues"
              value={`${stats.totalAnswered}`}
              sub="depuis le début"
            />
            <StatCard
              emoji="🏅"
              title="Badges débloqués"
              value={`${unlockedAchs.length}/${ACHIEVEMENTS.length}`}
              sub={unlockedAchs.length === ACHIEVEMENTS.length ? 'Tous débloqués !' : `${lockedAchs.length} restants`}
            />
          </div>
        </section>

        {/* Badges */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <h2 className="text-sm font-extrabold text-gray-700 mb-1">Badges collectés</h2>
          <p className="text-xs text-gray-400 mb-3">
            {unlockedAchs.length === 0
              ? 'Aucun badge encore — commencez à jouer !'
              : `${unlockedAchs.length} badge${unlockedAchs.length > 1 ? 's' : ''} débloqué${unlockedAchs.length > 1 ? 's' : ''}`}
          </p>
          <div className="grid grid-cols-2 gap-2">
            {ACHIEVEMENTS.map((ach) => {
              const unlocked = unlockedBadges.includes(ach.id);
              return (
                <div
                  key={ach.id}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-all ${
                    unlocked ? `${ach.color} border-transparent` : 'bg-gray-50 border-gray-100 opacity-50'
                  }`}
                >
                  <span className={`text-xl flex-shrink-0 ${!unlocked && 'grayscale'}`}>{ach.emoji}</span>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-700 leading-tight">{ach.name}</p>
                    <p className="text-[10px] text-gray-500 leading-tight line-clamp-1">{ach.description}</p>
                  </div>
                  {unlocked && <span className="ml-auto text-green-500 text-xs flex-shrink-0">✓</span>}
                </div>
              );
            })}
          </div>
        </section>

        {/* Message pédagogique */}
        <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-4">
          <h2 className="text-sm font-extrabold text-purple-800 mb-2">Comment ça marche ?</h2>
          <ul className="space-y-2 text-xs text-purple-700">
            <li className="flex gap-2"><span>🃏</span><span><b>Cartes éducatives :</b> retournez les cartes pour répondre à des questions sur les matières du programme CE1-CM2.</span></li>
            <li className="flex gap-2"><span>🎯</span><span><b>Quiz Chrono :</b> 10 questions, 15 secondes chacune — stimule la réflexion rapide.</span></li>
            <li className="flex gap-2"><span>⚔️</span><span><b>Bataille :</b> combats au tour par tour où la connaissance est l'arme principale.</span></li>
            <li className="flex gap-2"><span>⭐</span><span><b>XP et niveaux :</b> chaque bonne réponse rapporte des points d'expérience. La progression est visible et motivante.</span></li>
            <li className="flex gap-2"><span>🏅</span><span><b>Badges :</b> récompenses à collectionner pour chaque accomplissement.</span></li>
          </ul>
        </section>

        <div className="h-4" />
      </main>
    </div>
  );
}

function StatTile({ emoji, value, label }: { emoji: string; value: string; label: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-2 text-center border border-gray-100">
      <span className="text-lg">{emoji}</span>
      <p className="text-sm font-extrabold text-gray-800 mt-0.5">{value}</p>
      <p className="text-[10px] text-gray-500">{label}</p>
    </div>
  );
}

function StatCard({ emoji, title, value, sub }: { emoji: string; title: string; value: string; sub?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl px-3 py-3 border border-gray-100">
      <span className="text-xl">{emoji}</span>
      <p className="text-[10px] text-gray-500 mt-1">{title}</p>
      <p className="text-sm font-extrabold text-gray-800 mt-0.5">{value}</p>
      {sub && <p className="text-[10px] text-green-600 font-semibold">{sub}</p>}
    </div>
  );
}
