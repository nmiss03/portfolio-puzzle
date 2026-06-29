import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Header from '../components/Header';
import Button from '../components/Button';
import StockCard from '../components/StockCard';
import { getStocksByIds } from '../data/stocks';
import { colors, spacing, radius, font, categoryMeta } from '../theme';

export default function StockDashboard({ level, onBack, onContinue }) {
  const stocks = getStocksByIds(level.stockIds);

  // Group counts for the little summary strip.
  const counts = stocks.reduce(
    (acc, s) => {
      acc[s.category] = (acc[s.category] || 0) + 1;
      return acc;
    },
    { growth: 0, dividend: 0, bond: 0 }
  );

  return (
    <View style={styles.screen}>
      <Header title="Stock Dashboard" subtitle={`${stocks.length} instruments available`} onBack={onBack} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          Here's the menu. Compare fundamentals — high P/E, no dividend and high volatility usually
          means a growth bet, while bonds barely move and pay steady income.
        </Text>

        <View style={styles.legendStrip}>
          {['growth', 'dividend', 'bond'].map((c) => (
            <View key={c} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: categoryMeta[c].color }]} />
              <Text style={styles.legendText}>
                {counts[c]} {categoryMeta[c].label}
              </Text>
            </View>
          ))}
        </View>

        {stocks.map((stock) => (
          <StockCard key={stock.id} stock={stock} />
        ))}
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Build the Portfolio  ›" onPress={onContinue} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  intro: {
    color: colors.subtext,
    fontSize: font.md,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  legendStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.sm,
  },
  legendText: {
    color: colors.text,
    fontSize: font.sm,
    fontWeight: '700',
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
