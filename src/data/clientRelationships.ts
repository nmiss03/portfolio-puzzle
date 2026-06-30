// Tier-aware allocation matching. Each client recommends a stock/bond split and
// tolerates deviation according to their tier: low tiers are forgiving (±20%),
// high tiers demand precision (±5%). Matching builds the relationship; missing
// the target by more than the tolerance damages it.

import { Holding, RuntimeClient } from './gameState';
import { PriceMap } from './priceUpdates';
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
