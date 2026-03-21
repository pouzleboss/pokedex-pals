import { useState, useCallback, useRef } from 'react';
import { cards } from '../data/cards';
import { Subject } from '../types/game';
import { ACHIEVEMENTS, checkAchievement, Achievement, AchievementStats } from '../data/achievements';

const STORAGE_KEY = 'pokedex-pals-progress-v2';

// ── Niveaux ───────────────────────────────────────────────────────────────────
export const XP_LEVELS = [
  { level: 1,  name: 'Débutant',       xpNeeded: 0    },
  { level: 2,  name: 'Apprenti',       xpNeeded: 100  },
  { level: 3,  name: 'Explorateur',    xpNeeded: 250  },
  { level: 4,  name: 'Aventurier',     xpNeeded: 500  },
  { level: 5,  name: 'Chevalier',      xpNeeded: 900  },
  { level: 6,  name: 'Héros',          xpNeeded: 1500 },
  { level: 7,  name: 'Champion',       xpNeeded: 2500 },
  { level: 8,  name: 'Maître',         xpNeeded: 4000 },
  { level: 9,  name: 'Légende',        xpNeeded: 6000 },
  { level: 10, name: 'Génie Absolu',   xpNeeded: 9000 },
];

export function getLevelInfo(xp: number) {
  let current = XP_LEVELS[0];
  let next = XP_LEVELS[1];
  for (let i = XP_LEVELS.length - 1; i >= 0; i--) {
    if (xp >= XP_LEVELS[i].xpNeeded) {
      current = XP_LEVELS[i];
      next = XP_LEVELS[i + 1] ?? null;
      break;
    }
  }
  const xpInLevel = xp - current.xpNeeded;
  const xpNeededForNext = next ? next.xpNeeded - current.xpNeeded : 1;
  const progress = next ? Math.min(1, xpInLevel / xpNeededForNext) : 1;
  return { level: current.level, name: current.name, next, progress, xpInLevel, xpNeededForNext };
}

// ── Storage ───────────────────────────────────────────────────────────────────
interface StoredProgress {
  cardAnswers: Record<string, number[]>;
  battleWins: number;
  battleTotal: number;
  bestQuizScore: number;
  dailyDone: string[];
  xp: number;
  streak: number;
  lastActivityDate: string;
  totalAnswered: number;
  unlockedBadges: string[];
}

const EMPTY: StoredProgress = {
  cardAnswers: {},
  battleWins: 0,
  battleTotal: 0,
  bestQuizScore: 0,
  dailyDone: [],
  xp: 0,
  streak: 0,
  lastActivityDate: '',
  totalAnswered: 0,
  unlockedBadges: [],
};

function load(): StoredProgress {
  try {
    // Migration depuis v1
    const v1 = localStorage.getItem('pokedex-pals-progress-v1');
    const v2 = localStorage.getItem(STORAGE_KEY);
    if (!v2 && v1) {
      const old = JSON.parse(v1);
      const migrated: StoredProgress = {
        ...EMPTY,
        cardAnswers: old.cardAnswers ?? {},
        battleWins: old.battleWins ?? 0,
        battleTotal: old.battleTotal ?? 0,
        bestQuizScore: old.bestQuizScore ?? 0,
        dailyDone: old.dailyDone ?? [],
      };
      return migrated;
    }
    if (v2) return { ...EMPTY, ...JSON.parse(v2) };
  } catch {}
  return { ...EMPTY };
}

