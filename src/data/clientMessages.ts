// Client text messages: occasionally a client pings you asking to buy a new
// stock or add to an existing position. Acting on it by week-end earns a
// relationship bonus; ignoring it costs a small penalty.

import STOCKS, { stocksById } from './stocks';
import { RuntimeClient } from './gameState';

export type MessageType = 'new_stock_request' | 'increase_position_request' | 'insider_tip';

export interface ClientMessage {
  id: string;
  clientId: string;
  clientName: string;
  messageType: MessageType;
  stockId: string;
  stockName: string;
  messageText: string;
  weekIssued: number;
  deadline: number; // must act by end of this week
  baselineShares: number; // shares held of stockId at issue time
  read: boolean;
  resolved: boolean;
  fulfilled: boolean;
}

const NEW_STOCK_TEMPLATES = [
  'Hey! I have a friend who just told me about [S]. They work there and say great things about it. Think we could buy some shares?',
  'I was reading about [S] and their new product launch looks promising. Could we get some exposure?',
  'My cousin works in [SECTOR] and says [S] is the real deal. Want to give it a shot?',
];

const INCREASE_TEMPLATES = [
  "I've been thinking about [S]... could we increase our position? I'm pretty confident about it.",
  '[S] has been solid for us. Want to double down?',
  'My financial advisor mentioned [S]. Since we already own it, could we add more?',
];

function fill(template: string, stockName: string, sector: string): string {
  return template.replace(/\[S\]/g, stockName).replace(/\[SECTOR\]/g, sector);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Relationship (happiness) effects.
export const MESSAGE_FULFILLED_BONUS = 5;
export const MESSAGE_IGNORED_PENALTY = -3;

// ~20% chance per active client per week (roughly once every 5 weeks).
const MESSAGE_CHANCE = 0.2;

export function generateClientMessages(currentWeek: number, activeClients: RuntimeClient[]): ClientMessage[] {
  const messages: ClientMessage[] = [];
  activeClients.forEach((client) => {
    if (Math.random() > MESSAGE_CHANCE) return;

    const owned = STOCKS.filter((s) => (client.holdings[s.id]?.shares || 0) > 0);
    const notOwned = STOCKS.filter((s) => (client.holdings[s.id]?.shares || 0) <= 0);

    // 60% new stock, 40% increase (only if they own something). If the pool is
    // somehow empty (e.g. client owns every stock), skip rather than generate
    // an unfulfillable request.
    const wantIncrease = Math.random() < 0.4 && owned.length > 0;
    const pool = wantIncrease ? owned : notOwned;
    if (pool.length === 0) return;
    const stock = pick(pool);

    const messageType: MessageType = wantIncrease ? 'increase_position_request' : 'new_stock_request';
    const template = wantIncrease ? pick(INCREASE_TEMPLATES) : pick(NEW_STOCK_TEMPLATES);

    messages.push({
      id: `${client.id}-w${currentWeek}-${stock.id}-${Math.floor(Math.random() * 100000)}`,
      clientId: client.id,
      clientName: client.name,
      messageType,
      stockId: stock.id,
      stockName: stock.name,
      messageText: fill(template, stock.name, stock.sector),
      weekIssued: currentWeek,
      deadline: currentWeek,
      baselineShares: client.holdings[stock.id]?.shares || 0,
      read: false,
      resolved: false,
      fulfilled: false,
    });
  });
  return messages;
}

// Was the request satisfied given the client's current shares of the stock?
export function isMessageFulfilled(message: ClientMessage, currentShares: number): boolean {
  if (message.messageType === 'new_stock_request') {
    return message.baselineShares <= 0 && currentShares > 0;
  }
  // increase_position_request
  return currentShares > message.baselineShares;
}

export function stockNameOf(stockId: string): string {
  return stocksById[stockId]?.name ?? stockId;
}
