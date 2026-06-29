import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { radius, spacing, font } from '../theme';

/**
 * Small colored pill. Pass a `color` (the accent) and we render a tinted
 * background with matching text.
 */
export default function Badge({ label, color, style }) {
  return (
    <View style={[styles.badge, { backgroundColor: withAlpha(color, 0.18), borderColor: withAlpha(color, 0.5) }, style]}>
      <Text style={[styles.text, { color }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

// Accept #RRGGBB and append an alpha channel as #RRGGBBAA.
function withAlpha(hex, alpha) {
  if (typeof hex !== 'string' || hex[0] !== '#' || hex.length < 7) return hex;
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, '0');
  return `${hex.slice(0, 7)}${a}`;
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  text: {
    fontSize: font.xs,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