function persist(data: StoredProgress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function todayKey(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function yesterdayKey(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function computeStreak(prev: StoredProgress): { streak: number; lastActivityDate: string } {
  const today = todayKey();
  if (prev.lastActivityDate === today) return { streak: prev.streak, lastActivityDate: today };
  if (prev.lastActivityDate === yesterdayKey()) return { streak: prev.streak + 1, lastActivityDate: today };
  return { streak: 1, lastActivityDate: today };
}

function computeStats(data: StoredProgress): AchievementStats {
  const masteredBySubject: Record<Subject, number> = {
    maths: 0, sciences: 0, histoire: 0, langues: 0, géographie: 0,
  };
  let masteredCount = 0;
  for (const card of cards) {
    const answered = (data.cardAnswers[card.id] ?? []).length;
    if (answered >= card.attacks.length) {
      masteredCount++;
      masteredBySubject[card.subject]++;
    }
  }
  const levelInfo = getLevelInfo(data.xp);
  return {
    totalAnswered: data.totalAnswered,
    masteredCount,
    masteredBySubject,
    battleWins: data.battleWins,
    battleTotal: data.battleTotal,
    bestQuizScore: data.bestQuizScore,
    xp: data.xp,
    level: levelInfo.level,
    streak: data.streak,
  };
}

function checkNewBadges(prev: StoredProgress, next: StoredProgress): string[] {
  const stats = computeStats(next);
  const newlyUnlocked: string[] = [];
  for (const ach of ACHIEVEMENTS) {
    if (!prev.unlockedBadges.includes(ach.id) && checkAchievement(ach.id, stats)) {
      newlyUnlocked.push(ach.id);
    }
  }
  return newlyUnlocked;
}

// ── Hook ─────────────────────────────────────────────────────────────────────
export function useProgress() {
  const [data, setData] = useState<StoredProgress>(load);
  const [pendingBadges, setPendingBadges] = useState<Achievement[]>([]);

  const applyUpdate = useCallback((updater: (prev: StoredProgress) => StoredProgress) => {
    setData((prev) => {
      const next = updater(prev);
      if (next === prev) return prev;
      const newBadgeIds = checkNewBadges(prev, next);
      const finalNext: StoredProgress = newBadgeIds.length > 0
        ? { ...next, unlockedBadges: [...next.unlockedBadges, ...newBadgeIds] }
        : next;
      persist(finalNext);
      if (newBadgeIds.length > 0) {
        const newAchs = ACHIEVEMENTS.filter((a) => newBadgeIds.includes(a.id));
        setPendingBadges((pb) => [...pb, ...newAchs]);
      }
      return finalNext;
    });
  }, []);

  const markCorrect = useCallback((cardId: string, attackIndex: number) => {
    applyUpdate((prev) => {
      const existing = new Set(prev.cardAnswers[cardId] ?? []);
      if (existing.has(attackIndex)) return prev;
      existing.add(attackIndex);
      const streakInfo = computeStreak(prev);
      return {
        ...prev,
        cardAnswers: { ...prev.cardAnswers, [cardId]: [...existing] },
        xp: prev.xp + 5,
        totalAnswered: prev.totalAnswered + 1,
        ...streakInfo,
      };
    });
  }, [applyUpdate]);

  const recordBattle = useCallback((won: boolean) => {
    applyUpdate((prev) => {
      const streakInfo = computeStreak(prev);
      return {
        ...prev,
        battleWins: prev.battleWins + (won ? 1 : 0),
        battleTotal: prev.battleTotal + 1,
        xp: prev.xp + (won ? 30 : 10),
        ...streakInfo,
      };
    });
  }, [applyUpdate]);

  const recordQuizScore = useCallback((score: number, correctCount: number = 0) => {
    applyUpdate((prev) => {
      const xpGain = correctCount * 8 + (score >= 80 ? 20 : score >= 50 ? 10 : 0);
      const streakInfo = computeStreak(prev);
      return {
        ...prev,
        bestQuizScore: Math.max(prev.bestQuizScore, score),
        xp: prev.xp + xpGain,
        ...streakInfo,
      };
    });
  }, [applyUpdate]);

  const markDailyDone = useCallback(() => {
    const today = todayKey();
    applyUpdate((prev) => {
      if (prev.dailyDone.includes(today)) return prev;
      return {
        ...prev,
        dailyDone: [...prev.dailyDone, today],
        xp: prev.xp + 25, // bonus défi journalier
      };
    });
  }, [applyUpdate]);

  const getStars = useCallback(
    (cardId: string, totalAttacks: number): 0 | 1 | 2 | 3 => {
      const n = (data.cardAnswers[cardId] ?? []).length;
      if (n === 0) return 0;
      if (n >= totalAttacks) return 3;
      if (n >= Math.ceil(totalAttacks / 2)) return 2;
      return 1;
    },
    [data.cardAnswers],
  );

  const isDailyDone = data.dailyDone.includes(todayKey());

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem('pokedex-pals-progress-v1');
    setData({ ...EMPTY });
    setPendingBadges([]);
  }, []);

  const clearPendingBadges = useCallback(() => {
    setPendingBadges([]);
  }, []);

  const masteredCount = cards.filter(
    (c) => (data.cardAnswers[c.id] ?? []).length >= c.attacks.length,
  ).length;

  const levelInfo = getLevelInfo(data.xp);

  return {
    markCorrect,
    recordBattle,
    recordQuizScore,
    markDailyDone,
    getStars,
    resetProgress,
    isDailyDone,
    pendingBadges,
    clearPendingBadges,
    xp: data.xp,
    streak: data.streak,
    level: levelInfo.level,
    levelName: levelInfo.name,
    levelProgress: levelInfo.progress,
    xpInLevel: levelInfo.xpInLevel,
    xpNeededForNext: levelInfo.xpNeededForNext,
    nextLevelName: levelInfo.next?.name ?? null,
    unlockedBadges: data.unlockedBadges,
    stats: {
      masteredCount,
      battleWins: data.battleWins,
      battleTotal: data.battleTotal,
      bestQuizScore: data.bestQuizScore,
      totalAnswered: data.totalAnswered,
      cardAnswers: data.cardAnswers,
    },
  };
}
