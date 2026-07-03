// Pool of market-news articles. Headlines break every week with varying impact
// levels (minor/moderate/major); all impacts resolve at week-end.

import { maybeExclusiveArticle } from './exclusiveNews';
import { stocksById } from './stocks';

// Treasuries don't swing double digits on a headline. News impact on bond
// assets is capped so they stay the stable, defensive holdings they should be.
export const BOND_NEWS_CAP = 0.05;

export function capBondImpact(stockId: string, impact: number): number {
  if (stocksById[stockId]?.assetClass !== 'bond') return impact;
  return Math.max(-BOND_NEWS_CAP, Math.min(BOND_NEWS_CAP, impact));
}

export type NewsSource = 'Bloomberg' | 'Reuters' | 'CNBC' | 'WSJ';
export type NewsCategory = 'Industry' | 'Specific Stock';
export type ImpactType =
  | 'partnership' | 'new product' | 'lost client' | 'acquisition' | 'regulatory'
  | 'earnings beat' | 'lawsuit' | 'innovation' | 'market shift';

// How hard a headline hits the market. Minor stories barely move prices;
// major ones move them a lot. Rolled at generation time so the same headline
// can land with different weight on different weeks.
export type ImpactLevel = 'minor' | 'moderate' | 'major';

export interface NewsArticle {
  id: string;
  headline: string;
  category: NewsCategory;
  affects: string[];
  secondaryAffects: string[];
  impactType: ImpactType;
  priceImpact: Record<string, number>; // stockId -> fractional change
  publicationDate: string;
  articleText: string;
  source: NewsSource;
  impactLevel?: ImpactLevel; // set on generated copies
  exclusive?: boolean; // only visible pre-week to News Terminal owners
  exclusiveTier?: 1 | 2 | 3;
  insider?: boolean; // Politician Bill tip — never shown in the news feed
}

