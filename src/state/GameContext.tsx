// Global game state for the week-by-week portfolio manager.

import React, { createContext, useContext, useMemo, useReducer } from 'react';

import CLIENTS from '../data/clients';
import { stocksById } from '../data/stocks';
import {
  ClientProfile,
  Phase,
  RuntimeClient,
  clampHappiness,
  initRuntimeClient,
} from '../data/gameState';
import { happinessDeltaWeek, scoreWeek } from '../data/scoring';

export interface PerClientWeekResult {
  clientId: string;
  name: string;
  characterColor: string;
  returnDollar: number;
  returnPct: number;
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
  currentWeek: number; // 1-based
  totalWeeks: number;
  order: string[]; // client id per week (by unlockedWeek)
  unlocked: string[]; // client ids available so far
  clients: Record<string, RuntimeClient>;
  bookOpen: boolean;
  detailClientId: string | null;
  transition: TransitionInfo | null;
}

type Action =
  | { type: 'START_GAME' }
  | { type: 'SET_PHASE'; phase: Phase }
  | { type: 'BUY'; clientId: string; stockId: string; shares: number }
  | { type: 'SELL'; clientId: string; stockId: string; shares: number }
  | { type: 'TRANSITION_WEEK' }
  | { type: 'ADVANCE_WEEK' }
  | { type: 'TOGGLE_BOOK'; open?: boolean }
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
    detailClientId: null,
    transition: null,
  };
}

function investedCost(client: RuntimeClient): number {
  return Object.entries(client.holdings).reduce((sum, [id, sh]) => {
    const s = stocksById[id];
    return s ? sum + sh * s.price : sum;
  }, 0);
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'START_GAME': {
      const fresh = buildInitial();
      return { ...fresh, started: true };
    }
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'BUY': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      const stock = stocksById[action.stockId];
      if (!stock || action.shares <= 0) return state;
      const cost = action.shares * stock.price;
      const available = client.initialCapital - investedCost(client);
      if (cost > available + 1e-6) return state;
      const holdings = {
        ...client.holdings,
        [action.stockId]: (client.holdings[action.stockId] || 0) + action.shares,
      };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings } } };
    }

    case 'SELL': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      const owned = client.holdings[action.stockId] || 0;
      if (owned <= 0) return state;
      const n = Math.min(action.shares > 0 ? action.shares : owned, owned);
      const holdings = { ...client.holdings };
      const left = owned - n;
      if (left <= 0) delete holdings[action.stockId];
      else holdings[action.stockId] = left;
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings } } };
    }

    case 'TRANSITION_WEEK': {
      const updatedClients = { ...state.clients };
      const results: PerClientWeekResult[] = [];

      state.unlocked.forEach((id) => {
        const client = state.clients[id];
        const r = scoreWeek(client.holdings, client);
        const start = client.portfolioValue;
        const returnDollar = r.weekReturnDollar;
        const returnPct = start > 0 ? returnDollar / start : 0;
        const newValue = start + returnDollar;
        const delta = happinessDeltaWeek(returnPct, r.diversified);
        const prevHappiness = client.happiness;
        const newHappiness = clampHappiness(prevHappiness + delta);
        const fired = newHappiness <= 0;
        const allTimeDollar = newValue - client.initialCapital;
        const allTimePct = client.initialCapital > 0 ? allTimeDollar / client.initialCapital : 0;

        updatedClients[id] = {
          ...client,
          portfolioValue: newValue,
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
        nextWeek <= state.totalWeeks && nextClient
          ? { name: nextClient.name, age: nextClient.age }
          : null;

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
      return { ...state, currentWeek: nextWeek, unlocked, phase: 'weekIntro', transition: null };
    }

    case 'TOGGLE_BOOK':
      return { ...state, bookOpen: action.open ?? !state.bookOpen, detailClientId: null };
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
  teaserClient: RuntimeClient | null; // next-week client shown grayed out
  availableBalance: (client: RuntimeClient) => number;
  startGame: () => void;
  setPhase: (p: Phase) => void;
  buy: (clientId: string, stockId: string, shares: number) => void;
  sell: (clientId: string, stockId: string, shares: number) => void;
  transitionWeek: () => void;
  advanceWeek: () => void;
  toggleBook: (open?: boolean) => void;
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
    const teaserId = state.order[state.currentWeek]; // next week's client
    const teaserClient = teaserId && !state.unlocked.includes(teaserId) ? state.clients[teaserId] : null;
    return {
      state,
      activeClient,
      unlockedClients,
      teaserClient,
      availableBalance: (client: RuntimeClient) => client.initialCapital - investedCost(client),
      startGame: () => dispatch({ type: 'START_GAME' }),
      setPhase: (phase: Phase) => dispatch({ type: 'SET_PHASE', phase }),
      buy: (clientId, stockId, shares) => dispatch({ type: 'BUY', clientId, stockId, shares }),
      sell: (clientId, stockId, shares) => dispatch({ type: 'SELL', clientId, stockId, shares }),
      transitionWeek: () => dispatch({ type: 'TRANSITION_WEEK' }),
      advanceWeek: () => dispatch({ type: 'ADVANCE_WEEK' }),
      toggleBook: (open?: boolean) => dispatch({ type: 'TOGGLE_BOOK', open }),
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
