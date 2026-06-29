// Customer profiles + target ("ideal") allocations per level.
//
// `ideal` is expressed at the CATEGORY level (growth / dividend / bond) and
// always sums to 100. The scoring engine compares the player's category mix to
// this target — it doesn't care which specific growth stock you pick, only the
// overall shape of the portfolio.
//
// Level 1 is fully playable. Levels 2 & 3 are stubbed as `locked` so the level
// picker shows the full roadmap of 3 levels.

import STOCKS, { Category } from './stocks';

export type Difficulty = 'Easy' | 'Medium' | 'Hard';
export type RiskTolerance = 'Low' | 'Moderate' | 'High';

export interface CustomerProfile {
  name: string;
  age: number;
  occupation: string;
  salary: number;
  dependents: number;
  riskTolerance: RiskTolerance;
  horizonYears: number;
  /** Cash the client has to invest, in dollars. */
  startingCapital: number;
  goal: string;
  summary: string;
  targetSummary: string;
  notes: string[];
}

// Defines how much high-growth / high-volatility exposure is appropriate for
// this client. Exposure = share of invested dollars in the "growth" category.
//   below sweetSpotMin            -> too conservative for the client
//   sweetSpotMin..penaltyThreshold -> risk allocated well (expected returns)
//   above penaltyThreshold        -> too much risk: a downturn haircuts gains
export interface RiskProfile {
  sweetSpotMin: number;
  penaltyThreshold: number;
}

export interface Level {
  id: number;
  name: string;
  difficulty: Difficulty;
  locked: boolean;
  tagline: string;
  customer: CustomerProfile | null;
  ideal: Record<Category, number>;
  riskProfile: RiskProfile;
  stockIds: string[];
}

const allStockIds = STOCKS.map((s) => s.id);

const LEVELS: Level[] = [
  {
    id: 1,
    name: 'The Young Saver',
    difficulty: 'Easy',
    locked: false,
    tagline: 'A 25-year-old who can afford to swing for the fences.',
    customer: {
      name: 'Alex Rivera',
      age: 25,
      occupation: 'Software Engineer',
      salary: 60000,
      dependents: 0,
      riskTolerance: 'High',
      horizonYears: 40,
      startingCapital: 50000,
      goal: 'Aggressive long-term growth for retirement',
      summary:
        "Alex is 25, earns $60k, has no dependents and won't touch this money " +
        'for 40 years. With a long runway and a strong stomach for risk, the ' +
        'plan is to lean heavily into growth and keep just a small cushion of bonds.',
      targetSummary: '~80% stocks (growth-tilted) · ~20% bonds',
      notes: [
        'Decades until retirement — short-term swings barely matter.',
        'No dependents and a steady salary, so a market dip is survivable.',
        'High risk tolerance: favor high-growth names over safe income.',
        'Still keep ~20% in bonds so the portfolio is not 100% stocks.',
      ],
    },
    // Growth-tilted aggressive mix. Stocks = 80 (growth 60 + dividend 20), bonds = 20.
    ideal: { growth: 60, dividend: 20, bond: 20 },
    // Aggressive young client: ~70-80% high-growth is the sweet spot; going
    // above 80% courts a damaging downturn.
    riskProfile: { sweetSpotMin: 0.7, penaltyThreshold: 0.8 },
    stockIds: allStockIds,
  },

  // ---- Roadmap (not yet implemented) ----------------------------------
  {
    id: 2,
    name: 'Mid-Career Balance',
    difficulty: 'Medium',
    locked: true,
    tagline: 'A 45-year-old balancing growth with growing responsibilities.',
    customer: null,
    ideal: { growth: 40, dividend: 30, bond: 30 },
    riskProfile: { sweetSpotMin: 0.35, penaltyThreshold: 0.55 },
    stockIds: allStockIds,
  },
  {
    id: 3,
    name: 'Nearing Retirement',
    difficulty: 'Hard',
    locked: true,
    tagline: 'A 62-year-old who needs to protect what they have built.',
    customer: null,
    ideal: { growth: 20, dividend: 35, bond: 45 },
    riskProfile: { sweetSpotMin: 0.1, penaltyThreshold: 0.3 },
    stockIds: allStockIds,
  },
];

export const levelsById: Record<number, Level> = LEVELS.reduce(
  (acc, l) => {
    acc[l.id] = l;
    return acc;
  },
  {} as Record<number, Level>
);

export function getLevel(id: number): Level | undefined {
  return levelsById[id];
}

export default LEVELS;
