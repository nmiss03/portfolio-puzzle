import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { colors, spacing, font } from '../theme';

/**
 * A compact label-over-value stat cell, used inside stock cards.
 */
export default function StatItem({ label, value, valueColor, style }) {
  return (
    <View style={[styles.cell, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, valueColor && { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  cell: {
    minWidth: 64,
  },
  label: {
    color: colors.muted,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  value: {
    color: colors.text,
    fontSize: font.md,
    fontWeight: '700',
  },
});
