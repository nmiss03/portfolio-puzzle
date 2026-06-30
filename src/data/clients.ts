// The clients you advise, unlocked one per week.

import { ClientProfile } from './gameState';

const CLIENTS: ClientProfile[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    age: 28,
    occupation: 'Software Engineer',
    characterColor: '#D4A574',
    background:
      'Recently promoted with solid income. Has student loans but stable job. Seeks steady growth without major risk.',
    riskPreference: 'conservative',
    recommendedAllocation: '60% stocks, 40% bonds',
    idealStockPct: 0.6,
    initialCapital: 60000,
    unlockedWeek: 1,
    dialogue: [
      "Hi! I just got a promotion and I've got $60k to invest.",
      "I'm pretty conservative — I've got student loans, so I can't afford big losses.",
      'Maybe 30 years until retirement? I want steady growth.',
      'Help me put this money to work responsibly.',
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus',
    age: 35,
    occupation: 'Small Business Owner',
    characterColor: '#8B6F47',
    background:
      'Successful but variable income. No debt, but needs flexibility for business expansion. Comfortable with balanced approach.',
    riskPreference: 'moderate-aggressive',
    recommendedAllocation: '70% stocks, 30% bonds/liquid',
    idealStockPct: 0.7,
    initialCapital: 80000,
    unlockedWeek: 2,
    dialogue: [
      "Business has been good, and I've got $80k burning in my savings account.",
      "Honestly, I don't have much debt, but my income can be unpredictable — one bad quarter and things get tight.",
      'I need flexibility. Maybe I want to take some out in 5-10 years for expansion?',
      'So yeah, something balanced but with an exit strategy.',
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
