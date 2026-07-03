// The clients you advise, unlocked by reputation across four tiers. Higher
// tiers bring more capital but expect tighter allocation and react harder to
// losses. Tier metrics (tolerance, penalties) are defined in clientTiers.ts.

import { ClientProfile } from './gameState';

// Every client has a DREAM — a concrete thing the money is for, with a
// portfolio target attached. Dialogue states it; report cards and goodbyes
// reference it. This is the emotional spine of each client.

const CLIENTS: ClientProfile[] = [
  {
    id: 'alex',
    name: 'Alex',
    age: 24,
    occupation: 'Recent College Graduate',
    characterColor: '#D4A574',
    background:
      'Just landed first full-time job and saved up $10k. Looking to grow wealth but still learning about investing. Open to whatever makes sense for their situation.',
    tier: 1,
    recommendedAllocation: { stocks: 0.7, bonds: 0.3 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -2,
    initialCapital: 10000,
    unlockedAtReputation: 20,
    signingFee: 250, // small mix: modest signing + modest cut
    returnsFeePct: 0.1,
    dream: {
      label: 'Fried & True',
      blurb: 'Every dollar of this becomes my food truck. Best grilled cheese you will ever have.',
      target: 16000,
    },
    dialogue: [
      "Hey!! I'm Alex. First real job, first real paycheck, first real advisor — that's you!",
      "Okay, so: $10k. Every dollar I've ever saved. No pressure haha. (Some pressure.)",
      "Here's the plan. This money becomes Fried & True — my food truck. Best grilled cheese you'll ever have.",
      'Get me to $16k and you get free sandwiches for life. Deal? Deal.',
    ],
  },
  {
    id: 'jamie',
    name: 'Jamie',
    age: 29,
    occupation: 'Freelance Designer',
    characterColor: '#8B6F47',
    background:
      "Been freelancing for 5 years with variable but solid income. Has $35k in savings from good years. Wants steady growth but isn't deeply sophisticated about markets yet.",
    tier: 2,
    recommendedAllocation: { stocks: 0.65, bonds: 0.35 },
    allocationTolerance: 0.2,
    negativeReturnHappinessPenalty: -3,
    initialCapital: 35000,
    unlockedAtReputation: 27,
    signingFee: 0, // percentage-only client
    returnsFeePct: 0.18,
    dream: {
      label: 'The studio',
      blurb: 'One year of runway — quit client work, start my own design studio, make things I actually like.',
      target: 50000,
    },
    dialogue: [
      "hey. jamie. freelance designer — logos, mostly. some years are great. some years are ramen.",
      "i've scraped together $35k and i'm honestly a little terrified to touch it.",
      "the dream is a year of runway: quit client work, start my own studio, make things i actually like.",
      "$50k is the number. get me there and i'll design your firm a logo that doesn't look like clip art.",
    ],
  },
  {
    id: 'sarah',
    name: 'Sarah',
    age: 32,
    occupation: 'Senior Software Engineer',
    characterColor: '#C98B5E',
    background:
      'Mid-career tech professional with stable, high income. Has $65k to invest and clear financial goals. Understands markets reasonably well and cares about portfolio construction, not just returns.',
    tier: 3,
    recommendedAllocation: { stocks: 0.6, bonds: 0.4 },
    allocationTolerance: 0.1,
    negativeReturnHappinessPenalty: -4,
    initialCapital: 65000,
    unlockedAtReputation: 34,
    signingFee: 2000, // fee-heavy client: large upfront, small cut
    returnsFeePct: 0.05,
    dream: {
      label: 'The sabbatical',
      blurb: 'A full year off with my daughter while she still thinks I am cool. $90k makes it real.',
      target: 90000,
    },
    dialogue: [
      "Sarah. Senior engineer. I've read three books on portfolio theory, so I'll notice if you're improvising.",
      "$65,000. I want process, not luck — diversified, risk-adjusted, defensible.",
      "The goal is a sabbatical fund. $90k means a full year with my daughter while she still thinks I'm cool.",
      "She turns nine in the fall. The clock is real. Quarterly-grade decisions, please.",
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus',
    age: 42,
    occupation: 'Business Owner & Investor',
    characterColor: '#8B6F47',
    background:
      'Established entrepreneur with $120k+ to invest. Highly sophisticated about markets, portfolio construction, and risk management. Demands expert-level strategy and precise asset allocation. No patience for guessing.',
    tier: 4,
    recommendedAllocation: { stocks: 0.55, bonds: 0.45 },
    allocationTolerance: 0.07,
    negativeReturnHappinessPenalty: -5,
    initialCapital: 120000,
    unlockedAtReputation: 40,
    signingFee: 4000, // executive mix: big signing fee AND a big cut
    returnsFeePct: 0.15,
    dream: {
      label: 'Burying Whitmore',
      blurb: 'My brother-in-law brags about his fund manager at every family dinner. That ends at $170k.',
      target: 170000,
    },
    dialogue: [
      "Marcus. You have four minutes. I've built three companies — I know what competence looks like.",
      "$120,000. A rounding error for me. A test for you.",
      "My brother-in-law Whitmore brags about his fund manager at every single family dinner. That ends.",
      "Get me past $170k and outperform that smug golf shirt. Do that, and we'll talk real money.",
    ],
  },
];

export const clientsById: Record<string, ClientProfile> = CLIENTS.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<string, ClientProfile>
);

export default CLIENTS;
