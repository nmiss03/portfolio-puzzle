// Shared game state across the expo-router screens.
//
// Because each route is its own component, the selected level, the in-progress
// allocation, and the computed result live in a Context provider mounted at the
// root layout. Screens read/update this instead of passing params around.

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getLevel, Level } from '../data/levels';
import { getStocksByIds } from '../data/stocks';
import { Allocations, ScoreResult, scoreAllocation } from '../data/scoring';

interface GameContextValue {
  level: Level;
  levelId: number;
  allocations: Allocations;
  result: ScoreResult | null;
  /** Begin a level: select it and clear any previous progress. */
  startLevel: (id: number) => void;
  /** Persist an in-progress allocation (so it survives navigation). */
  saveAllocations: (a: Allocations) => void;
  /** Score the allocation, store the result, and return it. */
  submitAllocations: (a: Allocations) => ScoreResult;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [levelId, setLevelId] = useState(1);
  const [allocations, setAllocations] = useState<Allocations>({});
  const [result, setResult] = useState<ScoreResult | null>(null);

  // Level 1 is guaranteed to exist; fall back to it defensively.
  const level = getLevel(levelId) ?? (getLevel(1) as Level);

  const startLevel = useCallback((id: number) => {
    const target = getLevel(id);
    if (!target || target.locked) return;
    setLevelId(id);
    setAllocations({});
    setResult(null);
  }, []);

  const saveAllocations = useCallback((a: Allocations) => setAllocations(a), []);

  const submitAllocations = useCallback(
    (a: Allocations): ScoreResult => {
      setAllocations(a);
      const stocks = getStocksByIds(level.stockIds);
      const scored = scoreAllocation(a, stocks, level);
      setResult(scored);
      return scored;
    },
    [level]
  );

  const value = useMemo<GameContextValue>(
    () => ({ level, levelId, allocations, result, startLevel, saveAllocations, submitAllocations }),
    [level, levelId, allocations, result, startLevel, saveAllocations, submitAllocations]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
