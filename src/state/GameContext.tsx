// Global game state: a reputation-driven advisory career with 8-week client
// contracts (max 3 active), reputation milestones, and a game-over at rep 0.

import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';

import { pickCareerCast } from '../data/clients';
import STOCKS, { stocksById } from '../data/stocks';
import {
  ClientProfile,
  HappinessFactor,
  Phase,
  RuntimeClient,
  clampHappiness,
  freshRelationship,
  initRuntimeClient,
} from '../data/gameState';
import { marketValue, weeklyHappinessBreakdown } from '../data/scoring';
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
import {
  ContractGrade,
  activeCount,
  canSignMore,
  contractBonus,
  gradeContract,
  gradeRepBonus,
  signContract,
  tickContract,
} from '../data/contractSystem';
import {
  ClientMessage,
  MESSAGE_FULFILLED_BONUS,
  MESSAGE_IGNORED_PENALTY,
  generateClientMessages,
  isMessageFulfilled,
} from '../data/clientMessages';
import { BarkEvent, barkLine, gradeQuote, makeClientNote, renewalLine } from '../data/clientVoice';
import { CareerRecords, WEEKS_PER_YEAR, YearReview, careerTitle, freshRecords, updateRecords } from '../data/careerRecords';
import { checkAchievements } from '../data/achievements';
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
  happinessFactors: HappinessFactor[]; // itemized WHY the mood moved
}

// End-of-contract report card: the 8-week arc's payoff, shown in the summary.
export interface ContractReport {
  clientId: string;
  name: string;
  grade: ContractGrade;
  allTimePct: number;
  happiness: number;
  bonus: number; // completion bonus paid to the advisor
  repBonus: number;
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
  contractReports: ContractReport[]; // contracts that just finished their final week
  newRecords: string[]; // career records broken this week (★ NEW RECORD beat)
  yearReview: YearReview | null; // set on every 52nd week — the season beat
  newAchievements: string[]; // achievement ids earned this week
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
  // Career records & streaks — survive week-to-week, reset on a new career.
  records: CareerRecords;
  achievements: string[]; // earned achievement ids, never revoked
  lowestReputation: number; // career floor, for the comeback achievement
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
  // Every career deals a random hand from the full roster — no two careers
  // meet the same people. The cast is fixed for the life of the save.
  const clients: Record<string, RuntimeClient> = {};
  pickCareerCast().forEach((c: ClientProfile) => (clients[c.id] = initRuntimeClient(c)));
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
    records: freshRecords(),
    achievements: [],
    lowestReputation: STARTING_REPUTATION,
  };
}

