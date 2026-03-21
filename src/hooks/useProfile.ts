import { useState, useCallback } from 'react';
import { SchoolLevel } from '../types/game';

const PROFILES_KEY = 'pokedex-pals-profiles-v1';
const CURRENT_KEY  = 'pokedex-pals-current-profile-v1';

export interface ProfileEntry {
  id: string;
  name: string;
  avatarCardId: string;
  level: SchoolLevel; // CP=0, CE1=1, CE2=2, CM1=3, CM2=4
}

// Alias rétrocompat utilisé par PlayerSetup
export type PlayerProfile = Omit<ProfileEntry, 'id'>;

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

function loadProfiles(): ProfileEntry[] {
  try {
    const existing = localStorage.getItem(PROFILES_KEY);
    if (existing) {
      // Assurer rétrocompat : ajouter level si absent
      const parsed: ProfileEntry[] = JSON.parse(existing);
      return parsed.map(p => ({ level: 1 as SchoolLevel, ...p }));
    }

    // Migration depuis l'ancienne structure mono-profil
    const old = localStorage.getItem('pokedex-pals-profile-v1');
    if (old) {
      const p = JSON.parse(old) as { name: string; avatarCardId: string; level?: SchoolLevel };
      const migrated: ProfileEntry[] = [{ id: 'default', name: p.name, avatarCardId: p.avatarCardId, level: p.level ?? 1 }];
      localStorage.setItem(PROFILES_KEY, JSON.stringify(migrated));
      return migrated;
    }
  } catch {}
  return [];
}

function loadCurrentId(profiles: ProfileEntry[]): string | null {
  try {
    const id = localStorage.getItem(CURRENT_KEY);
    if (id && profiles.find(p => p.id === id)) return id;
  } catch {}
  return profiles[0]?.id ?? null;
}

export function useProfile() {
  const [profiles, setProfiles] = useState<ProfileEntry[]>(loadProfiles);
  const [currentId, setCurrentId] = useState<string | null>(() => {
    const all = loadProfiles();
    return loadCurrentId(all);
  });

  const currentProfile = profiles.find(p => p.id === currentId) ?? profiles[0] ?? null;

  // Créer ou mettre à jour un profil
  const saveProfile = useCallback((p: { name: string; avatarCardId: string }, id?: string) => {
    const profileId = id ?? generateId();
    const entry: ProfileEntry = { id: profileId, name: p.name, avatarCardId: p.avatarCardId };
    setProfiles(prev => {
      const updated = prev.find(x => x.id === profileId)
        ? prev.map(x => x.id === profileId ? entry : x)
        : [...prev, entry];
      localStorage.setItem(PROFILES_KEY, JSON.stringify(updated));
      return updated;
    });
    setCurrentId(profileId);
    localStorage.setItem(CURRENT_KEY, profileId);
  }, []);

  // Changer d'élève actif
  const switchProfile = useCallback((id: string) => {
    setCurrentId(id);
    localStorage.setItem(CURRENT_KEY, id);
  }, []);

  // Supprimer un profil (et sa progression)
  const deleteProfile = useCallback((id: string, currentIdSnapshot: string | null) => {
    const newProfiles = loadProfiles().filter(p => p.id !== id);
    localStorage.setItem(PROFILES_KEY, JSON.stringify(newProfiles));
    // Effacer la progression de ce profil
    localStorage.removeItem(`pokedex-pals-progress-v2-${id}`);
    setProfiles(newProfiles);
    if (currentIdSnapshot === id) {
      const newId = newProfiles[0]?.id ?? null;
      setCurrentId(newId);
      if (newId) localStorage.setItem(CURRENT_KEY, newId);
      else localStorage.removeItem(CURRENT_KEY);
    }
  }, []);

  return { profiles, currentProfile, currentId, saveProfile, switchProfile, deleteProfile };
}
