import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { useGame } from '../state/GameContext';

export default function LevelSelect() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { startGame } = useGame();

  const beginCareer = () => {
    startGame();
    router.push('/WeekScreen');
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>PORTFOLIO MANAGER</Text>
        <Text style={styles.title}>Advise. Allocate.{'\n'}Keep them happy.</Text>
        <Text style={styles.subtitle}>
          A new client walks in each day. Read their situation, build a portfolio that fits, and
          watch your returns — and their happiness — play out over time.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Career Mode</Text>
        <Text style={styles.cardText}>
          A new client unlocks each week. Manage everyone's portfolio from your Client Book — but a
          bad call can cost you the account.
        </Text>
      </View>

      <Button title="Start Career  ›" onPress={beginCareer} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, justifyContent: 'space-between' },
  hero: { marginTop: 16 },
  kicker: { color: '#4a90e2', fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { color: '#1a1a1a', fontSize: 32, fontWeight: '900', marginTop: 8, lineHeight: 38 },
  subtitle: { color: '#4a4a4a', fontSize: 15, lineHeight: 22, marginTop: 12 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 12, padding: 20 },
  cardTitle: { color: '#4a90e2', fontSize: 18, fontWeight: '900' },
  cardText: { color: '#4a4a4a', fontSize: 15, lineHeight: 21, marginTop: 6 },
});
