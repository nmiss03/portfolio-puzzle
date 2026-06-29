import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

import Button from '../../components/Button';
import HappinessMeter from '../../components/HappinessMeter';
import Stars from '../../components/Stars';
import { useGame } from '../../state/GameContext';
import { formatMoney } from '../../utils/format';

const GREEN = '#22c55e';
const RED = '#ef4444';

export default function DayTransition({ onContinue }: { onContinue: () => void }) {
  const { state } = useGame();
  const t = state.transition;
  const client = t ? state.clients[t.clientId] : null;

  const counter = useRef(new Animated.Value(0)).current;
  const happy = useRef(new Animated.Value(0)).current;
  const [gain, setGain] = useState(0);
  const [happiness, setHappiness] = useState(t?.prevHappiness ?? 0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!t) return;
    const cg = counter.addListener(({ value }) => setGain(t.gain * value));
    const ch = happy.addListener(({ value }) =>
      setHappiness(t.prevHappiness + (t.newHappiness - t.prevHappiness) * value)
    );
    Animated.sequence([
      Animated.timing(counter, { toValue: 1, duration: 1800, easing: Easing.out(Easing.cubic), useNativeDriver: false }),
      Animated.delay(300),
      Animated.timing(happy, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.quad), useNativeDriver: false }),
    ]).start(() => setDone(true));
    return () => {
      counter.removeListener(cg);
      happy.removeListener(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [t]);

  if (!t || !client) {
    return (
      <View style={styles.screen}>
        <Button title="Continue" onPress={onContinue} />
      </View>
    );
  }

  const positive = t.gain >= 0;
  const color = positive ? GREEN : RED;
  const pct = Math.round(t.returnPct * 1000) / 10;
  const arrow = t.newHappiness >= t.prevHappiness ? '▲' : '▼';
  const arrowColor = t.newHappiness >= t.prevHappiness ? GREEN : RED;

  return (
    <View style={styles.screen}>
      <Text style={styles.dayDone}>Day {state.currentDay} Complete</Text>
      <Text style={styles.clientName}>{client.name}'s portfolio</Text>

      <Text style={[styles.gain, { color }]}>
        {positive ? '+' : '-'}
        {formatMoney(Math.abs(Math.round(gain)))}
      </Text>
      <Text style={[styles.pct, { color }]}>
        {positive ? '+' : ''}
        {pct}%
      </Text>

      <View style={styles.starsWrap}>
        <Stars count={t.stars} size={34} />
      </View>

      <View style={styles.happyCard}>
        <HappinessMeter value={happiness} height={14} />
        <Text style={styles.happyDelta}>
          {client.name}: {t.prevHappiness} <Text style={{ color: arrowColor }}>{arrow}</Text> {t.newHappiness}
        </Text>
      </View>

      {t.fired && <Text style={styles.fired}>😠 {client.name} fired you — happiness hit zero.</Text>}

      {done && (
        <Button
          title={state.currentDay < state.order.length ? 'Moving to next day…  ›' : 'See Final Summary  ›'}
          onPress={onContinue}
          style={{ marginTop: 28, minWidth: 240 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center', padding: 24 },
  dayDone: { color: '#1a1a1a', fontSize: 26, fontWeight: '900' },
  clientName: { color: '#888888', fontSize: 15, fontWeight: '700', marginTop: 4, marginBottom: 18 },
  gain: { fontSize: 44, fontWeight: '900' },
  pct: { fontSize: 22, fontWeight: '800', marginTop: 2 },
  starsWrap: { marginTop: 16 },
  happyCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 16,
    marginTop: 22,
  },
  happyDelta: { color: '#1a1a1a', fontSize: 15, fontWeight: '800', textAlign: 'center', marginTop: 10 },
  fired: { color: RED, fontSize: 15, fontWeight: '800', marginTop: 18, textAlign: 'center' },
});
