import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { C, FONT_PIXEL } from '../theme';

interface Props {
  value: number; // 0..100
  height?: number;
  showLabel?: boolean;
}

export default function HappinessMeter({ value, height = 10, showLabel = true }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  // Color shifts from red (sad) through gold toward green (happy).
  const color = pct < 30 ? C.danger : pct < 60 ? C.gold : C.success;
  return (
    <View style={styles.wrap}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>HAPPINESS</Text>
          <Text style={[styles.value, { color }]}>{Math.round(pct)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height }]}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontFamily: FONT_PIXEL, color: C.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  value: { fontFamily: FONT_PIXEL, fontSize: 12, fontWeight: '800' },
  track: { width: '100%', backgroundColor: C.panelDark, borderWidth: 2, borderColor: C.border, overflow: 'hidden' },
});
