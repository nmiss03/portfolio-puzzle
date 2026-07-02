// The advisor's own economy: fee income from clients (signing fees and a cut
// of positive weekly returns), a running balance, and the shop upgrades that
// balance can buy. Also home to Politician Bill's insider-tip machinery.

import STOCKS from './stocks';
import { ClientProfile } from './gameState';
import { NewsArticle } from './newsArticles';
import { ClientMessage } from './clientMessages';
import { formatMoney } from '../utils/format';

// ---------- Fees ----------

export interface AdvisorTransaction {
  week: number;
  label: string;
  amount: number; // + income, - spending
}

// Human-readable fee structure for a client card / contract modal.
export function feeLabel(client: Pick<ClientProfile, 'signingFee' | 'returnsFeePct'>): string {
  const parts: string[] = [];
  if (client.signingFee > 0) parts.push(`${formatMoney(client.signingFee)} signing`);
  if (client.returnsFeePct > 0) parts.push(`${Math.round(client.returnsFeePct * 100)}% of weekly gains`);
  return parts.length > 0 ? parts.join(' + ') : 'pro bono';
}

// ---------- Shop ----------

export type UpgradeId = 'assistant' | 'newsTerminal' | 'politicalFunding';

export interface Upgrades {
  assistant: boolean;
  newsTerminal: boolean;
  politicalFunding: boolean;
}

export const NO_UPGRADES: Upgrades = { assistant: false, newsTerminal: false, politicalFunding: false };

export interface ShopItem {
  id: UpgradeId;
  name: string;
  icon: string;
  cost: number;
  blurb: string;
  detail: string;
}

export const SHOP_ITEMS: ShopItem[] = [
  {
    id: 'assistant',
    name: 'HIRE ASSISTANT',
    icon: '🧑‍💼',
    cost: 800,
    blurb: 'Take on a 4th client.',
    detail: 'A junior assistant handles the paperwork so you can manage one extra client. Costs 1% of your clients\' positive weekly gains as salary.',
  },
  {
    id: 'newsTerminal',
    name: 'NEWS TERMINAL',
    icon: '🖥',
    cost: 1500,
    blurb: 'See next week\'s news early + exclusive scoops.',
    detail: 'A professional-grade feed: preview next week\'s headlines before anyone else, and receive exclusive tiered scoops ordinary readers never see.',
  },
  {
    id: 'politicalFunding',
    name: 'POLITICAL FUNDING',
    icon: '🏛',
    cost: 6000,
    blurb: 'A friend in high places starts texting you.',
    detail: 'A generous contribution to Politician Bill\'s campaign. Bill occasionally shares... privileged information about stocks before it becomes public. Opens the door to political clientele.',
  },
];

export const shopItemById: Record<UpgradeId, ShopItem> = SHOP_ITEMS.reduce(
  (acc, i) => {
    acc[i.id] = i;
    return acc;
  },
  {} as Record<UpgradeId, ShopItem>
);

// Assistant salary: share of the sum of clients' positive weekly gains.
export const ASSISTANT_WEEKLY_CUT = 0.01;

export const BASE_MAX_CLIENTS = 3;

export function maxClientsFor(upgrades: Upgrades): number {
  return BASE_MAX_CLIENTS + (upgrades.assistant ? 1 : 0);
}

// ---------- Politician Bill (insider tips) ----------

export const BILL_ID = 'politician-bill';
const INSIDER_CHANCE = 0.3; // per week while funded
const INSIDER_MIN = 0.2; // insider moves beat exclusive news
const INSIDER_MAX = 0.3;

function billMessage(week: number, text: string): ClientMessage {
  return {
    id: `bill-w${week}-${Math.floor(Math.random() * 100000)}`,
    clientId: BILL_ID,
    clientName: 'Politician Bill',
    messageType: 'insider_tip',
    stockId: '',
    stockName: '',
    messageText: text,
    weekIssued: week,
    deadline: week,
    baselineShares: 0,
    read: false,
    resolved: true, // tips are informational — never graded
    fulfilled: true,
  };
}

export function billWelcomeMessage(week: number): ClientMessage {
  return billMessage(
    week,
    "Appreciate the support, friend. Campaigns aren't cheap. Keep your phone close — I hear things around the Hill, and I remember my friends."
  );
}

export interface InsiderTip {
  message: ClientMessage;
  article: NewsArticle; // hidden article injected into the week's news
}

// Maybe produce an insider tip for the (new) week: a big scheduled move on one
// stock, plus Bill's heads-up text. Applies at this week's end, so the player
// has the whole week to act on it.
export function maybeInsiderTip(week: number): InsiderTip | null {
  if (Math.random() > INSIDER_CHANCE) return null;
  // Committee gossip moves companies, not Treasury funds — bonds are exempt.
  const pool = STOCKS.filter((s) => s.assetClass !== 'bond');
  const stock = pool[Math.floor(Math.random() * pool.length)];
  const up = Math.random() < 0.6;
  const mag = INSIDER_MIN + Math.random() * (INSIDER_MAX - INSIDER_MIN);
  const impact = up ? mag : -mag;

  const flavor = up
    ? `Committee's about to hand ${stock.name} a very good week. Vote lands Friday. You didn't hear it from me.`
    : `Word is the hammer drops on ${stock.name} this week — subpoenas, the whole circus. I'd be light on it. This conversation never happened.`;

  const message = billMessage(week, flavor);
  message.stockId = stock.id;
  message.stockName = stock.name;

  const article: NewsArticle = {
    id: `insider-${stock.id}-w${week}`,
    headline: up ? `${stock.name} Set to Benefit From Committee Decision` : `${stock.name} Faces Sudden Regulatory Firestorm`,
    category: 'Specific Stock',
    affects: [stock.id],
    secondaryAffects: [],
    impactType: 'regulatory',
    priceImpact: { [stock.id]: Math.round(impact * 10000) / 10000 },
    publicationDate: `Week ${week}`,
    articleText: 'Details scarce. Those in the know were positioned early.',
    source: 'WSJ',
    insider: true,
  };

  return { message, article };
}
