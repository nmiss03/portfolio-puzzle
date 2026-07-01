// Rare "black swan" market crashes (roughly once every 15-20 weeks). Modeled on
// real crises (2008 GFC, the pandemic crash, sovereign-debt panics): the broad
// market falls hard, and each stock's drop scales with its BETA — high-beta
// growth names get crushed while low-beta defensives fall far less. Government
// bonds actually RALLY on a flight to safety, just like real Treasuries.

import STOCKS from './stocks';
import { PriceMap } from './priceUpdates';

export interface BlackSwanEvent {
  name: string;
  blurb: string;
}

const EVENTS: BlackSwanEvent[] = [
  { name: 'Global Financial Crisis', blurb: 'Credit markets seized up. Risk assets sold off violently while government bonds rallied on a flight to safety.' },
  { name: 'Pandemic Shock', blurb: 'A fast-moving global crisis froze the economy overnight. High-beta names cratered; defensives and Treasuries held up best.' },
  { name: 'Sovereign Debt Panic', blurb: 'Contagion fears sparked a stampede out of equities and into safe government debt.' },
  { name: 'Liquidity Crunch', blurb: 'A sudden liquidity vacuum triggered a broad, indiscriminate sell-off across risk assets.' },
  { name: 'Geopolitical Shock', blurb: 'An unexpected conflict spiked volatility and hammered cyclical, high-beta stocks the hardest.' },
];

export function pickBlackSwan(): BlackSwanEvent {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

// Per-stock price impact for a crash week. A broad shock (the move a beta-1.0
// stock would take) is scaled by each stock's beta; bonds get a positive
// flight-to-safety move instead.
export function generateBlackSwanImpact(): PriceMap {
  const broadShock = -(0.1 + Math.random() * 0.12); // -10% .. -22% for beta 1.0
  const impact: PriceMap = {};
  STOCKS.forEach((s) => {
    if (s.assetClass === 'bond') {
      impact[s.id] = 0.02 + Math.random() * 0.03; // Treasuries rally +2% .. +5%
    } else {
      // Scales with beta; capped so even the highest-beta name can't fall > 50%.
      impact[s.id] = Math.max(-0.5, broadShock * s.beta);
    }
  });
  return impact;
}

// Weeks until the next crash (15-20).
export function rollBlackSwanGap(): number {
  return 15 + Math.floor(Math.random() * 6);
}
