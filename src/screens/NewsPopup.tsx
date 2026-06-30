import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { stocksById } from '../data/stocks';
import { useGame } from '../state/GameContext';
import { C, FONT_PIXEL, BORDER_W } from '../theme';

const BLUE = C.gold;

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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,16,16,0.6)', justifyContent: 'flex-end' },
  panel: { height: '90%', backgroundColor: C.bg, borderTopWidth: BORDER_W * 2, borderColor: C.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: BORDER_W, borderBottomColor: C.border, backgroundColor: C.panelDark },
  title: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 18, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  close: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 18, fontWeight: '800' },
  controls: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: C.panelDark, borderBottomWidth: 2, borderBottomColor: C.border },
  chip: { borderWidth: 2, borderColor: C.border, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, backgroundColor: C.panel },
  chipActive: { backgroundColor: C.button, borderColor: C.border },
  chipText: { fontFamily: FONT_PIXEL, color: C.textDim, fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: C.ink },
  hint: { color: C.textDim, fontSize: 12, fontStyle: 'italic', padding: 12, paddingBottom: 0 },
  list: { padding: 12 },
  card: { backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 14, marginBottom: 10 },
  headline: { fontFamily: FONT_PIXEL, color: C.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: { backgroundColor: C.panelDark, borderWidth: 1, borderColor: C.border, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  badgeText: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 10, fontWeight: '800' },
  metaText: { color: C.muted, fontSize: 11 },
  body: { color: C.textDim, fontSize: 13, lineHeight: 19, marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 16, fontWeight: '800' },
  emptyText: { color: C.textDim, fontSize: 13, marginTop: 6, textAlign: 'center' },
});
