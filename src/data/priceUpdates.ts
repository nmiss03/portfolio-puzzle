// News resolves at week-end: the cumulative price impact of ALL of the week's
// published articles is applied to stock prices. The impact is hidden from the
// player during the week — they must judge it from the headlines themselves.

import { NewsArticle } from './newsArticles';

export function resolvedMultipliers(weekNews: NewsArticle[]): Record<string, number> {
  const mult: Record<string, number> = {};
  weekNews.forEach((a) => {
    Object.entries(a.priceImpact).forEach(([id, delta]) => {
      mult[id] = (mult[id] || 0) + delta;
    });
  });
  return mult;
}
