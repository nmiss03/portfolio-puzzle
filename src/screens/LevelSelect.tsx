import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { useGame } from '../state/GameContext';
import { C, FONT_PIXEL, BORDER_W } from '../theme';

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
        <Text style={styles.kicker}>◆ PORTFOLIO MANAGER ◆</Text>
        <Text style={styles.title}>ADVISE.{'\n'}ALLOCATE.{'\n'}KEEP THEM HAPPY.</Text>
        <Text style={styles.subtitle}>
          A new client walks in each week. Read their situation, build a portfolio that fits, and
          watch your returns — and their happiness — play out over time.
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardTitleBar}>
          <Text style={styles.cardTitle}>CAREER MODE</Text>
        </View>
        <Text style={styles.cardText}>
          A new client unlocks each week. Manage everyone's portfolio from your Client Book — but a
          bad call can cost you the account.
        </Text>
      </View>

      <Button title="Start Career  ▶" onPress={beginCareer} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, paddingHorizontal: 20, justifyContent: 'space-between' },
  hero: { marginTop: 16 },
  kicker: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 13, fontWeight: '800', letterSpacing: 2 },
  title: { fontFamily: FONT_PIXEL, color: C.text, fontSize: 26, fontWeight: '900', marginTop: 12, lineHeight: 34, letterSpacing: 1 },
  subtitle: { color: C.textDim, fontSize: 15, lineHeight: 22, marginTop: 16 },
  card: {
    backgroundColor: C.panel,
    borderWidth: BORDER_W,
    borderColor: C.border,
    padding: 0,
    overflow: 'hidden',
  },
  cardTitleBar: { backgroundColor: C.panelDark, borderBottomWidth: 2, borderBottomColor: C.border, paddingVertical: 8, paddingHorizontal: 14 },
  cardTitle: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
  cardText: { color: C.textDim, fontSize: 15, lineHeight: 21, padding: 14 },
});
