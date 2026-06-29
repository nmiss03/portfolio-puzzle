import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import StockCard from '../components/StockCard';
import { getStocksByIds, Category } from '../data/stocks';
import { useGame } from '../state/GameContext';
import { colors, spacing, radius, font, categoryMeta } from '../theme';

export default function StockDashboard() {
  const router = useRouter();
  const { level } = useGame();
  const stocks = getStocksByIds(level.stockIds);

  const counts = stocks.reduce(
    (acc, s) => {
      acc[s.category] += 1;
      return acc;
    },
    { growth: 0, dividend: 0, bond: 0 } as Record<Category, number>
  );

  const order: Category[] = ['growth', 'dividend', 'bond'];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* ---- Computer monitor frame ---- */}
        <View style={styles.monitor}>
          <View style={styles.monitorScreen}>
            {/* tiny "terminal" title bar */}
            <View style={styles.terminalBar}>
              <View style={[styles.dot, { backgroundColor: colors.danger }]} />
              <View style={[styles.dot, { backgroundColor: colors.warning }]} />
              <View style={[styles.dot, { backgroundColor: colors.success }]} />
              <Text style={styles.terminalTitle}>STOCK TERMINAL</Text>
            </View>

            <Text style={styles.intro}>
              Compare the fundamentals — high P/E, no dividend and high volatility usually means a
              growth bet, while bonds barely move and pay steady income.
            </Text>

            <View style={styles.legendStrip}>
              {order.map((c) => (
                <View key={c} style={styles.legendItem}>
                  <View style={[styles.legendDot, { backgroundColor: categoryMeta[c].color }]} />
                  <Text style={styles.legendText}>
                    {counts[c]} {categoryMeta[c].label}
                  </Text>
                </View>
              ))}
            </View>

            {stocks.map((stock) => (
              <StockCard key={stock.id} stock={stock} />
            ))}
          </View>
        </View>

        {/* ---- Monitor stand ---- */}
        <View style={styles.standNeck} />
        <View style={styles.standBase} />
      </ScrollView>

      <View style={styles.footer}>
        <Button title="Build the Portfolio  ›" onPress={() => router.push('/AllocationUI')} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
    alignItems: 'center',
  },

  // Monitor
  monitor: {
    width: '100%',
    borderWidth: 4,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.bg,
    padding: spacing.sm,
  },
  monitorScreen: {
    backgroundColor: colors.bg,
    borderRadius: radius.sm,
    padding: spacing.md,
  },
  terminalBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: spacing.md,
    marginBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  terminalTitle: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
    marginLeft: spacing.sm,
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
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
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

  // Stand
  standNeck: {
    width: 80,
    height: 40,
    backgroundColor: '#999999',
  },
  standBase: {
    width: 160,
    height: 12,
    borderRadius: radius.sm,
    backgroundColor: '#999999',
    marginBottom: spacing.lg,
  },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
