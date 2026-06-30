// The investable universe — 15 varied instruments across sectors.

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
export type Volatility = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';

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
  dividend: number; // yield %
  week52Low: number;
  week52High: number;
  marketCap: string;
  volatility: Volatility;
  logo: StockLogo;
  description: string;
  annualReturn: number;
  assetClass: AssetClass;
}

const SECTOR_COLOR: Record<Sector, string> = {
  Technology: '#3b82f6',
  Healthcare: '#ec4899',
  Finance: '#10b981',
  Energy: '#f59e0b',
  Consumer: '#8b5cf6',
  'Real Estate': '#f97316',
  Utilities: '#6b7280',
  Commodities: '#14b8a6',
  'Fixed Income': '#6366f1',
};

const STOCKS: Stock[] = [
  {
    id: 'tc', ticker: 'TC', name: 'TechCorp', price: 150, sector: 'Technology', sectorColor: SECTOR_COLOR.Technology,
    pe: 28, dividend: 0.5, week52Low: 95, week52High: 165, marketCap: '$250B', volatility: 'High',
    logo: { type: 'initials', value: 'TC', bgColor: '#3b82f6' },
    description: 'Cloud infrastructure leader, 30% market share. CEO enjoys golf. Recently renovated office kitchen. Serves 50,000+ enterprise customers. Founded 1998. Has a dog named Max.',
    annualReturn: 0.12, assetClass: 'stock',
  },
  {
    id: 'bh', ticker: 'BH', name: 'BioHealth', price: 85, sector: 'Healthcare', sectorColor: SECTOR_COLOR.Healthcare,
    pe: 22, dividend: 1.2, week52Low: 70, week52High: 95, marketCap: '$120B', volatility: 'High',
    logo: { type: 'symbol', value: '✚', bgColor: '#ec4899' },
    description: 'Pharmaceutical innovator with strong drug pipeline. 3 candidates in phase 3 trials. CEO has published 50+ papers. Office relocated to Boston suburbs. Only beverages offered are sparkling water.',
    annualReturn: 0.11, assetClass: 'stock',
  },
  {
    id: 'ff', ticker: 'FF', name: 'FinanceFirst', price: 120, sector: 'Finance', sectorColor: SECTOR_COLOR.Finance,
    pe: 15, dividend: 3.5, week52Low: 110, week52High: 135, marketCap: '$80B', volatility: 'Low',
    logo: { type: 'symbol', value: '$', bgColor: '#10b981' },
    description: 'Established bank, 150 years old. Dividend paid consecutively for 120 years. Offices in 45 countries. CEO has been in role 8 years. Recently switched to sustainably sourced coffee.',
    annualReturn: 0.08, assetClass: 'stock',
  },
  {
    id: 'em', ticker: 'EM', name: 'EnergyMax', price: 95, sector: 'Energy', sectorColor: SECTOR_COLOR.Energy,
    pe: 12, dividend: 2.1, week52Low: 70, week52High: 110, marketCap: '$45B', volatility: 'Medium',
    logo: { type: 'symbol', value: '↑', bgColor: '#f59e0b' },
    description: 'Oil & gas producer, strong cash flow. Largest reserves in the Gulf. Recently acquired 3 smaller competitors. CEO\'s hobby is sailing. Office has a basement gym nobody uses.',
    annualReturn: 0.09, assetClass: 'stock',
  },
  {
    id: 'cg', ticker: 'CG', name: 'ConsumerGoods', price: 110, sector: 'Consumer', sectorColor: SECTOR_COLOR.Consumer,
    pe: 18, dividend: 2.0, week52Low: 95, week52High: 125, marketCap: '$60B', volatility: 'Low',
    logo: { type: 'initials', value: 'CG', bgColor: '#8b5cf6' },
    description: 'Retail powerhouse, 5,000+ stores globally. 50-year brand loyalty. Supply chain entirely domestic. CEO is daughter of founder. Cafeteria serves 3 different lunch options daily.',
    annualReturn: 0.1, assetClass: 'stock',
  },
  {
    id: 'bs', ticker: 'BS', name: 'BondSecure', price: 100, sector: 'Fixed Income', sectorColor: SECTOR_COLOR['Fixed Income'],
    pe: null, dividend: 4.0, week52Low: 99, week52High: 101, marketCap: '$200B', volatility: 'Very Low',
    logo: { type: 'symbol', value: '🛡', bgColor: '#6366f1' },
    description: 'Government-backed bonds, zero default risk historically. Issued by US Treasury. Completely predictable. No CEO (government issued). Interest rates tied to federal policy.',
    annualReturn: 0.04, assetClass: 'bond',
  },
  {
    id: 'rr', ticker: 'RR', name: 'RealEstateRise', price: 75, sector: 'Real Estate', sectorColor: SECTOR_COLOR['Real Estate'],
    pe: 20, dividend: 5.2, week52Low: 60, week52High: 85, marketCap: '$35B', volatility: 'Medium',
    logo: { type: 'symbol', value: '🏠', bgColor: '#f97316' },
    description: 'Commercial real estate REIT, 200+ properties. Dividend payout 90% of earnings. CEO owns 10% personally. Portfolio weighted 60% retail, 40% office. Headquarters in Miami.',
    annualReturn: 0.07, assetClass: 'stock',
  },
  {
    id: 'ce', ticker: 'CE', name: 'CleanEnergy', price: 210, sector: 'Energy', sectorColor: SECTOR_COLOR.Energy,
    pe: 45, dividend: 0.0, week52Low: 120, week52High: 240, marketCap: '$85B', volatility: 'Very High',
    logo: { type: 'symbol', value: '☀', bgColor: '#f59e0b' },
    description: 'Solar & wind innovator, unprofitable but growing 50%+ annually. Backed by venture capital. CEO is 32 years old. Operates in 12 countries. No dividend, reinvests all earnings.',
    annualReturn: 0.25, assetClass: 'stock',
  },
  {
    id: 'us', ticker: 'US', name: 'UtilityStable', price: 65, sector: 'Utilities', sectorColor: SECTOR_COLOR.Utilities,
    pe: 18, dividend: 3.8, week52Low: 63, week52High: 68, marketCap: '$40B', volatility: 'Very Low',
    logo: { type: 'symbol', value: '⚙', bgColor: '#6b7280' },
    description: 'Monopoly utility provider, serves 5M customers. Regulated by government. 80-year-old infrastructure. CEO tenure: 12 years. Dividend increased every year for 25 years consecutively.',
    annualReturn: 0.05, assetClass: 'stock',
  },
  {
    id: 'rd', ticker: 'RD', name: 'RetailDisrupt', price: 45, sector: 'Consumer', sectorColor: SECTOR_COLOR.Consumer,
    pe: 35, dividend: 0.0, week52Low: 15, week52High: 55, marketCap: '$12B', volatility: 'Very High',
    logo: { type: 'symbol', value: '🛒', bgColor: '#8b5cf6' },
    description: 'Fast-growing e-commerce startup, only 5 years old. Unprofitable but massive user growth (200% YoY). CEO founded company in garage. No physical stores. Cash burn rate unsustainable long-term.',
    annualReturn: 0.4, assetClass: 'stock',
  },
  {
    id: 'mc', ticker: 'MC', name: 'MineralCorp', price: 55, sector: 'Commodities', sectorColor: SECTOR_COLOR.Commodities,
    pe: 8, dividend: 6.5, week52Low: 40, week52High: 70, marketCap: '$25B', volatility: 'High',
    logo: { type: 'symbol', value: '⛏', bgColor: '#14b8a6' },
    description: 'Lithium & rare earth miner. Essential for EV batteries. Prices volatile with commodity cycles. CEO is a geologist. New mine coming online in 2026. Dividend varies with commodity prices.',
    annualReturn: 0.12, assetClass: 'stock',
  },
  {
    id: 'as', ticker: 'AS', name: 'AeroSpace', price: 380, sector: 'Technology', sectorColor: SECTOR_COLOR.Technology,
    pe: 32, dividend: 0.8, week52Low: 290, week52High: 410, marketCap: '$150B', volatility: 'Medium',
    logo: { type: 'symbol', value: '✈', bgColor: '#3b82f6' },
    description: 'Defense & commercial aerospace supplier. 50% revenue from government contracts. CEO is a former Air Force pilot. Supply chain issues delayed 2024 earnings. 30-year-old facility being modernized.',
    annualReturn: 0.14, assetClass: 'stock',
  },
  {
    id: 'pt', ticker: 'PT', name: 'PharmaTech', price: 200, sector: 'Healthcare', sectorColor: SECTOR_COLOR.Healthcare,
    pe: 18, dividend: 2.3, week52Low: 160, week52High: 220, marketCap: '$95B', volatility: 'Medium',
    logo: { type: 'symbol', value: '⚗', bgColor: '#ec4899' },
    description: 'Mid-cap biotech, several blockbuster drugs in pipeline. FDA approval expected next year. CEO published in top journals. Drug efficacy trials still ongoing. Patent cliff approaching in 2028.',
    annualReturn: 0.13, assetClass: 'stock',
  },
  {
    id: 'fn', ticker: 'FN', name: 'FinTechNow', price: 180, sector: 'Finance', sectorColor: SECTOR_COLOR.Finance,
    pe: 50, dividend: 0.0, week52Low: 85, week52High: 200, marketCap: '$45B', volatility: 'Very High',
    logo: { type: 'symbol', value: '📱', bgColor: '#10b981' },
    description: 'Disruptive fintech, mobile-first banking. 10M users, 200% growth YoY. Unprofitable, burning cash fast. CEO is a former Google engineer, age 28. Regulatory scrutiny increasing. No clear path to profitability.',
    annualReturn: 0.35, assetClass: 'stock',
  },
  {
    id: 'at', ticker: 'AT', name: 'AgriTech', price: 70, sector: 'Consumer', sectorColor: SECTOR_COLOR.Consumer,
    pe: 22, dividend: 1.5, week52Low: 50, week52High: 85, marketCap: '$18B', volatility: 'Low',
    logo: { type: 'symbol', value: '🌿', bgColor: '#8b5cf6' },
    description: 'Agricultural technology, precision farming software. Serves 50,000 farmers globally. Steady growth 15% annually. CEO from a farming family. Recently acquired a competitor. Seasonal revenue patterns.',
    annualReturn: 0.11, assetClass: 'stock',
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
