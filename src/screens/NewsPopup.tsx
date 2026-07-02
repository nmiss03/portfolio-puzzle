import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { stocksById } from '../data/stocks';
import { useGame } from '../state/GameContext';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles } from '../contexts/ThemeContext';

type FilterMode = 'All' | 'Industry' | 'Specific Stock';
type WeekTab = 'this' | 'next';

export default function NewsPopup() {
  const { state, upgrades, toggleNews } = useGame();
  const styles = useStyles();
  const [filter, setFilter] = useState<FilterMode>('All');
  const [weekTab, setWeekTab] = useState<WeekTab>('this');

  const hasTerminal = upgrades.newsTerminal;

  // Insider tips never appear in the feed; exclusive scoops only for terminal
  // owners. The Next Week tab is a terminal perk.
  const articles = useMemo(() => {
    const pool = weekTab === 'next' ? state.nextWeekNews : state.weekNews;
    return pool
      .filter((a) => !a.insider && (!a.exclusive || hasTerminal))
      .filter((a) => filter === 'All' || a.category === filter);
  }, [state.weekNews, state.nextWeekNews, filter, weekTab, hasTerminal]);

  if (!state.newsOpen) return null;

  const visibleThisWeek = state.weekNews.some((a) => !a.insider && (!a.exclusive || hasTerminal));

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Market News</Text>
          <Pressable onPress={() => toggleNews(false)} hitSlop={10}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        {hasTerminal && (
          <View style={styles.weekTabs}>
            {(['this', 'next'] as WeekTab[]).map((t) => (
              <Pressable key={t} onPress={() => setWeekTab(t)} style={[styles.weekTab, weekTab === t && styles.weekTabActive]}>
                <Text style={[styles.weekTabText, weekTab === t && styles.weekTabTextActive]}>
                  {t === 'this' ? `WEEK ${state.currentWeek}` : `WEEK ${state.currentWeek + 1} PREVIEW`}
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {weekTab === 'this' && !visibleThisWeek ? (
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
              {weekTab === 'next'
                ? 'Terminal preview: these stories break next week. Position yourself before the crowd reads them.'
                : "Read the headlines and decide for yourself. Then buy what you think will rise and sell what you think will fall — the results land at week's end."}
            </Text>

            <ScrollView contentContainerStyle={styles.list}>
              {articles.map((a) => (
                <View key={a.id} style={[styles.card, a.exclusive && styles.cardExclusive]}>
                  {a.exclusive && (
                    <View style={styles.exclusiveTag}>
                      <Text style={styles.exclusiveTagText}>★ EXCLUSIVE · TIER {a.exclusiveTier}</Text>
                    </View>
                  )}
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
              {articles.length === 0 && (
                <Text style={styles.emptyText}>Nothing matching this filter.</Text>
              )}
            </ScrollView>
          </>
        )}
      </View>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,16,16,0.6)', justifyContent: 'flex-end' },
  panel: { height: '90%', backgroundColor: c.bg, borderTopWidth: BORDER_W * 2, borderColor: c.border, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: BORDER_W, borderBottomColor: c.border, backgroundColor: c.panelDark },
  title: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 18, fontWeight: '900', letterSpacing: 1, textTransform: 'uppercase' },
  close: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 18, fontWeight: '800' },
  weekTabs: { flexDirection: 'row', backgroundColor: c.panelDark, borderBottomWidth: 2, borderBottomColor: c.border },
  weekTab: { flex: 1, paddingVertical: 9, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  weekTabActive: { borderBottomColor: c.gold },
  weekTabText: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },
  weekTabTextActive: { color: c.gold },
  cardExclusive: { borderColor: c.gold },
  exclusiveTag: { alignSelf: 'flex-start', backgroundColor: c.gold, paddingHorizontal: 6, paddingVertical: 2, marginBottom: 8 },
  exclusiveTagText: { fontFamily: FONT_PIXEL, color: c.ink, fontSize: 10, fontWeight: '900', letterSpacing: 0.5 },
  controls: { flexDirection: 'row', alignItems: 'center', padding: 10, backgroundColor: c.panelDark, borderBottomWidth: 2, borderBottomColor: c.border },
  chip: { borderWidth: 2, borderColor: c.border, paddingHorizontal: 10, paddingVertical: 5, marginRight: 6, backgroundColor: c.panel },
  chipActive: { backgroundColor: c.button, borderColor: c.border },
  chipText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 11, fontWeight: '700' },
  chipTextActive: { color: c.ink },
  hint: { color: c.textDim, fontSize: 12, fontStyle: 'italic', padding: 12, paddingBottom: 0 },
  list: { padding: 12 },
  card: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 14, marginBottom: 10 },
  headline: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 14, fontWeight: '800', lineHeight: 20 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginTop: 6 },
  badge: { backgroundColor: c.panelDark, borderWidth: 1, borderColor: c.border, paddingHorizontal: 6, paddingVertical: 2, marginRight: 8 },
  badgeText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 10, fontWeight: '800' },
  metaText: { color: c.muted, fontSize: 11 },
  body: { color: c.textDim, fontSize: 13, lineHeight: 19, marginTop: 8 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
  emptyTitle: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 16, fontWeight: '800' },
  emptyText: { color: c.textDim, fontSize: 13, marginTop: 6, textAlign: 'center' },
  })
);