// Hydrate the last autosaved game (if any) so the title screen can "Continue".
// Transient UI fields are reset so a reload never reopens a modal mid-view.
function loadSavedState(): State | null {
  const saved = loadJSON<{ version: number; state: State }>(SAVE_KEY);
  if (!saved || saved.version !== SAVE_VERSION || !saved.state) return null;
  return {
    ...saved.state,
    // Saves from before the record book existed get an empty one.
    records: saved.state.records ?? freshRecords(),
    achievements: saved.state.achievements ?? [],
    lowestReputation: saved.state.lowestReputation ?? saved.state.reputation,
    bookOpen: false,
    newsOpen: false,
    phoneOpen: false,
    shopOpen: false,
    detailClientId: null,
  };
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
      // A client with shared history doesn't get the first-meeting intro —
      // you already know each other. (Their comeback text arrived when they
      // rejoined the pool.)
      const rel = client.relationship ?? freshRelationship();
      const knownToYou = rel.contracts > 0 || rel.cameBack;
      return {
        ...state,
        clients: { ...state.clients, [client.id]: signed },
        advisorBalance: state.advisorBalance + fee,
        advisorTransactions,
        focusClientId: client.id,
        introClientId: knownToYou ? null : client.id,
        bookOpen: false,
        phase: knownToYou ? 'builder' : 'clientIntro',
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
      // The relationship deepens: their re-signing text is staged by how many
      // contracts you've already finished together.
      const rel = client.relationship ?? freshRelationship();
      const note = makeClientNote(
        client.id,
        client.name,
        state.currentWeek,
        renewalLine(client.id, Math.max(1, rel.contracts), { advisor: state.advisorName, crashes: rel.crashes, contracts: rel.contracts })
      );
      return {
        ...state,
        clients: { ...state.clients, [client.id]: signContract(client, state.currentWeek) },
        advisorBalance: state.advisorBalance + fee,
        advisorTransactions,
        focusClientId: client.id,
        messages: [note, ...state.messages],
        unreadMessageCount: state.unreadMessageCount + 1,
      };
    }

    case 'DISMISS_EXPIRED': {
      const client = state.clients[action.clientId];
      if (!client) return state;
      // Dismissed clients cool off for a month, then return to the pool.
      return {
        ...state,
        clients: { ...state.clients, [client.id]: { ...client, status: 'dismissed', returnsAtWeek: state.currentWeek + 4 } },
      };
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
      const marketDrift = blackSwan
        ? generateBlackSwanImpact(blackSwan)
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

      // Contracts finishing their final week get graded (the chapter-end beat).
      const contractReports: ContractReport[] = [];

      // Client reactions to the week, delivered as phone texts (one per client
      // max, most dramatic event wins).
      const barks: ClientMessage[] = [];

      // Book-wide aggregates + funded dreams, for the career record book.
      let totalStartValue = 0;
      const dreamLabels: string[] = [];

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
          totalStartValue += startValue;
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
          const msgFactors: HappinessFactor[] = [];
          pendingMsgs
            .filter((m) => m.clientId === client.id)
            .forEach((m) => {
              const curShares = client.holdings[m.stockId]?.shares || 0;
              const ok = isMessageFulfilled(m, curShares);
              msgResolutions[m.id] = ok;
              msgDelta += ok ? MESSAGE_FULFILLED_BONUS : MESSAGE_IGNORED_PENALTY;
              msgFactors.push(
                ok
                  ? { label: 'Request fulfilled', amount: MESSAGE_FULFILLED_BONUS }
                  : { label: 'Request ignored', amount: MESSAGE_IGNORED_PENALTY }
              );
            });

          const prevHappiness = client.happiness;
          const hb = weeklyHappinessBreakdown(
            returnPct,
            alloc.happinessMatched,
            client.negativeReturnHappinessPenalty,
            conc.happinessPenalty,
            alloc.invested
          );
          const happinessFactors = [...hb.factors, ...msgFactors];
          const newHappiness = clampHappiness(prevHappiness + hb.delta + msgDelta);
          const fired = newHappiness <= 0;
          const allTimeDollar = endValue - client.initialCapital;
          const allTimePct = client.initialCapital > 0 ? allTimeDollar / client.initialCapital : 0;

          // Did the portfolio just reach the client's dream for the first time?
          const dreamNow = !!client.dream && !client.dreamReached && endValue >= client.dream.target;
          if (dreamNow) dreamLabels.push(client.dream.label);
          // ...or first cross 85% of it — the "almost there" beat.
          const dreamCloseNow =
            !!client.dream &&
            !client.dreamReached &&
            !dreamNow &&
            startValue < client.dream.target * 0.85 &&
            endValue >= client.dream.target * 0.85;

          // Shared history grows: crashes weathered, best weeks, firings.
          const prevRel = client.relationship ?? freshRelationship();
          const rel = {
            ...prevRel,
            crashes: prevRel.crashes + (isBlackSwan ? 1 : 0),
            bestWeekPct: Math.max(prevRel.bestWeekPct, returnPct),
            timesFired: prevRel.timesFired + (fired ? 1 : 0),
          };
          const voiceCtx = { advisor: state.advisorName, crashes: rel.crashes, contracts: rel.contracts };

          // Pick this client's reaction to the week (priority order matters:
          // a goodbye outranks everything; a funded dream outranks a crash).
          let barkEvent: BarkEvent | null = null;
          if (fired) barkEvent = 'goodbye';
          else if (dreamNow) barkEvent = 'dream';
          else if (dreamCloseNow) barkEvent = 'dreamClose';
          else if (isBlackSwan && Object.keys(client.holdings).length > 0) barkEvent = 'crash';
          else if (prevHappiness > 25 && newHappiness <= 25) barkEvent = 'misery';
          else if (prevHappiness <= 25 && newHappiness > 25) barkEvent = 'recovery';
          else if (returnPct <= -0.025 && Math.random() < 0.6) barkEvent = 'loss';
          else if (returnPct >= 0.025 && Math.random() < 0.5) barkEvent = 'win';
          else if (Math.random() < 0.1) barkEvent = 'idle'; // small talk keeps the phone alive
          if (barkEvent) {
            barks.push(makeClientNote(client.id, client.name, state.currentWeek, barkLine(client.id, barkEvent, voiceCtx)));
          }

          // The dream epilogue: a few weeks after funding, the photo/postcard
          // arrives — proof of the life the money bought. Always delivered,
          // even alongside another reaction; it's the payoff.
          const epilogueNow =
            !!client.dreamReached &&
            client.dreamReachedWeek !== undefined &&
            !client.epilogueSent &&
            !fired &&
            state.currentWeek >= client.dreamReachedWeek + 3;
          if (epilogueNow) {
            barks.push(makeClientNote(client.id, client.name, state.currentWeek, barkLine(client.id, 'epilogue', voiceCtx)));
          }

          // Final contract week (and not fired): grade the whole arc.
          if (!fired && client.contractWeeksRemaining === 1) {
            rel.contracts += 1; // another chapter of shared history
            const grade = gradeContract(allTimePct, newHappiness);
            contractReports.push({
              clientId: client.id,
              name: client.name,
              grade,
              allTimePct,
              happiness: newHappiness,
              bonus: contractBonus(client.tier, grade),
              repBonus: gradeRepBonus(grade),
            });
          }

          updated[client.id] = {
            ...client,
            status: fired ? 'fired' : client.status,
            // A fired client storms out — but may reconsider in a couple months.
            returnsAtWeek: fired ? state.currentWeek + 8 : client.returnsAtWeek,
            // Holdings and cash PERSIST across the week — only valuation changes.
            holdings: client.holdings,
            cash: client.cash,
            portfolioValue: endValue,
            happiness: newHappiness,
            lastHappinessFactors: happinessFactors,
            dreamReached: client.dreamReached || dreamNow,
            dreamReachedWeek: dreamNow ? state.currentWeek : client.dreamReachedWeek,
            epilogueSent: client.epilogueSent || epilogueNow,
            relationship: rel,
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
            happinessFactors,
          });

          if (fired) firedNames.push(client.name);
          else snapshots.push({
            clientId: client.id, name: client.name, happiness: newHappiness, returnPct,
          });
        });

      const rep = calculateWeeklyReputation(state.reputation, state.milestones, snapshots, firedNames);

      // Contract completions: grade-based reputation and advisor bonuses.
      let contractRepBonus = 0;
      let contractBonusTotal = 0;
      const repChanges = [...rep.changes];
      contractReports.forEach((r) => {
        contractBonusTotal += r.bonus;
        if (r.repBonus > 0) {
          contractRepBonus += r.repBonus;
          repChanges.push({ amount: r.repBonus, reason: `Completed ${r.name}'s contract (grade ${r.grade})` });
        }
      });
      const finalReputation = Math.max(0, Math.min(100, rep.newReputation + contractRepBonus));

      // Clients that just crossed their reputation unlock threshold.
      const newlyUnlocked = Object.values(state.clients)
        .filter((c) => c.status === 'unsigned' && c.unlockedAtReputation > state.reputation && c.unlockedAtReputation <= finalReputation)
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
      contractReports.forEach((r) => {
        if (r.bonus > 0) weekTxs.push({ week: state.currentWeek, label: `${r.name} contract bonus (${r.grade})`, amount: r.bonus });
      });
      if (assistantCut > 0) weekTxs.push({ week: state.currentWeek, label: 'Assistant salary', amount: -assistantCut });
      const advisorBalance = Math.max(0, state.advisorBalance + returnsFeeIncome + contractBonusTotal - assistantCut);

      // Fold the week into the career record book (best week, streaks, swans
      // survived, contracts, S-grades, funded-dream trophies).
      const bookReturnDollar = results.reduce((s, r) => s + r.returnDollar, 0);
      const recordsUpdate = updateRecords(state.records, {
        bookReturnPct: totalStartValue > 0 ? bookReturnDollar / totalStartValue : 0,
        bookReturnDollar,
        hadClients: results.length > 0,
        survivedSwan: !!blackSwan && finalReputation > 0,
        contractsCompleted: contractReports.length,
        sGrades: contractReports.filter((r) => r.grade === 'S').length,
        dreamsFundedLabels: dreamLabels,
      });

      // Achievements: checked against the updated record book and this week's
      // outcome. Earned once, kept forever.
      const lowestReputation = Math.min(state.lowestReputation ?? state.reputation, finalReputation);
      const newAchievements = checkAchievements(state.achievements ?? [], {
        records: recordsUpdate.records,
        reputation: finalReputation,
        lowestReputation,
        week: state.currentWeek,
        advisorBalance,
        activeHappinesses: results.filter((r) => !r.fired).map((r) => r.newHappiness),
      });

      // Every 52nd week closes a fiscal year: the summary opens with a YEAR IN
      // REVIEW card and the career title is re-assessed.
      let yearReview: YearReview | null = null;
      if (state.currentWeek % WEEKS_PER_YEAR === 0) {
        const firstWeek = state.currentWeek - WEEKS_PER_YEAR + 1;
        const yearReturns: number[] = [];
        Object.values(updated).forEach((cl) =>
          cl.performanceHistory.forEach((h) => {
            if (h.week >= firstWeek) yearReturns.push(h.returnPct);
          })
        );
        const firmIncome = [...state.advisorTransactions, ...weekTxs]
          .filter((tx) => tx.week >= firstWeek && tx.amount > 0)
          .reduce((s, tx) => s + tx.amount, 0);
        yearReview = {
          year: state.currentWeek / WEEKS_PER_YEAR,
          avgWeeklyReturnPct: yearReturns.length > 0 ? yearReturns.reduce((s, r) => s + r, 0) / yearReturns.length : 0,
          firmIncome,
          contractsCompleted: recordsUpdate.records.contractsCompleted,
          dreamsFunded: recordsUpdate.records.dreamsFunded,
          bestWeekPct: recordsUpdate.records.bestWeekPct,
          title: careerTitle(recordsUpdate.records, state.currentWeek + 1),
        };
      }

      return {
        ...state,
        clients: updated,
        reputation: finalReputation,
        milestones: rep.milestones,
        phase: 'transition',
        weekEndPrices,
        stockPriceHistory,
        messages: [...barks, ...resolvedMessages],
        unreadMessageCount: state.unreadMessageCount + barks.length,
        advisorBalance,
        advisorTransactions: [...state.advisorTransactions, ...weekTxs],
        records: recordsUpdate.records,
        achievements: [...(state.achievements ?? []), ...newAchievements],
        lowestReputation,
        // A black swan shocks the economy into a fresh downturn.
        regime: isBlackSwan ? 'downturn' : state.regime,
        regimeWeeksLeft: isBlackSwan ? 5 : state.regimeWeeksLeft,
        // Schedule the next crash 15-20 weeks out once one has struck.
        nextBlackSwanWeek: isBlackSwan ? state.currentWeek + rollBlackSwanGap() : state.nextBlackSwanWeek,
        transition: {
          week: state.currentWeek,
          results,
          repChanges,
          repBefore: state.reputation,
          repAfter: finalReputation,
          firedNames,
          newlyUnlocked,
          priceMoves,
          blackSwan,
          regime: state.regime,
          feeIncome: returnsFeeIncome,
          contractReports,
          newRecords: recordsUpdate.beats,
          yearReview,
          newAchievements,
        },
      };
    }

    case 'ADVANCE_WEEK': {
      // Guard against double-dispatch: advancing is only valid from the summary.
      if (state.phase !== 'summary') return state;
      if (state.reputation <= 0) return { ...state, phase: 'gameOver', transition: null };
      const nextWeek = state.currentWeek + 1;
      const ticked: Record<string, RuntimeClient> = {};
      const comebackNotes: ClientMessage[] = [];
      Object.values(state.clients).forEach((c) => {
        let t = tickContract(c);
        // Fired/dismissed clients eventually reconsider: they rejoin the pool
        // with a fresh account (reputation gate still applies). This keeps the
        // roster a renewable resource — losing a client is a wound, not a
        // permanent amputation of the game's content. The RELATIONSHIP
        // survives the reset: they come back remembering everything, and they
        // text you first — that's the reconciliation beat.
        if ((t.status === 'fired' || t.status === 'dismissed') && t.returnsAtWeek !== undefined && nextWeek >= t.returnsAtWeek) {
          const rel = { ...(t.relationship ?? freshRelationship()), cameBack: true };
          t = {
            ...initRuntimeClient(t),
            returnsAtWeek: undefined,
            relationship: rel,
            // A funded dream stays funded — no double trophies, no amnesia.
            dreamReached: t.dreamReached,
            dreamReachedWeek: t.dreamReachedWeek,
            epilogueSent: t.epilogueSent,
          };
          comebackNotes.push(
            makeClientNote(t.id, t.name, nextWeek, barkLine(t.id, 'comeback', { advisor: state.advisorName, crashes: rel.crashes, contracts: rel.contracts }))
          );
        }
        ticked[t.id] = t;
      });
      // Carry this week's ending prices over to become next week's start prices.
      const nextStartPrices = initializeWeekPrices(carryOverPrices(state.weekEndPrices), nextWeek);
      // Clients may text you a buy/add request for the new week.
      const newMessages = generateClientMessages(
        nextWeek,
        Object.values(ticked).filter((c) => c.status === 'signed')
      );
      newMessages.push(...comebackNotes);

      // Once a year — week 51 of the fiscal calendar — clients send holiday
      // texts. Pure warmth, zero mechanics: the roster feels alive in December.
      if (nextWeek % 52 === 51) {
        Object.values(ticked)
          .filter((c) => c.status === 'signed')
          .forEach((c) => {
            if (Math.random() < 0.75) {
              const r = c.relationship ?? freshRelationship();
              newMessages.push(
                makeClientNote(c.id, c.name, nextWeek, barkLine(c.id, 'holiday', { advisor: state.advisorName, crashes: r.crashes, contracts: r.contracts }))
              );
            }
          });
      }

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
