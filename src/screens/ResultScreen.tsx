import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import { getLevel } from '../data/levels';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const GREEN = '#22c55e';
const BLUE = '#4a90e2';
const GOLD = '#f5a623';
const TEXT = '#1a1a1a';
const BORDER = '#cccccc';

const ANIM_MS = 3500;

export default function ResultScreen() {
  const router = useRouter();
  const { level, result, startLevel } = useGame();

  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(result?.startingCapital ?? 50000);
  const [done, setDone] = useState(false);

  const start = result?.startingCapital ?? 50000;
  const final = result?.finalValue ?? start;

  useEffect(() => {
    if (!result) return;
    const id = progress.addListener(({ value }) => {
      setDisplay(start + (final - start) * value);
    });
    Animated.timing(progress, {
      toValue: 1,
      duration: ANIM_MS,
      easing: Easing.inOut(Easing.cubic),
      useNativeDriver: false,
    }).start(() => setDone(true));
    return () => progress.removeListener(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  if (!result) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No portfolio to score yet.</Text>
        <Button title="Back to Levels" onPress={() => router.dismissAll()} style={{ marginTop: 16 }} />
      </View>
    );
  }

  const barWidth = progress.interpolate({ inputRange: [0, 1], outputRange: ['4%', '100%'] });
  const gains = result.totalReturn;

  const nextLevel = getLevel(level.id + 1);
  const nextLocked = nextLevel ? nextLevel.locked : true;
  const passed = result.stars >= 1;

  const goNext = () => {
    if (!nextLevel || nextLevel.locked) return;
    startLevel(nextLevel.id);
    router.dismissAll();
    router.push('/CustomerIntro');
  };

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>40-Year Portfolio Growth</Text>

        {/* Animated value */}
        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Your portfolio grew to</Text>
          <Text style={styles.valueBig}>{formatMoney(Math.round(display))}</Text>

          {/* Growth bar */}
          <View style={styles.barTrack}>
            <Animated.View style={[styles.barFill, { width: barWidth }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>Start {formatMoney(start)}</Text>
            <Text style={styles.barLabel}>Final {formatMoney(Math.round(final))}</Text>
          </View>

          {done && <Text style={styles.gains}>+{formatMoney(Math.round(gains))} in gains</Text>}
        </View>

        {/* Stars + verdict (after the animation) */}
        {done && (
          <View style={styles.resultCard}>
            <View style={styles.starsRow}>
              {[0, 1, 2].map((i) => (
                <Text key={i} style={[styles.star, { color: i < result.stars ? GOLD : '#d9d9d9' }]}>
                  {i < result.stars ? '★' : '☆'}
                </Text>
              ))}
            </View>
            <Text style={styles.verdict}>{result.label}</Text>

            {result.bonusApplied && (
              <Text style={styles.bonus}>
                ★ Capital bonus: you deployed {Math.round(result.deployedPct * 100)}% of the cash — +1 star!
              </Text>
            )}

            <View style={styles.statsRow}>
              <Stat label="Invested" value={formatMoney(Math.round(result.invested))} />
              <Stat label="Deployed" value={`${Math.round(result.deployedPct * 100)}%`} />
              <Stat label="Return" value={formatMoney(Math.round(result.totalReturn))} valueColor={GREEN} />
            </View>
          </View>
        )}
      </ScrollView>

      {done && (
        <View style={styles.footer}>
          {passed ? (
            <Button
              title={nextLocked ? `Next Level (Coming Soon)` : 'Next Level  ›'}
              onPress={goNext}
              disabled={nextLocked}
            />
          ) : (
            <Button title="Try Again" onPress={() => router.back()} />
          )}
          <View style={styles.footerRow}>
            <Button
              title={passed ? 'Try Again' : 'Back to Levels'}
              onPress={passed ? () => router.back() : () => router.dismissAll()}
              variant="secondary"
              style={styles.footerBtn}
            />
            <Button title="All Levels" onPress={() => router.dismissAll()} variant="secondary" style={styles.footerBtn} />
          </View>
        </View>
      )}
    </View>
  );
}

function Stat({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, valueColor ? { color: valueColor } : null]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  emptyText: { color: '#4a4a4a', fontSize: 15 },

  title: { color: TEXT, fontSize: 20, fontWeight: '900', textAlign: 'center', marginVertical: 12 },

  valueCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
    marginBottom: 16,
  },
  valueLabel: { color: '#888888', fontSize: 14, fontWeight: '700' },
  valueBig: { color: TEXT, fontSize: 40, fontWeight: '900', marginTop: 4 },
  barTrack: {
    width: '100%',
    height: 16,
    borderRadius: 8,
    backgroundColor: '#eef1f5',
    marginTop: 16,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: GREEN, borderRadius: 8 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 },
  barLabel: { color: '#888888', fontSize: 12, fontWeight: '700' },
  gains: { color: GREEN, fontSize: 18, fontWeight: '900', marginTop: 14 },

  resultCard: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    padding: 20,
    alignItems: 'center',
  },
  starsRow: { flexDirection: 'row' },
  star: { fontSize: 48, marginHorizontal: 4 },
  verdict: { color: TEXT, fontSize: 20, fontWeight: '800', marginTop: 8 },
  bonus: { color: BLUE, fontSize: 14, fontWeight: '700', textAlign: 'center', marginTop: 10 },

  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: BORDER,
  },
  stat: { flex: 1, alignItems: 'center' },
  statLabel: { color: '#888888', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.3 },
  statValue: { color: TEXT, fontSize: 16, fontWeight: '800', marginTop: 3 },

  footer: { padding: 16, borderTopWidth: 1, borderTopColor: BORDER, backgroundColor: '#f5f5f5' },
  footerRow: { flexDirection: 'row', marginTop: 12 },
  footerBtn: { flex: 1, marginHorizontal: 4 },
});
