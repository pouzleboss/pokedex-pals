import { useState } from 'react';
import { cards } from '../data/cards';
import { CardMonster } from './CardMonster';
import { PlayerProfile } from '../hooks/useProfile';
import { SchoolLevel, LEVEL_LABELS } from '../types/game';

interface Props {
  onSave: (profile: PlayerProfile) => void;
}

// On propose un choix d'avatars parmi les monstres existants
const AVATAR_OPTIONS = [
  'math-05', 'sci-03', 'hist-01', 'lang-05', 'geo-05',
  'math-01', 'sci-01', 'hist-03', 'lang-02', 'geo-03',
];

const LEVELS: { value: SchoolLevel; label: string; desc: string; emoji: string }[] = [
  { value: 0, label: 'CP',  desc: '6-7 ans — Je commence à lire',       emoji: '🌱' },
  { value: 1, label: 'CE1', desc: '7-8 ans — Je lis et je calcule',       emoji: '🌿' },
  { value: 2, label: 'CE2', desc: '8-9 ans — J\'explore les matières',    emoji: '🌳' },
  { value: 3, label: 'CM1', desc: '9-10 ans — Je maîtrise les bases',     emoji: '⭐' },
  { value: 4, label: 'CM2', desc: '10-11 ans — Je suis prêt(e) pour le collège', emoji: '🏆' },
];

const HOW_TO_PLAY = [
  { emoji: '🃏', title: 'Retourne les cartes', desc: 'Appuie sur une carte pour la retourner et répondre à une question !' },
  { emoji: '🎯', title: 'Quiz Chrono', desc: '10 questions, 15 secondes chacune. Réponds vite pour scorer un maximum !' },
  { emoji: '⚔️', title: 'Bataille !', desc: 'Choisis ta carte et affronte un ennemi. Tes bonnes réponses font des dégâts !' },
  { emoji: '⭐', title: 'Gagne des étoiles', desc: 'Réponds à toutes les questions d\'une carte pour la maîtriser et débloquer des badges !' },
];

