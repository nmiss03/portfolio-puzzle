// Tier-aware allocation matching. Each client recommends a stock/bond split and
// tolerates deviation according to their tier: low tiers are forgiving (±20%),
// high tiers demand precision (±5%). Matching builds the relationship; missing
// the target by more than the tolerance damages it.

import { Holding, RuntimeClient } from './gameState';
import { PriceMap } from './priceUpdates';
import { stocksById } from './stocks';
import { tierOf } from './clientTiers';
import { stockFraction } from './scoring';

export interface AllocationEvaluation {
  invested: boolean; // did the client hold anything this week?
  match: boolean; // actual allocation within tolerance of target
  actualStockPct: number; // 0..1
  targetStockPct: number; // 0..1
  tolerance: number; // ± fraction
  repDelta: number; // reputation change from the relationship
  happinessMatched: boolean; // feeds the happiness allocation bonus/penalty
}

// Compare a client's actual stock/bond split against their recommended target,
// using their tier's tolerance band.
export function evaluateAllocationMatch(
  client: RuntimeClient,
  holdings: Record<string, Holding>,
  prices: PriceMap
): AllocationEvaluation {
  const targetStockPct = client.recommendedAllocation.stocks;
  const tolerance = client.allocationTolerance;
  const invested = Object.values(holdings).some((h) => h.shares > 0);
  const actualStockPct = stockFraction(holdings, prices);

  // Uninvested portfolios neither match nor mismatch — no relationship swing.
  if (!invested) {
    return { invested: false, match: false, actualStockPct: 0, targetStockPct, tolerance, repDelta: 0, happinessMatched: false };
  }

  const within = Math.abs(actualStockPct - targetStockPct) <= tolerance + 1e-9;
  return {
    invested: true,
    match: within,
    actualStockPct,
    targetStockPct,
    tolerance,
    repDelta: within ? 1 : -3,
    happinessMatched: within,
  };
}

export type ConcentrationLevel = 'safe' | 'moderate' | 'high' | 'extreme';

export interface ConcentrationEvaluation {
  level: ConcentrationLevel;
  largestStockWeight: number; // 0..1, share of the whole portfolio in one stock
  largestStockId: string | null;
  happinessPenalty: number; // non-positive, scaled by the client's tier
}

function concentrationLevel(weight: number): ConcentrationLevel {
  if (weight > 0.75) return 'extreme';
  if (weight > 0.5) return 'high';
  if (weight > 0.35) return 'moderate';
  return 'safe';
}

// Check whether too much of the client's capital sits in a single stock. Weight
// is measured against the whole portfolio (stocks + bonds); bonds themselves are
// never counted as a concentration risk. Penalty severity scales by tier.
export function evaluateConcentrationRisk(
  holdings: Record<string, Holding>,
  client: RuntimeClient,
  prices: PriceMap
): ConcentrationEvaluation {
  let total = 0;
  let largestStockValue = 0;
  let largestStockId: string | null = null;

  Object.entries(holdings).forEach(([id, h]) => {
    const s = stocksById[id];
    if (!s || h.shares <= 0) return;
    const value = h.shares * (prices[id] ?? s.price ?? 0);
    total += value;
    // Only individual stocks can be a concentration risk — bonds are exempt.
    if (s.assetClass === 'stock' && value > largestStockValue) {
      largestStockValue = value;
      largestStockId = id;
    }
  });

  if (total <= 0) {
    return { level: 'safe', largestStockWeight: 0, largestStockId: null, happinessPenalty: 0 };
  }

  const largestStockWeight = largestStockValue / total;
  const level = concentrationLevel(largestStockWeight);
  const table = tierOf(client.tier).concentrationPenalty;
  const happinessPenalty = level === 'safe' ? 0 : table[level];

  return { level, largestStockWeight, largestStockId, happinessPenalty };
}
