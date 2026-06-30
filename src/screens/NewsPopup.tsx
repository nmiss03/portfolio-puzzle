import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { stocksById } from '../data/stocks';
import { NewsArticle } from '../data/newsArticles';
import { useGame } from '../state/GameContext';

const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#4a90e2';

type FilterMode = 'All' | 'Industry' | 'Specific Stock';
type SortMode = 'Date' | 'Impact';

function maxAbsImpact(a: NewsArticle): number {
  return Math.max(...Object.values(a.priceImpact).map(Math.abs), 0);
}

export default function NewsPopup() {
  const { state, readNews, toggleNews } = useGame();
  const [filter, setFilter] = useState<FilterMode>('All');
  const [sort, setSort] = useState<SortMode>('Date');
  const [expanded, setExpanded] = useState<string | null>(null);

  const articles = useMemo(() => {
    let list = state.weekNews.filter((a) => filter === 'All' || a.category === filter);
    list = [...list];
    if (sort === 'Impact') list.sort((a, b) => maxAbsImpact(b) - maxAbsImpact(a));
    else list.sort((a, b) => b.publicationDate.localeCompare(a.publicationDate)); // newest first
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.weekNews, filter, sort]);

  if (!state.newsOpen) return null;
  const read = new Set(state.readNewsIds);

  const toggle = (a: NewsArticle) => {
    setExpanded((e) => (e === a.id ? null : a.id));
    if (!read.has(a.id)) readNews(a.id); // reading moves prices
  };

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Market News</Text>
          <Pressable onPress={() => toggleNews(false)} hitSlop={10}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <View style={styles.controls}>
          {(['All', 'Industry', 'Specific Stock'] as FilterMode[]).map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>{f === 'Specific Stock' ? 'Stocks' : f}</Text>
            </Pressable>
          ))}
          <Pressable onPress={() => setSort((s) => (s === 'Date' ? 'Impact' : 'Date'))} style={styles.sortBtn}>
            <Text style={styles.sortText}>Sort: {sort}</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          {articles.map((a) => {
            const isRead = read.has(a.id);
            const isOpen = expanded === a.id;
            return (
              <Pressable key={a.id} style={styles.card} onPress={() => toggle(a)}>
                <Text style={styles.headline}>{a.headline}</Text>
                <View style={styles.metaRow}>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {a.category === 'Industry' ? 'Industry' : `Stock: ${stocksById[a.affects[0]]?.name || a.affects[0]}`}
                    </Text>
                  </View>
                  <Text style={styles.metaText}>{a.source} · {a.publicationDate}</Text>
                  {isRead && <Text style={styles.readTag}>● read</Text>}
                </View>

                {isOpen && <Text style={styles.body}>{a.articleText}</Text>}

                <Text style={styles.impactLabel}>Impact preview</Text>
                <View style={styles.impactWrap}>
                  {Object.entries(a.priceImpact).map(([id, delta]) => {
                    const primary = a.affects.includes(id);
                    const pos = delta >= 0;
                    return (
                      <Text
                        key={id}
                        style={[styles.impact, { color: pos ? GREEN : RED, fontSize: primary ? 13 : 11, fontWeight: primary ? '800' : '600' }]}
                      >
                        {stocksById[id]?.name || id.toUpperCase()}: {pos ? '+' : ''}{Math.round(delta * 100)}%
                      </Text>
                    );
                  })}
                </View>
                {!isOpen && <Text style={styles.tapHint}>{isRead ? 'Tap to read full article' : 'Tap to read — moves prices'}</Text>}
              </Pressable>
            );
          })}
        </ScrollView>
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
  sortBtn: { marginLeft: 'auto', paddingHorizontal: 8, paddingVertical: 5 },
  sortText: { color: BLUE, fontSize: 12, fontWeight: '800' },
  list: { padding: 12 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 6, padding: 12, marginBottom: 10 },
  headline: { color: '#1a1a1a', fontSize: 14, fontWeight: '800', lineHeight: 19 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6, flexWrap: 'wrap' },
  badge: { backgroundColor: '#e5e7eb', borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  badgeText: { color: '#666666', fontSize: 11, fontWeight: '800' },
  metaText: { color: '#888888', fontSize: 11 },
  readTag: { color: GREEN, fontSize: 11, fontWeight: '800', marginLeft: 8 },
  body: { color: '#333333', fontSize: 12, lineHeight: 18, marginTop: 8 },
  impactLabel: { color: '#888888', fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3, marginTop: 10 },
  impactWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  impact: { marginRight: 12, marginTop: 2 },
  tapHint: { color: BLUE, fontSize: 11, fontWeight: '700', marginTop: 8 },
});
