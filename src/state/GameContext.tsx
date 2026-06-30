// Global game state: a reputation-driven advisory career with 8-week client
// contracts (max 3 active), reputation milestones, and a game-over at rep 0.

import React, { createContext, useContext, useMemo, useReducer } from 'react';

import CLIENTS from '../data/clients';
import STOCKS, { stocksById } from '../data/stocks';
import { ClientProfile, Phase, RuntimeClient, clampHappiness, initRuntimeClient } from '../data/gameState';
import { computeWeek, happinessDeltaWeek, stockFraction } from '../data/scoring';
import { NewsArticle, generateWeeklyNews } from '../data/newsArticles';
import { resolvedMultipliers } from '../data/priceUpdates';
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
}

export interface TransitionInfo {
  week: number;
  results: PerClientWeekResult[];
  repChanges: RepChange[];
  repBefore: number;
  repAfter: number;
  firedNames: string[];
  newlyUnlocked: string[];
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
  };
}

function firstActiveId(clients: Record<string, RuntimeClient>): string | null {
  const a = Object.values(clients).find((c) => c.status === 'signed');
  return a ? a.id : null;
}

function reducer(state: State, action: Action): State {
  const priceOf = (id: string) => stocksById[id]?.price ?? 0;

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
      const finalMult = resolvedMultipliers(state.weekNews);
      const updated = { ...state.clients };
      const results: PerClientWeekResult[] = [];
      const firedNames: string[] = [];
      const snapshots: ActiveSnapshot[] = [];

      Object.values(state.clients)
        .filter((c) => c.status === 'signed')
        .forEach((client) => {
          const r = computeWeek(client, finalMult);
          const start = client.portfolioValue;
          const weekEndValue = client.cash + r.marketValue;
          const returnDollar = weekEndValue - start;
          const returnPct = start > 0 ? returnDollar / start : 0;

          // Relationship: does the allocation match the client's risk profile?
          const sf = stockFraction(client.holdings);
          const diff = Math.abs(sf - client.idealStockPct);
          const relDelta = r.invested > 0 ? (diff <= 0.1 ? 2 : diff > 0.2 ? -3 : 0) : 0;

          const delta = happinessDeltaWeek(returnPct, r.diversified) + relDelta;
          const prevHappiness = client.happiness;
          const newHappiness = clampHappiness(prevHappiness + delta);
          const fired = newHappiness <= 0;
          const allTimeDollar = weekEndValue - client.initialCapital;
          const allTimePct = client.initialCapital > 0 ? allTimeDollar / client.initialCapital : 0;

          updated[client.id] = {
            ...client,
            status: fired ? 'fired' : client.status,
            holdings: {},
            cash: weekEndValue,
            portfolioValue: weekEndValue,
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
            returnDollar, returnPct, newsContribution: r.weekGain, prevHappiness, newHappiness,
            allTimeDollar, allTimePct, fired,
          });

          if (fired) firedNames.push(client.name);
          else snapshots.push({ clientId: client.id, name: client.name, happiness: newHappiness, returnPct });
        });

      const rep = calculateWeeklyReputation(state.reputation, state.milestones, snapshots, firedNames);

      // Clients that just crossed their reputation unlock threshold.
      const newlyUnlocked = Object.values(state.clients)
        .filter((c) => c.status === 'unsigned' && c.unlockedAtReputation > state.reputation && c.unlockedAtReputation <= rep.newReputation)
        .map((c) => c.name);

      return {
        ...state,
        clients: updated,
        reputation: rep.newReputation,
        milestones: rep.milestones,
        phase: 'transition',
        transition: {
          week: state.currentWeek,
          results,
          repChanges: rep.changes,
          repBefore: state.reputation,
          repAfter: rep.newReputation,
          firedNames,
          newlyUnlocked,
        },
      };
    }

    case 'ADVANCE_WEEK': {
      if (state.reputation <= 0) return { ...state, phase: 'gameOver', transition: null };
      const nextWeek = state.currentWeek + 1;
      const ticked: Record<string, RuntimeClient> = {};
      Object.values(state.clients).forEach((c) => (ticked[c.id] = tickContract(c)));
      return {
        ...state,
        currentWeek: nextWeek,
        clients: ticked,
        focusClientId: firstActiveId(ticked),
        phase: 'weekIntro',
        transition: null,
        weekNews: generateWeeklyNews(nextWeek),
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
