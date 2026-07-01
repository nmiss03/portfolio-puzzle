import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Button from '../components/Button';
import BarChart from '../components/BarChart';
import HappinessMeter from '../components/HappinessMeter';
import { useGame } from '../state/GameContext';
import { REGIME_BLURB, REGIME_LABEL } from '../data/economicCycles';
import { formatMoney, formatPrice } from '../utils/format';
import { C, FONT_PIXEL, BORDER_W } from '../theme';

const GREEN = C.success;
const RED = C.danger;
const BLUE = C.gold;

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
          <Text style={[styles.thNum, styles.th]}>Market</Text>
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
          {t.priceMoves.map((m) => {
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
                  <Text style={{ color: up ? GREEN : RED }}>
                    ({up ? '+' : ''}{(m.pct * 100).toFixed(1)}%)
                  </Text>
                </Text>
              </View>
            );
          })}
          <Text style={styles.priceNote}>These ending prices carry over as next week's starting prices.</Text>
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
          t.repChanges.map((c, i) => (
            <Text key={i} style={[styles.repChange, { color: c.amount >= 0 ? GREEN : RED }]}>
              {c.amount >= 0 ? '+' : ''}{c.amount} · {c.reason}
            </Text>
          ))
        )}
        <Text style={[styles.repTotal, { color: t.repAfter >= t.repBefore ? GREEN : RED }]}>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20 },
  title: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 20, fontWeight: '900', textAlign: 'center', marginVertical: 12, letterSpacing: 1, textTransform: 'uppercase' },
  regimeCard: { backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 12, marginBottom: 16 },
  regimeLabel: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 13, fontWeight: '900', letterSpacing: 0.5 },
  regimeBlurb: { color: C.textDim, fontSize: 12, lineHeight: 17, marginTop: 4 },
  feeLine: { fontFamily: FONT_PIXEL, color: C.success, fontSize: 12, fontWeight: '800', marginTop: 8 },
  priceNoteRibbon: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 9, fontWeight: '800', marginTop: 3 },
  swanCard: { backgroundColor: C.panelDark, borderWidth: BORDER_W, borderColor: C.danger, padding: 14, marginBottom: 16 },
  swanTitle: { fontFamily: FONT_PIXEL, color: C.danger, fontSize: 14, fontWeight: '900', letterSpacing: 0.5 },
  swanBlurb: { color: C.text, fontSize: 13, lineHeight: 19, marginTop: 8 },
  swanNote: { color: C.textDim, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  chartCard: { backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 16, marginBottom: 16 },
  accuracyCard: { backgroundColor: C.panelDark, borderWidth: BORDER_W, borderColor: C.gold, padding: 12, marginBottom: 16 },
  accuracyText: { color: C.text, fontSize: 13, fontWeight: '700', lineHeight: 18 },
  table: { backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 12 },
  concCard: { backgroundColor: C.panelDark, borderWidth: BORDER_W, borderColor: C.danger, padding: 14, marginTop: 16 },
  concTitle: { fontFamily: FONT_PIXEL, color: C.danger, fontSize: 14, fontWeight: '900', marginBottom: 6, letterSpacing: 0.5, textTransform: 'uppercase' },
  concRow: { color: C.text, fontSize: 13, fontWeight: '700', marginVertical: 2 },
  concPenalty: { color: C.danger, fontWeight: '900' },
  concNote: { color: C.muted, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  priceCard: { backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 14, marginTop: 16 },
  priceTitle: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 15, fontWeight: '900', marginBottom: 8, letterSpacing: 0.5, textTransform: 'uppercase' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 5, borderBottomWidth: 1, borderBottomColor: C.divider },
  priceLeft: { flex: 1, marginRight: 8 },
  priceName: { color: C.text, fontSize: 13, fontWeight: '700' },
  priceBreakdown: { color: C.muted, fontSize: 10, fontWeight: '600', marginTop: 1 },
  priceMove: { fontFamily: FONT_PIXEL, color: C.textDim, fontSize: 13, fontWeight: '800' },
  priceNote: { color: C.muted, fontSize: 11, fontStyle: 'italic', marginTop: 8 },
  repCard: { backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 14, marginTop: 16 },
  repHeadRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  repTitle: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 15, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  repNow: { fontFamily: FONT_PIXEL, color: C.text, fontSize: 14, fontWeight: '800' },
  repNeutral: { color: C.muted, fontSize: 13 },
  repChange: { fontSize: 13, fontWeight: '700', marginVertical: 2 },
  repTotal: { fontFamily: FONT_PIXEL, fontSize: 14, fontWeight: '900', marginTop: 8 },
  unlock: { color: C.gold, fontSize: 13, fontWeight: '800', marginTop: 8 },
  dead: { color: C.danger, fontSize: 13, fontWeight: '800', marginTop: 8 },
  tHead: { flexDirection: 'row', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 2, borderBottomColor: C.border },
  th: { fontFamily: FONT_PIXEL, color: C.textDim, fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  tRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: C.divider },
  thClient: { flex: 1.2 },
  thNum: { flex: 1.2, textAlign: 'right' },
  thHappy: { flex: 1.3, paddingLeft: 10 },
  tdName: { fontFamily: FONT_PIXEL, color: C.text, fontSize: 14, fontWeight: '800' },
  td: { fontFamily: FONT_PIXEL, fontSize: 12, fontWeight: '800' },
  happyPct: { fontFamily: FONT_PIXEL, color: C.muted, fontSize: 11, fontWeight: '700', marginTop: 2, textAlign: 'right' },
});
