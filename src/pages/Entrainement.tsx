import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { cards } from '../data/cards';
import { Subject, SUBJECT_LABELS, SUBJECT_COLORS } from '../types/game';
import { CardMonster } from '../components/CardMonster';
import { Confetti } from '../components/Confetti';
import { useProgress } from '../hooks/useProgress';
import { useProfile } from '../hooks/useProfile';
import { useSound } from '../hooks/useSound';

type Phase = 'select' | 'playing' | 'result';

interface Question {
  cardId: string;
  cardName: string;
  subject: Subject;
  attackIndex: number;
  question: string;
  answers: string[];
  correctIndex: number;
}

interface Answer {
  chosen: number;
  correct: boolean;
}

const SUBJECT_OPTIONS: { value: Subject | 'all'; label: string; emoji: string }[] = [
  { value: 'all',         label: 'Toutes les matières', emoji: '🌟' },
  { value: 'maths',       label: 'Maths',               emoji: '➕' },
  { value: 'sciences',    label: 'Sciences',             emoji: '🔬' },
  { value: 'histoire',    label: 'Histoire',             emoji: '🏛️' },
  { value: 'langues',     label: 'Langues',              emoji: '💬' },
  { value: 'géographie',  label: 'Géographie',           emoji: '🗺️' },
];

function generateQuestions(subject: Subject | 'all', count: number, levelCards: typeof cards): Question[] {
  const pool = subject === 'all'
    ? levelCards
    : levelCards.filter((c) => c.subject === subject);

  if (pool.length === 0) return [];

  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  return selected.map((card) => {
    const attackIdx = Math.floor(Math.random() * card.attacks.length);
    const attack = card.attacks[attackIdx];
    return {
      cardId: card.id,
      cardName: card.name,
      subject: card.subject,
      attackIndex: attackIdx,
      question: attack.question,
      answers: attack.answers,
      correctIndex: attack.correctIndex,
    };
  });
}

