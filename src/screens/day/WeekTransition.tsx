import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Easing } from 'react-native';

import Button from '../../components/Button';
import PixelCharacter from '../../components/PixelCharacter';
import { useGame } from '../../state/GameContext';
import { formatMoney } from '../../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../../theme';
import { makeUseStyles, useTheme } from '../../contexts/ThemeContext';

export default function WeekTransition({ onContinue }: { onContinue: () => void }) {
  const { state } = useGame();
  const t = state.transition;
  const styles = useStyles();
  const { c } = useTheme();

  const progress = useRef(new Animated.Value(0)).current;
  const [frac, setFrac] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!t) return;
    const id = progress.addListener(({ value }) => setFrac(value));
    Animated.sequence([
      Animated.delay(400),
      Animated.timing(progress, { toValue: 1, duration: 1400, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.delay(600),
    ]).start(() => setDone(true));
    return () => progress.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  if (!t) {
    return (
      <View style={styles.screen}>
        <Button title="Continue" onPress={onContinue} />
      </View>
    );
  }

  const combinedAllTime = t.results.reduce((s, r) => s + r.allTimeDollar, 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.weekDone}>WEEK {t.week} COMPLETE</Text>

      {t.results.map((r) => {
        const gain = r.returnDollar * frac;
        const positive = r.returnDollar >= 0;
        const arrowUp = r.newHappiness >= r.prevHappiness;
        return (
          <View key={r.clientId} style={styles.row}>
            <PixelCharacter seed={r.clientId} cell={4} />
            <View style={styles.rowMid}>
              <Text style={styles.rowName}>{r.name}</Text>
              <Text style={styles.rowHappy}>
                happiness {r.prevHappiness}{' '}
                <Text style={{ color: arrowUp ? c.success : c.danger }}>{arrowUp ? '▲' : '▼'}</Text> {r.newHappiness}
                {r.fired ? '  (fired you!)' : ''}
              </Text>
            </View>
            <View style={styles.rowRight}>
              <Text style={[styles.rowReturn, { color: positive ? c.success : c.danger }]}>
                {positive ? '+' : '-'}
                {formatMoney(Math.abs(Math.round(gain)))}
              </Text>
              <Text style={[styles.rowPct, { color: positive ? c.success : c.danger }]}>
                {positive ? '+' : ''}
                {(r.returnPct * 100).toFixed(2)}%
              </Text>
              {done && Math.abs(r.newsContribution) >= 1 && (
                <Text style={styles.rowNews}>
                  news {r.newsContribution >= 0 ? '+' : '-'}
                  {formatMoney(Math.abs(Math.round(r.newsContribution)))}
                </Text>
              )}
            </View>
          </View>
        );
      })}

      {done && (
        <>
          <Text style={styles.allTime}>
            Combined all-time: {combinedAllTime >= 0 ? '+' : '-'}
            {formatMoney(Math.abs(Math.round(combinedAllTime)))}
          </Text>

          {t.firedNames.length > 0 && (
            <Text style={styles.fired}>{t.firedNames.join(', ')} fired you this week.</Text>
          )}

          <Button title="View Week Summary  ›" onPress={onContinue} style={{ marginTop: 24, minWidth: 240 }} />
        </>
      )}
    </ScrollView>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
    content: { padding: 24, alignItems: 'center', flexGrow: 1, justifyContent: 'center', backgroundColor: c.bg },
    weekDone: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 24, fontWeight: '900', marginBottom: 24, letterSpacing: 1 },
    row: {
      width: '100%',
      maxWidth: 420,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: c.panel,
      borderWidth: BORDER_W,
      borderColor: c.border,
      padding: 14,
      marginBottom: 12,
    },
    rowMid: { flex: 1, marginLeft: 14 },
    rowName: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 16, fontWeight: '900' },
    rowHappy: { color: c.textDim, fontSize: 13, fontWeight: '700', marginTop: 4 },
    rowRight: { alignItems: 'flex-end' },
    rowReturn: { fontFamily: FONT_PIXEL, fontSize: 17, fontWeight: '900' },
    rowPct: { fontFamily: FONT_PIXEL, fontSize: 13, fontWeight: '800', marginTop: 2 },
    rowNews: { color: c.gold, fontSize: 11, fontWeight: '700', marginTop: 2 },
    allTime: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 14, fontWeight: '800', marginTop: 8 },
    fired: { color: c.danger, fontSize: 14, fontWeight: '800', marginTop: 12, textAlign: 'center' },
  })
);
