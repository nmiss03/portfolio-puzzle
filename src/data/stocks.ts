// The investable universe — 15 varied instruments across sectors.
// Raw metrics + detailed company profiles + which news categories move them.

export type Sector =
  | 'Technology'
  | 'Healthcare'
  | 'Finance'
  | 'Energy'
  | 'Consumer'
  | 'Real Estate'
  | 'Utilities'
  | 'Commodities'
  | 'Fixed Income';

export type AssetClass = 'stock' | 'bond';

export interface StockLogo {
  type: 'initials' | 'symbol';
  value: string;
  bgColor: string;
}

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  price: number;
  sector: Sector;
  sectorColor: string;
  pe: number | null;
  beta: number;
  dividend: number;
  week52Low: number;
  week52High: number;
  marketCap: string;
  yearFounded: number;
  employees: number;
  headquarters: string;
  logo: StockLogo;
  background: string;
  annualReturn: number;
  newsRelated: string[];
  assetClass: AssetClass;
}

const SC: Record<Sector, string> = {
  Technology: '#3b82f6',
  Healthcare: '#d946a6', // softened from #ec4899
  Finance: '#10b981',
  Energy: '#f59e0b',
  Consumer: '#a575d9', // softened from #8b5cf6
  'Real Estate': '#d97706', // softened from #f97316
  Utilities: '#6b7280',
  Commodities: '#14b8a6',
  'Fixed Income': '#6366f1',
};

