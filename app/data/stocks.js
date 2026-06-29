// Hardcoded universe of 10 instruments available in Level 1.
//
// category: 'growth' | 'dividend' | 'bond'   -> used by the scoring engine
// assetClass: 'stock' | 'bond'               -> used for the stocks-vs-bonds split
// peRatio:    null means "N/A" (no positive earnings, or not applicable to bonds)
// dividendYield / volatility are annualized percentages
//
// The data is intentionally readable: growth names have sky-high P/E, zero
// dividend and high volatility; dividend names are cheaper with real yield and
// calmer prices; bonds barely move and pay steady income.

const STOCKS = [
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
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Designs AI accelerator chips. Explosive revenue growth, no dividend.',
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
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Cloud + quantum compute platform reinvesting every dollar into growth.',
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
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Generative-AI tooling startup. Priced for huge future earnings.',
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
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Next-gen solar manufacturer scaling fast in a booming sector.',
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
    category: 'growth',
    assetClass: 'stock',
    blurb: 'Pre-profit gene-therapy lab. High risk, high potential reward.',
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
    category: 'dividend',
    assetClass: 'stock',
    blurb: 'Boring, steady packaged-foods giant that pays a dependable dividend.',
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
    category: 'dividend',
    assetClass: 'stock',
    blurb: 'Large retail bank. Modest growth, attractive dividend yield.',
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
    category: 'dividend',
    assetClass: 'stock',
    blurb: 'Regulated electric utility. Low growth, low volatility, fat dividend.',
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
    category: 'bond',
    assetClass: 'bond',
    blurb: 'Government bonds. The safe-haven anchor of a portfolio.',
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
    category: 'bond',
    assetClass: 'bond',
    blurb: 'High-quality corporate bonds. A bit more yield, still very stable.',
  },
];

// Lookup helpers used across screens.
export const stocksById = STOCKS.reduce((acc, s) => {
  acc[s.id] = s;
  return acc;
}, {});

export function getStocksByIds(ids) {
  return ids.map((id) => stocksById[id]).filter(Boolean);
}

export default STOCKS;
