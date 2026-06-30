// Client tiers: as your reputation grows you unlock higher-value clients who
// bring more capital but expect tighter allocation and react harder to losses.
// Each tier's metrics drive allocation strictness and happiness penalties.

export type ExpectationLevel = 'casual' | 'moderate' | 'sophisticated' | 'demanding';

export interface ClientTier {
  tier: number;
  label: string; // short human label, e.g. "Entry-level"
  unlockedAtReputation: number;
  minInitialCapital: number;
  allocationTolerance: number; // ± fraction from the target allocation that is acceptable
  negativeReturnHappinessPenalty: number; // happiness hit when a weekly return is sharply negative (< -2%)
  requiresStrictDiversification: boolean;
  expectationLevel: ExpectationLevel;
}

export const CLIENT_TIERS: Record<number, ClientTier> = {
  1: {
    tier: 1,
    label: 'Entry-level',
    unlockedAtReputation: 20,
    minInitialCapital: 10000,
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -2,
    requiresStrictDiversification: false,
    expectationLevel: 'casual',
  },
  2: {
    tier: 2,
    label: 'Early-career',
    unlockedAtReputation: 27,
    minInitialCapital: 35000,
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -3,
    requiresStrictDiversification: false,
    expectationLevel: 'moderate',
  },
  3: {
    tier: 3,
    label: 'Mid-career',
    unlockedAtReputation: 34,
    minInitialCapital: 65000,
    allocationTolerance: 0.1,
    negativeReturnHappinessPenalty: -4,
    requiresStrictDiversification: true,
    expectationLevel: 'sophisticated',
  },
  4: {
    tier: 4,
    label: 'Executive',
    unlockedAtReputation: 40,
    minInitialCapital: 120000,
    allocationTolerance: 0.05,
    negativeReturnHappinessPenalty: -5,
    requiresStrictDiversification: true,
    expectationLevel: 'demanding',
  },
};

export function tierOf(tier: number): ClientTier {
  return CLIENT_TIERS[tier] ?? CLIENT_TIERS[1];
}

const EXPECTATION_BLURB: Record<ExpectationLevel, string> = {
  casual: 'Just wants their money to grow.',
  moderate: 'Wants solid, steady returns.',
  sophisticated: 'Cares about proper portfolio construction, not just returns.',
  demanding: 'Highly aware of strategy — expects expert-level precision.',
};

export function expectationBlurb(level: ExpectationLevel): string {
  return EXPECTATION_BLURB[level];
}
