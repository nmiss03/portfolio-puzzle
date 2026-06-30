// Weekly portfolio scoring + happiness impact, with weekly-news modifiers.

import STOCKS from './stocks';
import { ClientProfile } from './gameState';
import { NewsHeadline } from './newsHeadlines';

export type Holdings = Record<string, number>; // stockId -> shares
export type NewsAnswer = 'positive' | 'negative' | 'neutral' | 'skipped';

const PROFILE_BONUS_WEEKLY = 0.005;
const UNBALANCED_PENALTY_WEEKLY = 0.003;
const UNBALANCED_THRESHOLD = 0.8;
const PROFILE_TOLERANCE = 0.12;
const WEEKS_PER_YEAR = 52;

const stocksById: Record<string, (typeof STOCKS)[number]> = STOCKS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, (typeof STOCKS)[number]>
);

export interface WeekResult {
  invested: number;
  stockPct: number;
  sectorsHeld: number;
  weekReturnDollar: number; // total, incl. news
  newsContribution: number; // dollars from news modifiers
  profileMatch: boolean;
  diversified: boolean;
  unbalanced: boolean;
}

// Net news modifier (fraction of value) for a single stock this week.
function newsModifierFor(stockId: string, news: NewsHeadline[]): number {
  let mod = 0;
  news.forEach((n) => {
    if (n.affects.includes(stockId)) {
      mod += (n.impact === 'positive' ? 1 : -1) * (n.weight / 100);
    }
  });
  return mod;
}

export function scoreWeek(
  holdings: Holdings,
  client: ClientProfile,
  news: NewsHeadline[] = []
): WeekResult {
  const bySector: Record<string, number> = {};
  let invested = 0;
  let stockDollars = 0;
  let baseGain = 0;
  let newsContribution = 0;

  Object.entries(holdings).forEach(([id, shares]) => {
    const s = stocksById[id];
    if (!s || shares <= 0) return;
    const value = shares * s.price;
    invested += value;
    bySector[s.sector] = (bySector[s.sector] || 0) + value;
    if (s.assetClass === 'stock') stockDollars += value;
    baseGain += value * (s.annualReturn / WEEKS_PER_YEAR);
    newsContribution += value * newsModifierFor(id, news);
  });

  if (invested <= 0) {
    return {
      invested: 0, stockPct: 0, sectorsHeld: 0, weekReturnDollar: 0, newsContribution: 0,
      profileMatch: false, diversified: false, unbalanced: false,
    };
  }

  const stockPct = stockDollars / invested;
  const sectorsHeld = Object.keys(bySector).length;
  const maxSectorShare = Math.max(...Object.values(bySector)) / invested;
  const profileMatch = Math.abs(stockPct - client.idealStockPct) <= PROFILE_TOLERANCE;
  const diversified = sectorsHeld >= 3;
  const unbalanced = maxSectorShare > UNBALANCED_THRESHOLD;

  let overallAdj = 0;
  if (profileMatch) overallAdj += PROFILE_BONUS_WEEKLY;
  if (unbalanced) overallAdj -= UNBALANCED_PENALTY_WEEKLY;

  const weekReturnDollar = baseGain + invested * overallAdj + newsContribution;

  return { invested, stockPct, sectorsHeld, weekReturnDollar, newsContribution, profileMatch, diversified, unbalanced };
}

// Fraction of shown headlines the player predicted correctly (neutral/skipped
// count as incorrect since every headline has a definite impact).
export function newsAccuracy(news: NewsHeadline[], answers: Record<string, NewsAnswer>): number {
  if (news.length === 0) return 1;
  const correct = news.filter((n) => answers[n.id] === n.impact).length;
  return correct / news.length;
}

export function happinessDeltaWeek(returnPct: number, diversified: boolean, accuracy?: number): number {
  let d = -3;
  if (returnPct >= 0.01) d += 8;
  else if (returnPct >= 0) d += 4;
  else d -= 10;
  if (diversified) d += 3;
  if (accuracy != null) {
    if (accuracy > 0.8) d += 3; // rewarded for reading the news well
    else if (accuracy < 0.4) d -= 5;
  }
  return d;
}