export default function Entrainement() {
  const navigate = useNavigate();
  const { markCorrect, pendingBadges, clearPendingBadges } = useProgress();
  const { currentProfile } = useProfile();
  const { playSuccess, playError, playVictory, playBadge } = useSound();
  const levelCards = cards.filter((c) => c.level === (currentProfile?.level ?? 1));

  const [phase, setPhase] = useState<Phase>('select');
  const [subject, setSubject] = useState<Subject | 'all'>('all');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [chosen, setChosen] = useState<number | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);

  // Badge notifications
  useState(() => {
    if (pendingBadges.length > 0) {
      playBadge();
      clearPendingBadges();
    }
  });

  const startSession = () => {
    const qs = generateQuestions(subject, 8, levelCards);
    setQuestions(qs);
    setCurrentIndex(0);
    setChosen(null);
    setAnswers([]);
    setPhase('playing');
  };

  const handleAnswer = useCallback((answerIdx: number) => {
    if (chosen !== null) return;
    const q = questions[currentIndex];
    const correct = answerIdx === q.correctIndex;
    setChosen(answerIdx);
    const newAnswers = [...answers, { chosen: answerIdx, correct }];
    setAnswers(newAnswers);

    if (correct) {
      playSuccess();
      markCorrect(q.cardId, q.attackIndex);
    } else {
      playError();
    }
  }, [chosen, questions, currentIndex, answers, markCorrect, playSuccess, playError]);

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= questions.length) {
      const correctCount = answers.filter((a) => a.correct).length;
      if (correctCount >= Math.floor(questions.length * 0.8)) {
        setShowConfetti(true);
        playVictory();
      }
      setPhase('result');
    } else {
      setCurrentIndex((i) => i + 1);
      setChosen(null);
    }
  }, [currentIndex, questions.length, answers, playVictory]);

  // ── SELECT ──────────────────────────────────────────────────────────────────
  if (phase === 'select') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-teal-900 flex flex-col items-center justify-center p-6 page-fade">
        <div className="text-6xl mb-3 pop-in">🌱</div>
        <h1 className="text-3xl font-extrabold text-white mb-1 slide-up text-center">Mode Entraînement</h1>
        <p className="text-green-300 text-sm mb-8 text-center slide-up">
          Sans chrono · À ton rythme · 8 questions
        </p>

        <div className="w-full max-w-sm space-y-2 mb-8">
          <p className="text-green-200 text-xs font-semibold text-center mb-3 uppercase tracking-wider">Quelle matière ?</p>
          {SUBJECT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSubject(opt.value)}
              className={`w-full flex items-center gap-3 rounded-2xl px-4 py-3 border-2 transition-all active:scale-95 ${
                subject === opt.value
                  ? 'border-yellow-400 bg-white/20 shadow-lg'
                  : 'border-white/20 bg-white/10'
              }`}
            >
              <span className="text-2xl flex-shrink-0">{opt.emoji}</span>
              <span className="text-white font-bold text-sm">{opt.label}</span>
              {subject === opt.value && <span className="ml-auto text-yellow-400 text-lg">✓</span>}
            </button>
          ))}
        </div>

        <button
          onClick={startSession}
          className="bg-yellow-400 text-yellow-900 font-extrabold px-10 py-4 rounded-full text-lg shadow-lg active:scale-95 transition-transform pop-in mb-4"
        >
          C'est parti ! 🚀
        </button>
        <button onClick={() => navigate('/')} className="text-green-300 text-sm underline">
          ← Retour à l'accueil
        </button>
      </div>
    );
  }

  // ── RESULT ──────────────────────────────────────────────────────────────────
  if (phase === 'result') {
    const correctCount = answers.filter((a) => a.correct).length;
    const pct = Math.round((correctCount / questions.length) * 100);
    const medal = pct >= 80 ? '🥇' : pct >= 50 ? '🥈' : '🥉';
    const msg = pct >= 80
      ? 'Excellent ! Tu maîtrises super bien !'
      : pct >= 50
        ? 'Bien joué ! Continue à t\'entraîner !'
        : 'Tu progresses ! Essaie encore !';

    return (
      <div className="min-h-screen bg-gradient-to-br from-green-900 to-teal-900 flex flex-col items-center justify-center p-6 text-center page-fade">
        <Confetti active={showConfetti} />
        <div className="text-7xl mb-3 pop-in">{medal}</div>
        <h2 className="text-3xl font-extrabold text-white mb-1 slide-up">
          {correctCount}/{questions.length}
        </h2>
        <p className="text-green-300 text-sm mb-6 slide-up">{msg}</p>

        {/* Récap détaillé */}
        <div className="w-full max-w-sm bg-white/10 rounded-2xl p-4 mb-6 border border-white/20 text-left space-y-2">
          <p className="text-green-200 text-xs font-bold uppercase tracking-wider mb-3 text-center">Récapitulatif</p>
          {questions.map((q, i) => {
            const a = answers[i];
            return (
              <div key={i} className={`rounded-xl px-3 py-2 flex items-start gap-2 ${a?.correct ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                <span className="text-sm flex-shrink-0 mt-0.5">{a?.correct ? '✅' : '❌'}</span>
                <div className="min-w-0">
                  <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{q.question}</p>
                  {!a?.correct && (
                    <p className="text-green-300 text-[10px] mt-0.5">
                      Bonne réponse : <span className="font-bold">{q.answers[q.correctIndex]}</span>
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3">
          <button
            onClick={startSession}
            className="bg-yellow-400 text-yellow-900 font-extrabold px-6 py-3 rounded-full text-base shadow-lg active:scale-95 transition-transform"
          >
            🌱 Rejouer
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-white/15 text-white font-bold px-6 py-3 rounded-full text-base border border-white/30 active:scale-95 transition-transform"
          >
            🏠 Accueil
          </button>
        </div>
      </div>
    );
  }

  // ── PLAYING ─────────────────────────────────────────────────────────────────
  const q = questions[currentIndex];
  const colors = SUBJECT_COLORS[q.subject];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-teal-900 flex flex-col page-fade">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="text-white/50 text-xs border border-white/20 rounded-full px-3 py-1"
        >
          ✕ Quitter
        </button>
        <span className="text-white font-extrabold text-sm">
          🌱 {currentIndex + 1}/{questions.length}
        </span>
        <span className="text-green-300 font-bold text-xs">
          {answers.filter((a) => a.correct).length} ✓
        </span>
      </div>

      {/* Barre de progression */}
      <div className="px-4 mb-3">
        <div className="w-full bg-white/20 rounded-full h-2">
          <div
            className="bg-yellow-400 h-2 rounded-full transition-all duration-500"
            style={{ width: `${((currentIndex) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Monstre */}
      <div className="flex justify-center px-4 mb-4">
        <div className={`rounded-2xl border-4 ${colors.border} overflow-hidden w-28`}>
          <div className={`bg-gradient-to-b ${colors.bg} px-2 py-1 text-center`}>
            <p className="text-white font-extrabold text-[10px] line-clamp-1">{q.cardName}</p>
          </div>
          <div className="bg-white flex items-center justify-center py-3 monster-float">
            <CardMonster cardId={q.cardId} className="w-20 h-20" />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="mx-4 flex-1">
        <div className="bg-white rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>
              {SUBJECT_LABELS[q.subject]}
            </span>
            <span className="text-gray-400 text-[10px]">Prends ton temps !</span>
          </div>
          <p className="text-sm font-semibold text-gray-800 mb-4 leading-snug">{q.question}</p>

          <div className="grid grid-cols-2 gap-2.5">
            {q.answers.map((ans, j) => {
              let style = 'bg-gray-50 border-gray-200 text-gray-800 active:scale-95 active:border-green-400';
              if (chosen !== null) {
                if (j === q.correctIndex)
                  style = 'bg-green-100 border-green-500 text-green-800 font-bold';
                else if (j === chosen)
                  style = 'bg-red-100 border-red-500 text-red-800 line-through opacity-70';
                else
                  style = 'bg-white border-gray-100 text-gray-400 opacity-50';
              }
              return (
                <button
                  key={j}
                  disabled={chosen !== null}
                  onClick={() => handleAnswer(j)}
                  className={`border-2 rounded-xl px-3 py-3 text-xs font-semibold text-left transition-all ${style}`}
                >
                  <span className="font-extrabold mr-1 text-teal-600">{String.fromCharCode(65 + j)}.</span>
                  {ans}
                </button>
              );
            })}
          </div>

          {chosen !== null && (
            <div className={`mt-3 rounded-xl px-3 py-2.5 pop-in text-center ${
              chosen === q.correctIndex ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <p className={`font-extrabold text-sm ${
                chosen === q.correctIndex ? 'text-green-700' : 'text-red-700'
              }`}>
                {chosen === q.correctIndex
                  ? '✅ Bravo ! Très bien !'
                  : `❌ La bonne réponse était : ${q.answers[q.correctIndex]}`}
              </p>
              <button
                onClick={handleNext}
                className="mt-2 bg-teal-600 text-white font-extrabold px-6 py-2 rounded-full text-sm active:scale-95 transition-transform"
              >
                {currentIndex + 1 >= questions.length ? 'Voir mes résultats →' : 'Question suivante →'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="h-6" />
    </div>
  );
}
