// Rare "black swan" market crashes (roughly once every 15-20 weeks). Modeled on
// real crises (2008 GFC, the pandemic crash, sovereign-debt panics): the broad
// market falls hard, and each stock's drop scales with its BETA — high-beta
// growth names get crushed while low-beta defensives fall far less. Government
// bonds usually RALLY on a flight to safety, just like real Treasuries.
//
// Each swan also has a SECTOR FINGERPRINT: extra shocks layered on top of the
// beta move (a pandemic spares healthcare and guts real estate; a cyberattack
// is a security vendor's best quarter). Same mechanics, different scars — so
// "which crash did you survive" becomes part of a career's story.

import STOCKS from './stocks';
import { PriceMap } from './priceUpdates';

export interface BlackSwanEvent {
  name: string;
  blurb: string;
  // Extra fractional move per SECTOR, added after beta scaling
  // (e.g. { Energy: 0.12 } lifts every energy name 12 points).
  sectorShift?: Record<string, number>;
  // Extra fractional move for specific stocks (overrides nothing, adds).
  stockShift?: Record<string, number>;
  // Treasuries rally by default; debt/rate crises break that refuge.
  bondsRally?: boolean;
}

const EVENTS: BlackSwanEvent[] = [
  {
    name: 'Global Financial Crisis',
    blurb: 'Credit markets seized up and a storied bank did not open on Monday. Risk assets sold off violently while government bonds rallied on a flight to safety.',
    sectorShift: { Finance: -0.08 },
  },
  {
    name: 'Pandemic Shock',
    blurb: 'A fast-moving global outbreak froze the economy overnight. Offices, malls and travel emptied; drugmakers and Treasuries were the only bids.',
    sectorShift: { Healthcare: 0.09, 'Real Estate': -0.07, Consumer: -0.04 },
  },
  {
    name: 'Sovereign Debt Panic',
    blurb: 'A major government missed a payment and the "risk-free" asset stopped being either. Even Treasuries wobbled — there was nowhere comfortable to hide.',
    sectorShift: { Finance: -0.06 },
    bondsRally: false,
  },
  {
    name: 'Liquidity Crunch',
    blurb: 'A sudden liquidity vacuum triggered a broad, indiscriminate sell-off. Funds sold what they could, not what they wanted to — quality fell with the junk.',
  },
  {
    name: 'Major Conflict Erupts',
    blurb: 'War broke out between major powers. Energy and defense spiked on the news while everything priced for peace repriced for something else.',
    sectorShift: { Energy: 0.1 },
    stockShift: { as: 0.22, csd: 0.12 },
  },
  {
    name: 'Coordinated Cyberattack',
    blurb: 'A coordinated attack took payment rails and exchanges offline for days. Every CISO got a blank check; every bank got a subpoena.',
    sectorShift: { Finance: -0.07, Technology: -0.04 },
    // csd carries a 2.0 beta, so the windfall has to outweigh a double-
    // strength crash: net effect is a rally in a typical cyber swan, a small
    // dip in the very worst one.
    stockShift: { csd: 0.42 },
  },
  {
    name: 'Oil Embargo',
    blurb: 'A producer bloc cut exports to the West overnight. Crude went vertical, and every business that moves things or people watched margins evaporate.',
    sectorShift: { Energy: 0.16, Consumer: -0.06 },
  },
  {
    name: 'Housing Collapse',
    blurb: 'The property bubble found its pin. Landlords, lenders and everyone who believed prices only go up learned the old lesson at the usual price.',
    sectorShift: { 'Real Estate': -0.12, Finance: -0.06 },
  },
  {
    name: 'AI Bubble Bursts',
    blurb: 'The market abruptly asked the trillion-dollar question: where is the revenue? Tech valuations halved their adjectives; the picks-and-shovels fell with the gold.',
    sectorShift: { Technology: -0.1 },
  },
  {
    name: 'Rate Shock',
    blurb: 'The central bank hiked twice as hard as anyone priced, mid-cycle, off-schedule. Bonds, property and long-duration promises all broke at once.',
    sectorShift: { 'Real Estate': -0.08, Utilities: -0.05 },
    bondsRally: false,
  },
  {
    name: 'Currency Crisis',
    blurb: 'A major currency went into free fall, dragging trade flows with it. Hard assets caught the panic bid; financial paper caught the panic sell.',
    sectorShift: { Commodities: 0.09, Energy: 0.05, Finance: -0.06 },
  },
  {
    name: 'Landmark Fraud Scandal',
    blurb: 'A blue-chip darling turned out to be a spreadsheet with a logo. Auditors, lenders and index funds all owned it; trust itself traded down.',
    sectorShift: { Finance: -0.09 },
  },
  {
    name: 'Supply Chain Collapse',
    blurb: 'Ports jammed, ships queued, shelves thinned. The just-in-time economy discovered what "just in case" would have cost — and paid triple.',
    sectorShift: { Consumer: -0.08, Technology: -0.05, Commodities: 0.07 },
  },
  {
    name: 'Commodity Shock',
    blurb: 'Crop failures and mine outages collided in the same quarter. Raw-material prices exploded, squeezing every producer between scarcity and demand.',
    sectorShift: { Commodities: 0.14, Consumer: -0.07 },
  },
];

export function pickBlackSwan(): BlackSwanEvent {
  return EVENTS[Math.floor(Math.random() * EVENTS.length)];
}

// Per-stock price impact for a crash week. A broad shock (the move a beta-1.0
// stock would take) is scaled by each stock's beta, then the event's sector
// fingerprint is layered on. Bonds rally on a flight to safety — unless this
// is the kind of crisis that breaks the refuge itself.
export function generateBlackSwanImpact(event?: BlackSwanEvent): PriceMap {
  const broadShock = -(0.1 + Math.random() * 0.12); // -10% .. -22% for beta 1.0
  const bondsRally = event?.bondsRally !== false;
  const impact: PriceMap = {};
  STOCKS.forEach((s) => {
    if (s.assetClass === 'bond') {
      impact[s.id] = bondsRally
        ? 0.02 + Math.random() * 0.03 // Treasuries rally +2% .. +5%
        : -(0.02 + Math.random() * 0.04); // the refuge fails: -2% .. -6%
      return;
    }
    const fingerprint = (event?.sectorShift?.[s.sector] ?? 0) + (event?.stockShift?.[s.id] ?? 0);
    // Beta-scaled crash + event fingerprint, capped to a survivable band.
    impact[s.id] = Math.max(-0.5, Math.min(0.35, broadShock * s.beta + fingerprint));
  });
  return impact;
}

// Weeks until the next crash (15-20).
export function rollBlackSwanGap(): number {
  return 15 + Math.floor(Math.random() * 6);
}
