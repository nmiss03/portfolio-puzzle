// Global game state: a reputation-driven advisory career with 8-week client
// contracts (max 3 active), reputation milestones, and a game-over at rep 0.

import React, { createContext, useContext, useMemo, useReducer } from 'react';

import CLIENTS from '../data/clients';
import STOCKS, { stocksById } from '../data/stocks';
import { ClientProfile, Phase, RuntimeClient, initRuntimeClient } from '../data/gameState';
import { marketValue, calculateWeeklyHappiness } from '../data/scoring';
import { NewsArticle, generateWeeklyNews } from '../data/newsArticles';
import {
  PriceMap,
  StockPricePoint,
  applyWeekEndPrices,
  calculateWeeklyPriceImpact,
  carryOverPrices,
  combineWeeklyImpact,
  generateWeeklyMarketDrift,
  initializeWeekPrices,
} from '../data/priceUpdates';
import { ConcentrationLevel, evaluateAllocationMatch, evaluateConcentrationRisk } from '../data/clientRelationships';
import {
  ActiveSnapshot,
  MilestoneMap,
  RepChange,
  STARTING_REPUTATION,
  calculateWeeklyReputation,
} from '../data/reputationSystem';
import { activeCount, canSignMore, signContract, tickContract } from '../data/contractSystem';

export interface PerClientWeekResult {
  clientId: string;
  name: string;
  characterColor: string;
  returnDollar: number;
  returnPct: number;
  newsContribution: number;
  prevHappiness: number;
  newHappiness: number;
  allTimeDollar: number;
  allTimePct: number;
  fired: boolean;
  concentrationLevel: ConcentrationLevel;
  concentrationPenalty: number; // non-positive happiness hit applied this week
  largestStockPct: number; // 0..1
}

export interface PriceMove {
  stockId: string;
  ticker: string;
  name: string;
  startPrice: number;
  endPrice: number;
  driftPct: number; // natural market drift component
  newsPct: number; // news impact component
  pct: number; // total fractional change start → end (drift + news)
}

export interface TransitionInfo {
  week: number;
  results: PerClientWeekResult[];
  repChanges: RepChange[];
  repBefore: number;
  repAfter: number;
  firedNames: string[];
  newlyUnlocked: string[];
  priceMoves: PriceMove[];
}

interface State {
  started: boolean;
  phase: Phase;
  currentWeek: number;
  clients: Record<string, RuntimeClient>;
  reputation: number;
  milestones: MilestoneMap;
  focusClientId: string | null;
  introClientId: string | null;
  bookOpen: boolean;
  newsOpen: boolean;
  detailClientId: string | null;
  transition: TransitionInfo | null;
  weekNews: NewsArticle[];
  // Stock prices persist week-to-week. weekStartPrices are what the player
  // trades at all week; weekEndPrices are computed at week-end and carried
  // over to become next week's start prices.
  weekStartPrices: PriceMap;
  weekEndPrices: PriceMap;
  stockPriceHistory: Record<string, StockPricePoint[]>;
}

type Action =
  | { type: 'START_GAME' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'BUY'; clientId: string; stockId: string; shares: number }
  | { type: 'SELL'; clientId: string; stockId: string; shares: number }
  | { type: 'SIGN_CLIENT'; clientId: string }
  | { type: 'RENEW_CLIENT'; clientId: string }
  | { type: 'DISMISS_EXPIRED'; clientId: string }
  | { type: 'TRANSITION_WEEK' }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'TOGGLE_BOOK'; open?: boolean }
  | { type: 'TOGGLE_NEWS'; open?: boolean }
  | { type: 'OPEN_DETAIL'; clientId: string }
  | { type: 'CLOSE_DETAIL' };

function buildInitial(): State {
  const clients: Record<string, RuntimeClient> = {};
  CLIENTS.forEach((c: ClientProfile) => (clients[c.id] = initRuntimeClient(c)));
  return {
    started: false,
    phase: 'weekIntro',
    currentWeek: 1,
    clients,
    reputation: STARTING_REPUTATION,
    milestones: {},
    focusClientId: null,
    introClientId: null,
    bookOpen: false,
    newsOpen: false,
    detailClientId: null,
    transition: null,
    weekNews: [],
    weekStartPrices: initializeWeekPrices(null, 1),
    weekEndPrices: {},
    stockPriceHistory: {},
  };
}

