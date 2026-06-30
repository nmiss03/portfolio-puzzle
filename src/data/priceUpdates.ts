// Real-time price logic: reading news articles moves stock prices for the week.

import { NewsArticle } from './newsArticles';
import { stocksById } from './stocks';

// Cumulative fractional price change per stock from the set of read articles.
export function computeMultipliers(
  weekNews: NewsArticle[],
  readIds: string[]
): Record<string, number> {
  const read = new Set(readIds);
  const mult: Record<string, number> = {};
  weekNews.forEach((a) => {
    if (!read.has(a.id)) return;
    Object.entries(a.priceImpact).forEach(([id, delta]) => {
      mult[id] = (mult[id] || 0) + delta;
    });
  });
  return mult;
}

// Current (news-adjusted) price for a stock given the week's multipliers.
export function currentPrice(stockId: string, multipliers: Record<string, number>): number {
  const base = stocksById[stockId]?.price ?? 0;
  return base * (1 + (multipliers[stockId] || 0));
}
