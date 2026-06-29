// Central design tokens so every screen shares one look.
// "Trading terminal" dark palette — calm navy with bright accents.

import { Category } from './data/stocks';

export const colors = {
  bg: '#0B1220',
  surface: '#16203A',
  surfaceAlt: '#1B2740',
  border: '#27355A',
  borderStrong: '#3A4D7A',

  text: '#E6EDF7',
  subtext: '#9FB0CC',
  muted: '#6B7CA0',

  primary: '#3B82F6',
  primaryDark: '#2563EB',

  success: '#22C55E',
  warning: '#F59E0B',
  danger: '#EF4444',

  // Asset categories (used for badges + charts)
  growth: '#8B5CF6',
  dividend: '#06B6D4',
  bond: '#10B981',

  white: '#FFFFFF',
  black: '#000000',
};

export const categoryMeta: Record<Category, { label: string; color: string }> = {
  growth: { label: 'Growth', color: colors.growth },
  dividend: { label: 'Dividend', color: colors.dividend },
  bond: { label: 'Bond', color: colors.bond },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const font = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 18,
  xl: 22,
  xxl: 28,
  display: 34,
};