const STOCKS: Stock[] = [
  {
    id: 'tc', ticker: 'TC', name: 'TechCorp', price: 150, sector: 'Technology', sectorColor: SC.Technology,
    pe: 28, beta: 1.8, dividend: 0.5, week52Low: 95, week52High: 165, marketCap: '$250B',
    yearFounded: 1998, employees: 45000, headquarters: 'San Jose, CA',
    logo: { type: 'initials', value: 'TC', bgColor: '#3b82f6' },
    background: `TechCorp stands as a global leader in cloud infrastructure, serving over 50,000 enterprise customers worldwide. Founded in 1998, the company has grown from a garage startup to a $250 billion market cap powerhouse. With 45,000 employees across 35 countries, TechCorp continues to innovate in edge computing, AI infrastructure, and quantum-ready architectures. The CEO has a background in physics and enjoys weekend golf outings. They recently renovated their San Jose headquarters, adding a 15,000 sq ft innovation lab — though beverage choices remain limited to sparkling water.`,
    annualReturn: 0.12, newsRelated: ['tech earnings', 'ai adoption', 'cloud growth'], assetClass: 'stock',
  },
  {
    id: 'bh', ticker: 'BH', name: 'BioHealth', price: 85, sector: 'Healthcare', sectorColor: SC.Healthcare,
    pe: 22, beta: 1.9, dividend: 1.2, week52Low: 70, week52High: 95, marketCap: '$120B',
    yearFounded: 1987, employees: 12000, headquarters: 'Boston, MA',
    logo: { type: 'symbol', value: '✚', bgColor: '#ec4899' },
    background: `BioHealth is a mid-sized pharmaceutical innovator with a robust pipeline of breakthrough treatments. Established in 1987, the company has built a reputation for rigorous clinical research. They have 3 drug candidates in phase 3 trials, targeting diabetes, cardiovascular disease, and rare genetic disorders. With 12,000 employees and R&D centers in Boston, San Francisco, and Basel, BioHealth invests 25% of revenue into research. The CEO has over 50 published papers. Their break rooms famously offer only sparkling water.`,
    annualReturn: 0.11, newsRelated: ['fda approval', 'drug trial results', 'patent news'], assetClass: 'stock',
  },
  {
    id: 'ff', ticker: 'FF', name: 'FinanceFirst', price: 120, sector: 'Finance', sectorColor: SC.Finance,
    pe: 15, beta: 0.9, dividend: 3.5, week52Low: 110, week52High: 135, marketCap: '$80B',
    yearFounded: 1870, employees: 35000, headquarters: 'New York, NY',
    logo: { type: 'symbol', value: '$', bgColor: '#10b981' },
    background: `FinanceFirst is the oldest continuously operating bank in North America, with a 150-year history dating to 1870. Through the Great Depression and digital disruption, it has maintained stability and shareholder returns. With $80B in market cap, 35,000 employees across 45 countries, and over $2 trillion in assets, its track record is extraordinary: a dividend paid for 120 consecutive years, increased for 45 straight. The CEO of 8 years emphasizes traditional banking values. The New York headquarters still requires business attire.`,
    annualReturn: 0.08, newsRelated: ['interest rates', 'bank earnings', 'regulatory changes'], assetClass: 'stock',
  },
  {
    id: 'em', ticker: 'EM', name: 'EnergyMax', price: 95, sector: 'Energy', sectorColor: SC.Energy,
    pe: 12, beta: 1.3, dividend: 2.1, week52Low: 70, week52High: 110, marketCap: '$45B',
    yearFounded: 1952, employees: 22000, headquarters: 'Houston, TX',
    logo: { type: 'symbol', value: '↑', bgColor: '#f59e0b' },
    background: `EnergyMax is a major integrated oil and gas producer with a dominant position in the Gulf of Mexico. Founded in 1952, it has spent 70 years developing some of the world's most productive reserves. With 22,000 employees across three continents, it generates strong free cash flow and recently completed three strategic acquisitions, becoming a top-5 global producer. The CEO is a former military pilot who loves sailing. They invested $500M in carbon capture, though activist pressure over fossil-fuel exposure is rising.`,
    annualReturn: 0.09, newsRelated: ['oil prices', 'opec decisions', 'energy demand'], assetClass: 'stock',
  },
  {
    id: 'cg', ticker: 'CG', name: 'ConsumerGoods', price: 110, sector: 'Consumer', sectorColor: SC.Consumer,
    pe: 18, beta: 0.8, dividend: 2.0, week52Low: 95, week52High: 125, marketCap: '$60B',
    yearFounded: 1965, employees: 38000, headquarters: 'Chicago, IL',
    logo: { type: 'initials', value: 'CG', bgColor: '#8b5cf6' },
    background: `ConsumerGoods is a retail powerhouse with 50+ years of history and a 5,000+ store footprint across North America and Europe. Founded in 1965 by two brothers, it is a household name with 38,000 employees and a fully domestic supply chain. The CEO is the founder's daughter, who modernized operations while honoring core values. Over 60% of customers identify as 'loyal.' They invested $2B in omnichannel infrastructure but recently faced supply-chain pressure from tariffs and wage inflation.`,
    annualReturn: 0.1, newsRelated: ['consumer spending', 'retail sales', 'supply chain'], assetClass: 'stock',
  },
  {
    id: 'bs', ticker: 'BS', name: 'BondSecure', price: 100, sector: 'Fixed Income', sectorColor: SC['Fixed Income'],
    pe: null, beta: 0.2, dividend: 4.0, week52Low: 99, week52High: 101, marketCap: '$200B',
    yearFounded: 1935, employees: 5000, headquarters: 'Washington, DC',
    logo: { type: 'symbol', value: '🛡', bgColor: '#6366f1' },
    background: `BondSecure represents the safest possible fixed-income investment, consisting entirely of US Treasury obligations backed by the full faith and credit of the US government. Established in 1935, the fund preserves capital with $200B under management and laddered maturities of 2 to 10 years. It has never missed a payment. Managed in Washington DC by former Treasury officials, its yields are tied directly to Federal Reserve policy. With the Fed signaling cuts, it has attracted heavy conservative inflows.`,
    annualReturn: 0.04, newsRelated: ['interest rates', 'inflation data', 'fed policy'], assetClass: 'bond',
  },
  {
    id: 'rr', ticker: 'RR', name: 'RealEstateRise', price: 75, sector: 'Real Estate', sectorColor: SC['Real Estate'],
    pe: 20, beta: 1.1, dividend: 5.2, week52Low: 60, week52High: 85, marketCap: '$35B',
    yearFounded: 1998, employees: 2500, headquarters: 'Atlanta, GA',
    logo: { type: 'symbol', value: '🏢', bgColor: '#f97316' },
    background: `RealEstateRise is a publicly traded REIT specializing in premium commercial properties across high-growth markets. Founded in 1998, it owns 200+ trophy assets worth over $35B, weighted 60% retail and 40% office. The CEO personally owns 10% and has a strong record of buying distressed assets and selling at premium valuations. It distributes 90% of net operating income, one of the highest yields in the sector. Post-pandemic, office occupancy is slowly declining, prompting a pivot to mixed-use developments.`,
    annualReturn: 0.07, newsRelated: ['real estate prices', 'occupancy rates', 'interest rates'], assetClass: 'stock',
  },
  {
    id: 'ce', ticker: 'CE', name: 'CleanEnergy', price: 210, sector: 'Energy', sectorColor: SC.Energy,
    pe: 45, beta: 2.5, dividend: 0.0, week52Low: 120, week52High: 240, marketCap: '$85B',
    yearFounded: 2015, employees: 8000, headquarters: 'Boulder, CO',
    logo: { type: 'symbol', value: '☀', bgColor: '#f59e0b' },
    background: `CleanEnergy is a disruptive solar and wind innovator growing 50%+ annually. Founded just 9 years ago in Boulder, it deploys gigawatts of renewable capacity across 12 countries. The CEO, only 32, founded it after dropping out of MIT to develop solar-efficiency technology. It serves 15 million households but is unprofitable, reinvesting 100% of revenue with zero dividend. The HQ runs on 400% renewable energy. Analysts are split: bulls see an energy-transition leader; bears worry about cash burn.`,
    annualReturn: 0.25, newsRelated: ['renewable adoption', 'climate policy', 'energy transition'], assetClass: 'stock',
  },
  {
    id: 'us', ticker: 'US', name: 'UtilityStable', price: 65, sector: 'Utilities', sectorColor: SC.Utilities,
    pe: 18, beta: 0.6, dividend: 3.8, week52Low: 63, week52High: 68, marketCap: '$40B',
    yearFounded: 1923, employees: 12000, headquarters: 'Louisville, KY',
    logo: { type: 'symbol', value: '⚙', bgColor: '#6b7280' },
    background: `UtilityStable is a regulated electric utility monopoly serving 5 million customers across the Southeast and Midwest — an essential, countercyclical service. Founded in 1923, it has invested $5B over a decade in smart-grid technology. Returns are regulated by state commissions, ensuring stable, predictable earnings. The CEO of 12 years is known for strong regulator relationships. It has increased its dividend every year for 25 consecutive years — a classic defensive holding — and committed to net-zero by 2050.`,
    annualReturn: 0.05, newsRelated: ['utility earnings', 'regulation', 'energy policy'], assetClass: 'stock',
  },
  {
    id: 'rd', ticker: 'RD', name: 'RetailDisrupt', price: 45, sector: 'Consumer', sectorColor: SC.Consumer,
    pe: 35, beta: 2.8, dividend: 0.0, week52Low: 15, week52High: 55, marketCap: '$12B',
    yearFounded: 2019, employees: 3500, headquarters: 'Seattle, WA',
    logo: { type: 'symbol', value: '🛒', bgColor: '#8b5cf6' },
    background: `RetailDisrupt is a venture-backed e-commerce startup with explosive user acquisition. Founded 5 years ago by two former Amazon engineers, it IPO'd at a $5B valuation in 2023 and has since doubled. Operating exclusively online with no physical stores, it has achieved 200%+ YoY growth via fast delivery (2-hour in major cities). It remains unprofitable, spending $2 on growth for every $1 of revenue. Wall Street is split, and it recently laid off 10% of staff to extend its cash runway.`,
    annualReturn: 0.4, newsRelated: ['e-commerce growth', 'startup funding', 'competition'], assetClass: 'stock',
  },
  {
    id: 'mc', ticker: 'MC', name: 'MineralCorp', price: 55, sector: 'Commodities', sectorColor: SC.Commodities,
    pe: 8, beta: 1.6, dividend: 6.5, week52Low: 40, week52High: 70, marketCap: '$25B',
    yearFounded: 1965, employees: 8500, headquarters: 'Santiago, Chile',
    logo: { type: 'symbol', value: '⛏', bgColor: '#14b8a6' },
    background: `MineralCorp is a major lithium and rare-earth miner producing battery materials for electric vehicles. Founded in 1965 in Chile, it controls some of the world's largest lithium deposits in the Atacama Desert, with operations in Chile, Australia, and South Africa. The CEO is a geologist. Its 6.5% dividend is high but variable, fluctuating with commodity prices near all-time highs. A new world-class mine comes online in 2026. Lithium prices are volatile and China controls much rare-earth processing.`,
    annualReturn: 0.12, newsRelated: ['ev sales', 'lithium prices', 'commodity prices'], assetClass: 'stock',
  },
  {
    id: 'as', ticker: 'AS', name: 'AeroSpace', price: 380, sector: 'Technology', sectorColor: SC.Technology,
    pe: 32, beta: 1.4, dividend: 0.8, week52Low: 290, week52High: 410, marketCap: '$150B',
    yearFounded: 1956, employees: 65000, headquarters: 'Long Beach, CA',
    logo: { type: 'symbol', value: '✈', bgColor: '#3b82f6' },
    background: `AeroSpace is a behemoth defense and commercial aerospace supplier. Founded in 1956, it has supplied every major aircraft model for 60+ years and is a cornerstone supplier for NASA and the DoD. With 65,000 employees, roughly 50% of revenue comes from long-term government contracts. The CEO is a former Air Force pilot. Supply-chain challenges delayed deliveries and pressured 2024 margins. A $2B Southern California facility modernization is underway. Rising defense budgets benefit it, though commercial aviation remains cyclical.`,
    annualReturn: 0.14, newsRelated: ['defense spending', 'airline demand', 'supply chain'], assetClass: 'stock',
  },
  {
    id: 'pt', ticker: 'PT', name: 'PharmaTech', price: 200, sector: 'Healthcare', sectorColor: SC.Healthcare,
    pe: 18, beta: 1.2, dividend: 2.3, week52Low: 160, week52High: 220, marketCap: '$95B',
    yearFounded: 1985, employees: 18000, headquarters: 'San Francisco, CA',
    logo: { type: 'symbol', value: '⚗', bgColor: '#ec4899' },
    background: `PharmaTech is a mid-cap biotech with several blockbuster drugs in its pipeline. Founded in 1985, it has brought 12 drugs to market and now has 4 in Phase 3 trials across oncology, immunology, and rare diseases, with FDA decisions expected within 18 months. With 18,000 employees, it invests 22% of revenue in R&D. Success could add $5B+ in annual revenue, but a patent cliff looms in 2027-2028. The stock is highly sensitive to regulatory news and trial readouts; recent preliminary data prompted analyst upgrades.`,
    annualReturn: 0.13, newsRelated: ['fda decisions', 'trial results', 'patent cliff'], assetClass: 'stock',
  },
  {
    id: 'fn', ticker: 'FN', name: 'FinTechNow', price: 180, sector: 'Finance', sectorColor: SC.Finance,
    pe: 50, beta: 2.2, dividend: 0.0, week52Low: 85, week52High: 200, marketCap: '$45B',
    yearFounded: 2016, employees: 5000, headquarters: 'San Francisco, CA',
    logo: { type: 'symbol', value: '📱', bgColor: '#10b981' },
    background: `FinTechNow is a venture-backed fintech disrupting banking with a mobile-first approach. Founded in 2016 by two former Google engineers, it has grown to 10 million users with 200%+ YoY growth and zero physical branches. The CEO, age 28, is a co-founder. User acquisition is viral among younger demographics, but profitability is elusive — it burns $500M annually. Regulatory scrutiny from the SEC and Fed is rising. It has raised $3B in venture funding; future raises may be dilutive in a higher-rate environment.`,
    annualReturn: 0.35, newsRelated: ['fintech regulation', 'venture funding', 'user growth'], assetClass: 'stock',
  },
  {
    id: 'at', ticker: 'AT', name: 'AgriTech', price: 70, sector: 'Consumer', sectorColor: SC.Consumer,
    pe: 22, beta: 0.7, dividend: 1.5, week52Low: 50, week52High: 85, marketCap: '$18B',
    yearFounded: 2010, employees: 2200, headquarters: 'Des Moines, IA',
    logo: { type: 'symbol', value: '🌱', bgColor: SC.Consumer },
    background: `AgriTech is a precision-agriculture software company modernizing farming through data analytics, IoT sensors, and AI insights. Founded in 2010 by a farming family in Iowa, it serves 50,000 farms globally with steady 15% annual growth. Using satellite imagery and soil sensors, it guides planting, irrigation, and pest management. With 70% gross margin and nearing operating break-even, it recently acquired a competitor for $400M. Its subscription model ($2k-$10k per farm) gives recurring revenue, though revenue is seasonal and commodity prices are volatile.`,
    annualReturn: 0.11, newsRelated: ['commodity prices', 'farm economics', 'climate'], assetClass: 'stock',
  },
  {
    id: 'si', ticker: 'SI', name: 'SemiconductorIntel', price: 165, sector: 'Technology', sectorColor: SC.Technology,
    pe: 18, beta: 1.9, dividend: 0.3, week52Low: 130, week52High: 185, marketCap: '$180B',
    yearFounded: 1968, employees: 110000, headquarters: 'Santa Clara, CA',
    logo: { type: 'initials', value: 'SI', bgColor: SC.Technology },
    background: `Established semiconductor manufacturer and fab operator. Founded 1968, now facing competition from TSMC and Samsung but remains dominant in CPU design. 110k employees across 30 fabrication facilities worldwide. CEO leading turnaround with $20B in new fab investments. Company supplies chips to every major tech company. Recent earnings beat but margin pressure from competition. Geopolitical tensions (China restrictions) add volatility. Patent portfolio extremely strong.`,
    annualReturn: 0.15, newsRelated: ['semiconductor demand', 'fab capacity', 'chip shortage'], assetClass: 'stock',
  },
  {
    id: 'hp', ticker: 'HP', name: 'HealthcarePharma', price: 120, sector: 'Healthcare', sectorColor: SC.Healthcare,
    pe: 25, beta: 1.5, dividend: 0.8, week52Low: 95, week52High: 140, marketCap: '$75B',
    yearFounded: 1995, employees: 8500, headquarters: 'Cambridge, MA',
    logo: { type: 'symbol', value: '⚕', bgColor: SC.Healthcare },
    background: `Boutique biotech focused on immunotherapy and oncology. Founded 1995 by Harvard researchers. 8,500 employees, entirely focused on cancer treatment pipeline. 2 drugs approaching FDA approval with blockbuster potential. CEO is chief scientific officer. Company has burned cash aggressively but recent funding rounds at higher valuations suggest confidence. Partnership with major pharma company de-risks development. Patent positions very strong in checkpoint inhibitors.`,
    annualReturn: 0.18, newsRelated: ['clinical trials', 'fda approval', 'partnership deals'], assetClass: 'stock',
  },
  {
    id: 'gb', ticker: 'GB', name: 'GreenBuildings', price: 68, sector: 'Real Estate', sectorColor: SC['Real Estate'],
    pe: 22, beta: 1.0, dividend: 4.8, week52Low: 55, week52High: 75, marketCap: '$28B',
    yearFounded: 2005, employees: 1800, headquarters: 'Austin, TX',
    logo: { type: 'symbol', value: '🏢', bgColor: SC['Real Estate'] },
    background: `Modern REIT specializing in sustainable, LEED-certified commercial properties. Founded 2005, now operates 120+ buildings in major US metros. Focus on ESG-compliant office and mixed-use properties. 1,800 employees, strong occupancy rates (92%+). CEO emphasizes climate-positive operations. Dividend is reliably paid from NOI. Post-pandemic office headwinds present risks, but flight-to-quality favors premium assets. Recent 10-year partnership with Fortune 500 company de-risks revenue. Strong ESG credentials attract ESG-focused institutional capital.`,
    annualReturn: 0.08, newsRelated: ['office demand', 'esg adoption', 'real estate prices'], assetClass: 'stock',
  },
  {
    id: 'et', ticker: 'ET', name: 'EnergyTransition', price: 92, sector: 'Energy', sectorColor: SC.Energy,
    pe: 16, beta: 1.4, dividend: 3.2, week52Low: 70, week52High: 110, marketCap: '$38B',
    yearFounded: 1987, employees: 9500, headquarters: 'Denver, CO',
    logo: { type: 'symbol', value: '⚡', bgColor: SC.Energy },
    background: `Legacy oil company pivoting toward renewables and hydrogen. Founded 1987, traditional oil & gas heritage but now 40% revenue from renewables. 9,500 employees split between traditional upstream and new renewable divisions. CEO committed to net-zero by 2050. Recently acquired solar company and hydrogen startup. Dividend remains attractive but faces pressure long-term. Stock reflects transition risk: upside if pivot succeeds, downside if oil demand collapses. Activism from both climate advocates and traditionalists. Geopolitical tensions support oil prices short-term.`,
    annualReturn: 0.1, newsRelated: ['energy transition', 'oil prices', 'renewable adoption'], assetClass: 'stock',
  },
  {
    id: 'pgm', ticker: 'PGM', name: 'PowerGridModern', price: 58, sector: 'Utilities', sectorColor: SC.Utilities,
    pe: 20, beta: 0.5, dividend: 4.2, week52Low: 55, week52High: 63, marketCap: '$32B',
    yearFounded: 2010, employees: 3200, headquarters: 'Atlanta, GA',
    logo: { type: 'symbol', value: '🔌', bgColor: SC.Utilities },
    background: `Modern utility operator focused on grid modernization and EV charging infrastructure. Founded 2010 (newer among utilities), primarily owns transmission and distribution networks. 3,200 employees, regulated monopoly in Southeast US. CEO emphasizes smart grid and distributed energy resources. Recently received regulatory approval for $5B infrastructure upgrade. Dividend growing 3-4% annually. Less volatile than traditional equities. Company positioned to benefit from EV adoption (charging infrastructure) and renewable integration. Regulatory environment supportive. Boring but stable.`,
    annualReturn: 0.05, newsRelated: ['utility earnings', 'grid modernization', 'ev infrastructure'], assetClass: 'stock',
  },
  {
    id: 'bgy', ticker: 'BGY', name: 'BondGovt10Yr', price: 100, sector: 'Fixed Income', sectorColor: SC['Fixed Income'],
    pe: null, beta: 0.3, dividend: 4.5, week52Low: 98, week52High: 102, marketCap: '$300B',
    yearFounded: 1935, employees: 2000, headquarters: 'Washington, DC',
    logo: { type: 'symbol', value: '📋', bgColor: SC['Fixed Income'] },
    background: `10-year US Treasury bonds, longest duration exposure. Issued by US Treasury. Lowest default risk possible. Price inverse to interest rates—when rates rise, prices fall; when rates fall, prices rise. Portfolio ladder strategy recommended. 2000 employees manage fund operations. Yield currently 4.5%, inversely correlated to growth equities. Excellent diversifier. Market has priced in Fed rate trajectory. Long-duration exposure means interest rate risk if inflation accelerates. Zero credit risk.`,
    annualReturn: 0.045, newsRelated: ['interest rates', 'inflation', 'fed policy'], assetClass: 'bond',
  },
  {
    id: 'csd', ticker: 'CSD', name: 'CyberSecurityDefense', price: 145, sector: 'Technology', sectorColor: SC.Technology,
    pe: 35, beta: 2.0, dividend: 0.0, week52Low: 95, week52High: 165, marketCap: '$65B',
    yearFounded: 2012, employees: 4500, headquarters: 'San Jose, CA',
    logo: { type: 'symbol', value: '🔒', bgColor: SC.Technology },
    background: `Cybersecurity SaaS platform protecting enterprise networks. Founded 2012, rapid growth 40%+ YoY. 4,500 employees, mostly engineers. CEO is former NSA cybersecurity director. Company provides AI-driven threat detection and response. No dividend (reinvests all revenue). Recent breaches at major corporations driving demand. Stock highly correlated to enterprise spending and security news. Recent government contracts worth $500M+ over 5 years. Patent portfolio strong in ML-based security. Valuation stretched but growth justifies multiples. Cyber attacks increasing in frequency, driving secular demand.`,
    annualReturn: 0.28, newsRelated: ['cybersecurity threats', 'breaches', 'government spending'], assetClass: 'stock',
  },
];

export const stocksById: Record<string, Stock> = STOCKS.reduce(
  (acc, s) => {
    acc[s.id] = s;
    return acc;
  },
  {} as Record<string, Stock>
);

export function getStocksByIds(ids: string[]): Stock[] {
  return ids.map((id) => stocksById[id]).filter(Boolean);
}

// Distinct sectors present, in a stable order (for the filter dropdown).
export const SECTORS: Sector[] = Array.from(new Set(STOCKS.map((s) => s.sector)));

export default STOCKS;
