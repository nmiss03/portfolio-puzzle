// Core types + constants for the week-by-week portfolio-manager game.

export type RiskPreference = 'conservative' | 'moderate' | 'aggressive' | 'moderate-aggressive';

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
  riskPreference: RiskPreference;
  recommendedAllocation: string; // human-readable
  idealStockPct: number; // recommended share in stocks, 0..1
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

export const RISK_LABEL: Record<RiskPreference, string> = {
  conservative: 'Conservative',
  moderate: 'Moderate',
  aggressive: 'Aggressive',
  'moderate-aggressive': 'Moderate-Aggressive',
};

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