const ARTICLES: NewsArticle[] = [
  { id: 'ev-sales-surge', headline: 'Electric Vehicle Sales Hit Record 35% Market Share Globally', category: 'Industry', affects: ['ce', 'mc'], secondaryAffects: ['em', 'tc', 'as'], impactType: 'market shift', priceImpact: { ce: 0.12, mc: 0.1, em: 0.04, tc: 0.03, as: 0.05 }, publicationDate: 'Week 2, Day 3', source: 'Bloomberg', articleText: 'Global EV adoption surged to a record 35% of new-car sales, lifting lithium and clean-energy producers as battery demand climbs. Traditional oil faces mild headwinds even as related tech and aerospace suppliers benefit.' },
  { id: 'techcorp-google-partnership', headline: 'TechCorp Announces Strategic Partnership with Google Cloud', category: 'Specific Stock', affects: ['tc'], secondaryAffects: ['as', 'fn'], impactType: 'partnership', priceImpact: { tc: 0.14, as: 0.03, fn: 0.02 }, publicationDate: 'Week 1, Day 5', source: 'Reuters', articleText: 'TechCorp struck a landmark partnership making it the preferred cloud partner for large enterprises migrating to distributed architectures, expected to drive $500M+ in incremental revenue. Analysts call it a major competitive win.' },
  { id: 'financefirst-loses-client', headline: 'FinanceFirst Loses Major Institutional Client to JPMorgan', category: 'Specific Stock', affects: ['ff'], secondaryAffects: ['bs', 'fn'], impactType: 'lost client', priceImpact: { ff: -0.08, bs: -0.01, fn: 0.01 }, publicationDate: 'Week 2, Day 2', source: 'CNBC', articleText: 'A $40B pension fund moved its mandate to JPMorgan, costing FinanceFirst an estimated $200M in annual fees and stoking fears of further migrations. Its dividend remains secure given a fortress balance sheet.' },
  { id: 'biohealth-drug-approval', headline: "BioHealth's Diabetes Drug Receives FDA Approval Ahead of Schedule", category: 'Specific Stock', affects: ['bh'], secondaryAffects: ['pt'], impactType: 'regulatory', priceImpact: { bh: 0.18, pt: 0.04 }, publicationDate: 'Week 3, Day 1', source: 'WSJ', articleText: 'BioHealth won early FDA approval for BH-2847, projected to reach $2.5B in peak annual sales. The approval de-risks the pipeline and lifts sentiment across biotech.' },
  { id: 'agritech-acquires', headline: 'AgriTech Acquires RuralAI for $600 Million', category: 'Specific Stock', affects: ['at'], secondaryAffects: ['cg'], impactType: 'acquisition', priceImpact: { at: 0.07, cg: 0.01 }, publicationDate: 'Week 2, Day 4', source: 'Bloomberg', articleText: "AgriTech bought precision-farming startup RuralAI in an all-stock deal expected to add $150M in recurring revenue and accelerate its roadmap by 18 months. Integration risk remains." },
  { id: 'energy-transition-threat', headline: 'Study Warns Traditional Oil & Gas Faces Accelerated Decline', category: 'Industry', affects: ['em'], secondaryAffects: ['ce', 'mc'], impactType: 'market shift', priceImpact: { em: -0.09, ce: 0.04, mc: 0.05 }, publicationDate: 'Week 4, Day 2', source: 'Reuters', articleText: 'An MIT study projects oil demand falling 40% by 2040 on EV adoption and renewable cost declines. EnergyMax, with 85% oil revenue, faces particular pressure while renewables benefit.' },
  { id: 'cleanenergy-lawsuit', headline: 'CleanEnergy Faces Class-Action Over Environmental Claims', category: 'Specific Stock', affects: ['ce'], secondaryAffects: ['at', 'us'], impactType: 'lawsuit', priceImpact: { ce: -0.06, at: -0.01, us: 0.02 }, publicationDate: 'Week 1, Day 3', source: 'CNBC', articleText: 'A class action alleges misleading "zero-impact" marketing, with potential damages above $100M. Long-term renewable demand fundamentals are unchanged.' },
  { id: 'retaildisrupt-grocery', headline: 'RetailDisrupt Launches Grocery Delivery with 90-Minute Guarantee', category: 'Specific Stock', affects: ['rd'], secondaryAffects: ['cg'], impactType: 'new product', priceImpact: { rd: 0.11, cg: -0.03 }, publicationDate: 'Week 3, Day 3', source: 'WSJ', articleText: 'RetailDisrupt expanded into grocery delivery across 15 metros, a strategic move into higher-frequency essentials. Thin grocery margins raise execution risk, worrying incumbents.' },
  { id: 'utilitystable-earnings', headline: 'UtilityStable Reports Q4 Earnings Beat; Raises Dividend', category: 'Specific Stock', affects: ['us'], secondaryAffects: ['bs', 'ff'], impactType: 'earnings beat', priceImpact: { us: 0.05, bs: 0.02, ff: 0.02 }, publicationDate: 'Week 2, Day 1', source: 'Bloomberg', articleText: 'UtilityStable beat estimates and raised its dividend a 26th straight year, reaffirming 5-10% growth guidance. Defensive income names rallied in sympathy.' },
  { id: 'fintech-regulation', headline: 'SEC Proposes Stricter Consumer Rules for Fintech Banking', category: 'Industry', affects: ['fn'], secondaryAffects: ['ff'], impactType: 'regulatory', priceImpact: { fn: -0.12, ff: 0.05 }, publicationDate: 'Week 4, Day 1', source: 'Reuters', articleText: 'Proposed rules require higher reserves and faster claims resolution, costing fintechs $200M+ annually. Traditional banks with existing compliance gain an edge.' },

  { id: 'fed-rate-cut', headline: 'Federal Reserve Cuts Interest Rates by 0.5%', category: 'Industry', affects: ['bs', 'rr', 'us'], secondaryAffects: ['ff'], impactType: 'market shift', priceImpact: { bs: 0.05, rr: 0.06, us: 0.04, ff: 0.03 }, publicationDate: 'Week 1, Day 2', source: 'WSJ', articleText: 'The Fed delivered a larger-than-expected cut, boosting bonds, REITs, and dividend payers as borrowing costs fall.' },
  { id: 'inflation-hot', headline: 'Inflation Jumps to 4.2%, Hottest in Six Months', category: 'Industry', affects: ['bs', 'us', 'cg'], secondaryAffects: ['rr'], impactType: 'market shift', priceImpact: { bs: -0.04, us: -0.03, cg: -0.03, rr: -0.02 }, publicationDate: 'Week 3, Day 2', source: 'Bloomberg', articleText: 'A hotter inflation print pressured rate-sensitive bonds, utilities, and retail margins.' },
  { id: 'oil-spike', headline: 'Crude Oil Jumps 9% on Supply Fears', category: 'Industry', affects: ['em'], secondaryAffects: ['mc'], impactType: 'market shift', priceImpact: { em: 0.1, mc: 0.03 }, publicationDate: 'Week 2, Day 5', source: 'Reuters', articleText: 'Geopolitical tensions sent crude sharply higher, lifting producer margins and cash flow.' },
  { id: 'oil-glut', headline: 'Global Oil Glut Sends Prices to Two-Year Low', category: 'Industry', affects: ['em'], secondaryAffects: [], impactType: 'market shift', priceImpact: { em: -0.08 }, publicationDate: 'Week 4, Day 3', source: 'CNBC', articleText: 'Oversupply pushed crude to multi-year lows, squeezing producer revenue.' },
  { id: 'biohealth-trial-fail', headline: 'BioHealth Phase 3 Trial Misses Primary Endpoint', category: 'Specific Stock', affects: ['bh'], secondaryAffects: ['pt'], impactType: 'innovation', priceImpact: { bh: -0.15, pt: -0.03 }, publicationDate: 'Week 1, Day 4', source: 'WSJ', articleText: 'A key late-stage trial failed, erasing an expected revenue source and dampening biotech sentiment.' },
  { id: 'office-vacancy', headline: 'Commercial Office Vacancies Hit Record Highs', category: 'Industry', affects: ['rr'], secondaryAffects: [], impactType: 'market shift', priceImpact: { rr: -0.07 }, publicationDate: 'Week 2, Day 2', source: 'Bloomberg', articleText: 'Record vacancies cut REIT rental income, pressuring office-heavy portfolios.' },
  { id: 'retail-foot-traffic', headline: 'Suburban Retail Foot Traffic Rebounds Sharply', category: 'Industry', affects: ['rr', 'cg'], secondaryAffects: ['rd'], impactType: 'market shift', priceImpact: { rr: 0.05, cg: 0.04, rd: 0.02 }, publicationDate: 'Week 3, Day 4', source: 'CNBC', articleText: 'A rebound in shopping-center traffic lifted retail landlords and consumer names.' },
  { id: 'ai-spending-wave', headline: 'Enterprise AI Spending Wave Accelerates', category: 'Industry', affects: ['tc', 'as'], secondaryAffects: ['fn'], impactType: 'innovation', priceImpact: { tc: 0.09, as: 0.05, fn: 0.03 }, publicationDate: 'Week 2, Day 1', source: 'Reuters', articleText: 'A surge in enterprise AI budgets is driving demand for cloud and advanced-tech suppliers.' },
  { id: 'bank-capital-rules', headline: 'Regulators Propose Stricter Bank Capital Requirements', category: 'Industry', affects: ['ff', 'fn'], secondaryAffects: [], impactType: 'regulatory', priceImpact: { ff: -0.05, fn: -0.04 }, publicationDate: 'Week 4, Day 1', source: 'WSJ', articleText: 'Tougher capital rules would reduce lending capacity and returns across banking.' },
  { id: 'lithium-crash', headline: 'Lithium Prices Tumble 20% on New Supply', category: 'Industry', affects: ['mc'], secondaryAffects: ['ce'], impactType: 'market shift', priceImpact: { mc: -0.1, ce: -0.02 }, publicationDate: 'Week 3, Day 1', source: 'Bloomberg', articleText: 'A wave of new supply sent lithium prices sharply lower, cutting miner revenue.' },
  { id: 'commodity-supercycle', headline: 'Analysts Call for New Commodity Supercycle', category: 'Industry', affects: ['mc', 'em'], secondaryAffects: [], impactType: 'market shift', priceImpact: { mc: 0.08, em: 0.05 }, publicationDate: 'Week 1, Day 1', source: 'Reuters', articleText: 'Rising commodity prices are forecast to lift miners and energy producers for years.' },
  { id: 'defense-budget', headline: 'Congress Approves 12% Defense Spending Increase', category: 'Industry', affects: ['as'], secondaryAffects: ['tc'], impactType: 'regulatory', priceImpact: { as: 0.08, tc: 0.02 }, publicationDate: 'Week 2, Day 3', source: 'CNBC', articleText: 'A bigger defense budget boosts demand for aerospace and defense contractors.' },
  { id: 'aerospace-contract', headline: 'AeroSpace Wins $8B Next-Gen Fighter Contract', category: 'Specific Stock', affects: ['as'], secondaryAffects: [], impactType: 'partnership', priceImpact: { as: 0.1 }, publicationDate: 'Week 3, Day 2', source: 'WSJ', articleText: 'A major multi-year contract locks in stable revenue and lifts the order backlog.' },
  { id: 'pharmatech-fasttrack', headline: 'PharmaTech Cancer Drug Gets FDA Fast-Track Status', category: 'Specific Stock', affects: ['pt'], secondaryAffects: ['bh'], impactType: 'regulatory', priceImpact: { pt: 0.13, bh: 0.03 }, publicationDate: 'Week 1, Day 5', source: 'Bloomberg', articleText: 'Fast-track designation speeds approval and raises the odds of a blockbuster launch.' },
  { id: 'pharmatech-patent', headline: 'Analysts Warn of PharmaTech Patent Cliff in 2027', category: 'Specific Stock', affects: ['pt'], secondaryAffects: [], impactType: 'market shift', priceImpact: { pt: -0.07 }, publicationDate: 'Week 4, Day 4', source: 'Reuters', articleText: 'Looming patent expirations threaten PharmaTech\'s two largest revenue drugs.' },
  { id: 'climate-bill', headline: 'Landmark Climate Bill Expands Renewable Subsidies', category: 'Industry', affects: ['ce', 'at'], secondaryAffects: [], impactType: 'regulatory', priceImpact: { ce: 0.11, at: 0.05 }, publicationDate: 'Week 2, Day 4', source: 'CNBC', articleText: 'New subsidies accelerate adoption of renewables and sustainable agriculture tech.' },
  { id: 'carbon-tax', headline: 'Government Proposes National Carbon Tax on Producers', category: 'Industry', affects: ['em'], secondaryAffects: ['us'], impactType: 'regulatory', priceImpact: { em: -0.07, us: -0.02 }, publicationDate: 'Week 4, Day 2', source: 'WSJ', articleText: 'A proposed carbon tax raises costs for fossil-fuel producers and heavy emitters.' },
  { id: 'consumer-confidence', headline: 'Consumer Confidence Climbs to Three-Year High', category: 'Industry', affects: ['cg', 'rd', 'at'], secondaryAffects: [], impactType: 'market shift', priceImpact: { cg: 0.04, rd: 0.06, at: 0.03 }, publicationDate: 'Week 1, Day 2', source: 'Bloomberg', articleText: 'Confident consumers are spending more, helping retail and consumer names.' },
  { id: 'recession-fears', headline: 'Yield Curve Inversion Stokes Recession Fears', category: 'Industry', affects: ['rd', 'fn', 'ce'], secondaryAffects: ['mc'], impactType: 'market shift', priceImpact: { rd: -0.09, fn: -0.08, ce: -0.06, mc: -0.04 }, publicationDate: 'Week 3, Day 5', source: 'Reuters', articleText: 'High-beta, unprofitable growth stocks fell hardest as recession fears mounted.' },
  { id: 'flight-to-safety', headline: 'Investors Pile Into Treasuries Amid Volatility', category: 'Industry', affects: ['bs', 'us'], secondaryAffects: [], impactType: 'market shift', priceImpact: { bs: 0.04, us: 0.03 }, publicationDate: 'Week 3, Day 5', source: 'CNBC', articleText: 'A flight to safety lifted Treasuries and defensive utilities.' },
  { id: 'fintechnow-userspike', headline: 'FinTechNow Tops 12 Million Users, Beats Forecast', category: 'Specific Stock', affects: ['fn'], secondaryAffects: [], impactType: 'earnings beat', priceImpact: { fn: 0.12 }, publicationDate: 'Week 2, Day 2', source: 'WSJ', articleText: 'Explosive user growth beat forecasts, though profitability remains years away.' },
  { id: 'fintechnow-breach', headline: 'FinTechNow Discloses Data Breach Affecting 2M Accounts', category: 'Specific Stock', affects: ['fn'], secondaryAffects: ['ff'], impactType: 'lawsuit', priceImpact: { fn: -0.13, ff: 0.02 }, publicationDate: 'Week 4, Day 3', source: 'Bloomberg', articleText: 'A breach exposed millions of accounts, inviting regulatory scrutiny and lawsuits.' },
  { id: 'techcorp-earnings-beat', headline: 'TechCorp Crushes Q4 Earnings, Cloud Revenue Up 28%', category: 'Specific Stock', affects: ['tc'], secondaryAffects: ['as'], impactType: 'earnings beat', priceImpact: { tc: 0.1, as: 0.02 }, publicationDate: 'Week 2, Day 1', source: 'Reuters', articleText: 'Blowout cloud revenue drove a big earnings beat and raised guidance.' },
  { id: 'tech-layoffs', headline: 'Major Tech Firms Announce Mass Layoffs', category: 'Industry', affects: ['tc', 'fn'], secondaryAffects: ['as'], impactType: 'market shift', priceImpact: { tc: -0.06, fn: -0.05, as: -0.02 }, publicationDate: 'Week 3, Day 3', source: 'CNBC', articleText: 'Widespread layoffs signal slowing growth and recession concerns across tech.' },
  { id: 'consumergoods-recall', headline: 'ConsumerGoods Issues Recall on Popular Product Line', category: 'Specific Stock', affects: ['cg'], secondaryAffects: [], impactType: 'lawsuit', priceImpact: { cg: -0.06 }, publicationDate: 'Week 1, Day 3', source: 'WSJ', articleText: 'A product recall will dent quarterly results and weigh on brand trust.' },
  { id: 'consumergoods-expansion', headline: 'ConsumerGoods Opens 300 New Stores in Europe', category: 'Specific Stock', affects: ['cg'], secondaryAffects: ['at'], impactType: 'new product', priceImpact: { cg: 0.06, at: 0.01 }, publicationDate: 'Week 4, Day 1', source: 'Bloomberg', articleText: 'An aggressive European expansion is expected to add meaningful revenue.' },
  { id: 'utility-rate-approved', headline: 'Commission Approves UtilityStable Rate Increase', category: 'Specific Stock', affects: ['us'], secondaryAffects: [], impactType: 'regulatory', priceImpact: { us: 0.04 }, publicationDate: 'Week 1, Day 1', source: 'Reuters', articleText: 'An approved rate hike raises regulated, predictable earnings.' },
  { id: 'mineralcorp-mine', headline: 'MineralCorp Opens World-Class Lithium Mine Early', category: 'Specific Stock', affects: ['mc'], secondaryAffects: ['ce'], impactType: 'new product', priceImpact: { mc: 0.12, ce: 0.02 }, publicationDate: 'Week 3, Day 1', source: 'CNBC', articleText: 'A flagship mine came online ahead of schedule, set to boost production and cash flow.' },
  { id: 'realestate-dividend-cut', headline: 'RealEstateRise Cuts Dividend Amid Office Slump', category: 'Specific Stock', affects: ['rr'], secondaryAffects: [], impactType: 'earnings beat', priceImpact: { rr: -0.1 }, publicationDate: 'Week 2, Day 5', source: 'WSJ', articleText: 'A surprise dividend cut spooked income investors as office assets underperform.' },
  { id: 'agritech-drought', headline: 'Severe Drought Threatens Farm-Tech Demand', category: 'Industry', affects: ['at'], secondaryAffects: ['cg'], impactType: 'market shift', priceImpact: { at: -0.05, cg: -0.02 }, publicationDate: 'Week 4, Day 4', source: 'Bloomberg', articleText: 'A widespread drought is pressuring farm economics and software spending.' },
  { id: 'dividend-aristocrat', headline: 'FinanceFirst Raises Dividend for 45th Straight Year', category: 'Specific Stock', affects: ['ff'], secondaryAffects: ['us'], impactType: 'earnings beat', priceImpact: { ff: 0.05, us: 0.02 }, publicationDate: 'Week 1, Day 4', source: 'Reuters', articleText: 'Another dividend hike underscored balance-sheet strength and drew income buyers.' },

  // ── Semiconductors / chips ────────────────────────────────────────────────
  { id: 'chip-shortage', headline: 'Global Chip Shortage Enters Second Year, Lead Times Stretch', category: 'Industry', affects: ['si'], secondaryAffects: ['tc', 'as', 'cg'], impactType: 'market shift', priceImpact: { si: 0.09, tc: -0.03, as: -0.02, cg: -0.02 }, publicationDate: 'Week 1, Day 1', source: 'Reuters', articleText: 'Scarce chips let SemiconductorIntel name its price, while device makers and manufacturers eat the shortage in margins and delays.' },
  { id: 'chip-glut', headline: 'Analysts Warn of Semiconductor Inventory Glut', category: 'Industry', affects: ['si'], secondaryAffects: ['tc'], impactType: 'market shift', priceImpact: { si: -0.1, tc: 0.02 }, publicationDate: 'Week 2, Day 3', source: 'Bloomberg', articleText: 'Channel checks show customers double-ordered during the shortage. Chipmakers face price cuts; buyers of chips quietly benefit.' },
  { id: 'si-fab', headline: 'SemiconductorIntel Breaks Ground on $20B Domestic Fab', category: 'Specific Stock', affects: ['si'], secondaryAffects: ['pgm', 'us'], impactType: 'new product', priceImpact: { si: 0.07, pgm: 0.04, us: 0.02 }, publicationDate: 'Week 3, Day 2', source: 'WSJ', articleText: 'A flagship fab brings subsidies and capacity — plus enormous power demands that grid modernizers will be paid to meet. Capex risk is real.' },
  { id: 'si-export-curbs', headline: 'New Export Controls Restrict Advanced Chip Sales Abroad', category: 'Industry', affects: ['si'], secondaryAffects: ['tc', 'csd'], impactType: 'regulatory', priceImpact: { si: -0.08, tc: -0.02, csd: 0.04 }, publicationDate: 'Week 4, Day 1', source: 'Reuters', articleText: 'Export curbs close a major market for chipmakers. Security hawks cheer; defense-adjacent software vendors expect follow-on contracts.' },
  { id: 'si-yield-breakthrough', headline: 'SemiconductorIntel Claims Yield Breakthrough on 2nm Process', category: 'Specific Stock', affects: ['si'], secondaryAffects: ['tc', 'as'], impactType: 'innovation', priceImpact: { si: 0.13, tc: 0.03, as: 0.02 }, publicationDate: 'Week 2, Day 2', source: 'CNBC', articleText: 'If the claimed yields hold at volume, the cost curve bends in its favor for years. Rivals dispute the math.' },

  // ── Cybersecurity ─────────────────────────────────────────────────────────
  { id: 'ransomware-wave', headline: 'Ransomware Wave Hits Hundreds of Mid-Size Firms', category: 'Industry', affects: ['csd'], secondaryAffects: ['fn', 'ff'], impactType: 'market shift', priceImpact: { csd: 0.12, fn: -0.04, ff: -0.02 }, publicationDate: 'Week 1, Day 3', source: 'CNBC', articleText: 'Every breach is a sales call for security vendors. Financial firms disclose rising incident-response costs and insurance premiums.' },
  { id: 'csd-contract', headline: 'CyberSecurityDefense Wins Federal Zero-Trust Mandate', category: 'Specific Stock', affects: ['csd'], secondaryAffects: ['as'], impactType: 'partnership', priceImpact: { csd: 0.11, as: 0.02 }, publicationDate: 'Week 3, Day 1', source: 'WSJ', articleText: 'A multi-year federal contract anchors recurring revenue. Implementation timelines, as always with government IT, are the fine print.' },
  { id: 'csd-false-positive', headline: 'Botched Security Update Knocks Client Systems Offline', category: 'Specific Stock', affects: ['csd'], secondaryAffects: ['tc'], impactType: 'lawsuit', priceImpact: { csd: -0.11, tc: -0.02 }, publicationDate: 'Week 2, Day 4', source: 'Bloomberg', articleText: 'A faulty update grounded clients for hours worldwide. Lawsuits loom, but analysts note switching costs keep customers captive.' },

  // ── Healthcare / pharma / science ─────────────────────────────────────────
  { id: 'hp-generic-threat', headline: 'Generic Rivals Target HealthcarePharma Flagship Drug', category: 'Specific Stock', affects: ['hp'], secondaryAffects: ['pt'], impactType: 'market shift', priceImpact: { hp: -0.08, pt: -0.02 }, publicationDate: 'Week 1, Day 2', source: 'Reuters', articleText: 'Generic filings challenge the patent moat around its best-seller. Litigation could delay the cliff for years — or not.' },
  { id: 'hp-acquisition', headline: 'HealthcarePharma Acquires Rare-Disease Biotech for $3B', category: 'Specific Stock', affects: ['hp'], secondaryAffects: ['bh'], impactType: 'acquisition', priceImpact: { hp: 0.06, bh: 0.05 }, publicationDate: 'Week 2, Day 1', source: 'WSJ', articleText: 'Big pharma is shopping again — a premium takeout lifts the whole biotech complex on buyout speculation.' },
  { id: 'drug-pricing-bill', headline: 'Drug-Price Negotiation Bill Gains Momentum in Senate', category: 'Industry', affects: ['hp', 'pt'], secondaryAffects: ['bh'], impactType: 'regulatory', priceImpact: { hp: -0.06, pt: -0.05, bh: -0.02 }, publicationDate: 'Week 3, Day 3', source: 'CNBC', articleText: 'Price caps would compress margins on blockbuster drugs. Lobbyists call the bill unworkable; markets price in some odds anyway.' },
  { id: 'gene-therapy-breakthrough', headline: 'University Lab Reports Gene-Therapy Breakthrough', category: 'Industry', affects: ['bh', 'hp'], secondaryAffects: ['pt'], impactType: 'innovation', priceImpact: { bh: 0.09, hp: 0.04, pt: 0.02 }, publicationDate: 'Week 4, Day 2', source: 'Bloomberg', articleText: 'Early results electrified the field. Commercialization is a decade out, but sentiment trades on the headline, not the timeline.' },
  { id: 'hospital-labor-costs', headline: 'Hospital Systems Report Surging Labor Costs', category: 'Industry', affects: ['hp'], secondaryAffects: ['us'], impactType: 'market shift', priceImpact: { hp: -0.04, us: 0.01 }, publicationDate: 'Week 1, Day 4', source: 'Reuters', articleText: 'Staffing costs squeeze hospital budgets — and their drug purchasing. Defensive payers fare better than suppliers.' },

  // ── Energy / grid / transition ────────────────────────────────────────────
  { id: 'et-storage-deal', headline: 'EnergyTransition Lands Utility-Scale Storage Megadeal', category: 'Specific Stock', affects: ['et'], secondaryAffects: ['pgm', 'ce'], impactType: 'partnership', priceImpact: { et: 0.12, pgm: 0.04, ce: 0.03 }, publicationDate: 'Week 2, Day 5', source: 'Bloomberg', articleText: 'Grid-scale batteries move from pilot to procurement. Margins on storage remain thinner than the press release suggests.' },
  { id: 'et-subsidy-lapse', headline: 'Key Clean-Tech Tax Credit Set to Lapse Without Renewal', category: 'Industry', affects: ['et', 'ce'], secondaryAffects: ['gb'], impactType: 'regulatory', priceImpact: { et: -0.09, ce: -0.07, gb: -0.03 }, publicationDate: 'Week 4, Day 4', source: 'WSJ', articleText: 'Project pipelines built on subsidy math wobble when the subsidy wobbles. Veterans note these credits usually get renewed at midnight.' },
  { id: 'grid-blackout', headline: 'Heat Dome Triggers Rolling Blackouts Across Three States', category: 'Industry', affects: ['pgm'], secondaryAffects: ['us', 'et'], impactType: 'market shift', priceImpact: { pgm: 0.1, us: -0.04, et: 0.05 }, publicationDate: 'Week 3, Day 4', source: 'CNBC', articleText: 'Every blackout is an advertisement for grid modernization — and a regulatory headache for the utility that browned out.' },
  { id: 'pgm-rate-case', headline: 'Regulators Trim PowerGridModern Cost-Recovery Request', category: 'Specific Stock', affects: ['pgm'], secondaryAffects: [], impactType: 'regulatory', priceImpact: { pgm: -0.06 }, publicationDate: 'Week 1, Day 5', source: 'Reuters', articleText: 'A leaner rate case slows the capex flywheel. Management insists the multi-decade grid buildout thesis is intact.' },
  { id: 'nuclear-revival', headline: 'Three States Fast-Track Small Modular Reactor Permits', category: 'Industry', affects: ['us', 'pgm'], secondaryAffects: ['em', 'et'], impactType: 'regulatory', priceImpact: { us: 0.05, pgm: 0.05, em: -0.02, et: -0.02 }, publicationDate: 'Week 2, Day 2', source: 'WSJ', articleText: 'A nuclear revival promises firm, clean baseload — someday. Renewables and gas both eye the same future load book.' },
  { id: 'opec-cut', headline: 'OPEC+ Announces Surprise Production Cut', category: 'Industry', affects: ['em'], secondaryAffects: ['cg', 'rd'], impactType: 'market shift', priceImpact: { em: 0.09, cg: -0.03, rd: -0.03 }, publicationDate: 'Week 3, Day 1', source: 'Bloomberg', articleText: 'Producers win at the wellhead; consumers pay at the pump — and retailers watch discretionary budgets shrink by the gallon.' },

  // ── Real estate / construction ────────────────────────────────────────────
  { id: 'gb-certification', headline: 'GreenBuildings Portfolio Earns Top Efficiency Rating', category: 'Specific Stock', affects: ['gb'], secondaryAffects: ['rr'], impactType: 'innovation', priceImpact: { gb: 0.08, rr: 0.01 }, publicationDate: 'Week 1, Day 1', source: 'CNBC', articleText: 'Certified-efficient buildings command premium rents from ESG-mandated tenants. Skeptics call it a plaque; the leases say otherwise.' },
  { id: 'mortgage-spike', headline: 'Mortgage Rates Touch Multi-Year High', category: 'Industry', affects: ['rr', 'gb'], secondaryAffects: ['ff', 'bs'], impactType: 'market shift', priceImpact: { rr: -0.08, gb: -0.06, ff: 0.02, bs: -0.03 }, publicationDate: 'Week 2, Day 3', source: 'WSJ', articleText: 'Expensive money freezes property deals. Lenders reprice upward while landlords watch cap rates drift the wrong way.' },
  { id: 'housing-starts-boom', headline: 'Housing Starts Jump 14% as Permits Surge', category: 'Industry', affects: ['rr', 'gb'], secondaryAffects: ['mc', 'cg'], impactType: 'market shift', priceImpact: { rr: 0.06, gb: 0.05, mc: 0.03, cg: 0.02 }, publicationDate: 'Week 4, Day 1', source: 'Bloomberg', articleText: 'A construction wave lifts landlords, materials and everything sold to fill a new house. Overbuilding worries are for next year.' },
  { id: 'downtown-conversion', headline: 'Cities Roll Out Office-to-Housing Conversion Incentives', category: 'Industry', affects: ['rr'], secondaryAffects: ['gb'], impactType: 'regulatory', priceImpact: { rr: 0.05, gb: 0.04 }, publicationDate: 'Week 3, Day 5', source: 'Reuters', articleText: 'Subsidized conversions could rescue stranded office towers — where the floor plates cooperate. Engineers are less optimistic than mayors.' },

  // ── Macro: rates, jobs, inflation, trade ──────────────────────────────────
  { id: 'rate-hike-surprise', headline: 'Fed Hikes Rates 0.25%, Signals More to Come', category: 'Industry', affects: ['bs', 'bgy', 'rr'], secondaryAffects: ['fn', 'tc'], impactType: 'market shift', priceImpact: { bs: -0.04, bgy: -0.04, rr: -0.05, fn: -0.04, tc: -0.03 }, publicationDate: 'Week 1, Day 3', source: 'WSJ', articleText: 'Hawkish surprises punish duration — bonds, property and long-promise growth stocks all reprice against a higher bar.' },
  { id: 'jobs-blowout', headline: 'Economy Adds 400K Jobs, Doubling Forecasts', category: 'Industry', affects: ['cg', 'rd'], secondaryAffects: ['bs', 'bgy'], impactType: 'market shift', priceImpact: { cg: 0.05, rd: 0.05, bs: -0.03, bgy: -0.03 }, publicationDate: 'Week 2, Day 5', source: 'CNBC', articleText: 'Paychecks power spending — good for stores, complicated for rate cuts. Good news is bad news, depending on your holdings.' },
  { id: 'jobs-miss', headline: 'Hiring Stalls; Unemployment Ticks Up to 4.6%', category: 'Industry', affects: ['rd', 'cg'], secondaryAffects: ['bs', 'bgy', 'us'], impactType: 'market shift', priceImpact: { rd: -0.06, cg: -0.04, bs: 0.03, bgy: 0.03, us: 0.02 }, publicationDate: 'Week 3, Day 2', source: 'Reuters', articleText: 'A soft labor print dents spending forecasts and revives rate-cut hopes — pain for retail, relief for bonds.' },
  { id: 'inflation-cools', headline: 'Inflation Cools to 2.4%, Below Expectations', category: 'Industry', affects: ['bs', 'bgy', 'rr'], secondaryAffects: ['tc', 'rd'], impactType: 'market shift', priceImpact: { bs: 0.04, bgy: 0.04, rr: 0.05, tc: 0.04, rd: 0.03 }, publicationDate: 'Week 4, Day 3', source: 'Bloomberg', articleText: 'Disinflation is duration\'s best friend: bonds, REITs and growth stocks all breathe easier when the price index behaves.' },
  { id: 'tariff-round', headline: 'New Tariff Round Targets Imported Electronics and Steel', category: 'Industry', affects: ['tc', 'si', 'cg'], secondaryAffects: ['mc', 'as'], impactType: 'regulatory', priceImpact: { tc: -0.05, si: -0.04, cg: -0.04, mc: 0.05, as: 0.02 }, publicationDate: 'Week 1, Day 5', source: 'Reuters', articleText: 'Tariffs raise import costs for electronics and retail — and hand domestic miners and defense suppliers a protected market.' },
  { id: 'trade-deal', headline: 'Sweeping Trade Agreement Slashes Cross-Border Duties', category: 'Industry', affects: ['cg', 'tc', 'at'], secondaryAffects: ['mc'], impactType: 'market shift', priceImpact: { cg: 0.05, tc: 0.04, at: 0.04, mc: -0.03 }, publicationDate: 'Week 2, Day 1', source: 'WSJ', articleText: 'Cheaper trade lanes widen margins for importers and exporters alike. Domestically-sheltered producers lose their moat.' },
  { id: 'dollar-surge', headline: 'Dollar Hits Two-Year High Against Major Currencies', category: 'Industry', affects: ['tc', 'hp', 'cg'], secondaryAffects: ['mc', 'em'], impactType: 'market shift', priceImpact: { tc: -0.04, hp: -0.03, cg: -0.03, mc: -0.04, em: -0.03 }, publicationDate: 'Week 3, Day 3', source: 'Bloomberg', articleText: 'A muscular dollar shrinks overseas revenue in translation and pressures dollar-priced commodities. Importers quietly cheer.' },

  // ── Transport / supply chain / logistics ──────────────────────────────────
  { id: 'canal-blockage', headline: 'Container Ship Runs Aground in Key Shipping Canal', category: 'Industry', affects: ['cg', 'rd'], secondaryAffects: ['em', 'mc', 'si'], impactType: 'market shift', priceImpact: { cg: -0.05, rd: -0.04, em: 0.04, mc: 0.03, si: -0.03 }, publicationDate: 'Week 1, Day 2', source: 'CNBC', articleText: 'One wedged hull, ten billion dollars a day of cargo. Retail inventories tighten while oil and freight rates jump.' },
  { id: 'port-strike', headline: 'Dockworkers Strike Shuts Coastal Ports', category: 'Industry', affects: ['rd', 'cg'], secondaryAffects: ['at', 'si'], impactType: 'market shift', priceImpact: { rd: -0.06, cg: -0.05, at: -0.02, si: -0.03 }, publicationDate: 'Week 2, Day 4', source: 'Reuters', articleText: 'Idle cranes back up everything from produce to processors. Every day of picket lines is a week of shelf gaps.' },
  { id: 'rail-merger', headline: 'Regulators Approve Transcontinental Rail Merger', category: 'Industry', affects: ['mc', 'at'], secondaryAffects: ['cg'], impactType: 'acquisition', priceImpact: { mc: 0.04, at: 0.04, cg: 0.02 }, publicationDate: 'Week 4, Day 2', source: 'WSJ', articleText: 'A single-network railroad promises cheaper bulk freight for miners and farm shippers — and pricing power someday.' },
  { id: 'airline-groundings', headline: 'Aviation Regulator Grounds Popular Jet Model for Inspections', category: 'Industry', affects: ['as'], secondaryAffects: ['rd'], impactType: 'regulatory', priceImpact: { as: -0.07, rd: -0.01 }, publicationDate: 'Week 3, Day 1', source: 'Bloomberg', articleText: 'Groundings hit the airframe supply chain hard. History says orders return once inspections clear — history isn\'t a guarantee.' },

  // ── Weather / disasters / agriculture ─────────────────────────────────────
  { id: 'hurricane-landfall', headline: 'Category 4 Hurricane Makes Landfall on Gulf Coast', category: 'Industry', affects: ['em', 'rr'], secondaryAffects: ['us', 'mc', 'gb'], impactType: 'market shift', priceImpact: { em: 0.06, rr: -0.05, us: -0.03, mc: 0.02, gb: -0.03 }, publicationDate: 'Week 1, Day 4', source: 'CNBC', articleText: 'Refinery outages lift fuel prices while insurers, landlords and utilities tally the damage. Rebuilding demand comes later.' },
  { id: 'bumper-harvest', headline: 'Record Grain Harvest Projected After Ideal Growing Season', category: 'Industry', affects: ['at'], secondaryAffects: ['cg'], impactType: 'market shift', priceImpact: { at: 0.07, cg: 0.03 }, publicationDate: 'Week 2, Day 2', source: 'Reuters', articleText: 'Fat yields reward the farm-tech stack that produced them and ease grocery input costs. Grain prices, of course, sag.' },
  { id: 'crop-blight', headline: 'Fungal Blight Spreads Through Corn Belt', category: 'Industry', affects: ['at', 'cg'], secondaryAffects: ['mc'], impactType: 'market shift', priceImpact: { at: -0.07, cg: -0.04, mc: 0.02 }, publicationDate: 'Week 3, Day 4', source: 'WSJ', articleText: 'A fast-moving blight threatens yields across three states. Food producers hedge; fertilizer and treatment demand spikes.' },
  { id: 'wildfire-season', headline: 'Early Wildfire Season Strains Western Power Grid', category: 'Industry', affects: ['us', 'pgm'], secondaryAffects: ['rr'], impactType: 'market shift', priceImpact: { us: -0.05, pgm: 0.06, rr: -0.02 }, publicationDate: 'Week 4, Day 4', source: 'Bloomberg', articleText: 'Utilities face liability for every spark; grid hardening budgets get approved in a hurry when the sky turns orange.' },

  // ── Corporate drama / management / launches ───────────────────────────────
  { id: 'tc-ceo-resigns', headline: 'TechCorp CEO Resigns Abruptly, Cites Personal Reasons', category: 'Specific Stock', affects: ['tc'], secondaryAffects: [], impactType: 'market shift', priceImpact: { tc: -0.07 }, publicationDate: 'Week 1, Day 1', source: 'CNBC', articleText: 'Abrupt exits invite speculation the board can\'t quiet. The COO steps up; the strategy, officially, is unchanged.' },
  { id: 'rd-founder-returns', headline: 'RetailDisrupt Founder Returns as Chief Executive', category: 'Specific Stock', affects: ['rd'], secondaryAffects: [], impactType: 'market shift', priceImpact: { rd: 0.09 }, publicationDate: 'Week 2, Day 1', source: 'WSJ', articleText: 'The prodigal founder is back with a turnaround plan and a cult following. Founder returns run famously hot — and cold.' },
  { id: 'cg-celebrity-line', headline: 'ConsumerGoods Signs Global Superstar for Product Line', category: 'Specific Stock', affects: ['cg'], secondaryAffects: ['rd'], impactType: 'new product', priceImpact: { cg: 0.07, rd: 0.02 }, publicationDate: 'Week 3, Day 5', source: 'Bloomberg', articleText: 'Celebrity lines can mint a quarter or quietly die in clearance aisles. Preorder data looks strong; so did last time\'s.' },
  { id: 'ff-fine', headline: 'FinanceFirst Pays $400M to Settle Mis-Selling Probe', category: 'Specific Stock', affects: ['ff'], secondaryAffects: ['fn'], impactType: 'regulatory', priceImpact: { ff: -0.06, fn: 0.02 }, publicationDate: 'Week 4, Day 3', source: 'Reuters', articleText: 'A settlement closes the probe but reopens the reputation question. Fintech rivals screenshot the headline for their ads.' },
  { id: 'fn-super-app', headline: 'FinTechNow Launches All-in-One "Money Super-App"', category: 'Specific Stock', affects: ['fn'], secondaryAffects: ['ff', 'tc'], impactType: 'new product', priceImpact: { fn: 0.1, ff: -0.03, tc: 0.02 }, publicationDate: 'Week 1, Day 5', source: 'CNBC', articleText: 'Banking, investing and payments in one app — a land grab for the customer relationship banks assumed they owned.' },
  { id: 'buyback-wave', headline: 'Corporate Buyback Announcements Hit Quarterly Record', category: 'Industry', affects: ['tc', 'ff', 'cg'], secondaryAffects: ['hp'], impactType: 'market shift', priceImpact: { tc: 0.04, ff: 0.04, cg: 0.03, hp: 0.02 }, publicationDate: 'Week 2, Day 3', source: 'WSJ', articleText: 'Companies are buying their own shares at a record clip — bullish support under prices, or a shortage of better ideas.' },
  { id: 'accounting-probe', headline: 'Short-Seller Report Questions MineralCorp Accounting', category: 'Specific Stock', affects: ['mc'], secondaryAffects: [], impactType: 'lawsuit', priceImpact: { mc: -0.12 }, publicationDate: 'Week 3, Day 2', source: 'Bloomberg', articleText: 'A scathing short report alleges creative reserve accounting. Management calls it fiction; the auditors say nothing at all.' },

  // ── Sentiment / flows / misc macro color ──────────────────────────────────
  { id: 'retail-mania', headline: 'Retail Trading Volumes Hit Frenzied Highs', category: 'Industry', affects: ['fn', 'tc', 'rd'], secondaryAffects: ['si'], impactType: 'market shift', priceImpact: { fn: 0.06, tc: 0.04, rd: 0.05, si: 0.03 }, publicationDate: 'Week 1, Day 2', source: 'CNBC', articleText: 'The crowd is back and buying whatever\'s moving. Brokers profit from the churn; veterans check their exits.' },
  { id: 'fund-outflows', headline: 'Equity Funds Post Largest Weekly Outflows of the Year', category: 'Industry', affects: ['bs', 'bgy', 'us'], secondaryAffects: ['tc', 'fn'], impactType: 'market shift', priceImpact: { bs: 0.03, bgy: 0.03, us: 0.02, tc: -0.04, fn: -0.04 }, publicationDate: 'Week 2, Day 5', source: 'Bloomberg', articleText: 'Money is leaving stocks for the safety of yield. Contrarians note outflows peak near bottoms — usually. Sometimes.' },
  { id: 'telecom-spectrum', headline: 'Government Auctions Next-Gen Wireless Spectrum', category: 'Industry', affects: ['tc'], secondaryAffects: ['csd', 'us'], impactType: 'regulatory', priceImpact: { tc: 0.05, csd: 0.03, us: -0.02 }, publicationDate: 'Week 4, Day 1', source: 'Reuters', articleText: 'New spectrum unlocks faster networks and new attack surfaces. The winners\' balance sheets absorb some very large checks.' },
  { id: 'space-launch', headline: 'Private Constellation Launch Opens Rural Broadband Market', category: 'Industry', affects: ['as', 'tc'], secondaryAffects: ['at'], impactType: 'innovation', priceImpact: { as: 0.07, tc: 0.02, at: 0.03 }, publicationDate: 'Week 3, Day 3', source: 'WSJ', articleText: 'A successful constellation launch beams connectivity — and precision-agriculture data — to places fiber never reached.' },
  { id: 'esg-mandate', headline: 'Pension Giants Adopt Strict ESG Screening Mandates', category: 'Industry', affects: ['ce', 'et', 'gb'], secondaryAffects: ['em'], impactType: 'market shift', priceImpact: { ce: 0.06, et: 0.05, gb: 0.05, em: -0.05 }, publicationDate: 'Week 1, Day 3', source: 'Bloomberg', articleText: 'Trillions in pension money rewrites its buy list. Green assets get a flow tailwind; excluded sectors get cheaper — some say too cheap.' },
  { id: 'bank-run-rumor', headline: 'Regional Lender Quells Social-Media Bank-Run Rumor', category: 'Industry', affects: ['ff', 'fn'], secondaryAffects: ['bs', 'bgy'], impactType: 'market shift', priceImpact: { ff: -0.05, fn: -0.04, bs: 0.03, bgy: 0.02 }, publicationDate: 'Week 2, Day 2', source: 'CNBC', articleText: 'A viral rumor moved deposits faster than any regulator could. It was false. The nervousness it revealed was not.' },
];

