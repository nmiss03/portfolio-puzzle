// Shared game state across the expo-router screens.
//
// The selected level, the in-progress share holdings, and the computed
// simulation result live in a Context provider mounted at the root layout so
// each route (its own component) can read/update them.

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';

import { getLevel, Level } from '../data/levels';
import { getStocksByIds } from '../data/stocks';
import { Holdings, SimulationResult, simulatePortfolio } from '../data/scoring';

interface GameContextValue {
  level: Level;
  levelId: number;
  holdings: Holdings;
  result: SimulationResult | null;
  /** Begin a level: select it and clear any previous progress. */
  startLevel: (id: number) => void;
  /** Persist in-progress holdings (so they survive navigation). */
  saveHoldings: (h: Holdings) => void;
  /** Run the 40-year simulation, store the result, and return it. */
  submitHoldings: (h: Holdings) => SimulationResult;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [levelId, setLevelId] = useState(1);
  const [holdings, setHoldings] = useState<Holdings>({});
  const [result, setResult] = useState<SimulationResult | null>(null);

  const level = getLevel(levelId) ?? (getLevel(1) as Level);

  const startLevel = useCallback((id: number) => {
    const target = getLevel(id);
    if (!target || target.locked) return;
    setLevelId(id);
    setHoldings({});
    setResult(null);
  }, []);

  const saveHoldings = useCallback((h: Holdings) => setHoldings(h), []);

  const submitHoldings = useCallback(
    (h: Holdings): SimulationResult => {
      setHoldings(h);
      const stocks = getStocksByIds(level.stockIds);
      const sim = simulatePortfolio(h, stocks, level);
      setResult(sim);
      return sim;
    },
    [level]
  );

  const value = useMemo<GameContextValue>(
    () => ({ level, levelId, holdings, result, startLevel, saveHoldings, submitHoldings }),
    [level, levelId, holdings, result, startLevel, saveHoldings, submitHoldings]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}
