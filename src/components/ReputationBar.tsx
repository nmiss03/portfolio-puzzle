import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { repColor } from '../data/reputationSystem';
import { FONT_PIXEL, Palette } from '../theme';
import { makeUseStyles } from '../contexts/ThemeContext';

export default function ReputationBar({ reputation }: { reputation: number }) {
  const pct = Math.max(0, Math.min(100, reputation));
  const color = repColor(reputation);
  const styles = useStyles();
  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>REP {Math.round(reputation)}/100</Text>
      <View style={styles.track}>
        <View style={{ width: `${pct}%`, height: '100%', backgroundColor: color }} />
      </View>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    wrap: { width: 120 },
    label: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1, textAlign: 'right' },
    track: {
      width: '100%',
      height: 10,
      backgroundColor: c.panelDark,
      borderWidth: 2,
      borderColor: c.border,
      overflow: 'hidden',
      marginTop: 3,
    },
  })
);
