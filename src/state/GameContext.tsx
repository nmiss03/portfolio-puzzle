// Global game state for the week-by-week portfolio manager with a live news
// feed that moves stock prices during the building phase.

import React, { createContext, useContext, useMemo, useReducer } from 'react';

import CLIENTS from '../data/clients';
import STOCKS, { stocksById } from '../data/stocks';
import { ClientProfile, Phase, RuntimeClient, clampHappiness, initRuntimeClient } from '../data/gameState';
import { computeWeek, happinessDeltaWeek } from '../data/scoring';
import { NewsArticle, generateWeeklyNews } from '../data/newsArticles';
import { computeMultipliers } from '../data/priceUpdates';

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
}

export interface TransitionInfo {
  week: number;
  results: PerClientWeekResult[];
  unlocking: { name: string; age: number } | null;
}

interface State {
  started: boolean;
  phase: Phase;
  currentWeek: number;
  totalWeeks: number;
  order: string[];
  unlocked: string[];
  clients: Record<string, RuntimeClient>;
  bookOpen: boolean;
  newsOpen: boolean;
  detailClientId: string | null;
  transition: TransitionInfo | null;
  weekNews: NewsArticle[];
  readNewsIds: string[];
}

type Action =
  | { type: 'START_GAME' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'BUY'; clientId: string; stockId: string; shares: number }
  | { type: 'SELL'; clientId: string; stockId: string; shares: number }
  | { type: 'READ_NEWS'; id: string }
  | { type: 'TRANSITION_WEEK' }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'TOGGLE_BOOK'; open?: boolean }
  | { type: 'TOGGLE_NEWS'; open?: boolean }
  | { type: 'OPEN_DETAIL'; clientId: string }
  | { type: 'CLOSE_DETAIL' };

function buildInitial(): State {
  const order = [...CLIENTS].sort((a, b) => a.unlockedWeek - b.unlockedWeek).map((c) => c.id);
  const clients: Record<string, RuntimeClient> = {};
  CLIENTS.forEach((c: ClientProfile) => (clients[c.id] = initRuntimeClient(c)));
  return {
    started: false,
    phase: 'weekIntro',
    currentWeek: 1,
    totalWeeks: order.length,
    order,
    unlocked: order.length ? [order[0]] : [],
    clients,
    bookOpen: false,
    newsOpen: false,
    detailClientId: null,
    transition: null,
    weekNews: [],
    readNewsIds: [],
  };
}

function ownedIdsAcross(state: State): string[] {
  const ids = new Set<string>();
  state.unlocked.forEach((cid) => Object.keys(state.clients[cid].holdings).forEach((id) => ids.add(id)));
  return [...ids];
}

