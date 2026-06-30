import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { stocksById } from '../data/stocks';
import { useGame } from '../state/GameContext';

const BLUE = '#4a90e2';

type FilterMode = 'All' | 'Industry' | 'Specific Stock';

export default function NewsPopup() {
  const { state, toggleNews } = useGame();
  const [filter, setFilter] = useState<FilterMode>('All');

  const articles = useMemo(
    () => state.weekNews.filter((a) => filter === 'All' || a.category === filter),
    [state.weekNews, filter]
  );

  if (!state.newsOpen) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Market News</Text>
          <Pressable onPress={() => toggleNews(false)} hitSlop={10}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {state.weekNews.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Quiet markets this week.</Text>
            <Text style={styles.emptyText}>No major headlines. Trade on the fundamentals.</Text>
          </View>
        ) : (
          <>
            <View style={styles.controls}>
              {(['All', 'Industry', 'Specific Stock'] as FilterMode[]).map((f) => (
                <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
                  <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                    {f === 'Specific Stock' ? 'Stocks' : f}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Text style={styles.hint}>
              Read the headlines and decide for yourself. Then buy what you think will rise and sell what you
              think will fall — the results land at week's end.
            </Text>

            <ScrollView contentContainerStyle={styles.list}>
              {articles.map((a) => (
                <View key={a.id} style={styles.card}>
                  <Text style={styles.headline}>{a.headline}</Text>
                  <View style={styles.metaRow}>
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>
                        {a.category === 'Industry'
                          ? 'Industry'
                          : `Stock: ${stocksById[a.affects[0]]?.name || a.affects[0]}`}
                      </Text>
                    </View>
                    <Text style={styles.metaText}>{a.source} · {a.publicationDate}</Text>
                  </View>
                  <Text style={styles.body}>{a.articleText}</Text>
                </View>
              ))}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,24,30,0.45)', justifyContent: 'flex-end' },
  panel: { height: '90%', backgroundColor: '#f5f5f5', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#cccccc', backgroundColor: '#ffffff' },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '900' },
  close: { color: BLUE, fontSize: 18, fontWeight: '800' },
  controls: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: '#ffffff', borderBottomWidth: 1, borderBottomColor: '#eee' },
  chip: { borderWidth: 1, borderColor: '#cccccc', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6 },
  chipActive: { backgroundColor: BLUE, borderColor: BLUE },
  chipText: { color: '#666666', fontSize: 12, fontWeight: '700' },
  chipTextActive: { color: '#ffffff' },
  hint: { color: '#666666', fontSize: 12, fontStyle: 'italic', padding: 12, paddingBottom: 0 },
  list: { padding: 12 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 6, padding: 14, marginBottom: 10 },
  headline: { color: '#1a1a1a', fontSize: 15, fontWeight: '800', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: { backgroundColor: '#e5e7eb', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  badgeText: { color: '#666666', fontSize: 11, fontWeight: '800' },
  metaText: { color: '#888888', fontSize: 11 },
  body: { color: '#333333', fontSize: 13, lineHeight: 19, marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle: { color: '#1a1a1a', fontSize: 17, fontWeight: '800' },
  emptyText: { color: '#666666', fontSize: 13, marginTop: 6, textAlign: 'center' },
});
