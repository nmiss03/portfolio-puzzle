// Global game state for the day-by-day portfolio manager.

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
import { DayResult, happinessDelta, scorePortfolio } from '../data/scoring';

export interface TransitionInfo {
  clientId: string;
  gain: number;
  returnPct: number;
  stars: number;
  prevHappiness: number;
  newHappiness: number;
  fired: boolean;
}

interface State {
  started: boolean;
  phase: Phase;
  currentDay: number; // 1-based
  order: string[]; // client id per day
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
  | { type: 'FINALIZE_DAY' }
  | { type: 'ADVANCE_DAY' }
  | { type: 'TOGGLE_BOOK'; open?: boolean }
  | { type: 'OPEN_DETAIL'; clientId: string }
  | { type: 'CLOSE_DETAIL' };

function buildInitial(): State {
  const order = CLIENTS.map((c) => c.id);
  const clients: Record<string, RuntimeClient> = {};
  CLIENTS.forEach((c: ClientProfile) => (clients[c.id] = initRuntimeClient(c)));
  return {
    started: false,
    phase: 'dayIntro',
    currentDay: 1,
    order,
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
      return { ...fresh, started: true, phase: 'dayIntro', currentDay: 1 };
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
      if (cost > available + 1e-6) return state; // not enough cash
      const holdings = {
        ...client.holdings,
        [action.stockId]: (client.holdings[action.stockId] || 0) + action.shares,
      };
      return {
        ...state,
        clients: { ...state.clients, [client.id]: { ...client, holdings } },
      };
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
      return {
        ...state,
        clients: { ...state.clients, [client.id]: { ...client, holdings } },
      };
    }

    case 'FINALIZE_DAY': {
      const id = state.order[state.currentDay - 1];
      const client = state.clients[id];
      if (!client) return state;
      const result: DayResult = scorePortfolio(client.holdings, client);
      const delta = happinessDelta(result);
      const prevHappiness = client.happiness;
      const newHappiness = clampHappiness(prevHappiness + delta);
      const fired = newHappiness <= 0;
      const updated: RuntimeClient = {
        ...client,
        finalized: true,
        happiness: newHappiness,
        fired,
        lastStars: result.stars,
        lastReturnPct: result.returnPct,
        lastGain: result.gain,
      };
      return {
        ...state,
        clients: { ...state.clients, [id]: updated },
        phase: 'transition',
        transition: {
          clientId: id,
          gain: result.gain,
          returnPct: result.returnPct,
          stars: result.stars,
          prevHappiness,
          newHappiness,
          fired,
        },
      };
    }

    case 'ADVANCE_DAY': {
      const nextDay = state.currentDay + 1;
      if (nextDay > state.order.length) {
        return { ...state, phase: 'gameOver' };
      }
      return { ...state, currentDay: nextDay, phase: 'dayIntro', transition: null };
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
  clientList: RuntimeClient[];
  availableBalance: (client: RuntimeClient) => number;
  startGame: () => void;
  setPhase: (p: Phase) => void;
  buy: (clientId: string, stockId: string, shares: number) => void;
  sell: (clientId: string, stockId: string, shares: number) => void;
  finalizeDay: () => void;
  advanceDay: () => void;
  toggleBook: (open?: boolean) => void;
  openDetail: (clientId: string) => void;
  closeDetail: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, buildInitial);

  const value = useMemo<GameContextValue>(() => {
    const activeId = state.order[state.currentDay - 1];
    const activeClient = state.clients[activeId];
    const clientList = state.order.map((id) => state.clients[id]);
    return {
      state,
      activeClient,
      clientList,
      availableBalance: (client: RuntimeClient) => client.initialCapital - investedCost(client),
      startGame: () => dispatch({ type: 'START_GAME' }),
      setPhase: (phase: Phase) => dispatch({ type: 'SET_PHASE', phase }),
      buy: (clientId, stockId, shares) => dispatch({ type: 'BUY', clientId, stockId, shares }),
      sell: (clientId, stockId, shares) => dispatch({ type: 'SELL', clientId, stockId, shares }),
      finalizeDay: () => dispatch({ type: 'FINALIZE_DAY' }),
      advanceDay: () => dispatch({ type: 'ADVANCE_DAY' }),
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
