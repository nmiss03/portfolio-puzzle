// Per-client portfolio scoring, returns, and happiness impact.
//
// A client's portfolio earns a single-period (annualized) return based on its
// allocation. Matching the client's profile adds a bonus; over-concentrating
// (and especially taking more high-growth risk than the client can stomach)
// triggers a drawdown that can push the return negative — which is how a client
// can lose money, score 0 stars, and grow unhappy.

import STOCKS, { Category } from './stocks';
import { ClientProfile } from './gameState';

export type Holdings = Record<string, number>; // stockId -> shares

export const ANNUAL_RETURN: Record<Category, number> = {
  growth: 0.12,
  dividend: 0.07,
  bond: 0.04,
};

const PROFILE_BONUS = 0.1; // +10% to gains when allocation fits the client
const UNBALANCED_PENALTY = 0.15; // -15% to gains when >80% sits in one category
const UNBALANCED_THRESHOLD = 0.8;
const PROFILE_TOLERANCE = 0.12; // stock% within ±12pts of ideal counts as a match
const DRAWDOWN_FACTOR = 0.6; // how hard excess high-growth risk bites

const stocksById: Record<string, (typeof STOCKS)[number]> = STOCKS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, (typeof STOCKS)[number]>
);

export interface DayResult {
  invested: number;
  byCategory: Record<Category, number>; // dollars
  stockPct: number; // stocks / invested
  highGrowthPct: number; // growth / invested
  blendedReturn: number; // weighted annual return before modifiers
  gain: number; // dollars (can be negative)
  returnPct: number; // gain / initialCapital (fraction, can be negative)
  stars: number; // 0..3
  profileMatch: boolean;
  diversified: boolean; // all three categories present
  unbalanced: boolean; // >80% in one category
  drawdownApplied: boolean;
}

export function scorePortfolio(holdings: Holdings, client: ClientProfile): DayResult {
  const byCategory: Record<Category, number> = { growth: 0, dividend: 0, bond: 0 };
  let invested = 0;

  Object.entries(holdings).forEach(([id, shares]) => {
    const s = stocksById[id];
    if (!s || shares <= 0) return;
    const cost = shares * s.price;
    invested += cost;
    byCategory[s.category] += cost;
  });

  const empty = invested <= 0;
  const stockDollars = byCategory.growth + byCategory.dividend;
  const stockPct = empty ? 0 : stockDollars / invested;
  const highGrowthPct = empty ? 0 : byCategory.growth / invested;

  const blendedReturn = empty
    ? 0
    : (['growth', 'dividend', 'bond'] as Category[]).reduce(
        (sum, c) => sum + (byCategory[c] / invested) * ANNUAL_RETURN[c],
        0
      );

  const profileMatch = !empty && Math.abs(stockPct - client.idealStockPct) <= PROFILE_TOLERANCE;
  const diversified = byCategory.growth > 0 && byCategory.dividend > 0 && byCategory.bond > 0;
  const maxShare = empty ? 0 : Math.max(byCategory.growth, byCategory.dividend, byCategory.bond) / invested;
  const unbalanced = !empty && maxShare > UNBALANCED_THRESHOLD;

  // Multiplier on gains for fit / concentration.
  let mult = 1;
  if (profileMatch) mult += PROFILE_BONUS;
  if (unbalanced) mult -= UNBALANCED_PENALTY;

  // Risk drawdown: high-growth exposure above the client's tolerance hurts,
  // scaling with how far over the line — enough to turn returns negative.
  const excessRisk = Math.max(0, highGrowthPct - client.riskTolerance);
  const drawdown = excessRisk * DRAWDOWN_FACTOR; // fraction of invested
  const drawdownApplied = drawdown > 0;

  const gain = invested * blendedReturn * mult - invested * drawdown;
  const returnPct = client.initialCapital > 0 ? gain / client.initialCapital : 0;

  const stars = returnPct >= 0.1 ? 3 : returnPct >= 0.05 ? 2 : returnPct >= 0 ? 1 : 0;

  return {
    invested,
    byCategory,
    stockPct,
    highGrowthPct,
    blendedReturn,
    gain,
    returnPct,
    stars,
    profileMatch,
    diversified,
    unbalanced,
    drawdownApplied,
  };
}

// How much a finalized day moves the happiness meter.
export function happinessDelta(result: DayResult): number {
  let d = -5; // natural decay
  if (result.stars >= 2) d += 10;
  else if (result.stars === 1) d += 5;
  else d -= 15; // 0 stars / negative returns
  if (result.diversified) d += 5;
  if (result.unbalanced) d -= 10;
  return d;
}
