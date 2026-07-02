// Light/dark theme provider. Persists the chosen mode without any native
// dependency: uses web localStorage when available, otherwise an in-memory
// fallback (so it still works in the current session on native).

import React, { createContext, useContext, useMemo, useState } from 'react';

import { Palette, ThemeMode, paletteFor } from '../styles/colors';

const STORAGE_KEY = 'portfolio-puzzle:themeMode';

let memoryMode: ThemeMode = 'light';

function readStoredMode(): ThemeMode {
  try {
    // @ts-ignore - localStorage exists on web only
    if (typeof localStorage !== 'undefined' && localStorage) {
      // @ts-ignore
      const v = localStorage.getItem(STORAGE_KEY);
      if (v === 'light' || v === 'dark') return v;
    }
  } catch {
    // ignore
  }
  return memoryMode;
}

function writeStoredMode(mode: ThemeMode) {
  memoryMode = mode;
  try {
    // @ts-ignore
    if (typeof localStorage !== 'undefined' && localStorage) {
      // @ts-ignore
      localStorage.setItem(STORAGE_KEY, mode);
    }
  } catch {
    // ignore
  }
}

export type { Palette };

interface ThemeContextValue {
  mode: ThemeMode;
  c: Palette;
  setMode: (m: ThemeMode) => void;
  toggle: () => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => readStoredMode());

  const value = useMemo<ThemeContextValue>(() => {
    const setMode = (m: ThemeMode) => {
      writeStoredMode(m);
      setModeState(m);
    };
    return {
      mode,
      c: paletteFor(mode),
      setMode,
      toggle: () => setMode(mode === 'dark' ? 'light' : 'dark'),
    };
  }, [mode]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback if a component renders outside the provider.
    return { mode: 'light', c: paletteFor('light'), setMode: () => {}, toggle: () => {} };
  }
  return ctx;
}

// Build a per-file `useStyles()` hook from a palette→styles factory. Styles are
// created once per theme mode and cached, so subcomponents can call the hook
// freely without re-creating StyleSheets on every render.
export function makeUseStyles<T>(factory: (c: Palette) => T): () => T {
  const cache: Partial<Record<ThemeMode, T>> = {};
  return function useStyles(): T {
    const { mode, c } = useTheme();
    if (!cache[mode]) cache[mode] = factory(c);
    return cache[mode] as T;
  };
}
