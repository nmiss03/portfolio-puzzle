import React, { useEffect } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import DayIntro from './day/DayIntro';
import ClientIntro from './day/ClientIntro';
import PortfolioBuilder from './day/PortfolioBuilder';
import DayTransition from './day/DayTransition';
import ClientBook from './ClientBook';
import PixelClient from '../components/PixelClient';
import HappinessMeter from '../components/HappinessMeter';
import Stars from '../components/Stars';
import Button from '../components/Button';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const GREEN = '#22c55e';
const RED = '#ef4444';

export default function DayScreen() {
  const { state, activeClient, startGame, setPhase, finalizeDay, advanceDay, toggleBook } = useGame();
  const insets = useSafeAreaInsets();

  // Ensure a game is running (e.g. if this route is opened directly).
  useEffect(() => {
    if (!state.started) startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.started) return <View style={styles.screen} />;

  const hasHoldings = Object.values(activeClient.holdings).some((n) => n > 0);

  let body: React.ReactNode = null;
  if (state.phase === 'dayIntro') {
    body = <DayIntro day={state.currentDay} onContinue={() => setPhase('clientIntro')} />;
  } else if (state.phase === 'clientIntro') {
    body = <ClientIntro onDone={() => setPhase('builder')} />;
  } else if (state.phase === 'transition') {
    body = <DayTransition onContinue={advanceDay} />;
  } else if (state.phase === 'gameOver') {
    body = <GameOver />;
  } else {
    // builder
    body = (
      <View style={styles.screen}>
        <View style={styles.flex}>
          <PortfolioBuilder clientId={activeClient.id} />
        </View>
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 10 }]}>
          <Button title="📖 Client Book" variant="secondary" onPress={() => toggleBook(true)} style={styles.tabBtn} />
          <Button title="Next Day  ›" onPress={finalizeDay} disabled={!hasHoldings} style={styles.tabBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {body}
      {/* Client Book overlay sits above everything */}
      <ClientBook />
    </View>
  );
}

function GameOver() {
  const { state, clientList, startGame } = useGame();
  const router = useRouter();
  const avgHappiness = Math.round(clientList.reduce((s, c) => s + c.happiness, 0) / Math.max(1, clientList.length));

  return (
    <ScrollView contentContainerStyle={styles.overContent}>
      <Text style={styles.overTitle}>Career Summary</Text>
      <Text style={styles.overSub}>{state.order.length} days · average happiness {avgHappiness}%</Text>

      {clientList.map((c) => {
        const positive = (c.lastGain ?? 0) >= 0;
        return (
          <View key={c.id} style={styles.overCard}>
            <PixelClient character={c.character} scale={0.5} />
            <View style={styles.overInfo}>
              <Text style={styles.overName}>{c.name}{c.fired ? '  (fired you)' : ''}</Text>
              <Text style={[styles.overReturn, { color: positive ? GREEN : RED }]}>
                {c.lastGain == null
                  ? 'No portfolio built'
                  : `${positive ? '+' : '-'}${formatMoney(Math.abs(Math.round(c.lastGain)))} (${positive ? '+' : ''}${((c.lastReturnPct ?? 0) * 100).toFixed(1)}%)`}
              </Text>
              <Stars count={c.lastStars} size={16} />
              <View style={{ marginTop: 8 }}>
                <HappinessMeter value={c.happiness} height={10} />
              </View>
            </View>
          </View>
        );
      })}

      <Button title="Play Again" onPress={startGame} style={{ marginTop: 20 }} />
      <Button title="Back to Start" onPress={() => router.replace('/')} variant="secondary" style={{ marginTop: 10 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  flex: { flex: 1 },
  tabBar: {
    flexDirection: 'row',
    paddingTop: 10,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#cccccc',
  },
  tabBtn: { flex: 1, marginHorizontal: 4 },

  overContent: { padding: 20, alignItems: 'center' },
  overTitle: { color: '#1a1a1a', fontSize: 26, fontWeight: '900', marginTop: 12 },
  overSub: { color: '#888888', fontSize: 14, fontWeight: '700', marginTop: 4, marginBottom: 18 },
  overCard: { width: '100%', flexDirection: 'row', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 16, marginBottom: 14, alignItems: 'center' },
  overInfo: { flex: 1, marginLeft: 16 },
  overName: { color: '#1a1a1a', fontSize: 18, fontWeight: '900' },
  overReturn: { fontSize: 15, fontWeight: '800', marginTop: 4, marginBottom: 4 },
});
