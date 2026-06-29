// The clients you advise, unlocked one per week.

import { ClientProfile } from './gameState';

const CLIENTS: ClientProfile[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    age: 28,
    occupation: 'Software Engineer',
    character: { skin: '#D4A574', shirt: '#14b8a6', hair: '#3b2f2f' },
    background:
      'Recently promoted with solid income. Has student loans but a stable job. Seeks steady, responsible growth.',
    riskPreference: 'Conservative',
    dialogue: [
      "Hi! I just got a promotion and I've got $60k to invest.",
      "I'm pretty conservative — I've got student loans, so I can't afford big losses.",
      'Maybe 30 years until retirement? I want steady growth.',
      'Help me put this money to work responsibly.',
    ],
    idealStockPct: 0.6, // 60% stocks / 40% bonds
    initialCapital: 60000,
    unlockedWeek: 1,
  },
  {
    id: 'marcus',
    name: 'Marcus',
    age: 35,
    occupation: 'Small Business Owner',
    character: { skin: '#A1724E', shirt: '#f59e0b', hair: '#1f1f1f' },
    background:
      'Successful but variable income. No debt, but needs flexibility for business opportunities. Wants balanced exposure with liquidity.',
    riskPreference: 'Moderate-to-Aggressive',
    dialogue: [
      "Business has been good, and I've got $80k burning in my savings account.",
      "Honestly, I don't have much debt, but my income can be unpredictable — one bad quarter and things get tight.",
      'I need flexibility. Maybe I want to take some out in 5-10 years for expansion?',
      'So yeah, something balanced but with an exit strategy.',
    ],
    idealStockPct: 0.7, // 70% stocks / 30% bonds
    initialCapital: 80000,
    unlockedWeek: 2,
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
