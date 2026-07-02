# GAME_DESIGN_AUDIT.md

> Lead Game Designer / Creative Director audit of **Portfolio Puzzle**.
> Goal alignment: the selling point is **"I cannot stop playing one more week"** —
> not finance. Every judgment below is measured against that.
> Companion to `PROJECT_CONTEXT.md` (technical source of truth).
> Audit date: Week of commit `3583668`. Changes marked ✅ were implemented with this audit.

---

## 1. Executive Summary

The systems are genuinely good. The *game* around them is underdeveloped.

Portfolio Puzzle already has what most tycoon prototypes never achieve: layered systems
that interact (beta × regimes × news × tiers × concentration), persistent consequences,
an upgrade tree that changes *how you play* rather than adding stats, and a weekly
resolve that is structurally a slot-machine pull. The bones of an addictive loop exist.

What's missing is **the emotional architecture around those systems**. The most
important moment of the game (the week-end reveal) is delivered as an accountant's
report. The natural chapter boundary (a contract ending) is a silent status change in a
submenu. The life-or-death meter (happiness) is a black box, so failure feels arbitrary
instead of instructive. There is nothing explicitly pulling the player toward the next
week except the absence of a reason to stop. And one design-level failure state exists:
the client roster can shrink to zero with no recovery, leaving the player in a dead
game that never ends.

Verdict: **do not build new systems.** Spend the next phase making the existing loop
*legible, dramatic, and goal-driven*. Seven surgical changes (implemented alongside
this audit) address the worst gaps; the roadmap below sequences the rest.

---

## 2. Biggest Strengths (protect these)

1. **Hidden-impact news you interpret yourself.** The single best design decision in
   the game. It converts reading into gambling-with-skill. Never show impact numbers
   pre-resolve.
2. **Persistence everywhere.** Prices, holdings, cost basis, reputation, fees. Decisions
   compound; the world feels continuous. This is the foundation of long-session play.
3. **Capability upgrades, not stat upgrades.** Assistant (+1 client), News Terminal
   (foresight), Political Funding (edge with flavor). Each changes the shape of a turn.
4. **The beta/defensive axis is real strategy.** Regimes and black swans make "boring"
   assets genuinely valuable sometimes. The game quietly teaches risk management.
5. **The diegetic frame.** Desk, PC, phone, newspaper, shop. Menus feel like *places*.
   Cheap to extend, high charm-per-pixel.
6. **Turn-based weeks at 1–3 minutes.** Perfect mobile session grain.
7. **Two-currency economy** (client capital vs. advisor balance) — clean mental model,
   no confusion once seen.

## 3. Biggest Weaknesses

1. **Roster deadlock (design-breaking).** Fired/dismissed clients never return;
   `availableClients` only includes `unsigned`. Lose Alex at rep < 27 and the game is
   *unwinnable and unlosable forever* — zero clients, zero rep sources, no game over.
   ✅ Fixed: fired clients reconsider after 8 weeks, dismissed after 4.
2. **The reveal is buried.** Anticipation → resolve is the dopamine spine, and it's
   split across a slow fixed animation and a dense 7-card summary. No single "moment."
3. **Happiness is illegible.** The game computes exactly why a client's mood moved and
   tells the player none of it. Punishment without explanation reads as unfairness —
   the #1 uninstall trigger in management games. ✅ Fixed: per-factor breakdown.
4. **No goal gradient.** Nothing on screen says what you're working toward. Rep
   thresholds and shop prices exist but are hidden in menus. ✅ Fixed: goal ticker.
5. **Contract end is a non-event.** Eight weeks of work concludes with a grayed-out
   card. No grade, no payoff, no ceremony. ✅ Fixed: report card + bonus.
6. **The allocation game requires mental spreadsheet math.** Clients judge your
   stock/bond split, but no screen shows your current split. Interpretation challenge
   is good; arithmetic homework is not. ✅ Fixed: portfolio mix meter.
