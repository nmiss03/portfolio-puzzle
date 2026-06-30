import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import WeekIntro from './day/WeekIntro';
import ClientIntro from './day/ClientIntro';
import PortfolioBuilder from './day/PortfolioBuilder';
import WeekTransition from './day/WeekTransition';
import WeekSummaryScreen from './WeekSummaryScreen';
import NewsPopup from './NewsPopup';
import ClientBook from './ClientBook';
import PixelCharacter from '../components/PixelCharacter';
import HappinessMeter from '../components/HappinessMeter';
import Button from '../components/Button';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const GREEN = '#22c55e';
const RED = '#ef4444';

export default function WeekScreen() {
  const { state, activeClient, startGame, setPhase, transitionWeek, advanceWeek, toggleBook, toggleNews } = useGame();
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (!state.started) startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!state.started) return <View style={styles.screen} />;

  const hasHoldings = Object.values(activeClient.holdings).some((h) => h.shares > 0);

  let body: React.ReactNode;
  if (state.phase === 'weekIntro') {
    body = <WeekIntro week={state.currentWeek} onContinue={() => setPhase('clientIntro')} />;
  } else if (state.phase === 'clientIntro') {
    body = <ClientIntro onDone={() => setPhase('builder')} />;
  } else if (state.phase === 'transition') {
    body = <WeekTransition onContinue={() => setPhase('summary')} />;
  } else if (state.phase === 'summary') {
    body = <WeekSummaryScreen onContinue={advanceWeek} />;
  } else if (state.phase === 'gameOver') {
    body = <GameOver />;
  } else {
    body = (
      <View style={styles.screen}>
        <View style={styles.flex}>
          <PortfolioBuilder clientId={activeClient.id} />
        </View>
        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 10 }]}>
          <Button title="📖 Clients" variant="secondary" onPress={() => toggleBook(true)} style={styles.tabBtn} />
          <Button title="📰 News" variant="secondary" onPress={() => toggleNews(true)} style={styles.tabBtn} />
          <Button title="Next Week  ›" onPress={transitionWeek} disabled={!hasHoldings} style={styles.tabBtn} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {body}
      <ClientBook />
      <NewsPopup />
    </View>
  );
}

function GameOver() {
  const { state, unlockedClients, startGame } = useGame();
  const router = useRouter();
  const combined = unlockedClients.reduce((s, c) => s + c.allTimeReturnDollar, 0);
  const avgHappiness = Math.round(
    unlockedClients.reduce((s, c) => s + c.happiness, 0) / Math.max(1, unlockedClients.length)
  );

  return (
    <ScrollView contentContainerStyle={styles.overContent}>
      <Text style={styles.overTitle}>Career Summary</Text>
      <Text style={styles.overSub}>
        {state.totalWeeks} weeks · avg happiness {avgHappiness}% · combined all-time{' '}
        {combined >= 0 ? '+' : '-'}
        {formatMoney(Math.abs(Math.round(combined)))}
      </Text>

      {unlockedClients.map((c) => {
        const positive = c.allTimeReturnDollar >= 0;
        return (
          <View key={c.id} style={styles.overCard}>
            <PixelCharacter seed={c.id} cell={5} />
            <View style={styles.overInfo}>
              <Text style={styles.overName}>{c.name}{c.fired ? '  (fired you)' : ''}</Text>
              <Text style={[styles.overReturn, { color: positive ? GREEN : RED }]}>
                All-time {positive ? '+' : '-'}
                {formatMoney(Math.abs(Math.round(c.allTimeReturnDollar)))} ({positive ? '+' : ''}
                {(c.allTimeReturnPct * 100).toFixed(1)}%)
              </Text>
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
  tabBar: { flexDirection: 'row', paddingTop: 10, paddingHorizontal: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#cccccc' },
  tabBtn: { flex: 1, marginHorizontal: 4 },

  overContent: { padding: 20, alignItems: 'center' },
  overTitle: { color: '#1a1a1a', fontSize: 26, fontWeight: '900', marginTop: 12 },
  overSub: { color: '#888888', fontSize: 14, fontWeight: '700', marginTop: 4, marginBottom: 18, textAlign: 'center' },
  overCard: { width: '100%', flexDirection: 'row', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 16, marginBottom: 14, alignItems: 'center' },
  overInfo: { flex: 1, marginLeft: 16 },
  overName: { color: '#1a1a1a', fontSize: 18, fontWeight: '900' },
  overReturn: { fontSize: 15, fontWeight: '800', marginTop: 4, marginBottom: 4 },
});
