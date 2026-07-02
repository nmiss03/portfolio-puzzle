// Global game state: a reputation-driven advisory career with 8-week client
// contracts (max 3 active), reputation milestones, and a game-over at rep 0.

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

import CLIENTS from '../data/clients';
import STOCKS, { stocksById } from '../data/stocks';
import { ClientProfile, Phase, RuntimeClient, clampHappiness, initRuntimeClient } from '../data/gameState';
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
import {
  ClientMessage,
  MESSAGE_FULFILLED_BONUS,
  MESSAGE_IGNORED_PENALTY,
  generateClientMessages,
  isMessageFulfilled,
} from '../data/clientMessages';
import { loadJSON, saveJSON } from '../data/persist';
import { BlackSwanEvent, generateBlackSwanImpact, pickBlackSwan, rollBlackSwanGap } from '../data/blackSwan';
import { Regime, RegimeState, initialRegime, nextRegime, regimeTilt } from '../data/economicCycles';
import {
  AdvisorTransaction,
  ASSISTANT_WEEKLY_CUT,
  NO_UPGRADES,
  UpgradeId,
  Upgrades,
  billWelcomeMessage,
  maxClientsFor,
  maybeInsiderTip,
  shopItemById,
} from '../data/advisorEconomy';

const SAVE_KEY = 'portfolio-puzzle:save';
const SAVE_VERSION = 2; // v2: advisor economy, regimes, pre-generated news

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
  driftPct: number; // natural market drift + regime tilt component
  newsPct: number; // news impact component
  pct: number; // total fractional change start → end (drift + news)
  notes: string[]; // attribution for exclusive scoops / insider activity
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
  blackSwan: BlackSwanEvent | null;
  regime: Regime;
  feeIncome: number; // advisor fees earned this week (returns fees)
}

interface State {
  started: boolean;
  advisorName: string;
  firmName: string;
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
  // Phone messages from clients (requests to buy / add to positions).
  messages: ClientMessage[];
  unreadMessageCount: number;
  phoneOpen: boolean;
  // Stock prices persist week-to-week. weekStartPrices are what the player
  // trades at all week; weekEndPrices are computed at week-end and carried
  // over to become next week's start prices.
  weekStartPrices: PriceMap;
  weekEndPrices: PriceMap;
  stockPriceHistory: Record<string, StockPricePoint[]>;
  // The week a black swan crash next strikes (rescheduled after each one).
  nextBlackSwanWeek: number;
  // Next week's news, pre-generated so the News Terminal can preview it.
  nextWeekNews: NewsArticle[];
  // Economic cycle: the active market regime and how long it has left.
  regime: Regime;
  regimeWeeksLeft: number;
  // Advisor economy.
  advisorBalance: number;
  advisorTransactions: AdvisorTransaction[];
  upgrades: Upgrades;
  shopOpen: boolean;
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
  | { type: 'TOGGLE_PHONE'; open?: boolean }
  | { type: 'TOGGLE_SHOP'; open?: boolean }
  | { type: 'BUY_UPGRADE'; id: UpgradeId }
  | { type: 'NEW_GAME'; advisorName: string; firmName: string }
  | { type: 'OPEN_DETAIL'; clientId: string }
  | { type: 'CLOSE_DETAIL' };

function buildInitial(identity?: { advisorName: string; firmName: string }): State {
  const clients: Record<string, RuntimeClient> = {};
  CLIENTS.forEach((c: ClientProfile) => (clients[c.id] = initRuntimeClient(c)));
  const startRegime = initialRegime();
  return {
    started: false,
    advisorName: identity?.advisorName ?? '',
    firmName: identity?.firmName ?? '',
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
    messages: [],
    unreadMessageCount: 0,
    phoneOpen: false,
    weekStartPrices: initializeWeekPrices(null, 1),
    weekEndPrices: {},
    stockPriceHistory: {},
    nextBlackSwanWeek: rollBlackSwanGap(),
    nextWeekNews: [],
    regime: startRegime.regime,
    regimeWeeksLeft: startRegime.weeksRemaining,
    advisorBalance: 0,
    advisorTransactions: [],
    upgrades: { ...NO_UPGRADES },
    shopOpen: false,
  };
}

// Hydrate the last autosaved game (if any) so the title screen can "Continue".
// Transient UI fields are reset so a reload never reopens a modal mid-view.
function loadSavedState(): State | null {
  const saved = loadJSON<{ version: number; state: State }>(SAVE_KEY);
  if (!saved || saved.version !== SAVE_VERSION || !saved.state) return null;
  return { ...saved.state, bookOpen: false, newsOpen: false, phoneOpen: false, shopOpen: false, detailClientId: null };
}

function initialState(): State {
  return loadSavedState() ?? buildInitial();
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
      // Restart fresh, keeping the current advisor/firm identity.
      const fresh = buildInitial({ advisorName: state.advisorName, firmName: state.firmName });
      return { ...fresh, started: true, weekNews: generateWeeklyNews(1), nextWeekNews: generateWeeklyNews(2) };
    }
    case 'NEW_GAME': {
      const fresh = buildInitial({ advisorName: action.advisorName, firmName: action.firmName });
      return { ...fresh, started: true, weekNews: generateWeeklyNews(1), nextWeekNews: generateWeeklyNews(2) };
    }
    case 'SET_PHASE':
      return { ...state, phase: action.phase };

