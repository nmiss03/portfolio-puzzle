// The Stock Terminal application: a simplified pixel Bloomberg. Ticker list on
// top (price + last week's move), full profile of the selected name below —
// specs, description, and this week's related headlines. Analysis only:
// trading stays in the Client Book, where the money actually lives.

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelWindow from '../components/PixelWindow';
import STOCKS, { Sector, SECTORS } from '../data/stocks';
import { useGame } from '../state/GameContext';
import { useIsWide } from '../utils/layout';
import { formatPrice } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

type Filter = 'All' | Sector;

export default function StockTerminal() {
  const { state, upgrades, priceOf, toggleTerminal } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
  const [selectedId, setSelectedId] = useState(STOCKS[0].id);
  const [filter, setFilter] = useState<Filter>('All');
  const isWide = useIsWide();

  const stocks = useMemo(() => (filter === 'All' ? STOCKS : STOCKS.filter((s) => s.sector === filter)), [filter]);
  const stock = STOCKS.find((s) => s.id === selectedId) ?? STOCKS[0];

  // Last resolved week's move per stock, from the price history.
  const lastMove = (id: string): number | null => {
    const hist = state.stockPriceHistory[id];
    if (!hist || hist.length === 0) return null;
    const last = hist[hist.length - 1];
    return last.startPrice > 0 ? (last.endPrice - last.startPrice) / last.startPrice : null;
  };

  // This week's visible headlines that touch the selected stock.
  const related = state.weekNews.filter(
    (a) => !a.insider && (!a.exclusive || upgrades.newsTerminal) && Math.abs(a.priceImpact[stock.id] ?? 0) > 1e-9
  );

  if (!state.terminalOpen) return null;

  const move = lastMove(stock.id);

  return (
    <PixelWindow title="Stock Terminal" icon="📈" onClose={() => toggleTerminal(false)} maxWidth={1100}>
      {/* Sector filter strip */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterStrip} contentContainerStyle={styles.filterContent}>
        {(['All', ...SECTORS] as Filter[]).map((f) => (
          <Pressable key={f} onPress={() => setFilter(f)} style={[styles.filterChip, filter === f && styles.filterChipActive]}>
            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f.toUpperCase()}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Desktop: ticker board and profile sit side by side; narrow stacks. */}
      <View style={[styles.split, isWide && styles.splitWide]}>
      <View style={[styles.board, isWide && styles.boardWide]}>
        <ScrollView>
          {stocks.map((s) => {
            const m = lastMove(s.id);
            const active = s.id === stock.id;
            const up = (m ?? 0) >= 0;
            return (
              <Pressable
                key={s.id}
                onPress={() => setSelectedId(s.id)}
                style={(st: any) => [styles.row, active && styles.rowActive, st.hovered && !active && styles.rowPressed, st.pressed && !active && styles.rowPressed]}
              >
                <View style={[styles.sectorPip, { backgroundColor: s.sectorColor }]} />
                <Text style={[styles.rowTicker, active && { color: c.ink }]}>{s.ticker}</Text>
                <Text style={[styles.rowName, active && { color: c.ink }]} numberOfLines={1}>{s.name}</Text>
                <Text style={[styles.rowPrice, active && { color: c.ink }]}>{formatPrice(priceOf(s.id))}</Text>
                <Text style={[styles.rowMove, { color: m === null ? c.muted : up ? c.success : c.danger }, active && { color: c.ink }]}>
                  {m === null ? '—' : `${up ? '▲' : '▼'}${Math.abs(m * 100).toFixed(1)}%`}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* Selected profile */}
      <ScrollView style={styles.profile} contentContainerStyle={styles.profileContent}>
        <View style={styles.profileHead}>
          <View style={[styles.logo, { backgroundColor: stock.logo.bgColor }]}>
            <Text style={[styles.logoText, { fontSize: stock.logo.type === 'initials' ? 18 : 22 }]}>{stock.logo.value}</Text>
          </View>
          <View style={styles.headMid}>
            <Text style={styles.profName}>{stock.name}</Text>
            <Text style={styles.profSector}>{stock.ticker} · {stock.sector}</Text>
          </View>
          <View style={styles.headRight}>
            <Text style={styles.profPrice}>{formatPrice(priceOf(stock.id))}</Text>
            <Text style={[styles.profMove, { color: move === null ? c.muted : move >= 0 ? c.success : c.danger }]}>
              {move === null ? 'no history' : `${move >= 0 ? '+' : ''}${(move * 100).toFixed(2)}% last wk`}
            </Text>
          </View>
        </View>

        <View style={styles.specGrid}>
          <Spec label="MKT CAP" value={stock.marketCap} />
          <Spec label="P/E" value={stock.pe == null ? 'N/A' : `${stock.pe}`} />
          <Spec label="DIV" value={`${stock.dividend.toFixed(1)}%`} />
          <Spec label="BETA" value={stock.beta.toFixed(1)} />
          <Spec label="52WK LO" value={formatPrice(stock.week52Low)} />
          <Spec label="52WK HI" value={formatPrice(stock.week52High)} />
        </View>

        <Text style={styles.desc}>{stock.background}</Text>

        <Text style={styles.newsHead}>RELATED HEADLINES — WEEK {state.currentWeek}</Text>
        {related.length === 0 ? (
          <Text style={styles.newsEmpty}>No headlines touching {stock.ticker} this week.</Text>
        ) : (
          related.map((a) => (
            <View key={a.id} style={styles.newsRow}>
              <Text style={styles.newsBullet}>■</Text>
              <Text style={styles.newsLine}>{a.headline}</Text>
            </View>
          ))
        )}
        <Text style={styles.footNote}>Analysis only — trade from a client's account in the Client Book.</Text>
      </ScrollView>
      </View>
    </PixelWindow>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  const styles = useStyles();
  return (
    <View style={styles.specCell}>
      <Text style={styles.specLabel}>{label}</Text>
      <Text style={styles.specValue} numberOfLines={1}>{value}</Text>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    filterStrip: { flexGrow: 0, backgroundColor: c.panelDark, borderBottomWidth: 2, borderBottomColor: c.border },
    filterContent: { padding: 6 },
    filterChip: { borderWidth: 2, borderColor: c.border, backgroundColor: c.panel, paddingHorizontal: 8, paddingVertical: 4, marginRight: 5 },
    filterChipActive: { backgroundColor: c.button },
    filterText: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 },
    filterTextActive: { color: c.ink },

    split: { flex: 1 },
    splitWide: { flexDirection: 'row' },
    board: { height: '38%', borderBottomWidth: BORDER_W, borderBottomColor: c.border, backgroundColor: c.panelDark },
    boardWide: { height: '100%', width: 380, borderBottomWidth: 0, borderRightWidth: BORDER_W, borderRightColor: c.border },
    row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: c.divider },
    rowActive: { backgroundColor: c.button },
    rowPressed: { backgroundColor: c.panelLite },
    sectorPip: { width: 6, height: 6, marginRight: 7 },
    rowTicker: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '900', width: 44 },
    rowName: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 10, flex: 1, marginRight: 6 },
    rowPrice: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 11, fontWeight: '800', width: 72, textAlign: 'right' },
    rowMove: { fontFamily: FONT_PIXEL, fontSize: 10, fontWeight: '900', width: 58, textAlign: 'right' },

    profile: { flex: 1 },
    profileContent: { padding: 12 },
    profileHead: { flexDirection: 'row', alignItems: 'center' },
    logo: { width: 44, height: 44, borderWidth: 2, borderColor: c.border, alignItems: 'center', justifyContent: 'center' },
    logoText: { color: '#ffffff', fontWeight: '900' },
    headMid: { flex: 1, marginLeft: 10 },
    profName: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 14, fontWeight: '900' },
    profSector: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 10, fontWeight: '700', marginTop: 2 },
    headRight: { alignItems: 'flex-end' },
    profPrice: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 16, fontWeight: '900' },
    profMove: { fontFamily: FONT_PIXEL, fontSize: 10, fontWeight: '800', marginTop: 2 },

    specGrid: { flexDirection: 'row', flexWrap: 'wrap', backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, marginTop: 10 },
    specCell: { width: '33.33%', paddingVertical: 6, paddingHorizontal: 8, borderBottomWidth: 1, borderRightWidth: 1, borderColor: c.divider },
    specLabel: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 8, fontWeight: '800', letterSpacing: 0.5 },
    specValue: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 11, fontWeight: '800', marginTop: 2 },

    desc: { color: c.textDim, fontSize: 12, lineHeight: 18, fontStyle: 'italic', marginTop: 10 },

    newsHead: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '900', letterSpacing: 0.5, marginTop: 14, marginBottom: 6 },
    newsRow: { flexDirection: 'row', paddingVertical: 3 },
    newsBullet: { color: c.gold, fontSize: 10, marginRight: 6, marginTop: 2 },
    newsLine: { color: c.text, fontSize: 12, fontWeight: '700', flex: 1, lineHeight: 17 },
    newsEmpty: { color: c.muted, fontSize: 11, fontStyle: 'italic' },
    footNote: { color: c.muted, fontSize: 10, fontStyle: 'italic', marginTop: 14 },
  })
);
