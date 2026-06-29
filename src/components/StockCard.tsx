import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Badge from './Badge';
import StatItem from './StatItem';
import { Stock } from '../data/stocks';
import { colors, spacing, radius, font, categoryMeta } from '../theme';
import { formatPrice, formatPE, formatPercent, volatilityLabel } from '../utils/format';

/**
 * Full stock card for the dashboard: a blue accent header (ticker + price)
 * over a white body with category, blurb, and the key fundamentals
 * (P/E, dividend yield, volatility).
 */
export default function StockCard({ stock }: { stock: Stock }) {
  const cat = categoryMeta[stock.category];
  const vol = volatilityLabel(stock.volatility);

  return (
    <View style={styles.card}>
      {/* Blue accent header */}
      <View style={styles.header}>
        <Text style={styles.ticker}>{stock.ticker}</Text>
        <Text style={styles.price}>{formatPrice(stock.price)}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={1}>
          {stock.name}
        </Text>

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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  ticker: {
    color: colors.white,
    fontSize: font.lg,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  price: {
    color: colors.white,
    fontSize: font.lg,
    fontWeight: '800',
  },
  body: {
    padding: spacing.lg,
  },
  name: {
    color: colors.text,
    fontSize: font.md,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.sm,
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
