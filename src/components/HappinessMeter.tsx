import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  value: number; // 0..100
  height?: number;
  showLabel?: boolean;
}

export default function HappinessMeter({ value, height = 10, showLabel = true }: Props) {
  const pct = Math.max(0, Math.min(100, value));
  // Color shifts from red (sad) through blue toward green (happy).
  const color = pct < 30 ? '#ef4444' : pct < 60 ? '#4a90e2' : '#22c55e';
  return (
    <View style={styles.wrap}>
      {showLabel && (
        <View style={styles.labelRow}>
          <Text style={styles.label}>Happiness</Text>
          <Text style={[styles.value, { color }]}>{Math.round(pct)}%</Text>
        </View>
      )}
      <View style={[styles.track, { height, borderRadius: height }]}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: height }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  labelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { color: '#888888', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  value: { fontSize: 13, fontWeight: '800' },
  track: { width: '100%', backgroundColor: '#e5e7eb', overflow: 'hidden' },
});
