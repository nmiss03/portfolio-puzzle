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

// Apply accumulated impacts to the week's starting prices → week-end prices.
// These become the next week's starting prices (carry-over).
export function applyWeekEndPrices(weekStartPrices: PriceMap, priceImpact: PriceMap): PriceMap {
  const end: PriceMap = {};
  Object.entries(weekStartPrices).forEach(([id, price]) => {
    const mult = priceImpact[id] || 0;
    end[id] = price * (1 + mult);
  });
  return end;
}

// Next week's starting prices are simply this week's ending prices.
export function carryOverPrices(weekEndPrices: PriceMap): PriceMap {
  return { ...weekEndPrices };
}