7. **Fixed ceremony time.** ~6–10s of unskippable animation per week is fine at week 3
   and rage-inducing at week 60. ✅ Fixed: tap-to-skip transition.
8. **Marcus is a chore.** ±5% tolerance + weekly drift = mandatory fiddly rebalancing
   every single week. Demanding should mean *tense*, not *tedious*. ✅ Eased to ±7%.
9. **Buying friction.** 22 paginated cards, typed share counts, no cost preview.
   Acceptable, not delightful. (Roadmap: quick-buy chips.)
10. **Skill is never celebrated.** Correctly reading a headline produces no personal
    feedback ("your TechCorp call made Sarah +$410"). The core skill loop lacks a
    reward voice. (Roadmap.)

---

## 4. Top 25 Gameplay Improvements (ranked by impact)

| # | Improvement | Why it matters | Status |
|---|---|---|---|
| 1 | Fired/dismissed clients return after a cooldown | Removes the dead-game soft-lock; makes firing a wound, not an amputation | ✅ shipped |
| 2 | Contract report card: grade + completion bonus + rep | Creates the chapter-end beat; pays the 8-week arc off | ✅ shipped |
| 3 | Happiness factor breakdown (transition + client detail) | Converts arbitrary punishment into learnable feedback | ✅ shipped |
| 4 | Portfolio mix meter (stocks/bonds/cash) in builder & detail | Removes spreadsheet math; keeps target hidden | ✅ shipped |
| 5 | Next-goal ticker on the dashboard | Installs the goal gradient; the "one more week" pull | ✅ shipped |
| 6 | Tap-to-skip week transition | Respects the player's 60th week as much as their 3rd | ✅ shipped |
| 7 | Marcus tolerance ±5% → ±7% | Demanding without weekly busywork | ✅ shipped |
| 8 | Unify transition+summary into one dramatized reveal sequence | One peak moment instead of two diluted ones | roadmap |
| 9 | Desk glanceability: client faces w/ mood on the dashboard | Status cockpit; see trouble without opening menus | roadmap |
| 10 | "Your call paid off" — per-holding news attribution | Celebrates the core skill (reading headlines) | roadmap |
| 11 | Records & streaks (best week, green streak, firm milestones) | Cheap dopamine + bragging numbers | roadmap |
| 12 | Quick-buy chips (25% / 50% of cash, $-amount) + cost preview | Cuts the worst input friction | roadmap |
| 13 | Drift warning chip ("Sarah's mix drifted") in Client Book | Turns hidden decay into a visible to-do | roadmap |
| 14 | Insider tips carry scandal risk (small chance: −rep event) | Political Funding needs a downside to be a decision | roadmap |
| 15 | Client barks reacting to results (2–3 lines each mood) | Characters > spreadsheets; emotional stakes | roadmap |
| 16 | Week-1 nudge: Alex names two tickers in dialogue | Softens 22-stock choice paralysis without rails | roadmap |
| 17 | Weekly micro-objective ("beat +0.8% avg this week") | Optional short-loop goal for tuned players | roadmap |
| 18 | 2–3 more shop upgrades (risk report, auto-rebalancer) | Extends the economy sink past week ~30 | roadmap |
| 19 | Renewal negotiation (client offers new fee terms by grade) | Makes renewals a decision, links to report card | roadmap |
| 20 | Sparklines on stock cards (history already tracked!) | Free depth from existing data | roadmap |
| 21 | Regime forecast as a purchasable edge | Another capability upgrade; macro play deepens | roadmap |
| 22 | Sound: reveal sting, buy click, contract fanfare | Feel multiplier on every existing beat | roadmap |
| 23 | Achievement toasts (first $1k fee, survive a swan…) | Session punctuation, retention | roadmap |
| 24 | First-session contextual hints (3–4 one-time tooltips) | Onboarding without a tutorial | roadmap |
| 25 | Scenario seeds ("Survive the '08 opening") | Replayability / content pipeline for later | roadmap |

## 5. Do NOT change

