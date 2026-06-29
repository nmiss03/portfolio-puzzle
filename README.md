# Portfolio Puzzle 📊

A portfolio rebalancing puzzle game built with **React Native + Expo + TypeScript**
and **expo-router** (file-based navigation). You play the role of a financial
advisor: read each client's profile, study the available stocks, and build the
asset allocation that best fits their situation. Match the ideal allocation to
score 100.

This repo contains **Level 1 of 3**, fully playable. Levels 2 & 3 appear in the
level picker as a locked roadmap.

## Gameplay

1. **Level Select** – pick a level (Level 1 is unlocked).
2. **Client Profile** – read the client's age, income, dependents, risk
   tolerance, time horizon, and goal.
3. **Stock Dashboard** – browse 10 instruments with price, sector, P/E, dividend
   yield, and volatility.
4. **Build the Portfolio** – allocate a percentage to each stock; the total must
   equal exactly 100%.
5. **Results** – get a 0–100 score, see your mix vs. the ideal, and read coaching
   feedback ("too aggressive", "needs more growth", etc.).

### Level 1 — *The Young Saver*
A 25-year-old earning $60k, no dependents, high risk tolerance, 40-year horizon.
The right answer is an aggressive, growth-tilted portfolio with a small bond
cushion: **~80% stocks (growth-heavy) / ~20% bonds**.

## Running it

```bash
npm install
npm start          # then press i (iOS), a (Android), or w (web)
npm run typecheck  # tsc --noEmit
```

Requires the [Expo CLI / Expo Go](https://docs.expo.dev/get-started/installation/).
Uses only React Native's built-in components — no external UI libraries.

## Project structure

```
src/
  app/                    # expo-router routes (file-based navigation)
    _layout.tsx           # Stack navigator + GameProvider
    index.tsx             # -> LevelSelect
    profile.tsx           # -> CustomerProfile
    stocks.tsx            # -> StockDashboard
    allocate.tsx          # -> AllocationUI
    result.tsx            # -> ResultScreen
  screens/                # screen implementations
  state/GameContext.tsx   # shared level / allocation / result state
  data/
    stocks.ts             # 10 hardcoded instruments (+ types)
    levels.ts             # customer profiles + ideal allocations
    scoring.ts            # allocation -> 0-100 score + feedback
  components/             # Button, Badge, StockCard, AllocationRow, ...
  utils/format.ts         # price / % / volatility formatting helpers
  theme.ts                # colors, spacing, fonts
```

## Scoring

The player allocates per-stock; those weights roll up into three categories
(**growth / dividend / bond**). The score is the *overlap* between the player's
category mix and the level's ideal mix:

```
score = Σ min(player[category], ideal[category])      # 0–100, 100 = perfect
```

Feedback is generated from the stocks-vs-bonds split and the growth tilt, so the
game can tell you when you're "too aggressive", "too conservative", or "need more
growth".
