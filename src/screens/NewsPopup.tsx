// The Market News application: a financial newspaper. Headlines run as a
// dense ■-bulleted list under a masthead; tapping one unfolds the article
// inline. Terminal owners get next week's edition early.

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelWindow from '../components/PixelWindow';
import { stocksById } from '../data/stocks';
import { useGame } from '../state/GameContext';
import { FONT_PIXEL, Palette } from '../theme';
import { makeUseStyles } from '../contexts/ThemeContext';

type FilterMode = 'All' | 'Industry' | 'Specific Stock';
type WeekTab = 'this' | 'next';

export default function NewsPopup() {
  const { state, upgrades, toggleNews } = useGame();
  const styles = useStyles();
  const [filter, setFilter] = useState<FilterMode>('All');
  const [weekTab, setWeekTab] = useState<WeekTab>('this');
  const [openId, setOpenId] = useState<string | null>(null);

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

  return (
    <PixelWindow title="Market News" icon="📰" onClose={() => toggleNews(false)}>
      {hasTerminal && (
        <View style={styles.weekTabs}>
          {(['this', 'next'] as WeekTab[]).map((t) => (
            <Pressable key={t} onPress={() => { setWeekTab(t); setOpenId(null); }} style={[styles.weekTab, weekTab === t && styles.weekTabActive]}>
              <Text style={[styles.weekTabText, weekTab === t && styles.weekTabTextActive]}>
                {t === 'this' ? `WEEK ${state.currentWeek}` : `WEEK ${state.currentWeek + 1} PREVIEW`}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.paper}>
        {/* Masthead */}
        <View style={styles.masthead}>
          <Text style={styles.mastTitle}>THE WEEKLY LEDGER</Text>
          <Text style={styles.mastSub}>
            {weekTab === 'next' ? `EARLY EDITION — WEEK ${state.currentWeek + 1}` : `MARKET NEWS — WEEK ${state.currentWeek}`}
          </Text>
          <View style={styles.mastRule} />
        </View>

        {/* Filter chips */}
        <View style={styles.controls}>
          {(['All', 'Industry', 'Specific Stock'] as FilterMode[]).map((f) => (
            <Pressable key={f} onPress={() => setFilter(f)} style={[styles.chip, filter === f && styles.chipActive]}>
              <Text style={[styles.chipText, filter === f && styles.chipTextActive]}>
                {f === 'Specific Stock' ? 'STOCKS' : f.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </View>

        {articles.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>Quiet markets.</Text>
            <Text style={styles.emptyText}>No headlines here. Trade on the fundamentals.</Text>
          </View>
        ) : (
          articles.map((a) => {
            const open = openId === a.id;
            return (
              <View key={a.id}>
                <Pressable
                  onPress={() => setOpenId(open ? null : a.id)}
                  style={({ pressed }) => [styles.headlineRow, pressed && styles.headlinePressed, open && styles.headlineOpen]}
                >
                  <Text style={[styles.bullet, a.exclusive && styles.bulletExclusive]}>■</Text>
                  <Text style={[styles.headline, open && styles.headlineActive]} numberOfLines={open ? undefined : 2}>
                    {a.exclusive ? '★ ' : ''}{a.headline}
                  </Text>
                  <Text style={styles.fold}>{open ? '▾' : '▸'}</Text>
                </Pressable>
                {open && (
                  <View style={styles.article}>
                    <View style={styles.metaRow}>
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {a.category === 'Industry' ? 'INDUSTRY' : (stocksById[a.affects[0]]?.ticker || a.affects[0]).toUpperCase()}
                        </Text>
                      </View>
                      {a.exclusive && (
                        <View style={[styles.badge, styles.badgeGold]}>
                          <Text style={[styles.badgeText, styles.badgeTextInk]}>★ EXCLUSIVE T{a.exclusiveTier}</Text>
                        </View>
                      )}
                      <Text style={styles.metaText}>{a.source}</Text>
                    </View>
                    <Text style={styles.body}>{a.articleText}</Text>
                  </View>
                )}
              </View>
            );
          })
        )}

        <Text style={styles.hint}>
          {weekTab === 'next'
            ? 'Terminal preview: these stories break next week. Position yourself before the crowd reads them.'
            : 'Read, interpret, position. Results land at week-end.'}
        </Text>
      </ScrollView>
    </PixelWindow>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
  weekTabs: { flexDirection: 'row', backgroundColor: c.panelDark, borderBottomWidth: 2, borderBottomColor: c.border },
  weekTab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderBottomWidth: 3, borderBottomColor: 'transparent' },
  weekTabActive: { borderBottomColor: c.gold },
  weekTabText: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  weekTabTextActive: { color: c.gold },

  paper: { padding: 12 },
  masthead: { alignItems: 'center', marginBottom: 8 },
  mastTitle: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 18, fontWeight: '900', letterSpacing: 2 },
  mastSub: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 9, fontWeight: '800', letterSpacing: 1, marginTop: 3 },
  mastRule: { height: 3, alignSelf: 'stretch', backgroundColor: c.border, marginTop: 8 },

  controls: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  chip: { borderWidth: 2, borderColor: c.border, paddingHorizontal: 8, paddingVertical: 4, marginRight: 6, backgroundColor: c.panel },
  chipActive: { backgroundColor: c.button },
  chipText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 9, fontWeight: '800' },
  chipTextActive: { color: c.ink },

  headlineRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: c.divider },
  headlinePressed: { backgroundColor: c.panel },
  headlineOpen: { borderBottomWidth: 0 },
  bullet: { color: c.gold, fontSize: 11, marginRight: 8, marginTop: 2 },
  bulletExclusive: { color: c.warning },
  headline: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 12, fontWeight: '800', lineHeight: 18, flex: 1 },
  headlineActive: { color: c.gold },
  fold: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 11, marginLeft: 8, marginTop: 2 },

  article: { backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, padding: 10, marginBottom: 10 },
  metaRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  badge: { backgroundColor: c.panelDark, borderWidth: 1, borderColor: c.border, paddingHorizontal: 5, paddingVertical: 2, marginRight: 6 },
  badgeGold: { backgroundColor: c.gold, borderColor: c.border },
  badgeText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 8, fontWeight: '900' },
  badgeTextInk: { color: c.ink },
  metaText: { color: c.muted, fontSize: 10 },
  body: { color: c.textDim, fontSize: 12, lineHeight: 18 },

  hint: { color: c.muted, fontSize: 10, fontStyle: 'italic', marginTop: 12, textAlign: 'center' },
  empty: { alignItems: 'center', padding: 24 },
  emptyTitle: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 14, fontWeight: '800' },
  emptyText: { color: c.textDim, fontSize: 12, marginTop: 6, textAlign: 'center' },
  })
);