- Hidden news impacts & hidden allocation targets/tolerances (the interpretation game).
- Week-end-only resolution (no real-time prices). It IS the slot machine.
- Persistence of prices/holdings/reputation.
- Turn length (~1–3 min/week) and the phase state machine.
- The two-currency economy split.
- Capability-based upgrade design.
- The diegetic desk/PC/phone frame and boxy pixel aesthetic.
- The zero-dependency architecture constraint.

## 6. Simplify

- Marcus's rebalance cadence (✅ ±7%).
- Week ceremony time (✅ skippable).
- Allocation arithmetic (✅ mix meter shows the split; the *target* stays fuzzy).
- Eventually: merge WeekTransition + WeekSummary into one screen (roadmap #8).
- Summary price list was already cut to movers+holdings — keep pruning toward "what
  changed that affects *you*."

## 7. Expand

- The **contract arc** (✅ report card now; later: renegotiation, testimonials).
- The **cast**: political tier, and eventually 2–3 clients *per* tier so a lost client
  isn't a lost tier.
- **News→player feedback** (#10) and **news variety** (sector-wide storylines).
- The **shop** past week 30 (#18, #21).
- **Moments**: records, achievements, barks, sound (feel layer, not systems).

---

## 8. Onboarding Redesign (progression roadmap)

Philosophy: **teach by consequence, never by modal.** The systems reveal themselves in
the summary screen; the game's job is to make each revelation legible the first time it
happens (factor labels, attribution ribbons — now present). No tutorial screens.

- **Week 1 — One client, one decision.** Only Alex is available (rep 22 vs threshold
  20 — already true). Player learns: sign → buy → NEXT WEEK → reveal. The goal ticker
  shows "Jamie signs at 27 REP," installing the first medium goal immediately.
  *Hidden:* everything else. Shop exists but is aspirational window-shopping.
- **Week 2–4 — The feedback loop.** First happiness factors appear ("money sitting
  idle," "wrong mix"); first phone request (~50% by week 3) teaches the phone; first
  regime label change teaches macro. Player learns the mix meter ↔ client style link.
- **Week 5–8 — First arc payoff.** Jamie unlocks (~wk 4–6 with decent play). Week 8:
  **first contract report card** — grade, bonus, renewal decision. This is the moment
  the player understands the game is about *arcs*, not weeks.
- **Week 10–15 — The economy turns on.** Assistant affordable (~$800) → 3–4 clients →
  juggling begins. First downturn regime has probably punished a high-beta portfolio
  by now; the defensive lesson lands via a happiness factor, not a lecture.
- **Week 15–20 — The first black swan.** The designed trauma event. If the player
  learned diversification, it's a war story; if not, it's the lesson. Terminal
  (~$1.5k) becomes reachable soon after — foresight as the answer to trauma.
- **Week 20–40 — Mastery loop.** Sarah/Marcus (rep 34/40) demand precision; exclusive
  scoops create "I knew before the market" highs; Political Funding (~$6k) becomes the
  long-save goal. Second swan hits a prepared player.
- **Week 40–80 — Endgame (current content ceiling).** All upgrades owned; play becomes
  optimization + survival streaks. This is where roadmap items #11/#18/#19/#25 must
  eventually land; today the honest ceiling is ~week 50–60.

**Never show directly:** news price impacts before resolve; exact allocation targets or
tolerance bands; regime tilt magnitudes; black-swan schedule; insider tip magnitudes.
**Always show:** *consequences* with causes attached (factors, attribution, grades).

## 9. UI Flow Notes (per screen)

- **Title/NewGameIntro:** good; the walk-in + naming builds ownership. Keep.
- **Desk dashboard:** charming but a *blank* cockpit — the goal ticker (✅) is step one;
  client mood faces (#9) are step two. NEXT WEEK on the desk is correct and readable.
- **Client Book:** solid hierarchy. Fee lines (added earlier) sell the economy. Add
  drift warnings (#13) later.
- **PortfolioBuilder:** the mix meter (✅) fixes its worst gap; quick-buy chips (#12)
  next. The 22-page ribbon is tolerable because of the sector filter.
- **Stock Terminal (analysis mode):** currently redundant with the builder. Roadmap:
  make it the *research* home (sparklines #20, 52wk context) or fold it away.
- **News popup:** excellent. Exclusive badges + preview tab give the terminal upgrade a
  visible identity.
- **Phone:** good; insider styling distinct. "Concerns {stock}" line is load-bearing.
- **WeekTransition:** now skippable (✅) and shows *why* moods moved (✅).
- **WeekSummary:** the contract report card (✅) now leads; long-term this screen and
  the transition should merge into one reveal sequence (#8).
- **Shop:** clear. FINANCES tab is a quiet retention win (watching averages).
- **Settings:** fine.

## 10–12. Weekly Gameplay / Retention / "One More Week"

The loop each week must produce, in order: **curiosity** (news/phone badge) → **agency**
(a decision worth making) → **anticipation** (NEXT WEEK press) → **reveal** (prices,
P/L) → **consequence** (moods with reasons, rep) → **pull** (goal ticker delta, teased
next beat). The shipped changes complete this chain for the first time: factors make
consequences legible, the report card creates arc payoffs, the ticker quantifies the
pull, and skip keeps the cadence fast. The biggest remaining retention lever is #8 (one
dramatized reveal) and #9 (glanceable trouble), then the feel layer (#10/#11/#15/#22).

## 13. Implementation Roadmap

- **Phase 1 (this commit ✅):** deadlock fix · report cards + bonuses · happiness
  factors · mix meter · goal ticker · skippable transition · Marcus ±7%.
- **Phase 2 (next):** unified reveal sequence (#8) · desk mood faces (#9) · quick-buy
  chips (#12) · drift warnings (#13) · news-call feedback (#10).
- **Phase 3:** records/achievements (#11/#23) · barks (#15) · insider risk (#14) ·
  week-1 nudge (#16) · onboarding hints (#24).
- **Phase 4 (content):** political tier · more upgrades (#18/#21) · renewal
  negotiation (#19) · sparklines (#20) · sound (#22) · scenarios (#25).
- **Continuous:** balance passes on fees/costs/regimes via simulation (see
  PROJECT_CONTEXT §12).

---

## Appendix: shipped changes in detail (Phase 1)

1. **Roster revival** — `RuntimeClient.returnsAtWeek`; firing sets `+8` weeks,
   dismissal `+4`. On `ADVANCE_WEEK`, cooled-down clients re-enter the pool fresh
   (`initRuntimeClient`), gated as always by reputation. Fired card shows when they'll
   reconsider. Old saves: previously-fired clients simply stay gone (no regression).
2. **Contract report card** — final contract week (remaining === 1, not fired) grades
   the arc in `contractSystem.gradeContract` (all-time % + happiness → S/A/B/C/D),
   pays a tier×grade completion bonus to the advisor balance (ledger entry), grants
   +2/+1 rep for S–A/B, and renders a gold "CONTRACT COMPLETE" card atop the summary.
3. **Happiness legibility** — `scoring.weeklyHappinessBreakdown()` returns
   `{delta, factors[]}` (single source of truth; the old delta fn delegates to it).
   The reducer appends phone-request factors, stores `lastHappinessFactors` on the
   client, surfaces the top factors in WeekTransition and the full list in ClientDetail.
4. **Mix meter** — new `components/MixBar.tsx` (stocks/bonds/cash segmented bar,
   theme-reactive); shown in the tradable PortfolioBuilder and ClientDetail. Targets
   remain hidden; only the *player's current* mix is revealed.
5. **Goal ticker** — dashboard banner: next locked client ("JAMIE SIGNS AT 27 REP —
   NOW 24") or, once all are unlocked, the next unaffordable upgrade ("SAVE $1,500 FOR
   NEWS TERMINAL — $460 SAVED").
6. **Skippable transition** — tap anywhere on WeekTransition to complete the count-up
   instantly.
7. **Marcus ±5% → ±7%** (`clients.ts` + `clientTiers.ts` tier 4).
