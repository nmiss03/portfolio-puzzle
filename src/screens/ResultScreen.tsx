import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import { getLevel } from '../data/levels';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const GREEN = '#22c55e';
const RED = '#c0392b';
const BLUE = '#4a90e2';
const GOLD = '#f5a623';
const TEXT = '#1a1a1a';
const BORDER = '#cccccc';

const ANIM_MS = 4000;
const CRASH_POINT = 0.72; // fraction of the animation where the downturn hits

export default function ResultScreen() {
  const router = useRouter();
  const { level, result, startLevel } = useGame();

  const progress = useRef(new Animated.Value(0)).current;
  const [display, setDisplay] = useState(result?.startingCapital ?? 50000);
  const [barPct, setBarPct] = useState(0.04);
  const [crashed, setCrashed] = useState(false);
  const [done, setDone] = useState(false);

  const start = result?.startingCapital ?? 50000;
  const expected = result?.expectedFinalValue ?? start;
  const final = result?.finalValue ?? start;
  const penalty = !!result?.penaltyApplied;
  const peak = penalty ? expected : final;

  useEffect(() => {
    if (!result) return;

    const valueAt = (p: number) => {
      if (!penalty) return start + (final - start) * p;
      if (p <= CRASH_POINT) return start + (peak - start) * (p / CRASH_POINT);
      const t = (p - CRASH_POINT) / (1 - CRASH_POINT);
      return peak + (final - peak) * t; // final < peak -> drops
    };

    const id = progress.addListener(({ value: p }) => {
      const v = valueAt(p);
      setDisplay(v);
      setBarPct(Math.max(0.04, Math.min(1, peak > 0 ? v / peak : 0)));
      if (penalty && p > CRASH_POINT) setCrashed(true);
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

  const nextLevel = getLevel(level.id + 1);
  const nextLocked = nextLevel ? nextLevel.locked : true;
  const passed = result.stars >= 1;
  const barColor = crashed ? RED : GREEN;

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

        <View style={styles.valueCard}>
          <Text style={styles.valueLabel}>Your portfolio grew to</Text>
          <Text style={[styles.valueBig, crashed && { color: RED }]}>{formatMoney(Math.round(display))}</Text>

          <View style={styles.barTrack}>
            <View style={[styles.barFill, { width: `${barPct * 100}%`, backgroundColor: barColor }]} />
          </View>
          <View style={styles.barLabels}>
            <Text style={styles.barLabel}>Start {formatMoney(start)}</Text>
            <Text style={styles.barLabel}>Peak {formatMoney(Math.round(peak))}</Text>
          </View>

          {/* Live crash alert during the animation */}
          {crashed && !done && (
            <Text style={styles.crashAlert}>⚠ Market downturn — too much risk!</Text>
          )}

          {done && (
            <Text style={[styles.gains, result.totalReturn < 0 && { color: RED }]}>
              {result.totalReturn >= 0 ? '+' : ''}
              {formatMoney(Math.round(result.totalReturn))} in {result.totalReturn >= 0 ? 'gains' : 'losses'}
            </Text>
          )}
        </View>

        {/* Risk verdict + stars (after the animation) */}
        {done && (
          <>
            <View style={[styles.riskCard, riskStyle(result.riskVerdict).card]}>
              <Text style={[styles.riskTitle, { color: riskStyle(result.riskVerdict).color }]}>
                {riskStyle(result.riskVerdict).icon} {riskHeadline(result.riskVerdict)}
              </Text>
              <Text style={styles.riskText}>{result.riskMessage}</Text>
              <Text style={styles.riskMeta}>
                High-growth exposure: {Math.round(result.highGrowthPct * 100)}%
                {result.penaltyApplied
                  ? `  ·  downturn cost ${formatMoney(Math.round(result.penaltyAmount))}`
                  : ''}
              </Text>
            </View>

            <View style={styles.resultCard}>
              <View style={styles.starsRow}>
                {[0, 1, 2].map((i) => (
                  <Text key={i} style={[styles.star, { color: i < result.stars ? GOLD : '#d9d9d9' }]}>
                    {i < result.stars ? '★' : '☆'}
                  </Text>
                ))}
              </View>
              <Text style={styles.verdict}>{result.label}</Text>
              <View style={styles.statsRow}>
                <Stat label="Invested" value={formatMoney(Math.round(result.invested))} />
                <Stat label="Deployed" value={`${Math.round(result.deployedPct * 100)}%`} />
                <Stat
                  label="Return"
                  value={formatMoney(Math.round(result.totalReturn))}
                  valueColor={result.totalReturn >= 0 ? GREEN : RED}
                />
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {done && (
        <View style={styles.footer}>
          {passed ? (
            <Button
              title={nextLocked ? 'Next Level (Coming Soon)' : 'Next Level  ›'}
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

function riskHeadline(v: string): string {
  if (v === 'excessive') return 'Too Much Risk';
  if (v === 'wellAllocated') return 'Risk Allocated Well';
  return 'Played It Safe';
}

function riskStyle(v: string): { color: string; icon: string; card: object } {
  if (v === 'excessive') return { color: RED, icon: '⚠', card: { borderColor: RED, backgroundColor: '#fdecea' } };
  if (v === 'wellAllocated') return { color: '#15803d', icon: '✓', card: { borderColor: GREEN, backgroundColor: '#eafaf0' } };
  return { color: BLUE, icon: 'ℹ', card: { borderColor: BLUE, backgroundColor: '#eef4fc' } };
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
  barTrack: { width: '100%', height: 16, borderRadius: 8, backgroundColor: '#eef1f5', marginTop: 16, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },
  barLabels: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 6 },
  barLabel: { color: '#888888', fontSize: 12, fontWeight: '700' },
  crashAlert: { color: RED, fontSize: 16, fontWeight: '900', marginTop: 14 },
  gains: { color: GREEN, fontSize: 18, fontWeight: '900', marginTop: 14 },

  riskCard: { borderWidth: 1, borderRadius: 8, padding: 16, marginBottom: 16 },
  riskTitle: { fontSize: 16, fontWeight: '900' },
  riskText: { color: TEXT, fontSize: 15, lineHeight: 21, marginTop: 6 },
  riskMeta: { color: '#4a4a4a', fontSize: 13, fontWeight: '700', marginTop: 8 },

  resultCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: BORDER, borderRadius: 8, padding: 20, alignItems: 'center' },
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
