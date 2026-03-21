import { useState, useCallback } from 'react';
import { cards } from '../data/cards';

const STORAGE_KEY = 'pokedex-pals-progress-v1';

interface StoredProgress {
  /** cardId → indices des attaques correctement répondues */
  cardAnswers: Record<string, number[]>;
  battleWins: number;
  battleTotal: number;
  /** Meilleur score au Quiz chrono (0-100) */
  bestQuizScore: number;
  /** Dates (YYYY-MM-DD) où le défi du jour a été accompli */
  dailyDone: string[];
}

const EMPTY: StoredProgress = {
  cardAnswers: {},
  battleWins: 0,
  battleTotal: 0,
  bestQuizScore: 0,
  dailyDone: [],
};

function load(): StoredProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...EMPTY, ...JSON.parse(raw) };
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

export function useProgress() {
  const [data, setData] = useState<StoredProgress>(load);

  const markCorrect = useCallback((cardId: string, attackIndex: number) => {
    setData((prev) => {
      const existing = new Set(prev.cardAnswers[cardId] ?? []);
      if (existing.has(attackIndex)) return prev;
      existing.add(attackIndex);
      const updated: StoredProgress = {
        ...prev,
        cardAnswers: { ...prev.cardAnswers, [cardId]: [...existing] },
      };
      persist(updated);
      return updated;
    });
  }, []);

  const recordBattle = useCallback((won: boolean) => {
    setData((prev) => {
      const updated: StoredProgress = {
        ...prev,
        battleWins: prev.battleWins + (won ? 1 : 0),
        battleTotal: prev.battleTotal + 1,
      };
      persist(updated);
      return updated;
    });
  }, []);

  const recordQuizScore = useCallback((score: number) => {
    setData((prev) => {
      if (score <= prev.bestQuizScore) return prev;
      const updated: StoredProgress = { ...prev, bestQuizScore: score };
      persist(updated);
      return updated;
    });
  }, []);

  const markDailyDone = useCallback(() => {
    const today = todayKey();
    setData((prev) => {
      if (prev.dailyDone.includes(today)) return prev;
      const updated: StoredProgress = {
        ...prev,
        dailyDone: [...prev.dailyDone, today],
      };
      persist(updated);
      return updated;
    });
  }, []);

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
    setData({ ...EMPTY });
  }, []);

  const masteredCount = cards.filter(
    (c) => (data.cardAnswers[c.id] ?? []).length >= c.attacks.length,
  ).length;

  return {
    markCorrect,
    recordBattle,
    recordQuizScore,
    markDailyDone,
    getStars,
    resetProgress,
    isDailyDone,
    stats: {
      masteredCount,
      battleWins: data.battleWins,
      battleTotal: data.battleTotal,
      bestQuizScore: data.bestQuizScore,
    },
  };
}
