import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, radius, font, categoryMeta } from '../theme';

/**
 * A stacked bar showing the growth / dividend / bond split of an allocation,
 * with an optional legend. `byCategory` is { growth, dividend, bond } in %.
 */
export default function AllocationBar({ byCategory, total, showLegend = true, height = 14 }) {
  const order = ['growth', 'dividend', 'bond'];
  const sum = total != null ? total : order.reduce((a, c) => a + (byCategory[c] || 0), 0);

  return (
    <View>
      <View style={[styles.bar, { height, borderRadius: height }]}>
        {sum === 0 ? (
          <View style={styles.empty} />
        ) : (
          order.map((c) => {
            const v = byCategory[c] || 0;
            if (v <= 0) return null;
            return (
              <View
                key={c}
                style={{ width: `${(v / Math.max(sum, 100)) * 100}%`, backgroundColor: categoryMeta[c].color }}
              />
            );
          })
        )}
      </View>

      {showLegend && (
        <View style={styles.legend}>
          {order.map((c) => (
            <View key={c} style={styles.legendItem}>
              <View style={[styles.dot, { backgroundColor: categoryMeta[c].color }]} />
              <Text style={styles.legendLabel}>{categoryMeta[c].label}</Text>
              <Text style={styles.legendValue}>{Math.round(byCategory[c] || 0)}%</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    width: '100%',
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  empty: {
    flex: 1,
    backgroundColor: colors.surfaceAlt,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 5,
    marginRight: spacing.xs,
  },
  legendLabel: {
    color: colors.subtext,
    fontSize: font.sm,
    marginRight: spacing.xs,
  },
  legendValue: {
    color: colors.text,
    fontSize: font.sm,
    fontWeight: '700',
  },
});
