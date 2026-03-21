import { Subject } from '../types/game';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  emoji: string;
  color: string; // Tailwind bg color class
}

export interface AchievementStats {
  totalAnswered: number;
  masteredCount: number;
  masteredBySubject: Record<Subject, number>;
  battleWins: number;
  battleTotal: number;
  bestQuizScore: number;
  xp: number;
  level: number;
  streak: number;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-answer',
    name: 'Premier Pas',
    description: 'Réponds à ta première question',
    emoji: '🌟',
    color: 'bg-yellow-100',
  },
  {
    id: 'five-mastered',
    name: 'Lecteur',
    description: 'Maîtrise 5 cartes',
    emoji: '📚',
    color: 'bg-blue-100',
  },
  {
    id: 'ten-mastered',
    name: 'Érudit',
    description: 'Maîtrise 10 cartes',
    emoji: '🎓',
    color: 'bg-purple-100',
  },
  {
    id: 'all-mastered',
    name: 'Grand Maître',
    description: 'Maîtrise toutes les 25 cartes !',
    emoji: '👑',
    color: 'bg-yellow-200',
  },
  {
    id: 'all-maths',
    name: 'Matheux',
    description: 'Maîtrise toutes les cartes Maths',
    emoji: '➕',
    color: 'bg-blue-100',
  },
  {
    id: 'all-sciences',
    name: 'Scientifique',
    description: 'Maîtrise toutes les cartes Sciences',
    emoji: '🔬',
    color: 'bg-green-100',
  },
  {
    id: 'all-histoire',
    name: 'Historien',
    description: 'Maîtrise toutes les cartes Histoire',
    emoji: '🏛️',
    color: 'bg-orange-100',
  },
  {
    id: 'all-langues',
    name: 'Linguiste',
    description: 'Maîtrise toutes les cartes Langues',
    emoji: '💬',
    color: 'bg-pink-100',
  },
  {
    id: 'all-geo',
    name: 'Géographe',
    description: 'Maîtrise toutes les cartes Géographie',
    emoji: '🗺️',
    color: 'bg-teal-100',
  },
  {
    id: 'first-battle-win',
    name: 'Guerrier',
    description: 'Remporte ta première bataille',
    emoji: '⚔️',
    color: 'bg-red-100',
  },
  {
    id: 'ten-battle-wins',
    name: 'Invincible',
    description: 'Remporte 10 batailles',
    emoji: '💪',
    color: 'bg-red-200',
  },
  {
    id: 'quiz-complete',
    name: 'Candidat',
    description: 'Termine le Quiz Chrono',
    emoji: '🎯',
    color: 'bg-indigo-100',
  },
  {
    id: 'quiz-champion',
    name: 'Champion Quiz',
    description: 'Obtiens 100/100 au Quiz Chrono',
    emoji: '🥇',
    color: 'bg-yellow-100',
  },
  {
    id: 'streak-3',
    name: 'Régulier',
    description: 'Joue 3 jours de suite',
    emoji: '🔥',
    color: 'bg-orange-100',
  },
  {
    id: 'streak-7',
    name: 'Étoile Filante',
    description: 'Joue 7 jours de suite',
    emoji: '⭐',
    color: 'bg-yellow-100',
  },
  {
    id: 'level-5',
    name: 'Aventurier Confirmé',
    description: 'Atteins le niveau 5',
    emoji: '🚀',
    color: 'bg-purple-100',
  },
];

export function checkAchievement(id: string, stats: AchievementStats): boolean {
  switch (id) {
    case 'first-answer':    return stats.totalAnswered >= 1;
    case 'five-mastered':   return stats.masteredCount >= 5;
    case 'ten-mastered':    return stats.masteredCount >= 10;
    case 'all-mastered':    return stats.masteredCount >= 25;
    case 'all-maths':       return (stats.masteredBySubject['maths'] ?? 0) >= 5;
    case 'all-sciences':    return (stats.masteredBySubject['sciences'] ?? 0) >= 5;
    case 'all-histoire':    return (stats.masteredBySubject['histoire'] ?? 0) >= 5;
    case 'all-langues':     return (stats.masteredBySubject['langues'] ?? 0) >= 5;
    case 'all-geo':         return (stats.masteredBySubject['géographie'] ?? 0) >= 5;
    case 'first-battle-win': return stats.battleWins >= 1;
    case 'ten-battle-wins': return stats.battleWins >= 10;
    case 'quiz-complete':   return stats.bestQuizScore > 0;
    case 'quiz-champion':   return stats.bestQuizScore >= 100;
    case 'streak-3':        return stats.streak >= 3;
    case 'streak-7':        return stats.streak >= 7;
    case 'level-5':         return stats.level >= 5;
    default:                return false;
  }
}
