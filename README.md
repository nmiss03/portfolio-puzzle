# Portfolio Puzzle

*A tiny, morally flexible Wall Street. Read the news before it happens. Fund
their dreams — or gamble them away.*

You're a financial advisor with a pixel-art desk, an aging PC, and a phone that
won't stop buzzing. Every week you scan ambiguous headlines, guess which stocks
they'll move, and rebalance your clients' portfolios before the market resolves.
Your clients aren't spreadsheets — Alex is saving for a food truck, Sarah wants
a year with her daughter, and Marcus mostly wants to bury his rival. Grow their
money and they'll text you their gratitude. Lose it and you'll get the breakup
text that names exactly what you destroyed.

Built with **React Native + Expo + TypeScript** and zero external runtime
libraries — every meter, chart, and pixel character is hand-built from `View`s.

## The loop

1. **Read the news.** 20–30 weekly headlines of varying reliability. Rumors,
   scoops, filler — interpreting them is the core skill.
2. **Work the book.** Sign clients (up to 3–4 concurrent 8-week contracts),
   trade their brokerage accounts, honor their risk preferences, answer their
   phone requests.
3. **End the week.** Prices resolve from market drift + economic regime + your
   news calls (and the occasional black swan crash). Happiness, reputation,
   fees, and contract grades all settle at once. Then do it again — the summary
   always ends on a cliffhanger.

## Systems under the hood

- **A 15-person handcrafted roster** across 4 tiers — every career randomly
  deals 8 of them, each with a dream, a flaw, and a voice you'll recognize
  before reading the name; relationships deepen across contracts, clients
  remember crashes and firings, and fired clients eventually come back
- **Contract report cards** (S–D grades) with completion bonuses and testimonials
- **Advisor economy & shop**: signing fees, returns fees, upgrades (news
  terminal, assistant, a helpful politician named Bill)
- **Economic cycles** (boom / stable / downturn) and **black swan crashes**
  scaled by portfolio beta — bonds rally when the world burns
- **Career seasons**: a YEAR IN REVIEW every 52 weeks, career titles from
  Associate to Legend of the Street, a record book (best week, green streaks,
  swans survived), and a trophy shelf of funded dreams on your desk
- **Light/dark pixel theme**, autosave, and a title screen that remembers you

## Running it

```bash
npm install
npm start          # then press i (iOS), a (Android), or w (web)
npm run typecheck  # tsc --noEmit
```

Requires the [Expo CLI / Expo Go](https://docs.expo.dev/get-started/installation/).

## Project structure

```
src/
  app/                     # expo-router routes
  screens/                 # title, desk (WeekScreen), summary, client book, ...
  state/GameContext.tsx    # single reducer: the entire game simulation
  data/                    # stocks, clients, news, prices, contracts, economy,
                           # black swans, regimes, records, client voices
  components/              # pixel characters, meters, charts, modals
  contexts/ThemeContext.tsx# light/dark palette + cached styles
```

`PROJECT_CONTEXT.md` documents the architecture in depth;
`GAME_DESIGN_AUDIT.md`, `CREATIVE_DIRECTION.md`, and `PUBLISHER_REVIEW.md`
track the design, emotional, and commercial roadmaps.
