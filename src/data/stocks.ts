// The 6 investable instruments, each in its own sector with a colorful card.

export type Sector = 'Technology' | 'Healthcare' | 'Finance' | 'Energy' | 'Consumer' | 'Bonds';
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
  dividend: number; // yield %
  logo: StockLogo;
  description: string;
  annualReturn: number; // e.g. 0.12 = 12%/yr
  assetClass: AssetClass;
}

const STOCKS: Stock[] = [
  {
    id: 'tc',
    ticker: 'TC',
    name: 'TechCorp',
    price: 150,
    sector: 'Technology',
    sectorColor: '#3b82f6',
    pe: 28,
    dividend: 0.5,
    logo: { type: 'initials', value: 'TC', bgColor: '#3b82f6' },
    description: 'Cloud infrastructure leader with 30% market share.',
    annualReturn: 0.12,
    assetClass: 'stock',
  },
  {
    id: 'bh',
    ticker: 'BH',
    name: 'BioHealth',
    price: 85,
    sector: 'Healthcare',
    sectorColor: '#ec4899',
    pe: 22,
    dividend: 1.2,
    logo: { type: 'symbol', value: '+', bgColor: '#ec4899' },
    description: 'Pharmaceutical innovator with a strong pipeline.',
    annualReturn: 0.11,
    assetClass: 'stock',
  },
  {
    id: 'ff',
    ticker: 'FF',
    name: 'FinanceFirst',
    price: 120,
    sector: 'Finance',
    sectorColor: '#10b981',
    pe: 15,
    dividend: 3.5,
    logo: { type: 'symbol', value: '$', bgColor: '#10b981' },
    description: 'Established bank with a stable dividend history.',
    annualReturn: 0.08,
    assetClass: 'stock',
  },
  {
    id: 'em',
    ticker: 'EM',
    name: 'EnergyMax',
    price: 95,
    sector: 'Energy',
    sectorColor: '#f59e0b',
    pe: 12,
    dividend: 2.1,
    logo: { type: 'symbol', value: '↑', bgColor: '#f59e0b' },
    description: 'Oil & gas producer with strong cash flow.',
    annualReturn: 0.09,
    assetClass: 'stock',
  },
  {
    id: 'cg',
    ticker: 'CG',
    name: 'ConsumerGoods',
    price: 110,
    sector: 'Consumer',
    sectorColor: '#8b5cf6',
    pe: 18,
    dividend: 2.0,
    logo: { type: 'initials', value: 'CG', bgColor: '#8b5cf6' },
    description: 'Retail powerhouse with global reach.',
    annualReturn: 0.1,
    assetClass: 'stock',
  },
  {
    id: 'bs',
    ticker: 'BS',
    name: 'BondSecure',
    price: 100,
    sector: 'Bonds',
    sectorColor: '#6b7280',
    pe: null,
    dividend: 4.0,
    logo: { type: 'symbol', value: '🛡', bgColor: '#6b7280' },
    description: 'Government bonds — low-risk, stable income.',
    annualReturn: 0.04,
    assetClass: 'bond',
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