function reducer(state: State, action: Action): State {
  const multipliers = computeMultipliers(state.weekNews, state.readNewsIds);
  const priceOf = (id: string) => (stocksById[id]?.price ?? 0) * (1 + (multipliers[id] || 0));

  switch (action.type) {
    case 'START_GAME': {
      const fresh = buildInitial();
      return { ...fresh, started: true, weekNews: generateWeeklyNews([]) };
    }
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'BUY': {
      const client = state.clients[action.clientId];
      if (!client || action.shares <= 0) return state;
      const stock = stocksById[action.stockId];
      if (!stock) return state;
      const price = priceOf(action.stockId);
      const cost = action.shares * price;
      if (cost > client.cash + 1e-6) return state;
      const prev = client.holdings[action.stockId];
      const holdings = {
        ...client.holdings,
        [action.stockId]: {
          shares: (prev?.shares || 0) + action.shares,
          cost: (prev?.cost || 0) + cost,
        },
      };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings, cash: client.cash - cost } } };
    }

    case 'SELL': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      const h = client.holdings[action.stockId];
      if (!h || h.shares <= 0) return state;
      const n = Math.min(action.shares > 0 ? action.shares : h.shares, h.shares);
      const price = priceOf(action.stockId);
      const refund = n * price;
      const avgCost = h.cost / h.shares;
      const holdings = { ...client.holdings };
      if (n >= h.shares) delete holdings[action.stockId];
      else holdings[action.stockId] = { shares: h.shares - n, cost: h.cost - n * avgCost };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings, cash: client.cash + refund } } };
    }

    case 'READ_NEWS':
      if (state.readNewsIds.includes(action.id)) return state;
      return { ...state, readNewsIds: [...state.readNewsIds, action.id] };

    case 'TRANSITION_WEEK': {
      const updatedClients = { ...state.clients };
      const results: PerClientWeekResult[] = [];

      state.unlocked.forEach((id) => {
        const client = state.clients[id];
        const r = computeWeek(client, multipliers);
        const start = client.portfolioValue;
        const weekEndValue = client.cash + r.marketValue;
        const returnDollar = weekEndValue - start;
        const returnPct = start > 0 ? returnDollar / start : 0;
        const delta = happinessDeltaWeek(returnPct, r.diversified);
        const prevHappiness = client.happiness;
        const newHappiness = clampHappiness(prevHappiness + delta);
        const fired = newHappiness <= 0;
        const allTimeDollar = weekEndValue - client.initialCapital;
        const allTimePct = client.initialCapital > 0 ? allTimeDollar / client.initialCapital : 0;

        updatedClients[id] = {
          ...client,
          // Bank the week: liquidate holdings into cash at end-of-week prices.
          holdings: {},
          cash: weekEndValue,
          portfolioValue: weekEndValue,
          happiness: newHappiness,
          fired,
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
          clientId: id,
          name: client.name,
          characterColor: client.characterColor,
          returnDollar,
          returnPct,
          newsContribution: r.weekGain,
          prevHappiness,
          newHappiness,
          allTimeDollar,
          allTimePct,
          fired,
        });
      });

      const nextWeek = state.currentWeek + 1;
      const nextId = state.order[nextWeek - 1];
      const nextClient = nextId ? state.clients[nextId] : null;
      const unlocking =
        nextWeek <= state.totalWeeks && nextClient ? { name: nextClient.name, age: nextClient.age } : null;

      return {
        ...state,
        clients: updatedClients,
        phase: 'transition',
        transition: { week: state.currentWeek, results, unlocking },
      };
    }

    case 'ADVANCE_WEEK': {
      const nextWeek = state.currentWeek + 1;
      if (nextWeek > state.totalWeeks) {
        return { ...state, phase: 'gameOver', transition: null };
      }
      const newId = state.order[nextWeek - 1];
      const unlocked = newId && !state.unlocked.includes(newId) ? [...state.unlocked, newId] : state.unlocked;
      const nextState = { ...state, currentWeek: nextWeek, unlocked };
      return {
        ...nextState,
        phase: 'weekIntro',
        transition: null,
        weekNews: generateWeeklyNews(ownedIdsAcross(nextState)),
        readNewsIds: [],
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
  activeClient: RuntimeClient;
  unlockedClients: RuntimeClient[];
  teaserClient: RuntimeClient | null;
  multipliers: Record<string, number>;
  priceOf: (stockId: string) => number;
  availableBalance: (client: RuntimeClient) => number;
  startGame: () => void;
  setPhase: (p: Phase) => void;
  buy: (clientId: string, stockId: string, shares: number) => void;
  sell: (clientId: string, stockId: string, shares: number) => void;
  readNews: (id: string) => void;
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
    const activeId = state.order[state.currentWeek - 1];
    const activeClient = state.clients[activeId];
    const unlockedClients = state.unlocked.map((id) => state.clients[id]);
    const teaserId = state.order[state.currentWeek];
    const teaserClient = teaserId && !state.unlocked.includes(teaserId) ? state.clients[teaserId] : null;
    const multipliers = computeMultipliers(state.weekNews, state.readNewsIds);
    const priceOf = (stockId: string) => (stocksById[stockId]?.price ?? 0) * (1 + (multipliers[stockId] || 0));
    return {
      state,
      activeClient,
      unlockedClients,
      teaserClient,
      multipliers,
      priceOf,
      availableBalance: (client: RuntimeClient) => client.cash,
      startGame: () => dispatch({ type: 'START_GAME' }),
      setPhase: (phase: Phase) => dispatch({ type: 'SET_PHASE', phase }),
      buy: (clientId, stockId, shares) => dispatch({ type: 'BUY', clientId, stockId, shares }),
      sell: (clientId, stockId, shares) => dispatch({ type: 'SELL', clientId, stockId, shares }),
      readNews: (id) => dispatch({ type: 'READ_NEWS', id }),
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

// Re-export for screens that map over the universe.
export { STOCKS };
