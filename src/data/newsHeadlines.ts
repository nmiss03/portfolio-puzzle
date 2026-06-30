// Pool of market-news headlines. Each week a handful are drawn; the player
// predicts each one's impact, and the actual impact modifies affected stocks'
// weekly returns.

export type NewsImpact = 'positive' | 'negative';
export type NewsCategory = 'Macroeconomic' | 'Industry Trend' | 'Corporate Action' | 'Regulatory' | 'Policy';

export interface NewsHeadline {
  id: string;
  headline: string;
  category: NewsCategory;
  affects: string[]; // stock ids
  impact: NewsImpact; // the actual (correct) impact
  explanation: string;
  weight: number; // 0.5..2.0 — strength in % applied to affected stocks
}

const NEWS: NewsHeadline[] = [
  { id: 'fed-rate-cut', headline: 'Federal Reserve Announces 0.5% Interest Rate Cut', category: 'Macroeconomic', affects: ['bs', 'ff', 'us', 'rr'], impact: 'positive', weight: 1.5, explanation: 'Lower rates lift bond prices and boost demand for dividend stocks and REITs.' },
  { id: 'ev-sales-surge', headline: 'Electric Vehicle Sales Hit Record 35% Market Share in Q4', category: 'Industry Trend', affects: ['mc', 'ce'], impact: 'positive', weight: 1.8, explanation: 'Surging EV adoption increases demand for lithium and renewable energy.' },
  { id: 'tech-layoffs', headline: 'Major Tech Companies Announce Mass Layoffs Amid Profit Pressure', category: 'Corporate Action', affects: ['tc', 'as', 'fn'], impact: 'negative', weight: 1.2, explanation: 'Widespread tech layoffs signal slowing growth and recession concerns.' },
  { id: 'retail-strong-holiday', headline: 'Holiday Retail Sales Beat Expectations by 8%', category: 'Industry Trend', affects: ['cg', 'rd', 'at'], impact: 'positive', weight: 1.3, explanation: 'Strong consumer spending benefits retailers and e-commerce disruptors.' },
  { id: 'drug-approval', headline: 'PharmaTech Drug Candidate Receives FDA Fast-Track Designation', category: 'Regulatory', affects: ['pt'], impact: 'positive', weight: 2.0, explanation: 'Fast-track designation speeds approval and raises odds of market success.' },
  { id: 'inflation-spike', headline: 'Inflation Rises Unexpectedly to 4.2%, Highest in 6 Months', category: 'Macroeconomic', affects: ['bs', 'us', 'cg'], impact: 'negative', weight: 1.6, explanation: 'Higher inflation erodes bond values and squeezes utility and retail margins.' },
  { id: 'mining-accident', headline: 'MineralCorp Reports Environmental Incident at Atacama Facility', category: 'Corporate Action', affects: ['mc'], impact: 'negative', weight: 0.7, explanation: 'Environmental concerns can cause operational delays and regulatory scrutiny.' },
  { id: 'defense-budget', headline: 'Congress Approves 12% Increase in Defense Spending', category: 'Policy', affects: ['as'], impact: 'positive', weight: 1.5, explanation: 'Bigger defense budgets boost demand for aerospace and defense contractors.' },
  { id: 'oil-price-surge', headline: 'Crude Oil Jumps 9% on Middle East Supply Fears', category: 'Macroeconomic', affects: ['em'], impact: 'positive', weight: 1.4, explanation: 'Higher oil prices lift producer margins and cash flow.' },
  { id: 'oil-glut', headline: 'Global Oil Glut Sends Prices to Two-Year Low', category: 'Industry Trend', affects: ['em'], impact: 'negative', weight: 1.3, explanation: 'Oversupply pressures producer revenue and profitability.' },
  { id: 'fda-rejection', headline: 'BioHealth Phase 3 Trial Misses Primary Endpoint', category: 'Regulatory', affects: ['bh'], impact: 'negative', weight: 1.8, explanation: 'A failed late-stage trial removes a major expected revenue source.' },
  { id: 'housing-slump', headline: 'Commercial Office Vacancies Hit Record Highs', category: 'Industry Trend', affects: ['rr'], impact: 'negative', weight: 1.4, explanation: 'Rising vacancies cut REIT rental income and property values.' },
  { id: 'housing-boom', headline: 'Suburban Retail Property Values Surge on Foot-Traffic Rebound', category: 'Industry Trend', affects: ['rr'], impact: 'positive', weight: 1.3, explanation: 'Stronger retail demand boosts REIT occupancy and valuations.' },
  { id: 'ai-breakthrough', headline: 'Breakthrough AI Model Sparks Enterprise Spending Wave', category: 'Industry Trend', affects: ['tc', 'as'], impact: 'positive', weight: 1.6, explanation: 'An AI spending wave benefits cloud and advanced-tech suppliers.' },
  { id: 'cloud-spending-up', headline: 'Enterprise Cloud Budgets Projected to Grow 22% Next Year', category: 'Industry Trend', affects: ['tc'], impact: 'positive', weight: 1.3, explanation: 'Rising cloud budgets directly increase infrastructure revenue.' },
  { id: 'bank-stress-test', headline: 'Regulators Propose Stricter Bank Capital Requirements', category: 'Regulatory', affects: ['ff', 'fn'], impact: 'negative', weight: 1.0, explanation: 'Higher capital rules reduce lending capacity and returns.' },
  { id: 'fintech-crackdown', headline: 'SEC Opens Probe Into Mobile Banking Compliance', category: 'Regulatory', affects: ['fn'], impact: 'negative', weight: 1.7, explanation: 'Regulatory probes threaten growth and raise compliance costs.' },
  { id: 'consumer-confidence-up', headline: 'Consumer Confidence Index Climbs to Three-Year High', category: 'Macroeconomic', affects: ['cg', 'rd', 'at'], impact: 'positive', weight: 1.1, explanation: 'Confident consumers spend more, helping retail and consumer names.' },
  { id: 'recession-fears', headline: 'Yield Curve Inversion Stokes Recession Fears', category: 'Macroeconomic', affects: ['rd', 'fn', 'ce'], impact: 'negative', weight: 1.5, explanation: 'High-beta, unprofitable growth stocks fall hardest on recession fears.' },
  { id: 'flight-to-safety', headline: 'Investors Pile Into Treasuries Amid Market Volatility', category: 'Macroeconomic', affects: ['bs', 'us'], impact: 'positive', weight: 1.2, explanation: 'A flight to safety lifts Treasuries and defensive utilities.' },
  { id: 'lithium-price-drop', headline: 'Lithium Prices Tumble 20% on New Supply', category: 'Industry Trend', affects: ['mc'], impact: 'negative', weight: 1.5, explanation: 'Falling lithium prices cut miner revenue and variable dividends.' },
  { id: 'commodity-supercycle', headline: 'Analysts Call for New Commodity Supercycle', category: 'Industry Trend', affects: ['mc', 'em'], impact: 'positive', weight: 1.4, explanation: 'Rising commodity prices boost miners and energy producers.' },
  { id: 'utility-rate-approved', headline: 'State Commission Approves UtilityStable Rate Increase', category: 'Regulatory', affects: ['us'], impact: 'positive', weight: 1.0, explanation: 'Approved rate hikes raise regulated, predictable earnings.' },
  { id: 'climate-bill', headline: 'Landmark Climate Bill Expands Renewable Subsidies', category: 'Policy', affects: ['ce', 'at'], impact: 'positive', weight: 1.5, explanation: 'New subsidies accelerate renewable and sustainable-tech adoption.' },
  { id: 'carbon-tax', headline: 'Government Proposes National Carbon Tax on Producers', category: 'Policy', affects: ['em'], impact: 'negative', weight: 1.3, explanation: 'A carbon tax raises costs for fossil-fuel producers.' },
  { id: 'patent-cliff-warning', headline: 'Analysts Warn of PharmaTech Patent Cliff in 2027', category: 'Corporate Action', affects: ['pt'], impact: 'negative', weight: 1.2, explanation: 'Looming patent expirations threaten the biggest revenue drugs.' },
  { id: 'strong-jobs-report', headline: 'Jobs Report Smashes Estimates, Wages Climb', category: 'Macroeconomic', affects: ['ff', 'cg'], impact: 'positive', weight: 1.0, explanation: 'A strong labor market supports banks and consumer spending.' },
  { id: 'supply-chain-snarl', headline: 'Port Congestion Triggers Fresh Supply-Chain Delays', category: 'Industry Trend', affects: ['as', 'cg', 'rd'], impact: 'negative', weight: 1.1, explanation: 'Supply delays raise costs and slow deliveries for goods makers.' },
  { id: 'dividend-hike', headline: 'FinanceFirst Raises Dividend for 45th Straight Year', category: 'Corporate Action', affects: ['ff', 'us'], impact: 'positive', weight: 0.8, explanation: 'Dividend hikes signal balance-sheet strength and attract income buyers.' },
  { id: 'venture-funding-dries', headline: 'Venture Funding Plunges as Investors Turn Cautious', category: 'Industry Trend', affects: ['fn', 'rd', 'ce'], impact: 'negative', weight: 1.4, explanation: 'Cash-burning startups depend on funding that is now drying up.' },
  { id: 'aerospace-order', headline: 'AeroSpace Wins $8B Next-Gen Fighter Contract', category: 'Corporate Action', affects: ['as'], impact: 'positive', weight: 1.3, explanation: 'A major contract win locks in years of stable revenue.' },
  { id: 'biotech-rally', headline: 'Positive Trial Data Sparks Broad Biotech Rally', category: 'Industry Trend', affects: ['bh', 'pt'], impact: 'positive', weight: 1.2, explanation: 'Encouraging trial data lifts sentiment across biotech names.' },
];

export const newsById: Record<string, NewsHeadline> = NEWS.reduce(
  (acc, n) => {
    acc[n.id] = n;
    return acc;
  },
  {} as Record<string, NewsHeadline>
);

// Pick `count` varied headlines: shuffle, then take while avoiding more than
// 2 headlines affecting the same stock.
export function pickWeeklyNews(count = 5): NewsHeadline[] {
  const shuffled = [...NEWS].sort(() => Math.random() - 0.5);
  const chosen: NewsHeadline[] = [];
  const stockCount: Record<string, number> = {};
  for (const n of shuffled) {
    if (chosen.length >= count) break;
    if (n.affects.some((id) => (stockCount[id] || 0) >= 2)) continue;
    chosen.push(n);
    n.affects.forEach((id) => (stockCount[id] = (stockCount[id] || 0) + 1));
  }
  return chosen;
}

export default NEWS;
