// The clients you advise, unlocked by reputation across four tiers. Higher
// tiers bring more capital but expect tighter allocation and react harder to
// losses. Tier metrics (tolerance, penalties) are defined in clientTiers.ts.

import { ClientProfile } from './gameState';

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
    dialogue: [
      'Hey! I just graduated and landed a solid entry-level job.',
      'I managed to save up about $10k, and I want to actually make it grow.',
      "I don't really know much about investing yet, but I'm willing to learn.",
      "Help me out—just make sure my money doesn't sit in a savings account earning nothing.",
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
    dialogue: [
      "I'm a freelancer, so income can be unpredictable—but I've had great years.",
      "I've saved up about $35k that I want to put to work.",
      "I'm not super technical, but I understand risk and reward basics.",
      'I just need solid returns on this capital. Can you help?',
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
    dialogue: [
      "I'm a senior engineer at a major tech company with solid income.",
      "I've got $65k I want to invest strategically.",
      "I care about diversification and proper allocation—I've read about portfolio theory.",
      'Show me you understand how to build a balanced portfolio, not just chase returns.',
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
    allocationTolerance: 0.05,
    negativeReturnHappinessPenalty: -5,
    initialCapital: 120000,
    unlockedAtReputation: 40,
    dialogue: [
      "I've built multiple successful businesses over 20 years.",
      "I've got $120k to deploy, and I have very specific expectations.",
      "I understand markets deeply—I've managed portfolios myself.",
      "I'm hiring you to execute a precise strategy. Can you deliver?",
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
