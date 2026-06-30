// Pool of market-news articles. Reading an article applies its priceImpact to
// the affected stocks' prices for the current week (cumulative, applied once).

export type NewsSource = 'Bloomberg' | 'Reuters' | 'CNBC' | 'WSJ';
export type NewsCategory = 'Industry' | 'Specific Stock';
export type ImpactType =
  | 'partnership' | 'new product' | 'lost client' | 'acquisition' | 'regulatory'
  | 'earnings beat' | 'lawsuit' | 'innovation' | 'market shift';

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
];

export const articlesById: Record<string, NewsArticle> = ARTICLES.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, NewsArticle>
);

// Pick 8-12 varied articles for a week, prioritizing stocks the client holds.
export function generateWeeklyNews(ownedIds: string[] = []): NewsArticle[] {
  const owned = new Set(ownedIds);
  const shuffled = [...ARTICLES].sort(() => Math.random() - 0.5);
  // Sort so articles touching held stocks come first, then shuffle within.
  shuffled.sort((a, b) => {
    const relA = a.affects.some((id) => owned.has(id)) ? 0 : 1;
    const relB = b.affects.some((id) => owned.has(id)) ? 0 : 1;
    return relA - relB;
  });
  const industry = shuffled.filter((a) => a.category === 'Industry');
  const stock = shuffled.filter((a) => a.category === 'Specific Stock');
  const chosen = [...industry.slice(0, 4), ...stock.slice(0, 6)];
  // Re-sort chosen by publication date for a feed feel.
  return chosen.sort((a, b) => a.publicationDate.localeCompare(b.publicationDate));
}

export default ARTICLES;
