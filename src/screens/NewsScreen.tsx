import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import Button from '../components/Button';
import { stocksById } from '../data/stocks';
import { NewsAnswer } from '../data/scoring';
import { useGame } from '../state/GameContext';

const GREEN = '#22c55e';
const RED = '#ef4444';
const GRAY = '#888888';

function tickers(ids: string[]): string {
  return ids.map((id) => stocksById[id]?.ticker || id.toUpperCase()).join(', ');
}

export default function NewsScreen({ onContinue }: { onContinue: () => void }) {
  const { state, selectNews, skipAllNews } = useGame();
  const news = state.weeklyNews;
  const answers = state.newsAnswers;

  const allAnswered = news.every((n) => answers[n.id]);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>This Week's Market News</Text>
        <Text style={styles.subtitle}>Read each headline and predict its impact on the affected stocks.</Text>

        {news.map((n) => {
          const answer = answers[n.id];
          const answered = !!answer;
          const correct = answer === n.impact;
          return (
            <View key={n.id} style={styles.card}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{n.category}</Text>
              </View>
              <Text style={styles.headline}>{n.headline}</Text>
              <Text style={styles.explanation}>{n.explanation}</Text>

              <View style={styles.btnRow}>
                <Choice label="✓ Positive" color={GREEN} active={answer === 'positive'} onPress={() => selectNews(n.id, 'positive')} />
                <Choice label="✗ Negative" color={RED} active={answer === 'negative'} onPress={() => selectNews(n.id, 'negative')} />
                <Choice label="❓ Neutral" color={GRAY} active={answer === 'neutral'} onPress={() => selectNews(n.id, 'neutral')} />
              </View>

              {answered && (
                <Text style={[styles.feedback, { color: correct ? GREEN : RED }]}>
                  {correct
                    ? `✓ Correct! This ${n.impact === 'positive' ? 'lifts' : 'pressures'} ${tickers(n.affects)}.`
                    : `✗ Actual impact was ${n.impact}. Affects ${tickers(n.affects)}.`}
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.footerRow}>
          <Button title="Skip all" variant="secondary" onPress={skipAllNews} style={styles.footerBtn} />
          <Button title="Continue  ›" onPress={onContinue} disabled={!allAnswered} style={styles.footerBtn} />
        </View>
      </View>
    </View>
  );
}

function Choice({ label, color, active, onPress }: { label: string; color: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        { borderColor: color },
        active && { backgroundColor: color },
        pressed && { opacity: 0.85 },
      ]}
    >
      <Text style={[styles.choiceText, { color: active ? '#ffffff' : color }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5' },
  content: { padding: 16 },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '900', marginTop: 8 },
  subtitle: { color: '#666666', fontSize: 13, marginTop: 4, marginBottom: 12 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 6, padding: 14, marginBottom: 12 },
  badge: { alignSelf: 'flex-start', backgroundColor: '#e5e7eb', borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2, marginBottom: 8 },
  badgeText: { color: '#666666', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  headline: { color: '#1a1a1a', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  explanation: { color: '#666666', fontSize: 12, fontStyle: 'italic', lineHeight: 17, marginTop: 6 },
  btnRow: { flexDirection: 'row', marginTop: 12 },
  choice: { flex: 1, borderWidth: 1.5, borderRadius: 4, paddingVertical: 8, alignItems: 'center', marginHorizontal: 3 },
  choiceText: { fontSize: 12, fontWeight: '800' },
  feedback: { fontSize: 13, fontWeight: '700', marginTop: 10, lineHeight: 18 },
  footer: { padding: 16, borderTopWidth: 1, borderTopColor: '#cccccc', backgroundColor: '#ffffff' },
  footerRow: { flexDirection: 'row' },
  footerBtn: { flex: 1, marginHorizontal: 4 },
});
