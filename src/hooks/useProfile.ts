import { useState, useCallback } from 'react';

const KEY = 'pokedex-pals-profile-v1';

export interface PlayerProfile {
  name: string;
  avatarCardId: string; // ID de la carte dont le monstre sert d'avatar
}

function load(): PlayerProfile | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function useProfile() {
  const [profile, setProfile] = useState<PlayerProfile | null>(load);

  const saveProfile = useCallback((p: PlayerProfile) => {
    localStorage.setItem(KEY, JSON.stringify(p));
    setProfile(p);
  }, []);

  return { profile, saveProfile };
}
