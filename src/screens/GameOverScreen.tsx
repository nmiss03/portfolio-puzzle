import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Button from '../components/Button';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const RED = '#ef4444';

export default function GameOverScreen() {
  const { state, advisorAllTimeDollar, startGame } = useGame();
  const served = Object.values(state.clients).filter((c) => c.status !== 'unsigned').length;
  const positive = advisorAllTimeDollar >= 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>You've Been Fired</Text>
      <Text style={styles.message}>
        Your reputation has reached 0. You're no longer qualified to manage client portfolios.
      </Text>

      <View style={styles.stats}>
        <Stat label="Weeks managed" value={`${state.currentWeek}`} />
        <Stat label="Clients served" value={`${served}`} />
        <Stat label="Advisor all-time returns" value={`${positive ? '+' : '-'}${formatMoney(Math.abs(Math.round(advisorAllTimeDollar)))}`} />
        <Stat label="Final reputation" value={`${Math.round(state.reputation)}/100`} />
      </View>

      <Button title="Start Over" onPress={startGame} style={{ marginTop: 24 }} />
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f5f5f5' },
  title: { color: RED, fontSize: 26, fontWeight: '900', textAlign: 'center' },
  message: { color: '#666666', fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 12 },
  stats: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 10, padding: 16, marginTop: 24 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#eee' },
  label: { color: '#888888', fontSize: 13, fontWeight: '700' },
  value: { color: '#1a1a1a', fontSize: 15, fontWeight: '900' },
});