    case 'BUY': {
      const client = state.clients[action.clientId];
      const shares = Math.floor(action.shares); // whole shares only
      if (!client || shares <= 0) return state;
      const stock = stocksById[action.stockId];
      if (!stock) return state;
      const cost = shares * priceOf(action.stockId);
      if (cost > client.cash + 1e-6) return state;
      const prev = client.holdings[action.stockId];
      const holdings = {
        ...client.holdings,
        [action.stockId]: { shares: (prev?.shares || 0) + shares, cost: (prev?.cost || 0) + cost },
      };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings, cash: client.cash - cost } } };
    }

    case 'SELL': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      const h = client.holdings[action.stockId];
      if (!h || h.shares <= 0) return state;
      const wanted = Math.floor(action.shares); // whole shares only
      const n = Math.min(wanted > 0 ? wanted : h.shares, h.shares);
      const refund = n * priceOf(action.stockId);
      const avgCost = h.cost / h.shares;
      const holdings = { ...client.holdings };
      if (n >= h.shares) delete holdings[action.stockId];
      else holdings[action.stockId] = { shares: h.shares - n, cost: h.cost - n * avgCost };
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, holdings, cash: client.cash + refund } } };
    }

    case 'SIGN_CLIENT': {
      const client = state.clients[action.clientId];
      if (!client || client.status === 'signed' || !canSignMore(state.clients, maxClientsFor(state.upgrades))) return state;
      const signed = signContract(client, state.currentWeek);
      // Collect the client's one-time signing fee.
      const fee = client.signingFee;
      const advisorTransactions =
        fee > 0
          ? [...state.advisorTransactions, { week: state.currentWeek, label: `${client.name} signing fee`, amount: fee }]
          : state.advisorTransactions;
      return {
        ...state,
        clients: { ...state.clients, [client.id]: signed },
        advisorBalance: state.advisorBalance + fee,
        advisorTransactions,
        focusClientId: client.id,
        introClientId: client.id,
        bookOpen: false,
        phase: 'clientIntro',
      };
    }

    case 'RENEW_CLIENT': {
      const client = state.clients[action.clientId];
      if (!client || client.status !== 'expired' || !canSignMore(state.clients, maxClientsFor(state.upgrades))) return state;
      const fee = client.signingFee;
      const advisorTransactions =
        fee > 0
          ? [...state.advisorTransactions, { week: state.currentWeek, label: `${client.name} renewal fee`, amount: fee }]
          : state.advisorTransactions;
      return {
        ...state,
        clients: { ...state.clients, [client.id]: signContract(client, state.currentWeek) },
        advisorBalance: state.advisorBalance + fee,
        advisorTransactions,
        focusClientId: client.id,
      };
    }

    case 'DISMISS_EXPIRED': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      return { ...state, clients: { ...state.clients, [client.id]: { ...client, status: 'dismissed' } } };
    }

    case 'TRANSITION_WEEK': {
      // Guard against double-dispatch (e.g. a fast double-tap on "Next Week"):
      // a week can only be resolved from the builder phase.
      if (state.phase !== 'builder') return state;
      // Week-end resolution: every stock gets natural market drift plus the
      // economic-cycle regime tilt, then this week's accumulated news impact is
      // added on top. On a rare black-swan week a crash replaces both drift and
      // regime and dominates the market move.
      const newsImpact = calculateWeeklyPriceImpact(state.weekNews);
      const isBlackSwan = state.currentWeek >= state.nextBlackSwanWeek;
      const blackSwan = isBlackSwan ? pickBlackSwan() : null;
      const marketDrift = isBlackSwan
        ? generateBlackSwanImpact()
        : combineWeeklyImpact(generateWeeklyMarketDrift(STOCKS.map((s) => s.id)), regimeTilt(state.regime));
      const finalMult = combineWeeklyImpact(marketDrift, newsImpact);
      const weekStartPrices = state.weekStartPrices;
      const weekEndPrices = applyWeekEndPrices(weekStartPrices, finalMult);
      const updated = { ...state.clients };
      const results: PerClientWeekResult[] = [];
      const firedNames: string[] = [];
      const snapshots: ActiveSnapshot[] = [];

      // Phone requests issued this week are graded now (deadline = week-end).
      const pendingMsgs = state.messages.filter((m) => !m.resolved && m.weekIssued === state.currentWeek);
      const msgResolutions: Record<string, boolean> = {};

      // Advisor fee collection: a cut of each client's POSITIVE weekly return.
      let returnsFeeIncome = 0;
      let totalPositiveGains = 0;
      const feeTxs: AdvisorTransaction[] = [];

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
          // How much of the move came from news alone (vs drift/regime).
          const newsGain = marketValue(client.holdings, newsImpact, weekStartPrices) - mvStart;

          if (returnDollar > 0) {
            totalPositiveGains += returnDollar;
            if (client.returnsFeePct > 0) {
              const fee = Math.round(returnDollar * client.returnsFeePct * 100) / 100;
              returnsFeeIncome += fee;
              feeTxs.push({ week: state.currentWeek, label: `${client.name} returns fee`, amount: fee });
            }
          }

          // Relationship: does the allocation match the client's tier target?
          const alloc = evaluateAllocationMatch(client, client.holdings, weekStartPrices);
          // Concentration: too much capital in a single stock hurts trust,
          // scaled by tier (higher tiers demand diversification). Cash counts
          // toward the denominator, so a small starter position is safe.
          const conc = evaluateConcentrationRisk(client.holdings, client, weekStartPrices, client.cash);

          // Phone requests: fulfilling a buy/add request builds the relationship.
          let msgDelta = 0;
          pendingMsgs
            .filter((m) => m.clientId === client.id)
            .forEach((m) => {
              const curShares = client.holdings[m.stockId]?.shares || 0;
              const ok = isMessageFulfilled(m, curShares);
              msgResolutions[m.id] = ok;
              msgDelta += ok ? MESSAGE_FULFILLED_BONUS : MESSAGE_IGNORED_PENALTY;
            });

          const prevHappiness = client.happiness;
          const newHappiness = clampHappiness(msgDelta + calculateWeeklyHappiness(
            prevHappiness,
            returnPct,
            alloc.happinessMatched,
            client.negativeReturnHappinessPenalty,
            conc.happinessPenalty,
            alloc.invested
          ));
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
            returnDollar, returnPct, newsContribution: newsGain, prevHappiness, newHappiness,
            allTimeDollar, allTimePct, fired,
            concentrationLevel: conc.level, concentrationPenalty: conc.happinessPenalty,
            largestStockPct: conc.largestStockWeight,
          });

          if (fired) firedNames.push(client.name);
          else snapshots.push({
            clientId: client.id, name: client.name, happiness: newHappiness, returnPct,
          });
        });

      const rep = calculateWeeklyReputation(state.reputation, state.milestones, snapshots, firedNames);

      // Clients that just crossed their reputation unlock threshold.
      const newlyUnlocked = Object.values(state.clients)
        .filter((c) => c.status === 'unsigned' && c.unlockedAtReputation > state.reputation && c.unlockedAtReputation <= rep.newReputation)
        .map((c) => c.name);

      // Price movements (start → end) for every stock — all move each week —
      // with the drift/news breakdown so the player sees why prices moved.
      // Exclusive scoops and insider activity get called out by name so even
      // non-terminal players learn after the fact why a stock moved hard.
      const attribution: Record<string, string[]> = {};
      state.weekNews.forEach((a) => {
        if (!a.exclusive && !a.insider) return;
        const label = a.insider ? `INSIDER ACTIVITY: ${a.headline}` : `EXCLUSIVE NEWS: ${a.headline}`;
        Object.keys(a.priceImpact).forEach((id) => {
          if (Math.abs(a.priceImpact[id]) < 1e-9) return;
          (attribution[id] = attribution[id] || []).push(label);
        });
      });

      const priceMoves: PriceMove[] = STOCKS.map((s) => {
        const startPrice = weekStartPrices[s.id] ?? s.price;
        const endPrice = weekEndPrices[s.id] ?? startPrice;
        return {
          stockId: s.id, ticker: s.ticker, name: s.name, startPrice, endPrice,
          driftPct: marketDrift[s.id] || 0,
          newsPct: newsImpact[s.id] || 0,
          pct: startPrice > 0 ? (endPrice - startPrice) / startPrice : 0,
          notes: attribution[s.id] || [],
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

      // Mark this week's phone requests resolved (fulfilled or not).
      const resolvedMessages = state.messages.map((m) =>
        !m.resolved && m.weekIssued === state.currentWeek
          ? { ...m, resolved: true, fulfilled: msgResolutions[m.id] ?? false }
          : m
      );

      // Assistant salary comes out of the advisor's balance each week.
      const assistantCut = state.upgrades.assistant
        ? Math.round(totalPositiveGains * ASSISTANT_WEEKLY_CUT * 100) / 100
        : 0;
      const weekTxs = [...feeTxs];
      if (assistantCut > 0) weekTxs.push({ week: state.currentWeek, label: 'Assistant salary', amount: -assistantCut });
      const advisorBalance = Math.max(0, state.advisorBalance + returnsFeeIncome - assistantCut);

      return {
        ...state,
        clients: updated,
        reputation: rep.newReputation,
        milestones: rep.milestones,
        phase: 'transition',
        weekEndPrices,
        stockPriceHistory,
        messages: resolvedMessages,
        advisorBalance,
        advisorTransactions: [...state.advisorTransactions, ...weekTxs],
        // A black swan shocks the economy into a fresh downturn.
        regime: isBlackSwan ? 'downturn' : state.regime,
        regimeWeeksLeft: isBlackSwan ? 5 : state.regimeWeeksLeft,
        // Schedule the next crash 15-20 weeks out once one has struck.
        nextBlackSwanWeek: isBlackSwan ? state.currentWeek + rollBlackSwanGap() : state.nextBlackSwanWeek,
        transition: {
          week: state.currentWeek,
          results,
          repChanges: rep.changes,
          repBefore: state.reputation,
          repAfter: rep.newReputation,
          firedNames,
          newlyUnlocked,
          priceMoves,
          blackSwan,
          regime: state.regime,
          feeIncome: returnsFeeIncome,
        },
      };
    }

    case 'ADVANCE_WEEK': {
      // Guard against double-dispatch: advancing is only valid from the summary.
      if (state.phase !== 'summary') return state;
      if (state.reputation <= 0) return { ...state, phase: 'gameOver', transition: null };
      const nextWeek = state.currentWeek + 1;
      const ticked: Record<string, RuntimeClient> = {};
      Object.values(state.clients).forEach((c) => (ticked[c.id] = tickContract(c)));
      // Carry this week's ending prices over to become next week's start prices.
      const nextStartPrices = initializeWeekPrices(carryOverPrices(state.weekEndPrices), nextWeek);
      // Clients may text you a buy/add request for the new week.
      const newMessages = generateClientMessages(
        nextWeek,
        Object.values(ticked).filter((c) => c.status === 'signed')
      );

      // The incoming week's news was pre-generated last week (so the News
      // Terminal could preview it); generate the following week's now.
      const incomingNews = [...(state.nextWeekNews.length > 0 ? state.nextWeekNews : generateWeeklyNews(nextWeek))];
      const nextWeekNews = generateWeeklyNews(nextWeek + 1);

      // Politician Bill occasionally tips off funded advisors: a big scheduled
      // move injected into this week's news, announced only on your phone.
      if (state.upgrades.politicalFunding) {
        const tip = maybeInsiderTip(nextWeek);
        if (tip) {
          incomingNews.push(tip.article);
          newMessages.unshift(tip.message);
        }
      }

      // Economic cycle ticks over; roll a fresh regime when this one ends.
      const regimeState: RegimeState =
        state.regimeWeeksLeft - 1 <= 0
          ? nextRegime(state.regime)
          : { regime: state.regime, weeksRemaining: state.regimeWeeksLeft - 1 };

      return {
        ...state,
        currentWeek: nextWeek,
        clients: ticked,
        focusClientId: firstActiveId(ticked),
        phase: 'weekIntro',
        transition: null,
        weekNews: incomingNews,
        nextWeekNews,
        regime: regimeState.regime,
        regimeWeeksLeft: regimeState.weeksRemaining,
        weekStartPrices: nextStartPrices,
        weekEndPrices: {},
        messages: [...newMessages, ...state.messages],
        unreadMessageCount: state.unreadMessageCount + newMessages.length,
      };
    }

    case 'TOGGLE_BOOK':
      return { ...state, bookOpen: action.open ?? !state.bookOpen, newsOpen: false, phoneOpen: false, shopOpen: false, detailClientId: null };
    case 'TOGGLE_NEWS':
      return { ...state, newsOpen: action.open ?? !state.newsOpen, bookOpen: false, phoneOpen: false, shopOpen: false };
    case 'TOGGLE_PHONE': {
      const open = action.open ?? !state.phoneOpen;
      // Opening the phone marks everything read and clears the badge.
      const messages = open ? state.messages.map((m) => (m.read ? m : { ...m, read: true })) : state.messages;
      return { ...state, phoneOpen: open, bookOpen: false, newsOpen: false, shopOpen: false, messages, unreadMessageCount: open ? 0 : state.unreadMessageCount };
    }
    case 'TOGGLE_SHOP':
      return { ...state, shopOpen: action.open ?? !state.shopOpen, bookOpen: false, newsOpen: false, phoneOpen: false };

    case 'BUY_UPGRADE': {
      const item = shopItemById[action.id];
      if (!item || state.upgrades[action.id] || state.advisorBalance < item.cost) return state;
      const upgrades = { ...state.upgrades, [action.id]: true };
      const advisorTransactions = [
        ...state.advisorTransactions,
        { week: state.currentWeek, label: item.name, amount: -item.cost },
      ];
      // Political funding: Bill introduces himself right away.
      const welcome = action.id === 'politicalFunding' ? billWelcomeMessage(state.currentWeek) : null;
      return {
        ...state,
        upgrades,
        advisorBalance: state.advisorBalance - item.cost,
        advisorTransactions,
        messages: welcome ? [welcome, ...state.messages] : state.messages,
        unreadMessageCount: welcome ? state.unreadMessageCount + 1 : state.unreadMessageCount,
      };
    }
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
  advisorName: string;
  firmName: string;
  canContinue: boolean; // a saved in-progress game exists
  advisorBalance: number;
  upgrades: Upgrades;
  maxClients: number;
  availableBalance: (client: RuntimeClient) => number;
  priceOf: (stockId: string) => number; // current week's starting price
  startGame: () => void;
  newGame: (advisorName: string, firmName: string) => void;
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
  togglePhone: (open?: boolean) => void;
  toggleShop: (open?: boolean) => void;
  buyUpgrade: (id: UpgradeId) => void;
  openDetail: (clientId: string) => void;
  closeDetail: () => void;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  // Autosave every change once a game is under way, so "Continue" can resume it.
  useEffect(() => {
    if (state.started) saveJSON(SAVE_KEY, { version: SAVE_VERSION, state });
  }, [state]);

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
      canSign: canSignMore(state.clients, maxClientsFor(state.upgrades)),
      advisorName: state.advisorName,
      firmName: state.firmName,
      canContinue: state.started && state.phase !== 'gameOver',
      advisorBalance: state.advisorBalance,
      upgrades: state.upgrades,
      maxClients: maxClientsFor(state.upgrades),
      availableBalance: (client: RuntimeClient) => client.cash,
      priceOf: (stockId: string) => state.weekStartPrices[stockId] ?? stocksById[stockId]?.price ?? 0,
      startGame: () => dispatch({ type: 'START_GAME' }),
      newGame: (advisorName: string, firmName: string) => dispatch({ type: 'NEW_GAME', advisorName, firmName }),
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
      togglePhone: (open?: boolean) => dispatch({ type: 'TOGGLE_PHONE', open }),
      toggleShop: (open?: boolean) => dispatch({ type: 'TOGGLE_SHOP', open }),
      buyUpgrade: (id: UpgradeId) => dispatch({ type: 'BUY_UPGRADE', id }),
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
