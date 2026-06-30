import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { repColor } from '../data/reputationSystem';
import { C, FONT_PIXEL } from '../theme';

export default function ReputationBar({ reputation }: { reputation: number }) {
  const pct = Math.max(0, Math.min(100, reputation));
  const color = repColor(reputation);
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>REP {Math.round(reputation)}/100</Text>
      <View style={styles.track}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: 150 },
  label: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'right' },
  track: {
    width: '100%',
    height: 10,
    backgroundColor: C.panelDark,
    borderWidth: 2,
    borderColor: C.border,
    overflow: 'hidden',
    marginTop: 3,
  },
});