function firstActiveId(clients: Record<string, RuntimeClient>): string | null {
  const a = Object.values(clients).find((c) => c.status === 'signed');
  return a ? a.id : null;
}

function reducer(state: State, action: Action): State {
  // Trades use the current week's starting prices (carried over week-to-week).
  const priceOf = (id: string) => state.weekStartPrices[id] ?? stocksById[id]?.price ?? 0;

  switch (action.type) {
    case 'START_GAME': {
      const fresh = buildInitial();
      return { ...fresh, started: true, weekNews: generateWeeklyNews(1) };
    }
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'BUY': {
      const client = state.clients[action.clientId];
      if (!client || action.shares <= 0) return state;
      const stock = stocksById[action.stockId];
      if (!stock) return state;
      const cost = action.shares * priceOf(action.stockId);
      if (cost > client.cash + 1e-6) return state;
      const prev = client.holdings[action.stockId];
      const holdings = {
        ...client.holdings,
        [action.stockId]: { shares: (prev?.shares || 0) + action.shares, cost: (prev?.cost || 0) + cost },
      };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings, cash: client.cash - cost } } };
    }

    case 'SELL': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      const h = client.holdings[action.stockId];
      if (!h || h.shares <= 0) return state;
      const n = Math.min(action.shares > 0 ? action.shares : h.shares, h.shares);
      const refund = n * priceOf(action.stockId);
      const avgCost = h.cost / h.shares;
      const holdings = { ...client.holdings };
      if (n >= h.shares) delete holdings[action.stockId];
      else holdings[action.stockId] = { shares: h.shares - n, cost: h.cost - n * avgCost };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings, cash: client.cash + refund } } };
    }

    case 'SIGN_CLIENT': {
      const client = state.clients[action.clientId];
      if (!client || client.status === 'signed' || !canSignMore(state.clients)) return state;
      const signed = signContract(client, state.currentWeek);
      return {
        ...state,
        clients: { ...state.clients, [client.id]: signed },
        focusClientId: client.id,
        introClientId: client.id,
        bookOpen: false,
        phase: 'clientIntro',
      };
    }

    case 'RENEW_CLIENT': {
      const client = state.clients[action.clientId];
      if (!client || client.status !== 'expired' || !canSignMore(state.clients)) return state;
      return {
        ...state,
        clients: { ...state.clients, [client.id]: signContract(client, state.currentWeek) },
        focusClientId: client.id,
      };
    }

    case 'DISMISS_EXPIRED': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, status: 'dismissed' } } };
    }

    case 'TRANSITION_WEEK': {
      // Week-end resolution: every stock gets natural market drift, then this
      // week's accumulated news impact is added on top. The combined move is
      // applied to the week's starting prices to get the ending prices.
      const newsImpact = calculateWeeklyPriceImpact(state.weekNews);
      const marketDrift = generateWeeklyMarketDrift(STOCKS.map((s) => s.id));
      const finalMult = combineWeeklyImpact(marketDrift, newsImpact);
      const weekStartPrices = state.weekStartPrices;
      const weekEndPrices = applyWeekEndPrices(weekStartPrices, finalMult);
      const updated = { ...state.clients };
      const results: PerClientWeekResult[] = [];
      const firedNames: string[] = [];
      const snapshots: ActiveSnapshot[] = [];

      Object.values(state.clients)
        .filter((c) => c.status === 'signed')
        .forEach((client) => {
          // Persistent brokerage account: holdings and cash carry over. The
          // week's P/L is the mark-to-market change in portfolio value as
          // prices move from week-start to week-end — nothing is liquidated.
          const mvStart = marketValue(client.holdings, {}, weekStartPrices);
          const mvEnd = marketValue(client.holdings, finalMult, weekStartPrices);
          const startValue = client.cash + mvStart; // portfolio value entering week-end
          const endValue = client.cash + mvEnd; // portfolio value after price moves
          const returnDollar = endValue - startValue; // == mvEnd - mvStart
          const returnPct = startValue > 0 ? returnDollar / startValue : 0;

          // Relationship: does the allocation match the client's tier target?
          const alloc = evaluateAllocationMatch(client, client.holdings, weekStartPrices);
          // Concentration: too much capital in a single stock hurts trust,
          // scaled by tier (higher tiers demand diversification).
          const conc = evaluateConcentrationRisk(client.holdings, client, weekStartPrices);

          const prevHappiness = client.happiness;
          const newHappiness = calculateWeeklyHappiness(
            prevHappiness,
            returnPct,
            alloc.happinessMatched,
            client.negativeReturnHappinessPenalty,
            conc.happinessPenalty
          );
          const fired = newHappiness <= 0;
          const allTimeDollar = endValue - client.initialCapital;
          const allTimePct = client.initialCapital > 0 ? allTimeDollar / client.initialCapital : 0;

          updated[client.id] = {
            ...client,
            status: fired ? 'fired' : client.status,
            // Holdings and cash PERSIST across the week — only valuation changes.
            holdings: client.holdings,
            cash: client.cash,
            portfolioValue: endValue,
            happiness: newHappiness,
            lastWeekReturnDollar: returnDollar,
            lastWeekReturnPct: returnPct,
            allTimeReturnDollar: allTimeDollar,
            allTimeReturnPct: allTimePct,
            performanceHistory: [
              ...client.performanceHistory,
              { week: state.currentWeek, returnDollar, returnPct, happiness: newHappiness },
            ],
          };

          results.push({
            clientId: client.id, name: client.name, characterColor: client.characterColor,
            returnDollar, returnPct, newsContribution: returnDollar, prevHappiness, newHappiness,
            allTimeDollar, allTimePct, fired,
            concentrationLevel: conc.level, concentrationPenalty: conc.happinessPenalty,
            largestStockPct: conc.largestStockWeight,
          });

          if (fired) firedNames.push(client.name);
          else snapshots.push({
            clientId: client.id, name: client.name, happiness: newHappiness, returnPct,
            invested: alloc.invested, allocationMatch: alloc.match,
          });
        });

      const rep = calculateWeeklyReputation(state.reputation, state.milestones, snapshots, firedNames);

      // Clients that just crossed their reputation unlock threshold.
      const newlyUnlocked = Object.values(state.clients)
        .filter((c) => c.status === 'unsigned' && c.unlockedAtReputation > state.reputation && c.unlockedAtReputation <= rep.newReputation)
        .map((c) => c.name);

      // Price movements (start → end) for every stock — all move each week —
      // with the drift/news breakdown so the player sees why prices moved.
      const priceMoves: PriceMove[] = STOCKS.map((s) => {
        const startPrice = weekStartPrices[s.id] ?? s.price;
        const endPrice = weekEndPrices[s.id] ?? startPrice;
        return {
          stockId: s.id, ticker: s.ticker, name: s.name, startPrice, endPrice,
          driftPct: marketDrift[s.id] || 0,
          newsPct: newsImpact[s.id] || 0,
          pct: startPrice > 0 ? (endPrice - startPrice) / startPrice : 0,
        };
      }).sort((a, b) => Math.abs(b.pct) - Math.abs(a.pct));

      // Record this week's start/end for every stock.
      const stockPriceHistory: Record<string, StockPricePoint[]> = {};
      STOCKS.forEach((s) => {
        const startPrice = weekStartPrices[s.id] ?? s.price;
        const endPrice = weekEndPrices[s.id] ?? startPrice;
        stockPriceHistory[s.id] = [
          ...(state.stockPriceHistory[s.id] || []),
          { week: state.currentWeek, startPrice, endPrice },
        ];
      });

      return {
        ...state,
        clients: updated,
        reputation: rep.newReputation,
        milestones: rep.milestones,
        phase: 'transition',
        weekEndPrices,
        stockPriceHistory,
        transition: {
          week: state.currentWeek,
          results,
          repChanges: rep.changes,
          repBefore: state.reputation,
          repAfter: rep.newReputation,
          firedNames,
          newlyUnlocked,
          priceMoves,
        },
      };
    }

    case 'ADVANCE_WEEK': {
      if (state.reputation <= 0) return { ...state, phase: 'gameOver', transition: null };
      const nextWeek = state.currentWeek + 1;
      const ticked: Record<string, RuntimeClient> = {};
      Object.values(state.clients).forEach((c) => (ticked[c.id] = tickContract(c)));
      // Carry this week's ending prices over to become next week's start prices.
      const nextStartPrices = initializeWeekPrices(carryOverPrices(state.weekEndPrices), nextWeek);
      return {
        ...state,
        currentWeek: nextWeek,
        clients: ticked,
        focusClientId: firstActiveId(ticked),
        phase: 'weekIntro',
        transition: null,
        weekNews: generateWeeklyNews(nextWeek),
        weekStartPrices: nextStartPrices,
        weekEndPrices: {},
      };
    }

    case 'TOGGLE_BOOK':
      return { ...state, bookOpen: action.open ?? !state.bookOpen, newsOpen: false, detailClientId: null };
    case 'TOGGLE_NEWS':
      return { ...state, newsOpen: action.open ?? !state.newsOpen, bookOpen: false };
    case 'OPEN_DETAIL':
      return { ...state, detailClientId: action.clientId };
    case 'CLOSE_DETAIL':
      return { ...state, detailClientId: null };
    default:
      return state;
  }
}

