// Mark-to-market weekly scoring. A client's week return is the change in the
// market value of their holdings (driven by week-end news price moves) versus
// the cost basis they paid. Prices are the week's *starting* prices (carried
// over from the prior week); news multipliers are applied on top at week-end.

import { stocksById } from './stocks';
import { PriceMap } from './priceUpdates';
import { Holding, RuntimeClient, clampHappiness } from './gameState';

export type Holdings = Record<string, Holding>;

function priceOf(prices: PriceMap, id: string): number {
  return prices[id] ?? stocksById[id]?.price ?? 0;
}

export function marketValue(holdings: Holdings, multipliers: Record<string, number>, prices: PriceMap): number {
  return Object.entries(holdings).reduce((sum, [id, h]) => {
    if (!stocksById[id]) return sum;
    const price = priceOf(prices, id) * (1 + (multipliers[id] || 0));
    return sum + h.shares * price;
  }, 0);
}

export function costBasis(holdings: Holdings): number {
  return Object.values(holdings).reduce((sum, h) => sum + h.cost, 0);
}

// Share of invested value (at week-start prices) in stocks vs bonds, 0..1.
export function stockFraction(holdings: Holdings, prices: PriceMap): number {
  let stock = 0;
  let total = 0;
  Object.entries(holdings).forEach(([id, h]) => {
    const s = stocksById[id];
    if (!s) return;
    const v = h.shares * priceOf(prices, id);
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

export function computeWeek(client: RuntimeClient, multipliers: Record<string, number>, prices: PriceMap): WeekResult {
  const invested = costBasis(client.holdings);
  const mv = marketValue(client.holdings, multipliers, prices);
  return {
    invested,
    marketValue: mv,
    weekGain: mv - invested,
    diversified: sectorsHeld(client.holdings) >= 3,
  };
}

// Per-week happiness change. Base decay, a return-based adjustment whose
// sharply-negative branch is scaled by the client's tier, an allocation match
// bonus/penalty, and a tier-scaled concentration-risk penalty.
export function weeklyHappinessDelta(
  returnPct: number,
  allocationMatch: boolean,
  negativeReturnHappinessPenalty: number,
  concentrationPenalty = 0
): number {
  let d = -3; // base weekly decay
  if (returnPct >= 0.01) d += 8;
  else if (returnPct >= 0) d += 4;
  else if (returnPct >= -0.005) d -= 1;
  else if (returnPct >= -0.02) d -= 2;
  else d += negativeReturnHappinessPenalty; // tier-specific (-2 .. -5)
  d += allocationMatch ? 2 : -5;
  d += concentrationPenalty; // non-positive; over-concentration in one stock
  return d;
}

// New clamped happiness for a client after a week.
export function calculateWeeklyHappiness(
  currentHappiness: number,
  returnPct: number,
  allocationMatch: boolean,
  negativeReturnHappinessPenalty: number,
  concentrationPenalty = 0
): number {
  return clampHappiness(
    currentHappiness +
      weeklyHappinessDelta(returnPct, allocationMatch, negativeReturnHappinessPenalty, concentrationPenalty)
  );
}
