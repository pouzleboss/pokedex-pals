import { useState, useCallback } from 'react';
import { cards } from '../data/cards';

const STORAGE_KEY = 'pokedex-pals-progress-v1';

interface StoredProgress {
  /** cardId → list of correctly answered attack indices */
  cardAnswers: Record<string, number[]>;
  battleWins: number;
  battleTotal: number;
}

const EMPTY: StoredProgress = { cardAnswers: {}, battleWins: 0, battleTotal: 0 };

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

export function useProgress() {
  const [data, setData] = useState<StoredProgress>(load);

  /** Mark one attack question as correctly answered */
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

  /** Record a battle result */
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

  /** 0–3 stars based on fraction of attacks answered correctly */
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

  /** Clear all saved progress */
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
    getStars,
    resetProgress,
    stats: {
      masteredCount,
      battleWins: data.battleWins,
      battleTotal: data.battleTotal,
    },
  };
}
