// The clients you advise, one per day.

import { ClientProfile } from './gameState';

const CLIENTS: ClientProfile[] = [
  {
    id: 'sarah',
    name: 'Sarah',
    age: 28,
    occupation: 'Software Engineer',
    character: { skin: '#D4A574', shirt: '#14b8a6', hair: '#3b2f2f' },
    summary:
      'A 28-year-old software engineer with a fresh promotion and student loans. ' +
      'Conservative by necessity — steady growth over a ~30-year horizon.',
    dialogue: [
      "Hi! I just got a promotion and I've got $60k to invest.",
      "I'm pretty conservative — I've got student loans, so I can't afford big losses.",
      'Maybe 30 years until retirement? I want steady growth.',
      'Help me put this money to work responsibly.',
    ],
    initialCapital: 60000,
    horizonYears: 30,
    idealStockPct: 0.6, // ~60% stocks / 40% bonds
    riskTolerance: 0.35, // modest high-growth exposure
  },
  {
    id: 'marcus',
    name: 'Marcus',
    age: 35,
    occupation: 'Small Business Owner',
    character: { skin: '#A1724E', shirt: '#f59e0b', hair: '#1f1f1f' },
    summary:
      'A 35-year-old small-business owner with $80k and unpredictable income. ' +
      'Low debt but needs flexibility — may pull funds in 5-10 years for expansion.',
    dialogue: [
      "Business has been good, and I've got $80k burning in my savings account.",
      "Honestly, I don't have much debt, but my income can be unpredictable — one bad quarter and things get tight.",
      'I need flexibility. Maybe I want to take some out in 5-10 years for expansion?',
      'So yeah, something balanced but with an exit strategy.',
    ],
    initialCapital: 80000,
    horizonYears: 8,
    idealStockPct: 0.55, // balanced, slight growth tilt
    riskTolerance: 0.5,
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
