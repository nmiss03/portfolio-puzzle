import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter from '../components/PixelCharacter';
import HappinessMeter from '../components/HappinessMeter';
import Button from '../components/Button';
import PortfolioBuilder from './day/PortfolioBuilder';
import STOCKS from '../data/stocks';
import { RuntimeClient, avgCost, riskPreferenceLabel } from '../data/gameState';
import { useGame } from '../state/GameContext';
import { formatMoney, formatPrice } from '../utils/format';

const GREEN = '#22c55e';
const RED = '#ef4444';
const BLUE = '#4a90e2';

function signedMoney(n: number) {
  return `${n >= 0 ? '+' : '-'}${formatMoney(Math.abs(Math.round(n)))}`;
}
function signedPct(n: number) {
  return `${n >= 0 ? '+' : ''}${(n * 100).toFixed(1)}%`;
}

export default function ClientDetail({ client, onClose }: { client: RuntimeClient; onClose: () => void }) {
  const { priceOf } = useGame();
  const [editing, setEditing] = useState(false);
  const hasHistory = client.performanceHistory.length > 0;
  const ownedStocks = STOCKS.filter((s) => (client.holdings[s.id]?.shares || 0) > 0);

  // Live brokerage valuation at this week's prices.
  const holdingsValue = ownedStocks.reduce((sum, s) => sum + client.holdings[s.id].shares * priceOf(s.id), 0);
  const cash = client.cash;
  const totalValue = cash + holdingsValue;
  const weeklyPos = (client.lastWeekReturnDollar ?? 0) >= 0;
  const allTimePos = client.allTimeReturnDollar >= 0;

  return (
    <View style={styles.panel}>
      <View style={styles.header}>
        <Text style={styles.title}>{client.name}</Text>
        <Pressable onPress={editing ? () => setEditing(false) : onClose} hitSlop={10}>
          <Text style={styles.close}>{editing ? 'Done' : '✕'}</Text>
        </Pressable>
      </View>

      {editing ? (
        <PortfolioBuilder clientId={client.id} />
      ) : (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          {/* CLIENT PROFILE */}
          <View style={styles.detailTop}>
            <PixelCharacter seed={client.id} cell={6} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailName}>{client.name}</Text>
              <Text style={styles.detailMeta}>{client.age} · {client.occupation}</Text>
              <Text style={styles.detailRisk}>Risk preference: {riskPreferenceLabel(client.recommendedAllocation)}</Text>
              <Text style={styles.contract}>Contract: {client.contractWeeksRemaining} {client.contractWeeksRemaining === 1 ? 'week' : 'weeks'} remaining</Text>
            </View>
          </View>
          <Text style={styles.detailBg}>{client.background}</Text>

          {/* PORTFOLIO SUMMARY */}
          <View style={styles.portCard}>
            <Text style={styles.portValueLabel}>Portfolio value</Text>
            <Text style={styles.portValue}>{formatMoney(Math.round(totalValue))}</Text>
            <View style={styles.portGrid}>
              <View style={styles.portCell}>
                <Text style={styles.portCellLabel}>Cash</Text>
                <Text style={styles.portCellVal}>{formatMoney(Math.round(cash))}</Text>
              </View>
              <View style={styles.portCell}>
                <Text style={styles.portCellLabel}>Holdings</Text>
                <Text style={styles.portCellVal}>{formatMoney(Math.round(holdingsValue))}</Text>
              </View>
            </View>
            <View style={styles.portGrid}>
              <View style={styles.portCell}>
                <Text style={styles.portCellLabel}>Weekly P/L</Text>
                <Text style={[styles.portCellVal, { color: weeklyPos ? GREEN : RED }]}>
                  {hasHistory ? `${signedMoney(client.lastWeekReturnDollar ?? 0)} (${signedPct(client.lastWeekReturnPct ?? 0)})` : 'pending'}
                </Text>
              </View>
              <View style={styles.portCell}>
                <Text style={styles.portCellLabel}>Total P/L</Text>
                <Text style={[styles.portCellVal, { color: allTimePos ? GREEN : RED }]}>
                  {hasHistory ? `${signedMoney(client.allTimeReturnDollar)} (${signedPct(client.allTimeReturnPct)})` : '—'}
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.happyBox}>
            <HappinessMeter value={client.happiness} height={14} />
          </View>

          {/* HOLDINGS TABLE */}
          <Text style={styles.sectionLabel}>Holdings</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.cStock, styles.th]}>Stock</Text>
            <Text style={[styles.cNum, styles.th]}>Sh</Text>
            <Text style={[styles.cNum, styles.th]}>Avg</Text>
            <Text style={[styles.cNum, styles.th]}>Price</Text>
            <Text style={[styles.cNum, styles.th]}>Value</Text>
            <Text style={[styles.cNum, styles.th]}>G/L</Text>
          </View>
          {ownedStocks.length === 0 ? (
            <Text style={styles.empty}>No holdings yet — this account is all cash.</Text>
          ) : (
            ownedStocks.map((s) => {
              const h = client.holdings[s.id];
              const ac = avgCost(h);
              const cur = priceOf(s.id);
              const mv = h.shares * cur;
              const glPct = ac > 0 ? (cur - ac) / ac : 0;
              const glPos = glPct >= 0;
              return (
                <View key={s.id} style={styles.tableRow}>
                  <Text style={[styles.cStock, styles.td]} numberOfLines={1}>{s.ticker}</Text>
                  <Text style={[styles.cNum, styles.td]}>{h.shares}</Text>
                  <Text style={[styles.cNum, styles.td]}>{formatPrice(ac)}</Text>
                  <Text style={[styles.cNum, styles.td]}>{formatPrice(cur)}</Text>
                  <Text style={[styles.cNum, styles.td]}>{formatMoney(Math.round(mv))}</Text>
                  <Text style={[styles.cNum, styles.td, { color: glPos ? GREEN : RED }]}>{signedPct(glPct)}</Text>
                </View>
              );
            })
          )}

          <Button title="Manage Portfolio" onPress={() => setEditing(true)} style={{ marginTop: 16 }} />
          <Button title="Close" onPress={onClose} variant="secondary" style={{ marginTop: 10 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { height: '88%', backgroundColor: '#f5f5f5', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#cccccc', backgroundColor: '#ffffff' },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '900' },
  close: { color: BLUE, fontSize: 18, fontWeight: '800' },
  detailTop: { flexDirection: 'row', alignItems: 'center' },
  detailInfo: { flex: 1, marginLeft: 16 },
  detailName: { color: '#1a1a1a', fontSize: 22, fontWeight: '900' },
  detailMeta: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 2 },
  detailRisk: { color: BLUE, fontSize: 13, fontWeight: '800', marginTop: 4 },
  contract: { color: '#888888', fontSize: 12, fontWeight: '700', marginTop: 3 },
  detailBg: { color: '#666666', fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginTop: 14 },

  portCard: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 16, marginTop: 16 },
  portValueLabel: { color: '#888888', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.3 },
  portValue: { color: '#1a1a1a', fontSize: 26, fontWeight: '900', marginTop: 2 },
  portGrid: { flexDirection: 'row', marginTop: 12 },
  portCell: { flex: 1 },
  portCellLabel: { color: '#888888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  portCellVal: { color: '#1a1a1a', fontSize: 15, fontWeight: '800', marginTop: 2 },

  happyBox: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 16, marginTop: 16 },
  sectionLabel: { color: '#888888', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 18, marginBottom: 8 },
  tableHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#cccccc' },
  th: { color: '#888888', fontSize: 11, fontWeight: '800', textTransform: 'uppercase' },
  td: { color: '#1a1a1a', fontSize: 12, fontWeight: '600' },
  cStock: { flex: 1.1 },
  cNum: { flex: 1, textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  empty: { color: '#888888', fontSize: 14, paddingVertical: 8 },
});
