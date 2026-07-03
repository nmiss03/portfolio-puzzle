// Economic cycles: the market rotates through regimes. In an EXPANSION,
// high-beta growth names get a weekly tailwind proportional to beta; in a
// DOWNTURN they get a headwind while low-beta defensives and bonds hold up or
// gain (flight to quality). STEADY periods have no tilt — just normal drift.

import STOCKS from './stocks';
import { PriceMap } from './priceUpdates';

export type Regime = 'expansion' | 'steady' | 'downturn';

export interface RegimeState {
  regime: Regime;
  weeksRemaining: number;
}

function dur(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

export function initialRegime(): RegimeState {
  return { regime: 'steady', weeksRemaining: dur(3, 5) };
}

// Roll the next regime when the current one expires.
export function nextRegime(current: Regime): RegimeState {
  const r = Math.random();
  if (current === 'steady') {
    return r < 0.5
      ? { regime: 'expansion', weeksRemaining: dur(5, 8) }
      : { regime: 'downturn', weeksRemaining: dur(4, 6) };
  }
  if (current === 'expansion') {
    return r < 0.6
      ? { regime: 'steady', weeksRemaining: dur(3, 5) }
      : { regime: 'downturn', weeksRemaining: dur(4, 6) };
  }
  // downturn
  return r < 0.7
    ? { regime: 'steady', weeksRemaining: dur(3, 5) }
    : { regime: 'expansion', weeksRemaining: dur(5, 8) };
}

// Weekly per-stock tilt for the active regime, scaled by beta. In a downturn,
// bonds rally and sub-0.8-beta defensives get a small cushion — so defensive
// stocks noticeably outperform high-beta names, and vice versa in expansions.
export function regimeTilt(regime: Regime): PriceMap {
  const tilt: PriceMap = {};
  if (regime === 'steady') return tilt;

  if (regime === 'expansion') {
    const base = 0.006 + Math.random() * 0.006; // +0.6%..+1.2% per beta unit
    STOCKS.forEach((s) => {
      tilt[s.id] = s.assetClass === 'bond' ? -0.001 : base * s.beta;
    });
  } else {
    const base = -(0.008 + Math.random() * 0.007); // -0.8%..-1.5% per beta unit
    STOCKS.forEach((s) => {
      if (s.assetClass === 'bond') tilt[s.id] = 0.003 + Math.random() * 0.003;
      else tilt[s.id] = base * s.beta + (s.beta < 0.8 ? 0.004 : 0);
    });
  }
  return tilt;
}

export const REGIME_LABEL: Record<Regime, string> = {
  expansion: 'EXPANSION ▲',
  steady: 'STEADY —',
  downturn: 'DOWNTURN ▼',
};

// Multiple flavor lines per regime so the market has moods, not just labels.
// Picked deterministically by week, so the same summary re-renders stably but
// consecutive weeks in the same regime read differently.
const REGIME_BLURBS: Record<Regime, string[]> = {
  expansion: [
    'Risk appetite is high — high-beta growth names have a tailwind.',
    'Greed is doing the talking this week. Everything speculative catches a bid; everything careful gets called boring.',
    'Optimism everywhere: analysts raising targets, taxi drivers sharing tips. High-beta names love it. Veterans get quietly nervous.',
    'The melt-up mood continues. Money is rotating out of safety and into stories.',
    'Champagne conditions — growth stocks sprint, bonds sulk, and nobody wants to be the first to sell.',
    'Animal spirits are loose. The market is paying up for promises and discounting nothing.',
  ],
  steady: [
    'Calm markets — no cyclical tilt this week.',
    'A quiet tape. Prices drift on their own merits; no macro wind at anyone\'s back.',
    'Sideways and sleepy — the kind of week where discipline earns its keep unnoticed.',
    'The market is waiting for a reason. Until it finds one, fundamentals do the driving.',
    'Caution without fear: volumes thin, moves small, everyone watching everyone else.',
    'An uneventful stretch. Enjoy it — the market rarely stays polite for long.',
  ],
  downturn: [
    'Investors are defensive — high-beta names face a headwind while bonds and low-beta stocks hold up.',
    'Fear has the microphone. Rallies get sold, dips get worse, and cash suddenly has many admirers.',
    'Risk is being rationed. Speculative names bleed while boring, dividend-paying ballast quietly outperforms.',
    'The mood is grim — every bounce is greeted with suspicion, every headline read twice.',
    'De-risking continues: portfolios are hiding in bonds and utilities until the sky stops looking like that.',
    'Capitulation watch. The optimists have gone quiet, which is usually when it gets interesting.',
  ],
};

// Kept for compatibility: the first (canonical) blurb per regime.
export const REGIME_BLURB: Record<Regime, string> = {
  expansion: REGIME_BLURBS.expansion[0],
  steady: REGIME_BLURBS.steady[0],
  downturn: REGIME_BLURBS.downturn[0],
};

// Week-seeded pick: stable within a week, varied across a regime's run.
export function regimeBlurb(regime: Regime, week: number): string {
  const pool = REGIME_BLURBS[regime];
  return pool[week % pool.length];
}
