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

export interface SimulationResult {
  startingCapital: number;
  invested: number;
  uninvested: number;
  /** Fraction of starting capital actually deployed (0..1). */
  deployedPct: number;
  finalValue: number;
  totalReturn: number;
  /** Final star count after the deployment bonus (0..3). */
  stars: number;
  /** Stars from returns alone, before the bonus. */
  baseStars: number;
  bonusApplied: boolean;
  label: string;
  byCategoryInvested: Record<Category, number>;
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
  const finalValue = finalInvested + uninvested;
  const totalReturn = finalValue - startingCapital;
  const deployedPct = startingCapital > 0 ? invested / startingCapital : 0;

  const baseStars = starsForReturn(totalReturn, startingCapital);
  // Reward fully deploying the capital with a one-tier bump — but the top tier
  // is earned on returns alone, so the bonus can lift a 1-star to 2 and never
  // reach 3 (a 3-star portfolio must clear the growth-tilted return threshold).
  const bonusApplied = deployedPct >= 0.9 && baseStars === 1;
  const stars = bonusApplied ? 2 : baseStars;

  return {
    startingCapital,
    invested,
    uninvested,
    deployedPct,
    finalValue,
    totalReturn,
    stars,
    baseStars,
    bonusApplied,
    label: labelForStars(stars),
    byCategoryInvested,
  };
}
