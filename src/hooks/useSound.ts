import { useRef, useCallback } from 'react';

export function useSound() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback((): AudioContext | null => {
    try {
      if (!ctxRef.current) {
        ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      return ctxRef.current;
    } catch {
      return null;
    }
  }, []);

  const playTone = useCallback((
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.25,
    delay = 0,
  ) => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = frequency;
      osc.type = type;
      const start = ctx.currentTime + delay;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(volume, start + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, start + duration);
      osc.start(start);
      osc.stop(start + duration + 0.01);
    } catch {}
  }, [getCtx]);

  /** Bonne réponse : petite mélodie montante joyeuse */
  const playSuccess = useCallback(() => {
    playTone(523, 0.12, 'sine', 0.25, 0);      // Do5
    playTone(659, 0.12, 'sine', 0.25, 0.1);    // Mi5
    playTone(784, 0.18, 'sine', 0.25, 0.2);    // Sol5
  }, [playTone]);

  /** Mauvaise réponse : bip grave court */
  const playError = useCallback(() => {
    playTone(200, 0.25, 'sawtooth', 0.15, 0);
  }, [playTone]);

  /** Passage de niveau : fanfare courte */
  const playLevelUp = useCallback(() => {
    playTone(523, 0.15, 'sine', 0.3, 0);
    playTone(659, 0.15, 'sine', 0.3, 0.15);
    playTone(784, 0.15, 'sine', 0.3, 0.3);
    playTone(1047, 0.3, 'sine', 0.3, 0.45);
  }, [playTone]);

  /** Badge débloqué : carillon */
  const playBadge = useCallback(() => {
    playTone(988,  0.15, 'sine', 0.25, 0);
    playTone(1175, 0.15, 'sine', 0.25, 0.15);
    playTone(1319, 0.2,  'sine', 0.25, 0.3);
  }, [playTone]);

  /** Victoire bataille */
  const playVictory = useCallback(() => {
    [523, 659, 784, 659, 784, 1047].forEach((freq, i) => {
      playTone(freq, 0.18, 'sine', 0.25, i * 0.12);
    });
  }, [playTone]);

  /** Défaite */
  const playDefeat = useCallback(() => {
    playTone(392, 0.2, 'sine', 0.2, 0);
    playTone(349, 0.2, 'sine', 0.2, 0.2);
    playTone(294, 0.4, 'sine', 0.2, 0.4);
  }, [playTone]);

  /** Click/tap bouton */
  const playClick = useCallback(() => {
    playTone(800, 0.05, 'sine', 0.1, 0);
  }, [playTone]);

  return { playSuccess, playError, playLevelUp, playBadge, playVictory, playDefeat, playClick };
}
