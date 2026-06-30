import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { repColor } from '../data/reputationSystem';

export default function ReputationBar({ reputation }: { reputation: number }) {
  const pct = Math.max(0, Math.min(100, reputation));
  const color = repColor(reputation);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>Reputation: {Math.round(reputation)}/100</Text>
      <View style={styles.track}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color, borderRadius: 3 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 150 },
  label: { color: '#1a1a1a', fontSize: 13, fontWeight: '800', textAlign: 'right' },
  track: { width: '100%', height: 6, borderRadius: 3, backgroundColor: '#e5e7eb', overflow: 'hidden', marginTop: 3 },
});
