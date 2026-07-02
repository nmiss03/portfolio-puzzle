// Exclusive scoops — only News Terminal owners see these BEFORE the week
// resolves. Their price impact applies to the market either way; non-owners
// only learn why a stock moved from the week summary afterwards. Rarer than
// regular news and roughly 1.1x as impactful, in three tiers.

import type { NewsArticle } from './newsArticles';
import { stocksById } from './stocks';

// Same bond cap as regular news (kept local — newsArticles runtime-imports
// this module, so importing back from it would create a cycle).
const BOND_CAP = 0.05;
function capBond(stockId: string, impact: number): number {
  if (stocksById[stockId]?.assetClass !== 'bond') return impact;
  return Math.max(-BOND_CAP, Math.min(BOND_CAP, impact));
}

// |max impact| bands per exclusive tier (≈ regular bands x 1.1, tier 3 on top).
const EXCLUSIVE_BANDS: Record<1 | 2 | 3, [number, number]> = {
  1: [0.033, 0.077], // moderate-plus
  2: [0.1, 0.176], // major-plus
  3: [0.17, 0.22], // market-shaking
};

const EXCLUSIVE_CHANCE = 0.3; // ~ once every 3-4 weeks

interface ExclusiveSeed {
  id: string;
  headline: string;
  articleText: string;
  affects: string[];
  priceImpact: Record<string, number>; // relative shape; rescaled to tier band
}

const EXCLUSIVE_POOL: ExclusiveSeed[] = [
  { id: 'ex-tc-buyback', headline: 'LEAK: TechCorp Board Quietly Approves Massive Buyback', articleText: 'Sources close to the board say TechCorp has authorized a buyback far larger than the street expects. Announcement due within days.', affects: ['tc'], priceImpact: { tc: 0.1, si: 0.02 } },
  { id: 'ex-bh-data', headline: 'SCOOP: BioHealth Trial Data Beats Every Endpoint', articleText: 'Unreleased Phase 3 data reviewed by our terminal shows results well above consensus. Formal release next week.', affects: ['bh'], priceImpact: { bh: 0.12, pt: 0.03, hp: 0.03 } },
  { id: 'ex-ff-writedown', headline: 'EXCLUSIVE: FinanceFirst Sitting on Undisclosed Loan Losses', articleText: 'Internal memos point to a portfolio of soured commercial loans that has not yet hit the balance sheet.', affects: ['ff'], priceImpact: { ff: -0.1, fn: -0.02 } },
  { id: 'ex-em-field', headline: 'TERMINAL FLASH: EnergyMax Discovers Major New Field', articleText: 'Survey crews have confirmed a significant offshore discovery. Reserves could rise double digits.', affects: ['em'], priceImpact: { em: 0.11, et: 0.03 } },
  { id: 'ex-rd-takeover', headline: 'WHISPER: RetailDisrupt Takeover Talks Under Way', articleText: 'Two strategic buyers are circling RetailDisrupt at a substantial premium, per people familiar.', affects: ['rd'], priceImpact: { rd: 0.14, cg: -0.02 } },
  { id: 'ex-csd-contract', headline: 'LEAK: CyberSecurityDefense Set to Win Pentagon Mega-Contract', articleText: 'Procurement insiders say the award decision is done — announcement pending.', affects: ['csd'], priceImpact: { csd: 0.12, as: 0.03 } },
  { id: 'ex-fn-probe', headline: 'EXCLUSIVE: Regulators Preparing Enforcement Action Against FinTechNow', articleText: 'A coordinated enforcement package is being drafted. Fines and growth restrictions on the table.', affects: ['fn'], priceImpact: { fn: -0.13, ff: 0.02 } },
  { id: 'ex-ce-grid', headline: 'SCOOP: CleanEnergy Lands Nationwide Grid-Storage Deal', articleText: 'A multi-state storage rollout worth billions is in final signatures.', affects: ['ce'], priceImpact: { ce: 0.13, pgm: 0.03 } },
  { id: 'ex-mc-nationalize', headline: 'TERMINAL FLASH: Foreign Government Moves on MineralCorp Assets', articleText: 'Draft legislation would sharply raise royalties on MineralCorp\'s flagship deposits.', affects: ['mc'], priceImpact: { mc: -0.12, ce: -0.02 } },
  { id: 'ex-rate-shock', headline: 'LEAK: Central Bank Preparing Surprise Rate Move', articleText: 'An unscheduled policy adjustment is being war-gamed for the coming week, insiders say.', affects: ['bs', 'bgy', 'rr'], priceImpact: { bs: 0.05, bgy: 0.05, rr: 0.06, us: 0.04, ff: 0.03 } },
  { id: 'ex-si-fab', headline: 'EXCLUSIVE: SemiconductorIntel Fab Yields Collapse on New Node', articleText: 'Yield data leaked from the flagship fab is far below plan; guidance cut likely.', affects: ['si'], priceImpact: { si: -0.11, tc: -0.02, csd: -0.02 } },
  { id: 'ex-hp-partner', headline: 'SCOOP: HealthcarePharma Nearing Big-Pharma Licensing Deal', articleText: 'A top-5 pharma is finalizing a licensing deal that would fund the entire pipeline.', affects: ['hp'], priceImpact: { hp: 0.13, bh: 0.02 } },
];

function rollTier(): 1 | 2 | 3 {
  const r = Math.random();
  if (r < 0.5) return 1;
  if (r < 0.85) return 2;
  return 3;
}

// Maybe produce one exclusive article for the week (~30% of weeks).
export function maybeExclusiveArticle(week: number): NewsArticle | null {
  if (Math.random() > EXCLUSIVE_CHANCE) return null;
  const seed = EXCLUSIVE_POOL[Math.floor(Math.random() * EXCLUSIVE_POOL.length)];
  const tier = rollTier();
  const [lo, hi] = EXCLUSIVE_BANDS[tier];
  const target = lo + Math.random() * (hi - lo);
  const maxAbs = Math.max(...Object.values(seed.priceImpact).map(Math.abs), 1e-9);
  const f = target / maxAbs;
  const priceImpact: Record<string, number> = {};
  Object.entries(seed.priceImpact).forEach(([id, v]) => {
    priceImpact[id] = capBond(id, Math.round(v * f * 10000) / 10000);
  });
  return {
    id: `${seed.id}-w${week}`,
    headline: seed.headline,
    category: 'Specific Stock',
    affects: seed.affects,
    secondaryAffects: [],
    impactType: 'market shift',
    priceImpact,
    publicationDate: `Week ${week}`,
    articleText: seed.articleText,
    source: 'Bloomberg',
    exclusive: true,
    exclusiveTier: tier,
  };
}
