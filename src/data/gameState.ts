// Core types + constants for the week-by-week portfolio-manager game.

export interface CharacterStyle {
  skin: string;
  shirt: string;
  hair: string;
}

export type RiskPreference = 'Conservative' | 'Moderate' | 'Moderate-to-Aggressive' | 'Aggressive';

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
  character: CharacterStyle;
  background: string; // 1-2 sentence blurb
  dialogue: string[];
  riskPreference: RiskPreference;
  /** Recommended share of the portfolio in stocks (vs bonds), 0..1. */
  idealStockPct: number;
  initialCapital: number;
  /** Which week this client becomes available. */
  unlockedWeek: number;
}

// Runtime state layered on top of a profile.
export interface RuntimeClient extends ClientProfile {
  holdings: Record<string, number>; // stockId -> shares
  happiness: number; // 0..100
  /** Account value; only meaningful after a week has been transitioned. */
  portfolioValue: number;
  // Returns are null until the client has completed at least one week.
  lastWeekReturnDollar: number | null;
  lastWeekReturnPct: number | null;
  allTimeReturnDollar: number;
  allTimeReturnPct: number;
  performanceHistory: WeekRecord[];
  fired: boolean;
}

export type Phase = 'weekIntro' | 'clientIntro' | 'builder' | 'transition' | 'gameOver';

export const STARTING_HAPPINESS = 75;

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
