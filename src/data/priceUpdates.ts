// Stock prices persist week-to-week. Each week starts at the previous week's
// ending prices; the cumulative impact of ALL of that week's news articles is
// applied only at week-end to produce the next week's starting prices. Impacts
// are hidden from the player during the week — they judge them from headlines.

import STOCKS from './stocks';
import { NewsArticle } from './newsArticles';

export type PriceMap = Record<string, number>;

export interface StockPricePoint {
  week: number;
  startPrice: number;
  endPrice: number;
}

// Base prices authored in stocks.ts — the Week 1 starting point.
export const basePrices: PriceMap = STOCKS.reduce((acc, s) => {
  acc[s.id] = s.price;
  return acc;
}, {} as PriceMap);

// Starting prices for a week: base prices in Week 1, otherwise the prices
// carried over from the previous week's end.
export function initializeWeekPrices(previousWeekEndPrices: PriceMap | null, currentWeek: number): PriceMap {
  if (currentWeek <= 1 || !previousWeekEndPrices || Object.keys(previousWeekEndPrices).length === 0) {
    return { ...basePrices };
  }
  // Spread base first so any stock missing from the carry-over still has a price.
  return { ...basePrices, ...previousWeekEndPrices };
}

// Accumulate the fractional price impact of every article published this week.
// (Articles passed in are already filtered to the current week.)
export function calculateWeeklyPriceImpact(weekNews: NewsArticle[]): PriceMap {
  const impact: PriceMap = {};
  weekNews.forEach((a) => {
    Object.entries(a.priceImpact).forEach(([id, delta]) => {
      impact[id] = (impact[id] || 0) + delta;
    });
  });
  return impact;
}

// No matter how many negative shocks stack up in one week (crash + insider +
// several bad headlines), a stock can never lose more than this — which also
// guarantees prices stay positive.
const MAX_WEEKLY_DROP = -0.85;

// Apply accumulated impacts to the week's starting prices → week-end prices.
// These become the next week's starting prices (carry-over).
export function applyWeekEndPrices(weekStartPrices: PriceMap, priceImpact: PriceMap): PriceMap {
  const end: PriceMap = {};
  Object.entries(weekStartPrices).forEach(([id, price]) => {
    const mult = Math.max(MAX_WEEKLY_DROP, priceImpact[id] || 0);
    end[id] = price * (1 + mult);
  });
  return end;
}

// Natural weekly market drift — every stock moves a little every week, news or
// not, so non-news weeks still feel alive. Small moves are common; large ones
// are rare. Magnitude is drawn from a weighted distribution; direction is a
// 50/50 coin flip. Drift alone never exceeds ±3%.
const DRIFT_DISTRIBUTION: { probability: number; magnitude: number }[] = [
  { probability: 0.5, magnitude: 0.005 }, // ±0.50%
  { probability: 0.25, magnitude: 0.01 }, // ±1.00%
  { probability: 0.15, magnitude: 0.015 }, // ±1.50%
  { probability: 0.07, magnitude: 0.02 }, // ±2.00%
  { probability: 0.02, magnitude: 0.025 }, // ±2.50%
  { probability: 0.01, magnitude: 0.03 }, // ±3.00%
];

const DRIFT_CAP = 0.03;

function pickDriftMagnitude(): number {
  const r = Math.random();
  let cumulative = 0;
  for (const row of DRIFT_DISTRIBUTION) {
    cumulative += row.probability;
    if (r < cumulative) return row.magnitude;
  }
  return DRIFT_DISTRIBUTION[0].magnitude; // numerical-edge fallback
}

function pickStockDrift(): number {
  const magnitude = pickDriftMagnitude();
  const direction = Math.random() < 0.5 ? -1 : 1;
  return Math.max(-DRIFT_CAP, Math.min(DRIFT_CAP, direction * magnitude));
}

// Generate independent natural drift for every stock for the week.
export function generateWeeklyMarketDrift(stockIds: string[]): PriceMap {
  const drift: PriceMap = {};
  stockIds.forEach((id) => {
    drift[id] = pickStockDrift();
  });
  return drift;
}

// Combine natural drift with news impact: total move = drift + news. Includes
// every stock present in either map so all stocks move every week.
export function combineWeeklyImpact(drift: PriceMap, news: PriceMap): PriceMap {
  const total: PriceMap = { ...drift };
  Object.entries(news).forEach(([id, delta]) => {
    total[id] = (total[id] || 0) + delta;
  });
  return total;
}

// Next week's starting prices are simply this week's ending prices.
export function carryOverPrices(weekEndPrices: PriceMap): PriceMap {
  return { ...weekEndPrices };
}