export function PlayerSetup({ onSave }: Props) {
  const [step, setStep] = useState<'name' | 'level' | 'avatar' | 'tutorial'>('name');
  const [name, setName] = useState('');
  const [level, setLevel] = useState<SchoolLevel>(1);
  const [avatarCardId, setAvatarCardId] = useState(AVATAR_OPTIONS[0]);

  const handleNameNext = () => {
    if (name.trim().length < 2) return;
    setStep('level');
  };

  const handleSave = () => {
    onSave({ name: name.trim(), avatarCardId, level });
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-purple-900 via-blue-900 to-purple-900 flex flex-col items-center justify-center p-6">

      {/* Logo */}
      <div className="text-5xl mb-2 pop-in">🃏</div>
      <h1 className="text-3xl font-extrabold text-white mb-1 slide-up text-center">
        Pokedex-Pals
      </h1>
      <p className="text-purple-300 text-sm mb-8 slide-up text-center">
        Le jeu de cartes éducatif !
      </p>

      {step === 'name' && (
        <div className="w-full max-w-sm bg-white/10 backdrop-blur rounded-3xl p-6 border border-white/20 pop-in">
          <h2 className="text-white font-extrabold text-xl mb-1 text-center">
            Comment tu t'appelles ?
          </h2>
          <p className="text-purple-300 text-xs text-center mb-4">
            Ton prénom apparaîtra sur ton profil
          </p>
          <input
            type="text"
            placeholder="Ex : Lucas, Emma…"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleNameNext()}
            maxLength={20}
            autoFocus
            className="w-full bg-white rounded-xl px-4 py-3 text-base font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-400 mb-4 text-center"
          />
          <button
            disabled={name.trim().length < 2}
            onClick={handleNameNext}
            className="w-full bg-yellow-400 text-yellow-900 font-extrabold py-3 rounded-full text-base disabled:opacity-40 active:scale-95 transition-transform"
          >
            Suivant →
          </button>
        </div>
      )}

      {step === 'level' && (
        <div className="w-full max-w-sm bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/20 pop-in">
          <h2 className="text-white font-extrabold text-xl mb-1 text-center">
            Quelle est ta classe, {name} ?
          </h2>
          <p className="text-purple-300 text-xs text-center mb-4">
            Tu verras les cartes de ton niveau scolaire
          </p>

          <div className="flex flex-col gap-2 mb-5">
            {LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setLevel(lvl.value)}
                className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 border-2 transition-all active:scale-95 text-left ${
                  level === lvl.value
                    ? 'border-yellow-400 bg-yellow-400/20'
                    : 'border-white/20 bg-white/5'
                }`}
              >
                <span className="text-2xl flex-shrink-0">{lvl.emoji}</span>
                <div className="min-w-0">
                  <span className={`font-extrabold text-sm block ${level === lvl.value ? 'text-yellow-300' : 'text-white'}`}>
                    {lvl.label}
                  </span>
                  <span className="text-purple-300 text-xs truncate block">{lvl.desc}</span>
                </div>
                {level === lvl.value && (
                  <span className="ml-auto text-yellow-400 text-lg flex-shrink-0">✓</span>
                )}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('name')}
              className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-full text-sm border border-white/20 active:scale-95 transition-transform"
            >
              ← Retour
            </button>
            <button
              onClick={() => setStep('avatar')}
              className="flex-[2] bg-yellow-400 text-yellow-900 font-extrabold py-2.5 rounded-full text-sm active:scale-95 transition-transform"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}

      {step === 'avatar' && (
        <div className="w-full max-w-sm bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/20 pop-in">
          <h2 className="text-white font-extrabold text-xl mb-1 text-center">
            Choisis ton monstre, {name} !
          </h2>
          <p className="text-purple-300 text-xs text-center mb-4">
            Ce sera ton avatar dans le jeu
          </p>

          <div className="grid grid-cols-5 gap-2 mb-5">
            {AVATAR_OPTIONS.map((cardId) => (
              <button
                key={cardId}
                onClick={() => setAvatarCardId(cardId)}
                className={`rounded-xl p-1 border-2 transition-all active:scale-95 ${
                  avatarCardId === cardId
                    ? 'border-yellow-400 bg-yellow-400/20 scale-110'
                    : 'border-white/20 bg-white/10'
                }`}
              >
                <CardMonster cardId={cardId} className="w-full aspect-square" />
              </button>
            ))}
          </div>

          {/* Aperçu */}
          <div className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 mb-4">
            <div className="w-14 h-14 monster-float flex-shrink-0">
              <CardMonster cardId={avatarCardId} className="w-full h-full" />
            </div>
            <div>
              <p className="text-white font-extrabold text-base">{name}</p>
              <p className="text-purple-300 text-xs">
                {LEVEL_LABELS[level]} — Prêt(e) à jouer !
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('level')}
              className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-full text-sm border border-white/20 active:scale-95 transition-transform"
            >
              ← Retour
            </button>
            <button
              onClick={() => setStep('tutorial')}
              className="flex-[2] bg-yellow-400 text-yellow-900 font-extrabold py-2.5 rounded-full text-sm active:scale-95 transition-transform"
            >
              Suivant →
            </button>
          </div>
        </div>
      )}
      {step === 'tutorial' && (
        <div className="w-full max-w-sm bg-white/10 backdrop-blur rounded-3xl p-5 border border-white/20 pop-in">
          <h2 className="text-white font-extrabold text-xl mb-1 text-center">
            Comment jouer, {name} ?
          </h2>
          <p className="text-purple-300 text-xs text-center mb-4">
            C'est super simple — regarde !
          </p>

          <div className="space-y-3 mb-5">
            {HOW_TO_PLAY.map((item, i) => (
              <div key={i} className="flex items-start gap-3 bg-white/10 rounded-2xl px-3 py-2.5 border border-white/10">
                <span className="text-2xl flex-shrink-0 mt-0.5">{item.emoji}</span>
                <div>
                  <p className="text-white font-extrabold text-sm leading-tight">{item.title}</p>
                  <p className="text-purple-300 text-xs mt-0.5 leading-snug">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('avatar')}
              className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-full text-sm border border-white/20 active:scale-95 transition-transform"
            >
              ← Retour
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] bg-yellow-400 text-yellow-900 font-extrabold py-2.5 rounded-full text-sm active:scale-95 transition-transform"
            >
              🎮 Jouer maintenant !
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
