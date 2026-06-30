import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import WeekIntro from './day/WeekIntro';
import ClientIntro from './day/ClientIntro';
import PortfolioBuilder from './day/PortfolioBuilder';
import WeekTransition from './day/WeekTransition';
import WeekSummaryScreen from './WeekSummaryScreen';
import GameOverScreen from './GameOverScreen';
import NewsPopup from './NewsPopup';
import ClientBook from './ClientBook';
import ReputationBar from '../components/ReputationBar';
import Button from '../components/Button';
import { useGame } from '../state/GameContext';

export default function WeekScreen() {
  const { state, activeClients, availableClients, canSign, startGame, setPhase, transitionWeek, advanceWeek, toggleBook, toggleNews } = useGame();
  const insets = useSafeAreaInsets();
  const [alertSeen, setAlertSeen] = useState(false);

  useEffect(() => {
    if (!state.started) startGame();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset the alert each new week.
  useEffect(() => setAlertSeen(false), [state.currentWeek]);

  if (!state.started) return <View style={styles.screen} />;

  const showAlert = !alertSeen && availableClients.length > 0 && canSign && state.phase === 'builder';

  let body: React.ReactNode;
  if (state.phase === 'weekIntro') {
    body = <WeekIntro week={state.currentWeek} onContinue={() => setPhase('builder')} />;
  } else if (state.phase === 'clientIntro') {
    body = <ClientIntro onDone={() => setPhase('builder')} />;
  } else if (state.phase === 'transition') {
    body = <WeekTransition onContinue={() => setPhase('summary')} />;
  } else if (state.phase === 'summary') {
    body = <WeekSummaryScreen onContinue={advanceWeek} />;
  } else if (state.phase === 'gameOver') {
    body = <GameOverScreen />;
  } else {
    body = (
      <View style={styles.screen}>
        <View style={[styles.topBar, { paddingTop: insets.top + 8 }]}>
          <Text style={styles.weekText}>Week {state.currentWeek}</Text>
          <ReputationBar reputation={state.reputation} />
        </View>

        {showAlert && (
          <Pressable style={styles.alert} onPress={() => { setAlertSeen(true); toggleBook(true); }}>
            <Text style={styles.alertText}>
              📋 {availableClients.length} Available Client{availableClients.length > 1 ? 's' : ''} — tap to view
            </Text>
            <View style={styles.alertDot} />
          </Pressable>
        )}

        {activeClients.length === 0 && (
          <Pressable style={styles.manageHint} onPress={() => toggleBook(true)}>
            <Text style={styles.manageHintText}>
              {availableClients.length > 0
                ? 'Open the Client Book to sign your first client.'
                : 'No active clients — open the Client Book to manage portfolios.'}
            </Text>
          </Pressable>
        )}

        <View style={styles.flex}>
          {/* Weekly screen is analysis-only — trading happens in the Client Book. */}
          <PortfolioBuilder analysisOnly />
        </View>

        <View style={[styles.tabBar, { paddingBottom: insets.bottom + 10 }]}>
          <Button title="📖 Clients" variant="secondary" onPress={() => toggleBook(true)} style={styles.tabBtn} />
          <Button title="📰 News" variant="secondary" onPress={() => toggleNews(true)} style={styles.tabBtn} />
          <Button title="Next Week  ›" onPress={transitionWeek} disabled={activeClients.length === 0} style={styles.tabBtn} />
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

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f5f5f5' },
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  flex: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingBottom: 8, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  weekText: { color: '#1a1a1a', fontSize: 18, fontWeight: '900' },
  alert: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eef4fc', borderBottomWidth: 1, borderBottomColor: '#4a90e2', paddingVertical: 10 },
  alertText: { color: '#1a1a1a', fontSize: 13, fontWeight: '800' },
  alertDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#ef4444', marginLeft: 8 },
  manageHint: { backgroundColor: '#fff7e6', borderBottomWidth: 1, borderBottomColor: '#f0c060', paddingVertical: 9, paddingHorizontal: 16 },
  manageHintText: { color: '#7a5a00', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  tabBar: { flexDirection: 'row', paddingTop: 10, paddingHorizontal: 12, backgroundColor: '#ffffff', borderTopWidth: 1, borderTopColor: '#cccccc' },
  tabBtn: { flex: 1, marginHorizontal: 4 },
});
