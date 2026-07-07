# The Advisor · `ALPHA v0.1.0`

*A tiny, morally flexible Wall Street. Read the news before it happens. Fund
their dreams — or gamble them away.*

A boutique **investment-firm management sim** that runs entirely in the browser.
You're a financial advisor with a pixel-art operations desk, a market terminal,
and a phone that won't stop buzzing. Every week you scan ambiguous headlines,
guess which stocks they'll move, and rebalance your clients' portfolios before
the market resolves. Your clients aren't spreadsheets — Alex is saving for a
food truck, Sarah wants a year with her daughter, and Marcus mostly wants to
bury his rival. Grow their money and they'll text you their gratitude. Lose it
and you'll get the breakup text that names exactly what you destroyed.

Built with **React Native (Web) + Expo + TypeScript** and zero external runtime
UI libraries — every meter, chart, window, and pixel character is hand-built
from `View`s. **100% client-side:** no account, no server, no database. Your
firm autosaves to your browser's Local Storage; close the tab and click
**Continue** later.

## The loop

1. **Read the news.** ~90 authored headlines of varying reliability break each
   week. Rumors, scoops, filler — interpreting them is the core skill.
2. **Work the book.** Sign clients (up to 3–4 concurrent 8-week contracts),
   trade their brokerage accounts, honor their risk preferences, answer their
   phone requests.
3. **End the week.** Prices resolve from market drift + economic regime + your
   news calls (and the occasional black-swan crash). Happiness, reputation,
   fees, and contract grades all settle at once. Then do it again — the summary
   always ends on a cliffhanger.

## Systems under the hood

- **A 15-person handcrafted roster** across 4 tiers — every career randomly
  deals 8 of them, each with a dream, a flaw, and a voice you'll recognize
  before reading the name; relationships deepen across contracts, clients
  remember crashes and firings, and fired clients eventually come back.
- **Operations dashboard** desktop: client triage, market snapshot, firm status,
  weekly priorities, and a news desk — all live before you open a single window.
- **Contract report cards** (S–D grades) with completion bonuses and testimonials.
- **Advisor economy & shop**: signing fees, returns fees, upgrades (news
  terminal, assistant, a helpful politician named Bill).
- **Economic cycles** (boom / stable / downturn) and **14 black-swan crash
  flavors** with sector fingerprints, scaled by portfolio beta — bonds rally
  when the world burns.
- **Career seasons**: a YEAR IN REVIEW every 52 weeks, career titles from
  Associate to Legend of the Street, 20 achievements, a record book, and a
  trophy shelf of funded dreams on your desk.
- **Light/dark pixel theme**, robust autosave, and a title screen that
  remembers you.

## Controls

Desktop, mouse-driven. Click a dashboard panel to open its application window;
click the **✕** to close it. **NEXT WEEK** (bottom-right) resolves the week.
Everything is point-and-click — no keyboard required. The interface scales to
fill 1366×768 up through 2560×1440.

## Tech stack

| | |
|---|---|
| Framework | React Native 0.74 + `react-native-web` |
| Tooling | Expo SDK 51, expo-router (file-based) |
| Language | TypeScript 5.3 (strict) |
| State | One `useReducer` + Context — the whole simulation |
| Persistence | Browser Local Storage (in-memory fallback) |
| Dependencies | Zero external UI/chart/state libraries |

## Getting started

```bash
npm install
npm run web        # dev server; also: npm start, then press w
npm run typecheck  # tsc --noEmit
```

Requires Node 18+ and the [Expo CLI](https://docs.expo.dev/get-started/installation/).

## Production build

```bash
npm run build      # expo export -p web  →  static site in ./dist
```

The output in `dist/` is a fully static bundle (HTML/JS/CSS/assets) with no
server component and no runtime configuration.

## Deployment (Vercel)

The repo is Vercel-ready — no manual setup. `vercel.json` pins the build:

```json
{ "buildCommand": "npx expo export -p web", "outputDirectory": "dist" }
```

1. Push to GitHub.
2. Import the repo in Vercel (framework preset: **Other** — `vercel.json` handles
   the rest).
3. Deploy. Unknown routes rewrite to `index.html`, so a browser refresh always
   resolves and the game restores from Local Storage.

Any static host works too (Netlify, GitHub Pages, Cloudflare Pages): build, then
serve `dist/` with an SPA fallback to `index.html`.

## Save system

- **Autosave** fires on every state change once a game is under way (toggleable
  in Settings). No manual save needed.
- **Continue / New Game** are chosen on the title screen based on whether a save
  exists. New Game asks for confirmation before overwriting.
- **Recovery:** if the save is missing, corrupted, or from an incompatible older
  version, the game never crashes — the title screen surfaces the problem and
  offers *Delete Save & Start Fresh*.

## Project structure

```
src/
  app/                     # expo-router routes (index → title, (game)/WeekScreen)
  screens/                 # title, desk (WeekScreen), windows, day phases
  components/              # PixelWindow, pixel characters, meters, modals
  contexts/ThemeContext    # light/dark palette + cached styles
  state/GameContext.tsx    # single reducer: the entire game simulation + saves
  data/                    # GAME LOGIC — stocks, clients, news, prices,
                           # contracts, economy, black swans, regimes, records,
                           # achievements, client voices, settings, persistence
  styles/  utils/  version.ts
vercel.json                # one-click deploy config
```

Game logic lives in `src/data` and `src/state`; everything the player sees lives
in `src/screens` and `src/components`.

## Roadmap

- **Phase 1 (this alpha):** stable client-side game, local saves, clean deploy. ✅
- **Next:** audio pass, tutorial/onboarding, more content (clients, events,
  scenarios), daily-seeded challenge.
- **Later:** optional accounts + cloud save, achievements sync, leaderboards.
  The save layer is isolated (`data/persist.ts`, `data/settings.ts`) so a cloud
  backend can slot in without touching gameplay.

---

Design notes live in `PROJECT_CONTEXT.md` (architecture), `GAME_DESIGN_AUDIT.md`,
`CREATIVE_DIRECTION.md`, and `PUBLISHER_REVIEW.md`.
