export type Subject = 'maths' | 'sciences' | 'histoire' | 'langues' | 'géographie';
export type Difficulty = 'commun' | 'rare' | 'legendaire';

// CE1=1, CE2=2, CM1=3, CM2=4
export type SchoolLevel = 1 | 2 | 3 | 4;

export interface Attack {
  name: string;
  question: string;
  answers: string[];
  correctIndex: number;
  damage: number;
}

export interface EducationalCard {
  id: string;
  name: string;
  subject: Subject;
  difficulty: Difficulty;
  hp: number;
  currentHp?: number;
  description: string;
  emoji: string;
  attacks: Attack[];
  level: SchoolLevel;
}

export const HP_BY_DIFFICULTY: Record<Difficulty, number> = {
  commun: 40,
  rare: 60,
  legendaire: 80,
};

export const SUBJECT_COLORS: Record<Subject, { bg: string; border: string; text: string; badge: string }> = {
  maths: {
    bg: 'from-blue-400 to-blue-600',
    border: 'border-blue-700',
    text: 'text-blue-900',
    badge: 'bg-blue-100 text-blue-800',
  },
  sciences: {
    bg: 'from-green-400 to-green-600',
    border: 'border-green-700',
    text: 'text-green-900',
    badge: 'bg-green-100 text-green-800',
  },
  histoire: {
    bg: 'from-orange-400 to-orange-600',
    border: 'border-orange-700',
    text: 'text-orange-900',
    badge: 'bg-orange-100 text-orange-800',
  },
  langues: {
    bg: 'from-pink-400 to-pink-600',
    border: 'border-pink-700',
    text: 'text-pink-900',
    badge: 'bg-pink-100 text-pink-800',
  },
  géographie: {
    bg: 'from-teal-400 to-teal-600',
    border: 'border-teal-700',
    text: 'text-teal-900',
    badge: 'bg-teal-100 text-teal-800',
  },
};

export const SUBJECT_LABELS: Record<Subject, string> = {
  maths: 'Maths',
  sciences: 'Sciences',
  histoire: 'Histoire',
  langues: 'Langues',
  géographie: 'Géographie',
};

export const DIFFICULTY_STARS: Record<Difficulty, string> = {
  commun: '⭐',
  rare: '⭐⭐',
  legendaire: '⭐⭐⭐',
};

export const LEVEL_LABELS: Record<SchoolLevel, string> = {
  1: 'CE1',
  2: 'CE2',
  3: 'CM1',
  4: 'CM2',
};
