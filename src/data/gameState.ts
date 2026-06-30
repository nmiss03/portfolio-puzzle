// Core types + constants for the week-by-week portfolio-manager game.

export type RiskPreference = 'conservative' | 'moderate' | 'aggressive' | 'moderate-aggressive';

export interface WeekRecord {
  week: number;
  returnDollar: number;
  returnPct: number; // fraction
  happiness: number;
}

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
  unlockedWeek: number;
}

// Runtime state layered on top of a profile.
export interface RuntimeClient extends ClientProfile {
  holdings: Record<string, number>; // stockId -> shares
  happiness: number; // 0..100
  portfolioValue: number; // only meaningful after a transitioned week
  lastWeekReturnDollar: number | null;
  lastWeekReturnPct: number | null;
  allTimeReturnDollar: number;
  allTimeReturnPct: number;
  performanceHistory: WeekRecord[];
  fired: boolean;
}

export type Phase = 'weekIntro' | 'clientIntro' | 'builder' | 'news' | 'transition' | 'summary' | 'gameOver';

export const STARTING_HAPPINESS = 75;

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
    holdings: {},
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
