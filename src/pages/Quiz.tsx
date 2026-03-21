import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cards } from '../data/cards';
import { EducationalCard as CardType, SUBJECT_COLORS } from '../types/game';
import { CardMonster } from '../components/CardMonster';
import { Confetti } from '../components/Confetti';
import { useProgress } from '../hooks/useProgress';

const TOTAL_QUESTIONS = 10;
const SECONDS_PER_Q = 15;

interface Question {
  card: CardType;
  attackIndex: number;
}

function generateQuestions(): Question[] {
  const shuffled = [...cards].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, TOTAL_QUESTIONS).map((card) => ({
    card,
    attackIndex: Math.floor(Math.random() * card.attacks.length),
  }));
}

type Phase = 'intro' | 'playing' | 'result';

export default function Quiz() {
  const navigate = useNavigate();
  const { recordQuizScore, markDailyDone, stats } = useProgress();

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SECONDS_PER_Q);
  const [chosen, setChosen] = useState<number | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);

  const current = questions[currentIndex];
  const attack = current ? current.card.attacks[current.attackIndex] : null;

  // Démarrer la partie
  const startQuiz = () => {
    setQuestions(generateQuestions());
    setCurrentIndex(0);
    setScore(0);
    setChosen(null);
    setTimeLeft(SECONDS_PER_Q);
    setPhase('playing');
  };

  // Passer à la question suivante
  const nextQuestion = useCallback(() => {
    if (currentIndex + 1 >= TOTAL_QUESTIONS) {
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setChosen(null);
      setTimeLeft(SECONDS_PER_Q);
    }
  }, [currentIndex]);

  // Timer
  useEffect(() => {
    if (phase !== 'playing' || chosen !== null) return;
    if (timeLeft <= 0) {
      setChosen(-1); // timeout : aucune réponse
      setTimeout(nextQuestion, 1200);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, chosen, nextQuestion]);

  // Réponse sélectionnée
  const handleAnswer = (answerIndex: number) => {
    if (chosen !== null || !attack) return;
    setChosen(answerIndex);
    const correct = answerIndex === attack.correctIndex;
    if (correct) setScore((s) => s + 1);
    setTimeout(nextQuestion, 1200);
  };

  // Résultat final
  useEffect(() => {
    if (phase !== 'result') return;
    const finalScore = Math.round((score / TOTAL_QUESTIONS) * 100);
    recordQuizScore(finalScore);
    markDailyDone();
    if (finalScore >= 80) setShowConfetti(true);
  }, [phase, score, recordQuizScore, markDailyDone]);

  const scorePercent = Math.round((score / TOTAL_QUESTIONS) * 100);
  const isNewRecord = phase === 'result' && scorePercent > stats.bestQuizScore;

  // ── INTRO ──────────────────────────────────────────────────────────────────
  if (phase === 'intro') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6 text-center page-fade">
        <div className="text-6xl mb-3 pop-in">🎯</div>
        <h1 className="text-3xl font-extrabold text-white mb-2 slide-up">Quiz Chrono</h1>
        <p className="text-indigo-300 mb-2 slide-up">
          {TOTAL_QUESTIONS} questions · {SECONDS_PER_Q}s par question
        </p>

        {stats.bestQuizScore > 0 && (
          <div className="bg-yellow-400/20 border border-yellow-400 rounded-2xl px-4 py-2 mb-6 slide-up">
            <p className="text-yellow-300 text-sm font-bold">
              🏆 Meilleur score : {stats.bestQuizScore}/100
            </p>
          </div>
        )}

        <div className="bg-white/10 rounded-2xl p-4 mb-8 max-w-xs text-left border border-white/20 slide-up">
          <p className="text-white text-sm font-semibold mb-2">Comment jouer :</p>
          <ul className="text-indigo-200 text-xs space-y-1">
            <li>⏱️ Réponds avant la fin du chrono</li>
            <li>✅ +1 point par bonne réponse</li>
            <li>❌ Mauvaise réponse ou temps écoulé = 0 point</li>
            <li>🏆 Score ≥ 80/100 = champion !</li>
          </ul>
        </div>

        <button
          onClick={startQuiz}
          className="bg-yellow-400 text-yellow-900 font-extrabold px-10 py-4 rounded-full text-lg shadow-lg active:scale-95 transition-transform pop-in"
        >
          C'est parti ! 🚀
        </button>
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-indigo-300 text-sm underline"
        >
          Retour à la collection
        </button>
      </div>
    );
  }

  // ── RESULT ─────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const medal = scorePercent >= 80 ? '🥇' : scorePercent >= 50 ? '🥈' : '🥉';
    const msg =
      scorePercent >= 80
        ? 'Incroyable, tu es un génie !'
        : scorePercent >= 50
          ? 'Pas mal, continue à t'entraîner !'
          : 'Continue, tu vas progresser !';

    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 flex flex-col items-center justify-center p-6 text-center page-fade">
        <Confetti active={showConfetti} />
        <div className="text-7xl mb-3 pop-in">{medal}</div>
        <h2 className="text-3xl font-extrabold text-white mb-1 slide-up">
          {score}/{TOTAL_QUESTIONS}
        </h2>
        <p className="text-2xl font-bold text-yellow-300 mb-1 slide-up">{scorePercent}/100</p>
        <p className="text-indigo-300 mb-2 slide-up">{msg}</p>

        {isNewRecord && (
          <div className="bg-yellow-400/20 border border-yellow-400 rounded-2xl px-4 py-2 mb-4 pop-in">
            <p className="text-yellow-300 font-extrabold text-sm">🎉 Nouveau record !</p>
          </div>
        )}

        {/* Barre de score */}
        <div className="w-full max-w-xs bg-white/20 rounded-full h-4 mb-6 slide-up">
          <div
            className="h-4 rounded-full bg-gradient-to-r from-yellow-400 to-green-400 transition-all duration-1000"
            style={{ width: `${scorePercent}%` }}
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={startQuiz}
            className="bg-yellow-400 text-yellow-900 font-extrabold px-6 py-3 rounded-full text-base shadow-lg active:scale-95 transition-transform"
          >
            🎯 Rejouer
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

  // ── PLAYING ────────────────────────────────────────────────────────────────
  if (!current || !attack) return null;

  const colors = SUBJECT_COLORS[current.card.subject];
  const timerPct = (timeLeft / SECONDS_PER_Q) * 100;
  const timerColor = timerPct > 50 ? 'bg-green-400' : timerPct > 25 ? 'bg-yellow-400' : 'bg-red-400';

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-900 to-purple-900 flex flex-col page-fade">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1"
        >
          ✕ Quitter
        </button>
        <span className="text-white font-extrabold text-sm">
          🎯 {currentIndex + 1}/{TOTAL_QUESTIONS}
        </span>
        <span className="text-yellow-300 font-bold text-sm">
          Score : {score}
        </span>
      </div>

      {/* Chrono */}
      <div className="px-4 mb-3 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className={`text-lg font-extrabold ${timeLeft <= 5 ? 'text-red-400' : 'text-white'}`}>
            {timeLeft <= 5 ? '⚠️' : '⏱️'} {timeLeft}s
          </span>
          <div className="flex-1 bg-white/20 rounded-full h-3">
            <div
              className={`${timerColor} h-3 rounded-full transition-all duration-1000`}
              style={{ width: `${timerPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Carte / Monstre */}
      <div className="flex justify-center px-4 mb-3 flex-shrink-0">
        <div className={`rounded-2xl border-4 ${colors.border} overflow-hidden w-32`}>
          <div className={`bg-gradient-to-b ${colors.bg} px-2 py-1 text-center`}>
            <p className="text-white font-extrabold text-[10px] line-clamp-1">{current.card.name}</p>
          </div>
          <div className={`monster-float bg-white flex items-center justify-center py-3`}>
            <CardMonster cardId={current.card.id} className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mx-4 flex-shrink-0">
        <div className="bg-white rounded-2xl p-4 shadow-2xl">
          <p className="text-xs font-bold text-indigo-500 mb-2">⚡ {attack.name}</p>
          <p className="text-sm font-semibold text-gray-800 mb-4 leading-snug">{attack.question}</p>

          <div className="grid grid-cols-2 gap-2">
            {attack.answers.map((ans, j) => {
              let style = 'bg-gray-50 border-gray-200 text-gray-800 active:scale-95 active:border-indigo-400';
              if (chosen !== null) {
                if (j === attack.correctIndex)
                  style = 'bg-green-100 border-green-500 text-green-800 font-bold';
                else if (j === chosen)
                  style = 'bg-red-100 border-red-500 text-red-800 line-through opacity-70';
                else style = 'bg-white border-gray-100 text-gray-400 opacity-50';
              }
              return (
                <button
                  key={j}
                  disabled={chosen !== null}
                  onClick={() => handleAnswer(j)}
                  className={`border-2 rounded-xl px-3 py-3 text-xs font-semibold text-left transition-all ${style}`}
                >
                  <span className="font-extrabold mr-1 text-indigo-500">{String.fromCharCode(65 + j)}.</span>
                  {ans}
                </button>
              );
            })}
          </div>

          {chosen !== null && (
            <p className={`text-center font-extrabold text-sm mt-3 pop-in ${
              chosen === attack.correctIndex ? 'text-green-600' : 'text-red-600'
            }`}>
              {chosen === -1
                ? '⏰ Temps écoulé !'
                : chosen === attack.correctIndex
                  ? '✅ Bravo ! +1 point'
                  : `❌ Réponse : ${String.fromCharCode(65 + attack.correctIndex)}`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
