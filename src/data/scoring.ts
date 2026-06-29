// Weekly portfolio scoring + happiness impact.
//
// Each week a client's portfolio earns a small return based on its allocation
// (weekly = annual / 52). Matching the client's recommended mix adds a bonus;
// over-concentrating in one sector applies a penalty that can push the weekly
// return negative.

import STOCKS, { Category } from './stocks';
import { ClientProfile } from './gameState';

export type Holdings = Record<string, number>; // stockId -> shares

// Weekly average returns by category (~annual / 52).
export const WEEKLY_RETURN: Record<Category, number> = {
  growth: 0.0023, // ~12% / yr
  dividend: 0.0013, // ~7% / yr
  bond: 0.0008, // ~4% / yr
};

const PROFILE_BONUS_WEEKLY = 0.005; // +0.5%/wk when the mix fits the client
const UNBALANCED_PENALTY_WEEKLY = 0.003; // -0.3%/wk when >80% sits in one sector
const UNBALANCED_THRESHOLD = 0.8;
const PROFILE_TOLERANCE = 0.12; // stock% within ±12pts of recommended

const stocksById: Record<string, (typeof STOCKS)[number]> = STOCKS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, (typeof STOCKS)[number]>
);

export interface WeekResult {
  invested: number;
  byCategory: Record<Category, number>;
  stockPct: number;
  /** Effective weekly return rate applied to invested capital. */
  weeklyRate: number;
  /** Dollar return for the week (can be negative). */
  weekReturnDollar: number;
  profileMatch: boolean;
  diversified: boolean;
  unbalanced: boolean;
}

export function scoreWeek(holdings: Holdings, client: ClientProfile): WeekResult {
  const byCategory: Record<Category, number> = { growth: 0, dividend: 0, bond: 0 };
  let invested = 0;

  Object.entries(holdings).forEach(([id, shares]) => {
    const s = stocksById[id];
    if (!s || shares <= 0) return;
    const cost = shares * s.price;
    invested += cost;
    byCategory[s.category] += cost;
  });

  if (invested <= 0) {
    return {
      invested: 0,
      byCategory,
      stockPct: 0,
      weeklyRate: 0,
      weekReturnDollar: 0,
      profileMatch: false,
      diversified: false,
      unbalanced: false,
    };
  }

  const stockPct = (byCategory.growth + byCategory.dividend) / invested;
  const blended = (['growth', 'dividend', 'bond'] as Category[]).reduce(
    (sum, c) => sum + (byCategory[c] / invested) * WEEKLY_RETURN[c],
    0
  );

  const profileMatch = Math.abs(stockPct - client.idealStockPct) <= PROFILE_TOLERANCE;
  const diversified = byCategory.growth > 0 && byCategory.dividend > 0 && byCategory.bond > 0;
  const maxShare = Math.max(byCategory.growth, byCategory.dividend, byCategory.bond) / invested;
  const unbalanced = maxShare > UNBALANCED_THRESHOLD;

  let weeklyRate = blended;
  if (profileMatch) weeklyRate += PROFILE_BONUS_WEEKLY;
  if (unbalanced) weeklyRate -= UNBALANCED_PENALTY_WEEKLY;

  const weekReturnDollar = invested * weeklyRate;

  return { invested, byCategory, stockPct, weeklyRate, weekReturnDollar, profileMatch, diversified, unbalanced };
}

// Weekly happiness change given the realized return fraction and diversification.
export function happinessDeltaWeek(returnPct: number, diversified: boolean): number {
  let d = -3; // natural decay
  if (returnPct >= 0.01) d += 8;
  else if (returnPct >= 0) d += 4;
  else d -= 10;
  if (diversified) d += 3;
  return d;
}
