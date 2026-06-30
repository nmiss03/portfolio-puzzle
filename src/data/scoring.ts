// Mark-to-market weekly scoring. A client's week return is the change in the
// market value of their holdings (driven by news price moves) versus the cost
// basis they paid.

import { stocksById } from './stocks';
import { Holding, RuntimeClient } from './gameState';

export type Holdings = Record<string, Holding>;

export function marketValue(holdings: Holdings, multipliers: Record<string, number>): number {
  return Object.entries(holdings).reduce((sum, [id, h]) => {
    const s = stocksById[id];
    if (!s) return sum;
    const price = s.price * (1 + (multipliers[id] || 0));
    return sum + h.shares * price;
  }, 0);
}

export function costBasis(holdings: Holdings): number {
  return Object.values(holdings).reduce((sum, h) => sum + h.cost, 0);
}

// Share of invested value (at base prices) in stocks vs bonds, 0..1.
export function stockFraction(holdings: Holdings): number {
  let stock = 0;
  let total = 0;
  Object.entries(holdings).forEach(([id, h]) => {
    const s = stocksById[id];
    if (!s) return;
    const v = h.shares * s.price;
    total += v;
    if (s.assetClass === 'stock') stock += v;
  });
  return total > 0 ? stock / total : 0;
}

export function sectorsHeld(holdings: Holdings): number {
  const sectors = new Set<string>();
  Object.keys(holdings).forEach((id) => {
    const s = stocksById[id];
    if (s && (holdings[id]?.shares || 0) > 0) sectors.add(s.sector);
  });
  return sectors.size;
}

export interface WeekResult {
  invested: number; // cost basis
  marketValue: number; // current value of holdings
  weekGain: number; // marketValue - invested
  diversified: boolean;
}

export function computeWeek(client: RuntimeClient, multipliers: Record<string, number>): WeekResult {
  const invested = costBasis(client.holdings);
  const mv = marketValue(client.holdings, multipliers);
  return {
    invested,
    marketValue: mv,
    weekGain: mv - invested,
    diversified: sectorsHeld(client.holdings) >= 3,
  };
}

export function happinessDeltaWeek(returnPct: number, diversified: boolean): number {
  let d = -3;
  if (returnPct >= 0.01) d += 8;
  else if (returnPct >= 0) d += 4;
  else d -= 10;
  if (diversified) d += 3;
  return d;
}