interface GameContextValue {
  state: State;
  focusClient: RuntimeClient | null;
  introClient: RuntimeClient | null;
  activeClients: RuntimeClient[];
  availableClients: RuntimeClient[];
  expiredClients: RuntimeClient[];
  firedClients: RuntimeClient[];
  advisorAllTimeDollar: number;
  canSign: boolean;
  availableBalance: (client: RuntimeClient) => number;
  priceOf: (stockId: string) => number; // current week's starting price
  startGame: () => void;
  setPhase: (p: Phase) => void;
  buy: (clientId: string, stockId: string, shares: number) => void;
  sell: (clientId: string, stockId: string, shares: number) => void;
  signClient: (clientId: string) => void;
  renewClient: (clientId: string) => void;
  dismissExpired: (clientId: string) => void;
  transitionWeek: () => void;
  advanceWeek: () => void;
  toggleBook: (open?: boolean) => void;
  toggleNews: (open?: boolean) => void;
  openDetail: (clientId: string) => void;
  closeDetail: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitial);

  const value = useMemo<GameContextValue>(() => {
    const all = Object.values(state.clients);
    const activeClients = all.filter((c) => c.status === 'signed');
    const availableClients = all.filter((c) => c.status === 'unsigned' && state.reputation >= c.unlockedAtReputation);
    const expiredClients = all.filter((c) => c.status === 'expired');
    const firedClients = all.filter((c) => c.status === 'fired');
    const advisorAllTimeDollar = all.reduce((s, c) => s + c.allTimeReturnDollar, 0);
    return {
      state,
      focusClient: state.focusClientId ? state.clients[state.focusClientId] : null,
      introClient: state.introClientId ? state.clients[state.introClientId] : null,
      activeClients,
      availableClients,
      expiredClients,
      firedClients,
      advisorAllTimeDollar,
      canSign: canSignMore(state.clients),
      availableBalance: (client: RuntimeClient) => client.cash,
      priceOf: (stockId: string) => state.weekStartPrices[stockId] ?? stocksById[stockId]?.price ?? 0,
      startGame: () => dispatch({ type: 'START_GAME' }),
      setPhase: (phase: Phase) => dispatch({ type: 'SET_PHASE', phase }),
      buy: (clientId, stockId, shares) => dispatch({ type: 'BUY', clientId, stockId, shares }),
      sell: (clientId, stockId, shares) => dispatch({ type: 'SELL', clientId, stockId, shares }),
      signClient: (clientId) => dispatch({ type: 'SIGN_CLIENT', clientId }),
      renewClient: (clientId) => dispatch({ type: 'RENEW_CLIENT', clientId }),
      dismissExpired: (clientId) => dispatch({ type: 'DISMISS_EXPIRED', clientId }),
      transitionWeek: () => dispatch({ type: 'TRANSITION_WEEK' }),
      advanceWeek: () => dispatch({ type: 'ADVANCE_WEEK' }),
      toggleBook: (open?: boolean) => dispatch({ type: 'TOGGLE_BOOK', open }),
      toggleNews: (open?: boolean) => dispatch({ type: 'TOGGLE_NEWS', open }),
      openDetail: (clientId: string) => dispatch({ type: 'OPEN_DETAIL', clientId }),
      closeDetail: () => dispatch({ type: 'CLOSE_DETAIL' }),
    };
  }, [state]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within a GameProvider');
  return ctx;
}

export { STOCKS, activeCount };
