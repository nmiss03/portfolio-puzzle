// Core types + constants for the day-by-day portfolio-manager game.

export interface CharacterStyle {
  skin: string;
  shirt: string;
  hair: string;
}

// Static description of a client (authored in clients.ts).
export interface ClientProfile {
  id: string;
  name: string;
  age: number;
  occupation: string;
  character: CharacterStyle;
  summary: string;
  dialogue: string[];
  initialCapital: number;
  horizonYears: number;
  /** Ideal share of the portfolio in stocks (vs bonds), 0..1. */
  idealStockPct: number;
  /** How much high-growth / high-volatility exposure the client can stomach, 0..1. */
  riskTolerance: number;
}

// Runtime state layered on top of a profile.
export interface RuntimeClient extends ClientProfile {
  /** stockId -> shares owned. */
  holdings: Record<string, number>;
  happiness: number; // 0..100
  finalized: boolean; // has a day result been committed?
  fired: boolean;
  lastStars: number | null;
  lastReturnPct: number | null; // fraction
  lastGain: number | null; // dollars
}

export type Phase = 'dayIntro' | 'clientIntro' | 'builder' | 'transition' | 'gameOver';

export const STARTING_HAPPINESS = 75;

export function clampHappiness(n: number): number {
  return Math.max(0, Math.min(100, n));
}

// Build a fresh runtime client from a profile.
export function initRuntimeClient(profile: ClientProfile): RuntimeClient {
  return {
    ...profile,
    holdings: {},
    happiness: STARTING_HAPPINESS,
    finalized: false,
    fired: false,
    lastStars: null,
    lastReturnPct: null,
    lastGain: null,
  };
}
