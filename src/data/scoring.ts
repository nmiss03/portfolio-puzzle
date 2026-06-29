// Scoring engine — 40-year growth simulation + 3-star rating.
//
// The player buys whole shares of stocks with a fixed pot of starting capital.
// We project each holding forward 40 years using a historical-average annual
// return based on its category, compound it, and sum. Leftover (uninvested)
// cash does not grow, so deploying capital matters.
//
//   final_i   = cost_i * (1 + annualReturn[category_i]) ^ 40
//   finalValue = Σ final_i + uninvestedCash
//   totalReturn = finalValue - startingCapital
//
// Stars are awarded on totalReturn, with a one-tier bump if 90%+ of the
// capital was deployed.

import { Stock, Category } from './stocks';
import { Level } from './levels';

export type Holdings = Record<string, number>; // stockId -> shares owned

// Historical-average annual returns by category.
export const ANNUAL_RETURN: Record<Category, number> = {
  growth: 0.12,
  dividend: 0.07,
  bond: 0.04,
};

export const SIM_YEARS = 40;

// When the high-growth exposure exceeds the client's penalty threshold, an
// "unforeseen" downturn wipes out a slice of the gains. The further over the
// line, the worse the crash.
const RISK_PENALTY_BASE = 0.25; // gains lost right at the threshold
const RISK_PENALTY_SLOPE = 1.75; // extra loss per point of over-exposure
const RISK_PENALTY_MAX = 0.65; // never wipe more than this share of gains

// Star tiers, expressed as the total return measured in MULTIPLES of the
// starting capital (return / startingCapital). Over a 40-year horizon money
// compounds enormously, so absolute dollar thresholds are meaningless — these
// multiples are what separate an aggressive growth portfolio from a timid one:
//
//   fully-deployed all-bonds    ~3.8x   -> 0 stars (too conservative for a 25yo)
//   fully-deployed all-dividend ~14x    -> 1 star
//   moderate growth tilt        ~16-40x -> 2 stars
//   growth-heavy (the right call) ~40x+ -> 3 stars
export const STAR_RETURN_MULTIPLE = {
  three: 40,
  two: 16,
  one: 6,
};

export type RiskVerdict = 'conservative' | 'wellAllocated' | 'excessive';

export interface SimulationResult {
  startingCapital: number;
  invested: number;
  uninvested: number;
  /** Fraction of starting capital actually deployed (0..1). */
  deployedPct: number;
  /** Pre-penalty 40-year value (the "expected" growth). */
  expectedFinalValue: number;
  /** Final value after any risk penalty. */
  finalValue: number;
  totalReturn: number;
  /** Final star count after the deployment bonus (0..3). */
  stars: number;
  /** Stars from returns alone, before the excessive-risk cap. */
  baseStars: number;
  label: string;
  byCategoryInvested: Record<Category, number>;

  // ---- asset-mix risk grading ----
  /** Share of invested dollars in high-growth / high-volatility names (0..1). */
  highGrowthPct: number;
  riskVerdict: RiskVerdict;
  riskMessage: string;
  /** True if an over-risk downturn cut the gains. */
  penaltyApplied: boolean;
  /** Dollars lost to the downturn (0 if none). */
  penaltyAmount: number;
}

function starsForReturn(totalReturn: number, startingCapital: number): number {
  const multiple = startingCapital > 0 ? totalReturn / startingCapital : 0;
  if (multiple >= STAR_RETURN_MULTIPLE.three) return 3;
  if (multiple >= STAR_RETURN_MULTIPLE.two) return 2;
  if (multiple >= STAR_RETURN_MULTIPLE.one) return 1;
  return 0;
}

function labelForStars(stars: number): string {
  if (stars >= 3) return 'Excellent growth!';
  if (stars === 2) return 'Good growth';
  if (stars === 1) return 'Okay growth';
  return 'Needs improvement';
}

export function simulatePortfolio(holdings: Holdings, stocks: Stock[], level: Level): SimulationResult {
  const startingCapital = level.customer?.startingCapital ?? 50000;

  let invested = 0;
  let finalInvested = 0;
  const byCategoryInvested: Record<Category, number> = { growth: 0, dividend: 0, bond: 0 };

  stocks.forEach((s) => {
    const shares = holdings[s.id] || 0;
    const cost = shares * s.price;
    if (cost <= 0) return;
    invested += cost;
    byCategoryInvested[s.category] += cost;
    finalInvested += cost * Math.pow(1 + ANNUAL_RETURN[s.category], SIM_YEARS);
  });

  const uninvested = Math.max(0, startingCapital - invested);
  const expectedFinalValue = finalInvested + uninvested;
  const deployedPct = startingCapital > 0 ? invested / startingCapital : 0;

  // ---- Asset-mix risk grading -------------------------------------------
  // How concentrated is the portfolio in high-growth / high-volatility names?
  const highGrowthPct = invested > 0 ? byCategoryInvested.growth / invested : 0;
  const { sweetSpotMin, penaltyThreshold } = level.riskProfile;

  let riskVerdict: RiskVerdict;
  let riskMessage: string;
  let penaltyFraction = 0;

  if (highGrowthPct > penaltyThreshold) {
    riskVerdict = 'excessive';
    riskMessage = 'You took on too much risk — a market downturn wiped out a chunk of your gains.';
    const over = highGrowthPct - penaltyThreshold; // 0..(1 - threshold)
    penaltyFraction = Math.min(RISK_PENALTY_MAX, RISK_PENALTY_BASE + over * RISK_PENALTY_SLOPE);
  } else if (highGrowthPct >= sweetSpotMin) {
    riskVerdict = 'wellAllocated';
    riskMessage = 'You allocated risk very well — right in this client\'s sweet spot.';
  } else {
    riskVerdict = 'conservative';
    riskMessage = 'A bit conservative for this client — they could have taken on more growth.';
  }

  const expectedGains = expectedFinalValue - startingCapital;
  const penaltyAmount = Math.max(0, expectedGains) * penaltyFraction;
  const finalValue = expectedFinalValue - penaltyAmount;
  const totalReturn = finalValue - startingCapital;
  const penaltyApplied = penaltyAmount > 0;

  const baseStars = starsForReturn(totalReturn, startingCapital);
  let stars = baseStars;
  // Taking on excessive risk caps the score: the perfect rating is reserved
  // for portfolios that stayed inside the client's risk sweet spot.
  if (riskVerdict === 'excessive') stars = Math.min(stars, 2);

  return {
    startingCapital,
    invested,
    uninvested,
    deployedPct,
    expectedFinalValue,
    finalValue,
    totalReturn,
    stars,
    baseStars,
    label: labelForStars(stars),
    byCategoryInvested,
    highGrowthPct,
    riskVerdict,
    riskMessage,
    penaltyApplied,
    penaltyAmount,
  };
}
