// Hardcoded universe of 10 instruments available in Level 1.
//
// category   -> used by the scoring engine to bucket the portfolio
// assetClass -> used for the stocks-vs-bonds split
// peRatio: null means "N/A" (no positive earnings, or not applicable to bonds)
// dividendYield / volatility are annualized percentages
//
// The data is intentionally readable: growth names have sky-high P/E, zero
// dividend and high volatility; dividend names are cheaper with real yield and
// calmer prices; bonds barely move and pay steady income.

export type Category = 'growth' | 'dividend' | 'bond';
export type AssetClass = 'stock' | 'bond';

export interface Stock {
  id: string;
  ticker: string;
  name: string;
  sector: string;
  price: number;
  peRatio: number | null;
  dividendYield: number;
  volatility: number;
  /** Extra research fundamentals shown on the stock page. */
  marketCap: string;
  beta: number;
  eps: number | null;
  week52Low: number;
  week52High: number;
  category: Category;
  assetClass: AssetClass;
  blurb: string;
  /** One-line neutral company description. */
  description: string;
  /** A few sentences mixing relevant and irrelevant facts — the player reads
   *  to separate signal from noise. */
  background: string;
}

const STOCKS: Stock[] = [
  // ---- 5 tech / growth -------------------------------------------------
  {
    id: 'nvx',
    ticker: 'NVX',
    name: 'NovaChip Semiconductors',
    sector: 'Technology',
    price: 485.2,
    peRatio: 68.4,
    dividendYield: 0.0,
    volatility: 52,
    marketCap: '$1.18T',
    beta: 1.8,
    eps: 7.09,
    week52Low: 240.0,
    week52High: 520.5,
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Designs AI accelerator chips. Explosive revenue growth, no dividend.',
    description: 'Designs the high-end chips that power AI data centers worldwide.',
    background:
      'Founded in 2009 in Austin, Texas. Revenue has tripled in the last three years as AI demand exploded. The CEO is an avid marathon runner. Holds a commanding share of the AI accelerator market. Its campus cafeteria is famous for free smoothies.',
  },
  {
    id: 'qcld',
    ticker: 'QCLD',
    name: 'Quantum Cloud',
    sector: 'Technology',
    price: 312.75,
    peRatio: 55.1,
    dividendYield: 0.0,
    volatility: 47,
    marketCap: '$210B',
    beta: 1.6,
    eps: 5.68,
    week52Low: 180.0,
    week52High: 340.2,
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Cloud + quantum compute platform reinvesting every dollar into growth.',
    description: 'Runs a fast-growing cloud platform and an experimental quantum division.',
    background:
      'Started as a college side project in 2014. Reinvests nearly all profit back into expansion rather than paying dividends. The headquarters has a rooftop beehive. Customer base is doubling roughly every two years. Its mascot is a cartoon owl named Q.',
  },
  {
    id: 'byte',
    ticker: 'BYTE',
    name: 'ByteForge AI',
    sector: 'Technology',
    price: 128.4,
    peRatio: 82.0,
    dividendYield: 0.0,
    volatility: 58,
    marketCap: '$28B',
    beta: 2.1,
    eps: 1.57,
    week52Low: 60.0,
    week52High: 150.75,
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Generative-AI tooling startup. Priced for huge future earnings.',
    description: 'Builds developer tools for generative-AI applications.',
    background:
      'A young company that IPO\'d only last year. Its products are still early but adoption among startups is climbing quickly. The founders met at a hackathon. It has the highest valuation-to-earnings ratio of any name on this list. Their office dog, Pixel, has a popular social media account.',
  },
  {
    id: 'sln',
    ticker: 'SLN',
    name: 'SolarNova Energy',
    sector: 'Clean Energy',
    price: 94.1,
    peRatio: 45.3,
    dividendYield: 0.0,
    volatility: 49,
    marketCap: '$15B',
    beta: 1.7,
    eps: 2.08,
    week52Low: 48.0,
    week52High: 110.4,
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Next-gen solar manufacturer scaling fast in a booming sector.',
    description: 'Manufactures next-generation high-efficiency solar panels.',
    background:
      'Founded in 2011 in Arizona. Operates in the fast-growing but volatile clean-energy sector. The company sponsors a local little-league team. Demand swings sharply with government subsidy cycles. Its newest factory runs entirely on its own solar power.',
  },
  {
    id: 'mdgn',
    ticker: 'MDGN',
    name: 'MediGen Bio',
    sector: 'Biotech',
    price: 61.85,
    peRatio: null,
    dividendYield: 0.0,
    volatility: 64,
    marketCap: '$6B',
    beta: 2.4,
    eps: null,
    week52Low: 22.0,
    week52High: 80.3,
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Pre-profit gene-therapy lab. High risk, high potential reward.',
    description: 'A clinical-stage biotech developing gene therapies.',
    background:
      'Spun out of a university research lab in 2016. It is not yet profitable and its value hinges on trial results. The lab keeps a tank of tropical fish in the lobby. A single FDA decision could double or halve the stock. Its scientists publish frequently in major journals.',
  },

  // ---- 3 dividend stocks ----------------------------------------------
  {
    id: 'orf',
    ticker: 'ORF',
    name: 'Old Reliable Foods',
    sector: 'Consumer Staples',
    price: 58.3,
    peRatio: 19.2,
    dividendYield: 3.4,
    volatility: 14,
    marketCap: '$42B',
    beta: 0.6,
    eps: 3.04,
    week52Low: 50.1,
    week52High: 64.2,
    category: 'dividend',
    assetClass: 'stock',
    blurb: 'Boring, steady packaged-foods giant that pays a dependable dividend.',
    description: 'A century-old packaged-foods company with steady sales.',
    background:
      'Founded in 1921 and family-run for three generations. Sales barely move year to year, which makes it dependable. It has paid an uninterrupted dividend for over 40 years. The original factory still operates in Ohio. The current CEO collects vintage cookbooks.',
  },
  {
    id: 'mgb',
    ticker: 'MGB',
    name: 'MegaBank Financial',
    sector: 'Financials',
    price: 42.15,
    peRatio: 11.8,
    dividendYield: 4.1,
    volatility: 22,
    marketCap: '$88B',
    beta: 1.1,
    eps: 3.57,
    week52Low: 33.5,
    week52High: 47.8,
    category: 'dividend',
    assetClass: 'stock',
    blurb: 'Large retail bank. Modest growth, attractive dividend yield.',
    description: 'A large national retail and commercial bank.',
    background:
      'Traces its roots to 1888. Profits grow slowly but it returns a lot of cash to shareholders via dividends. It recently updated its mobile app to positive reviews. Earnings are sensitive to interest-rate changes. The bank sponsors an annual charity 10k run.',
  },
  {
    id: 'pwg',
    ticker: 'PWG',
    name: 'PowerGrid Utilities',
    sector: 'Utilities',
    price: 77.6,
    peRatio: 16.5,
    dividendYield: 4.8,
    volatility: 12,
    marketCap: '$31B',
    beta: 0.4,
    eps: 4.7,
    week52Low: 70.2,
    week52High: 82.1,
    category: 'dividend',
    assetClass: 'stock',
    blurb: 'Regulated electric utility. Low growth, low volatility, fat dividend.',
    description: 'A regulated electric utility serving several states.',
    background:
      'Established in 1934 as a public power provider. Its regulated rates make revenue very predictable and the stock calm. It pays one of the highest dividends on this list. The company is slowly expanding into wind power. Its headquarters lobby features a small museum of antique light bulbs.',
  },

  // ---- 2 bonds ---------------------------------------------------------
  {
    id: 'ustb',
    ticker: 'USTB',
    name: 'US Treasury Bond Fund',
    sector: 'Government Bonds',
    price: 99.85,
    peRatio: null,
    dividendYield: 4.2,
    volatility: 4,
    marketCap: '$24B AUM',
    beta: 0.1,
    eps: null,
    week52Low: 96.5,
    week52High: 102.3,
    category: 'bond',
    assetClass: 'bond',
    blurb: 'Government bonds. The safe-haven anchor of a portfolio.',
    description: 'A fund holding U.S. government bonds of various maturities.',
    background:
      'Backed by the full faith and credit of the U.S. government, so default risk is minimal. Its price moves very little, making it a portfolio anchor. The fund was launched in 2002. Returns are modest but steady. The fund manager is based in Boston and bikes to work.',
  },
  {
    id: 'corp',
    ticker: 'CORP',
    name: 'Investment-Grade Corporate Bond Fund',
    sector: 'Corporate Bonds',
    price: 101.4,
    peRatio: null,
    dividendYield: 5.1,
    volatility: 6,
    marketCap: '$31B AUM',
    beta: 0.2,
    eps: null,
    week52Low: 98.1,
    week52High: 104.6,
    category: 'bond',
    assetClass: 'bond',
    blurb: 'High-quality corporate bonds. A bit more yield, still very stable.',
    description: 'A fund holding investment-grade corporate bonds.',
    background:
      'Holds bonds from large, financially healthy companies. It yields a little more than government bonds in exchange for slightly more risk. The fund celebrated its 20th anniversary recently. Price movements are small and gradual. Its prospectus is printed on recycled paper.',
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

export default STOCKS;
