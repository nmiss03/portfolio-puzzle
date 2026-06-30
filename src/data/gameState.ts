// Core types + constants for the week-by-week portfolio-manager game.

// A client's target split between stocks and bonds (fractions summing to 1).
export interface AllocationTarget {
  stocks: number;
  bonds: number;
}

export interface WeekRecord {
  week: number;
  returnDollar: number;
  returnPct: number; // fraction
  happiness: number;
}

export type ClientStatus = 'unsigned' | 'signed' | 'expired' | 'dismissed' | 'fired';

export const CONTRACT_WEEKS = 8;
export const MAX_ACTIVE_CLIENTS = 3;

// Static description of a client (authored in clients.ts).
export interface ClientProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  characterColor: string; // simple colored-rectangle character
  background: string; // 1-2 sentence blurb
  dialogue: string[];
  tier: number; // 1..4 — drives capital, tolerance and penalties (see clientTiers.ts)
  recommendedAllocation: AllocationTarget; // target stock/bond split, fractions
  allocationTolerance: number; // ± fraction from target that still counts as a match
  negativeReturnHappinessPenalty: number; // happiness hit on a sharply negative week (< -2%)
  initialCapital: number;
  unlockedAtReputation: number; // becomes available at/above this reputation
}

// Runtime state layered on top of a profile.
export interface RuntimeClient extends ClientProfile {
  status: ClientStatus;
  contractStartWeek: number;
  contractWeeksRemaining: number;
  holdings: Record<string, Holding>; // stockId -> position
  cash: number; // uninvested capital available
  happiness: number; // 0..100
  portfolioValue: number; // only meaningful after a transitioned week
  lastWeekReturnDollar: number | null;
  lastWeekReturnPct: number | null;
  allTimeReturnDollar: number;
  allTimeReturnPct: number;
  performanceHistory: WeekRecord[];
  fired: boolean;
}

export type Phase = 'weekIntro' | 'clientIntro' | 'builder' | 'transition' | 'summary' | 'gameOver';

/** A position: total shares and the total dollars paid for them (cost basis). */
export interface Holding {
  shares: number;
  cost: number;
}

export const STARTING_HAPPINESS = 50;

// Human-readable target allocation, e.g. "60% stocks, 40% bonds".
export function allocationLabel(a: AllocationTarget): string {
  return `${Math.round(a.stocks * 100)}% stocks, ${Math.round(a.bonds * 100)}% bonds`;
}

// Weighted-average cost per share for a position.
export function avgCost(h: Holding): number {
  return h.shares > 0 ? h.cost / h.shares : 0;
}

// Qualitative risk-preference label shown to the player. Derived from the
// (hidden) target allocation so the exact numbers never leak into the UI.
export function riskPreferenceLabel(a: AllocationTarget): string {
  if (a.stocks >= 0.68) return 'Growth-focused';
  if (a.stocks >= 0.62) return 'Growth with some stability';
  if (a.stocks >= 0.57) return 'Balanced';
  return 'Capital-preservation leaning';
}

export function clampHappiness(n: number): number {
  return Math.max(0, Math.min(100, n));
}

export function initRuntimeClient(profile: ClientProfile): RuntimeClient {
  return {
    ...profile,
    status: 'unsigned',
    contractStartWeek: 0,
    contractWeeksRemaining: 0,
    holdings: {},
    cash: profile.initialCapital,
    happiness: STARTING_HAPPINESS,
    portfolioValue: profile.initialCapital,
    lastWeekReturnDollar: null,
    lastWeekReturnPct: null,
    allTimeReturnDollar: 0,
    allTimeReturnPct: 0,
    performanceHistory: [],
    fired: false,
  };
}
