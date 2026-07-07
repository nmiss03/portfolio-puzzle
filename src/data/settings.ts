// Player settings, persisted client-side (localStorage with in-memory fallback,
// same as the save system). Kept deliberately small for the alpha: only real,
// wired-up options live here. A tiny pub/sub lets the Settings UI stay in sync
// while GameContext can read the current value synchronously in its autosave
// effect. Theme mode is handled separately by ThemeContext.

import { useEffect, useState } from 'react';
import { loadJSON, saveJSON } from './persist';

const SETTINGS_KEY = 'portfolio-puzzle:settings';

export interface Settings {
  autosave: boolean;
}

export const DEFAULT_SETTINGS: Settings = {
  autosave: true,
};

function sanitize(raw: unknown): Settings {
  const s = (raw ?? {}) as Partial<Settings>;
  return { autosave: typeof s.autosave === 'boolean' ? s.autosave : DEFAULT_SETTINGS.autosave };
}

let current: Settings = sanitize(loadJSON<Settings>(SETTINGS_KEY));
const listeners = new Set<(s: Settings) => void>();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  saveJSON(SETTINGS_KEY, current);
  listeners.forEach((fn) => fn(current));
}

export function resetSettings(): void {
  current = { ...DEFAULT_SETTINGS };
  saveJSON(SETTINGS_KEY, current);
  listeners.forEach((fn) => fn(current));
}

// Reactive hook for the Settings UI.
export function useSettings(): Settings {
  const [s, setS] = useState<Settings>(current);
  useEffect(() => {
    const fn = (next: Settings) => setS(next);
    listeners.add(fn);
    setS(current);
    return () => {
      listeners.delete(fn);
    };
  }, []);
  return s;
}
