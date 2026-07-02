import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Button from '../components/Button';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles } from '../contexts/ThemeContext';

export default function GameOverScreen() {
  const { state, advisorAllTimeDollar, startGame } = useGame();
  const styles = useStyles();
  const served = Object.values(state.clients).filter((c) => c.status !== 'unsigned').length;
  const positive = advisorAllTimeDollar >= 0;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>GAME OVER — YOU'RE FIRED</Text>
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
  const styles = useStyles();
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    content: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: c.bg },
    title: { fontFamily: FONT_PIXEL, color: c.danger, fontSize: 22, fontWeight: '900', textAlign: 'center', letterSpacing: 1 },
    message: { color: c.textDim, fontSize: 14, lineHeight: 20, textAlign: 'center', marginTop: 12 },
    stats: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 16, marginTop: 24 },
    row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.divider },
    label: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 12, fontWeight: '700' },
    value: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 14, fontWeight: '900' },
  })
);
