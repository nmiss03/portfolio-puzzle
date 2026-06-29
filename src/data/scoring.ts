// Weekly portfolio scoring + happiness impact.
//
// Each week a portfolio earns a small return: each holding contributes its
// annualReturn / 52, weighted by dollar value. Matching the client's
// recommended stock/bond split adds a bonus; over-concentrating in one sector
// applies a penalty that can push the weekly return negative.

import STOCKS, { Sector } from './stocks';
import { ClientProfile } from './gameState';

export type Holdings = Record<string, number>; // stockId -> shares

const PROFILE_BONUS_WEEKLY = 0.005; // +0.5%/wk when the mix fits the client
const UNBALANCED_PENALTY_WEEKLY = 0.003; // -0.3%/wk when >80% in one sector
const UNBALANCED_THRESHOLD = 0.8;
const PROFILE_TOLERANCE = 0.12; // stock% within ±12pts of recommended
const WEEKS_PER_YEAR = 52;

const stocksById: Record<string, (typeof STOCKS)[number]> = STOCKS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, (typeof STOCKS)[number]>
);

export interface WeekResult {
  invested: number;
  stockPct: number; // non-bond value / invested
  sectorsHeld: number;
  weeklyRate: number; // effective weekly return rate on invested
  weekReturnDollar: number; // can be negative
  profileMatch: boolean;
  diversified: boolean; // 3+ sectors held
  unbalanced: boolean; // >80% in one sector
}

export function scoreWeek(holdings: Holdings, client: ClientProfile): WeekResult {
  const bySector: Partial<Record<Sector, number>> = {};
  let invested = 0;
  let stockDollars = 0;
  let blended = 0;

  Object.entries(holdings).forEach(([id, shares]) => {
    const s = stocksById[id];
    if (!s || shares <= 0) return;
    const cost = shares * s.price;
    invested += cost;
    bySector[s.sector] = (bySector[s.sector] || 0) + cost;
    if (s.assetClass === 'stock') stockDollars += cost;
    blended += cost * (s.annualReturn / WEEKS_PER_YEAR);
  });

  if (invested <= 0) {
    return {
      invested: 0,
      stockPct: 0,
      sectorsHeld: 0,
      weeklyRate: 0,
      weekReturnDollar: 0,
      profileMatch: false,
      diversified: false,
      unbalanced: false,
    };
  }

  blended /= invested; // weighted average weekly rate
  const stockPct = stockDollars / invested;
  const sectorsHeld = Object.keys(bySector).length;
  const maxSectorShare = Math.max(...Object.values(bySector)) / invested;

  const profileMatch = Math.abs(stockPct - client.idealStockPct) <= PROFILE_TOLERANCE;
  const diversified = sectorsHeld >= 3;
  const unbalanced = maxSectorShare > UNBALANCED_THRESHOLD;

  let weeklyRate = blended;
  if (profileMatch) weeklyRate += PROFILE_BONUS_WEEKLY;
  if (unbalanced) weeklyRate -= UNBALANCED_PENALTY_WEEKLY;

  return {
    invested,
    stockPct,
    sectorsHeld,
    weeklyRate,
    weekReturnDollar: invested * weeklyRate,
    profileMatch,
    diversified,
    unbalanced,
  };
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
