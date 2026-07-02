import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { stocksById } from '../data/stocks';
import { Holding } from '../data/gameState';
import { FONT_PIXEL, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

// Segmented stocks/bonds/cash bar. Shows the player their CURRENT mix so the
// allocation game is about judgment, not mental arithmetic. The client's
// target and tolerance stay hidden — only consequences reveal those.
export default function MixBar({
  holdings,
  cash,
  priceOf,
}: {
  holdings: Record<string, Holding>;
  cash: number;
  priceOf: (stockId: string) => number;
}) {
  const styles = useStyles();
  const { c } = useTheme();

  let stocksVal = 0;
  let bondsVal = 0;
  Object.entries(holdings).forEach(([id, h]) => {
    const s = stocksById[id];
    if (!s || h.shares <= 0) return;
    const v = h.shares * priceOf(id);
    if (s.assetClass === 'bond') bondsVal += v;
    else stocksVal += v;
  });
  const cashVal = Math.max(0, cash);
  const total = stocksVal + bondsVal + cashVal;
  if (total <= 0) return null;

  const pct = (v: number) => Math.round((v / total) * 100);
  const segs = [
    { label: 'STOCKS', value: stocksVal, color: c.gold },
    { label: 'BONDS', value: bondsVal, color: '#14b8a6' },
    { label: 'CASH', value: cashVal, color: c.muted },
  ].filter((s) => s.value > 0);

  return (
    <View style={styles.wrap}>
      <View style={styles.bar}>
        {segs.map((s) => (
          <View key={s.label} style={{ flex: s.value, backgroundColor: s.color }} />
        ))}
      </View>
      <Text style={styles.legend}>
        {segs.map((s) => `${s.label} ${pct(s.value)}%`).join(' · ')}
      </Text>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    wrap: { width: '100%' },
    bar: { flexDirection: 'row', height: 12, borderWidth: 2, borderColor: c.border, overflow: 'hidden', backgroundColor: c.panelDark },
    legend: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 10, fontWeight: '800', letterSpacing: 0.5, marginTop: 4 },
  })
);
