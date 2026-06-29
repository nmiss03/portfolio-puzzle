// Small formatting helpers shared by the stock UI.

import { colors } from '../theme';

export function formatPrice(price) {
  return `$${price.toFixed(2)}`;
}

export function formatPE(peRatio) {
  return peRatio == null ? 'N/A' : peRatio.toFixed(1);
}

export function formatPercent(value, digits = 1) {
  return `${value.toFixed(digits)}%`;
}

// Turn an annualized volatility number into a friendly risk label + color.
export function volatilityLabel(vol) {
  if (vol <= 8) return { label: 'Very Low', color: colors.bond };
  if (vol <= 20) return { label: 'Low', color: colors.success };
  if (vol <= 35) return { label: 'Medium', color: colors.warning };
  if (vol <= 50) return { label: 'High', color: '#F97316' };
  return { label: 'Very High', color: colors.danger };
}

export function formatMoney(amount) {
  return `$${amount.toLocaleString('en-US')}`;
}
