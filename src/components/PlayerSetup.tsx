import { useState } from 'react';
import { cards } from '../data/cards';
import { CardMonster } from './CardMonster';
import { PlayerProfile } from '../hooks/useProfile';

interface Props {
  onSave: (profile: PlayerProfile) => void;
}

// On propose un choix d'avatars parmi les monstres existants
const AVATAR_OPTIONS = [
  'math-05', 'sci-03', 'hist-01', 'lang-05', 'geo-05',
  'math-01', 'sci-01', 'hist-03', 'lang-02', 'geo-03',
];

export function PlayerSetup({ onSave }: Props) {
  const [step, setStep] = useState<'name' | 'avatar'>('name');
  const [name, setName] = useState('');
  const [avatarCardId, setAvatarCardId] = useState(AVATAR_OPTIONS[0]);

  const handleNameNext = () => {
    if (name.trim().length < 2) return;
    setStep('avatar');
  };

  const handleSave = () => {
    onSave({ name: name.trim(), avatarCardId });
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
              <p className="text-purple-300 text-xs">Prêt(e) à jouer !</p>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep('name')}
              className="flex-1 bg-white/10 text-white font-bold py-2.5 rounded-full text-sm border border-white/20 active:scale-95 transition-transform"
            >
              ← Retour
            </button>
            <button
              onClick={handleSave}
              className="flex-[2] bg-yellow-400 text-yellow-900 font-extrabold py-2.5 rounded-full text-sm active:scale-95 transition-transform"
            >
              C'est parti ! 🎮
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