export const articlesById: Record<string, NewsArticle> = ARTICLES.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, NewsArticle>
);

// Target |max impact| bands per level. A generated article's impacts are
// rescaled (keeping sign and relative proportions) so its biggest move lands
// inside the rolled band — minor stories are common, major ones are rare.
const LEVEL_BANDS: Record<ImpactLevel, [number, number]> = {
  minor: [0.005, 0.025], // ±0.5% .. ±2.5%
  moderate: [0.03, 0.07], // ±3% .. ±7%
  major: [0.09, 0.16], // ±9% .. ±16%
};

function rollImpactLevel(): ImpactLevel {
  const r = Math.random();
  if (r < 0.5) return 'minor';
  if (r < 0.83) return 'moderate';
  return 'major';
}

// Clone an article with its impacts rescaled to the rolled level's band, its
// publication date stamped to the week it actually breaks, and bond impacts
// capped so fixed income stays defensive.
export function scaleArticleToLevel(article: NewsArticle, level: ImpactLevel, week: number): NewsArticle {
  const [lo, hi] = LEVEL_BANDS[level];
  const target = lo + Math.random() * (hi - lo);
  const maxAbs = Math.max(...Object.values(article.priceImpact).map(Math.abs), 1e-9);
  const f = target / maxAbs;
  const priceImpact: Record<string, number> = {};
  Object.entries(article.priceImpact).forEach(([id, v]) => {
    priceImpact[id] = capBondImpact(id, Math.round(v * f * 10000) / 10000);
  });
  return {
    ...article,
    id: `${article.id}-w${week}`,
    priceImpact,
    impactLevel: level,
    publicationDate: `Week ${week}`,
  };
}

// 1-3 headlines break every week, each with its own rolled impact level, so
// the news mix genuinely varies from barely-moves-the-needle to market-moving.
// Occasionally an exclusive scoop rides along (visible early only to News
// Terminal owners, but it moves prices for everyone).
export function generateWeeklyNews(week: number): NewsArticle[] {
  const count = 1 + Math.floor(Math.random() * 3); // 1-3
  const picks = [...ARTICLES].sort(() => Math.random() - 0.5).slice(0, count);
  const articles = picks.map((a) => scaleArticleToLevel(a, rollImpactLevel(), week));
  const scoop = maybeExclusiveArticle(week);
  if (scoop) articles.push(scoop);
  return articles;
}

export default ARTICLES;
