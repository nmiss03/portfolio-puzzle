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

// One labeled component of a week's happiness change ("Losses -4", "Request
// fulfilled +5"). Computed by scoring.weeklyHappinessBreakdown and surfaced in
// the UI so mood swings are learnable rather than mysterious.
export interface HappinessFactor {
  label: string;
  amount: number;
}

// What the money is FOR. Every client has a concrete dream with a portfolio
// target attached — the emotional stake behind the numbers. Reaching it (or
// destroying it) is what the player remembers.
export interface ClientDream {
  label: string; // short name, e.g. "The food truck"
  blurb: string; // one sentence in the client's own voice
  target: number; // portfolio value that funds the dream
}

// The history between a client and THIS advisor. It survives contract renewals,
// firings and returns — it's what lets a client say "remember that crash?"
// instead of greeting you like a stranger every eight weeks.
export interface ClientRelationship {
  contracts: number; // contracts completed together
  crashes: number; // black-swan weeks weathered while signed
  timesFired: number; // how often they've walked out on you
  cameBack: boolean; // returned after firing/dismissal at least once
  bestWeekPct: number; // best weekly return you ever gave them (fraction)
}

export function freshRelationship(): ClientRelationship {
  return { contracts: 0, crashes: 0, timesFired: 0, cameBack: false, bestWeekPct: 0 };
}

// How deep the relationship runs — drives which dialogue pool a client speaks
// from. 0 professional · 1 friendly · 2 trusting · 3 close (inside jokes).
export function relationshipStage(r: ClientRelationship | undefined): number {
  if (!r) return 0;
  return Math.min(3, r.contracts);
}

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
  // Advisor compensation — some clients pay a one-time signing fee, some a cut
  // of positive weekly returns, some a mix. Scales with tier.
  signingFee: number; // one-time, paid on signing (and on renewal)
  returnsFeePct: number; // advisor's share of a positive weekly return, 0..1
  // The human stake behind the account (see ClientDream).
  dream: ClientDream;
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
  // Week at which a fired/dismissed client will consider working with you again
  // (they return to the available pool, reputation gate permitting).
  returnsAtWeek?: number;
  // Why their mood moved last week — shown in ClientDetail / WeekTransition.
  lastHappinessFactors?: HappinessFactor[];
  // Set once the portfolio has ever reached the client's dream target.
  dreamReached?: boolean;
  dreamReachedWeek?: number; // when it happened — schedules the epilogue text
  epilogueSent?: boolean; // the one-time "here's what you made real" payoff
  // Shared history with the advisor (optional for pre-roster save compat).
  relationship?: ClientRelationship;
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
    relationship: freshRelationship(),
  };
}
