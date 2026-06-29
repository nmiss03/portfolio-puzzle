import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Badge from './Badge';
import StatItem from './StatItem';
import { colors, spacing, radius, font, categoryMeta } from '../theme';
import { formatPrice, formatPE, formatPercent, volatilityLabel } from '../utils/format';

/**
 * Full stock card for the dashboard: identity, price, category, and the key
 * fundamentals (P/E, dividend yield, volatility).
 */
export default function StockCard({ stock }) {
  const cat = categoryMeta[stock.category];
  const vol = volatilityLabel(stock.volatility);

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.identity}>
          <Text style={styles.ticker}>{stock.ticker}</Text>
          <Text style={styles.name} numberOfLines={1}>
            {stock.name}
          </Text>
        </View>
        <Text style={styles.price}>{formatPrice(stock.price)}</Text>
      </View>

      <View style={styles.badgeRow}>
        <Badge label={stock.sector} color={colors.subtext} />
        <Badge label={cat.label} color={cat.color} style={{ marginLeft: spacing.xs }} />
      </View>

      <Text style={styles.blurb}>{stock.blurb}</Text>

      <View style={styles.statsRow}>
        <StatItem label="P/E" value={formatPE(stock.peRatio)} />
        <StatItem
          label="Div Yield"
          value={formatPercent(stock.dividendYield)}
          valueColor={stock.dividendYield > 0 ? colors.dividend : colors.muted}
        />
        <StatItem label="Volatility" value={vol.label} valueColor={vol.color} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  identity: {
    flex: 1,
    paddingRight: spacing.sm,
  },
  ticker: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  name: {
    color: colors.subtext,
    fontSize: font.sm,
    marginTop: 1,
  },
  price: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  blurb: {
    color: colors.subtext,
    fontSize: font.sm,
    lineHeight: 19,
    marginTop: spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
