import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Button from '../components/Button';
import BarChart from '../components/BarChart';
import HappinessMeter from '../components/HappinessMeter';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#4a90e2';

export default function WeekSummaryScreen({ onContinue }: { onContinue: () => void }) {
  const { state } = useGame();
  const t = state.transition;

  if (!t) {
    return (
      <View style={styles.screen}>
        <Button title="Continue" onPress={onContinue} />
      </View>
    );
  }

  const barData = t.results.map((r) => ({ label: r.name, value: Math.round(r.returnDollar) }));

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Week {t.week} Summary</Text>

      <View style={styles.chartCard}>
        <BarChart data={barData} height={180} />
      </View>

      {t.newsCount > 0 && (
        <View style={styles.accuracyCard}>
          <Text style={styles.accuracyText}>
            You predicted {Math.round(t.newsAccuracy * t.newsCount)} of {t.newsCount} headlines correctly (
            {Math.round(t.newsAccuracy * 100)}% accuracy).
            {t.newsAccuracy > 0.8 ? '  Bonus: +3 happiness.' : t.newsAccuracy < 0.4 ? '  Penalty: -5 happiness.' : ''}
          </Text>
        </View>
      )}

      <View style={styles.table}>
        <View style={styles.tHead}>
          <Text style={[styles.thClient, styles.th]}>Client</Text>
          <Text style={[styles.thNum, styles.th]}>Week</Text>
          <Text style={[styles.thNum, styles.th]}>News</Text>
          <Text style={[styles.thNum, styles.th]}>All-time</Text>
          <Text style={[styles.thHappy, styles.th]}>Happy</Text>
        </View>
        {t.results.map((r) => {
          const wPos = r.returnDollar >= 0;
          const aPos = r.allTimeDollar >= 0;
          const nPos = r.newsContribution >= 0;
          return (
            <View key={r.clientId} style={styles.tRow}>
              <Text style={[styles.thClient, styles.tdName]} numberOfLines={1}>{r.name}</Text>
              <Text style={[styles.thNum, styles.td, { color: wPos ? GREEN : RED }]}>
                {wPos ? '+' : '-'}{formatMoney(Math.abs(Math.round(r.returnDollar)))}{'\n'}
                {wPos ? '+' : ''}{(r.returnPct * 100).toFixed(2)}%
              </Text>
              <Text style={[styles.thNum, styles.td, { color: BLUE }]}>
                {nPos ? '+' : '-'}{formatMoney(Math.abs(Math.round(r.newsContribution)))}
              </Text>
              <Text style={[styles.thNum, styles.td, { color: aPos ? GREEN : RED }]}>
                {aPos ? '+' : '-'}{formatMoney(Math.abs(Math.round(r.allTimeDollar)))}{'\n'}
                {aPos ? '+' : ''}{(r.allTimePct * 100).toFixed(2)}%
              </Text>
              <View style={styles.thHappy}>
                <HappinessMeter value={r.newHappiness} height={8} showLabel={false} />
                <Text style={styles.happyPct}>{Math.round(r.newHappiness)}%</Text>
              </View>
            </View>
          );
        })}
      </View>

      <Button
        title={t.unlocking ? `Continue to Week ${t.week + 1}  ›` : 'Finish  ›'}
        onPress={onContinue}
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '900', textAlign: 'center', marginVertical: 12 },
  chartCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 16, marginBottom: 16 },
  accuracyCard: { backgroundColor: '#eef4fc', borderWidth: 1, borderColor: '#4a90e2', borderRadius: 8, padding: 12, marginBottom: 16 },
  accuracyText: { color: '#1a1a1a', fontSize: 13, fontWeight: '700', lineHeight: 18 },
  table: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 12 },
  tHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: '#cccccc' },
  th: { color: '#888888', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10 },
  thClient: { flex: 1.2 },
  thNum: { flex: 1.2, textAlign: 'right' },
  thHappy: { flex: 1.3, paddingLeft: 10 },
  tdName: { color: '#1a1a1a', fontSize: 14, fontWeight: '800' },
  td: { fontSize: 12, fontWeight: '800' },
  happyPct: { color: '#888888', fontSize: 11, fontWeight: '700', marginTop: 2, textAlign: 'right' },
});
