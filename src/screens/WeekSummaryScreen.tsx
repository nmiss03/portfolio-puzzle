import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Button from '../components/Button';
import BarChart from '../components/BarChart';
import HappinessMeter from '../components/HappinessMeter';
import { useGame } from '../state/GameContext';
import { REGIME_BLURB, REGIME_LABEL } from '../data/economicCycles';
import { formatMoney, formatPrice } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

export default function WeekSummaryScreen({ onContinue }: { onContinue: () => void }) {
  const { state } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
  const t = state.transition;

  if (!t) {
    return (
      <View style={styles.screen}>
        <Button title="Continue" onPress={onContinue} />
      </View>
    );
  }

  const barData = t.results.map((r) => ({ label: r.name, value: Math.round(r.returnDollar) }));

  // Keep the price list scannable: your holdings, the week's biggest movers,
  // and anything with a special-event note — not all 22 stocks.
  const heldIds = new Set<string>();
  Object.values(state.clients).forEach((cl) => {
    if (cl.status !== 'signed') return;
    Object.entries(cl.holdings).forEach(([id, h]) => {
      if (h.shares > 0) heldIds.add(id);
    });
  });
  const topIds = new Set(t.priceMoves.slice(0, 5).map((m) => m.stockId));
  const shownMoves = t.priceMoves.filter((m) => heldIds.has(m.stockId) || topIds.has(m.stockId) || m.notes.length > 0);

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <Text style={styles.title}>Week {t.week} Summary</Text>

      {/* Contract report cards — the payoff for a finished 8-week arc. */}
      {t.contractReports.map((r) => (
        <View key={r.clientId} style={styles.reportCard}>
          <View style={styles.reportHead}>
            <Text style={styles.reportTitle}>📜 CONTRACT COMPLETE — {r.name.toUpperCase()}</Text>
            <Text style={styles.reportGrade}>{r.grade}</Text>
          </View>
          <Text style={styles.reportLine}>
            8-week return:{' '}
            <Text style={{ color: r.allTimePct >= 0 ? c.success : c.danger }}>
              {r.allTimePct >= 0 ? '+' : ''}{(r.allTimePct * 100).toFixed(1)}%
            </Text>
            {'   '}Final happiness: {Math.round(r.happiness)}%
          </Text>
          {r.bonus > 0 && <Text style={styles.reportBonus}>Completion bonus: +{formatMoney(r.bonus)}</Text>}
          {r.repBonus > 0 && <Text style={styles.reportRep}>+{r.repBonus} reputation</Text>}
          <Text style={styles.reportNote}>Find {r.name} in the Client Book to renew or part ways.</Text>
        </View>
      ))}

      {/* Economic cycle context for the week */}
      <View style={styles.regimeCard}>
        <Text style={styles.regimeLabel}>MARKET: {REGIME_LABEL[t.regime]}</Text>
        <Text style={styles.regimeBlurb}>{REGIME_BLURB[t.regime]}</Text>
        {t.feeIncome > 0 && (
          <Text style={styles.feeLine}>Advisor fees earned this week: +{formatMoney(Math.round(t.feeIncome))}</Text>
        )}
      </View>

      {t.blackSwan && (
        <View style={styles.swanCard}>
          <Text style={styles.swanTitle}>⚠ BLACK SWAN — {t.blackSwan.name.toUpperCase()}</Text>
          <Text style={styles.swanBlurb}>{t.blackSwan.blurb}</Text>
          <Text style={styles.swanNote}>Low-beta defensives and bonds held up best. High-beta names took the brunt.</Text>
        </View>
      )}

      <View style={styles.chartCard}>
        <BarChart data={barData} height={180} />
      </View>

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
              <Text style={[styles.thNum, styles.td, { color: wPos ? c.success : c.danger }]}>
                {wPos ? '+' : '-'}{formatMoney(Math.abs(Math.round(r.returnDollar)))}{'\n'}
                {wPos ? '+' : ''}{(r.returnPct * 100).toFixed(2)}%
              </Text>
              <Text style={[styles.thNum, styles.td, { color: c.gold }]}>
                {nPos ? '+' : '-'}{formatMoney(Math.abs(Math.round(r.newsContribution)))}
              </Text>
              <Text style={[styles.thNum, styles.td, { color: aPos ? c.success : c.danger }]}>
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

      {/* Concentration warnings — over-allocating to one stock hurts trust. */}
      {t.results.some((r) => r.concentrationPenalty < 0) && (
        <View style={styles.concCard}>
          <Text style={styles.concTitle}>⚠ Concentration Risk</Text>
          {t.results
            .filter((r) => r.concentrationPenalty < 0)
            .map((r) => (
              <Text key={r.clientId} style={styles.concRow}>
                {r.name}: {Math.round(r.largestStockPct * 100)}% in one stock ({r.concentrationLevel}) ·{' '}
                <Text style={styles.concPenalty}>{r.concentrationPenalty} happiness</Text>
              </Text>
            ))}
          <Text style={styles.concNote}>Spread capital across more stocks to keep clients comfortable.</Text>
        </View>
      )}

      {/* Stock price movements: week-start → week-end. Every stock drifts each
          week; news adds on top. Breakdown shown when news contributed. */}
      {t.priceMoves.length > 0 && (
        <View style={styles.priceCard}>
          <Text style={styles.priceTitle}>Price Movements (week-end)</Text>
          {shownMoves.map((m) => {
            const up = m.pct >= 0;
            const hasNews = Math.abs(m.newsPct) > 1e-9;
            return (
              <View key={m.stockId} style={styles.priceRow}>
                <View style={styles.priceLeft}>
                  <Text style={styles.priceName} numberOfLines={1}>{m.name} ({m.ticker})</Text>
                  {hasNews && (
                    <Text style={styles.priceBreakdown}>
                      market {m.driftPct >= 0 ? '+' : ''}{(m.driftPct * 100).toFixed(2)}% · news {m.newsPct >= 0 ? '+' : ''}{(m.newsPct * 100).toFixed(2)}%
                    </Text>
                  )}
                  {m.notes.map((n, i) => (
                    <Text key={i} style={styles.priceNoteRibbon} numberOfLines={2}>{n}</Text>
                  ))}
                </View>
                <Text style={styles.priceMove}>
                  {formatPrice(m.startPrice)} → {formatPrice(m.endPrice)}{'  '}
                  <Text style={{ color: up ? c.success : c.danger }}>
                    ({up ? '+' : ''}{(m.pct * 100).toFixed(1)}%)
                  </Text>
                </Text>
              </View>
            );
          })}
          <Text style={styles.priceNote}>Top movers, your holdings & special events shown · {t.priceMoves.length} stocks tracked. Ending prices carry over to next week.</Text>
        </View>
      )}

      {/* Reputation changes */}
      <View style={styles.repCard}>
        <View style={styles.repHeadRow}>
          <Text style={styles.repTitle}>Reputation</Text>
          <Text style={styles.repNow}>{Math.round(t.repBefore)} → {Math.round(t.repAfter)}/100</Text>
        </View>
        {t.repChanges.length === 0 ? (
          <Text style={styles.repNeutral}>No change this week.</Text>
        ) : (
          t.repChanges.map((ch, i) => (
            <Text key={i} style={[styles.repChange, { color: ch.amount >= 0 ? c.success : c.danger }]}>
              {ch.amount >= 0 ? '+' : ''}{ch.amount} · {ch.reason}
            </Text>
          ))
        )}
        <Text style={[styles.repTotal, { color: t.repAfter >= t.repBefore ? c.success : c.danger }]}>
          {t.repAfter >= t.repBefore ? '+' : ''}{Math.round(t.repAfter - t.repBefore)} reputation this week
        </Text>
        {t.newlyUnlocked.length > 0 && (
          <Text style={styles.unlock}>⭐ New client available: {t.newlyUnlocked.join(', ')}</Text>
        )}
        {t.repAfter <= 0 && <Text style={styles.dead}>Your reputation hit 0 — your career is over.</Text>}
      </View>

      <Button
        title={t.repAfter <= 0 ? 'See Final Result  ›' : `Continue to Week ${t.week + 1}  ›`}
        onPress={onContinue}
        style={{ marginTop: 24 }}
      />
    </ScrollView>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
  screen: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  title: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 20, fontWeight: '900', textAlign: 'center', marginVertical: 12, letterSpacing: 1, textTransform: 'uppercase' },
  reportCard: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.gold, padding: 14, marginBottom: 16 },
  reportHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  reportTitle: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 13, fontWeight: '900', letterSpacing: 0.5, flex: 1, marginRight: 8 },
  reportGrade: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 28, fontWeight: '900' },
  reportLine: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 12, fontWeight: '700', marginTop: 8 },
  reportBonus: { fontFamily: FONT_PIXEL, color: c.success, fontSize: 12, fontWeight: '900', marginTop: 6 },
  reportRep: { fontFamily: FONT_PIXEL, color: c.success, fontSize: 12, fontWeight: '900', marginTop: 2 },
  reportNote: { color: c.muted, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  regimeCard: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 12, marginBottom: 16 },
  regimeLabel: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  regimeBlurb: { color: c.textDim, fontSize: 12, lineHeight: 17, marginTop: 4 },
  feeLine: { fontFamily: FONT_PIXEL, color: c.success, fontSize: 12, fontWeight: '800', marginTop: 8 },
  priceNoteRibbon: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 9, fontWeight: '800', marginTop: 3 },
  swanCard: { backgroundColor: c.panelDark, borderWidth: BORDER_W, borderColor: c.danger, padding: 14, marginBottom: 16 },
  swanTitle: { fontFamily: FONT_PIXEL, color: c.danger, fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  swanBlurb: { color: c.text, fontSize: 13, lineHeight: 19, marginTop: 8 },
  swanNote: { color: c.textDim, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  chartCard: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 16, marginBottom: 16 },
  accuracyCard: { backgroundColor: c.panelDark, borderWidth: BORDER_W, borderColor: c.gold, padding: 12, marginBottom: 16 },
  accuracyText: { color: c.text, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  table: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 12 },
  concCard: { backgroundColor: c.panelDark, borderWidth: BORDER_W, borderColor: c.danger, padding: 14, marginTop: 16 },
  concTitle: { fontFamily: FONT_PIXEL, color: c.danger, fontSize: 14, fontWeight: '900', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  concRow: { color: c.text, fontSize: 13, fontWeight: '700', marginVertical: 2 },
  concPenalty: { color: c.danger, fontWeight: '900' },
  concNote: { color: c.muted, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  priceCard: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 14, marginTop: 16 },
  priceTitle: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 15, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: c.divider },
  priceLeft: { flex: 1, marginRight: 8 },
  priceName: { color: c.text, fontSize: 13, fontWeight: '700' },
  priceBreakdown: { color: c.muted, fontSize: 10, fontWeight: '600', marginTop: 1 },
  priceMove: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 13, fontWeight: '800' },
  priceNote: { color: c.muted, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  repCard: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 14, marginTop: 16 },
  repHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  repTitle: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 15, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  repNow: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 14, fontWeight: '800' },
  repNeutral: { color: c.muted, fontSize: 13 },
  repChange: { fontSize: 13, fontWeight: '700', marginVertical: 2 },
  repTotal: { fontFamily: FONT_PIXEL, fontSize: 14, fontWeight: '900', marginTop: 8 },
  unlock: { color: c.gold, fontSize: 13, fontWeight: '800', marginTop: 8 },
  dead: { color: c.danger, fontSize: 13, fontWeight: '800', marginTop: 8 },
  tHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: c.border },
  th: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: c.divider },
  thClient: { flex: 1.2 },
  thNum: { flex: 1.2, textAlign: 'right' },
  thHappy: { flex: 1.3, paddingLeft: 10 },
  tdName: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 14, fontWeight: '800' },
  td: { fontFamily: FONT_PIXEL, fontSize: 12, fontWeight: '800' },
  happyPct: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 11, fontWeight: '700', marginTop: 2, textAlign: 'right' },
  })
);
