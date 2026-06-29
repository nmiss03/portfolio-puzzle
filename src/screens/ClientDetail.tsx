import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import CharacterVisual from '../components/CharacterVisual';
import HappinessMeter from '../components/HappinessMeter';
import Button from '../components/Button';
import PortfolioBuilder from './day/PortfolioBuilder';
import STOCKS from '../data/stocks';
import { RISK_LABEL, RuntimeClient } from '../data/gameState';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const GREEN = '#22c55e';
const RED = '#ef4444';

function returnText(dollar: number, pct: number) {
  const positive = dollar >= 0;
  return `${positive ? '+' : '-'}${formatMoney(Math.abs(Math.round(dollar)))} (${positive ? '+' : ''}${(pct * 100).toFixed(1)}%)`;
}

export default function ClientDetail({ client, onClose }: { client: RuntimeClient; onClose: () => void }) {
  const { availableBalance } = useGame();
  const [editing, setEditing] = useState(false);
  const hasHistory = client.performanceHistory.length > 0;
  const positive = (client.lastWeekReturnDollar ?? 0) >= 0;
  const ownedStocks = STOCKS.filter((s) => (client.holdings[s.id] || 0) > 0);

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
          <View style={styles.detailTop}>
            <CharacterVisual color={client.characterColor} width={56} height={76} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailName}>{client.name}</Text>
              <Text style={styles.detailMeta}>{client.age} · {client.occupation}</Text>
              <Text style={styles.detailRisk}>{RISK_LABEL[client.riskPreference]} · {client.recommendedAllocation}</Text>
            </View>
          </View>
          <Text style={styles.detailBg}>{client.background}</Text>

          <View style={styles.returnsRow}>
            <View style={styles.returnsBox}>
              <Text style={styles.statLabel}>Week-over-week</Text>
              <Text style={[styles.wow, { color: positive ? GREEN : RED }]}>
                {hasHistory ? returnText(client.lastWeekReturnDollar ?? 0, client.lastWeekReturnPct ?? 0) : 'pending'}
              </Text>
            </View>
            <View style={styles.returnsBox}>
              <Text style={styles.statLabel}>All-time</Text>
              <Text style={styles.allTime}>
                {hasHistory ? returnText(client.allTimeReturnDollar, client.allTimeReturnPct) : '—'}
              </Text>
            </View>
          </View>

          <View style={styles.happyBox}>
            <HappinessMeter value={client.happiness} height={14} />
          </View>

          <Text style={styles.sectionLabel}>Holdings (cost basis)</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.thName, styles.th]}>Stock</Text>
            <Text style={[styles.thNum, styles.th]}>Shares</Text>
            <Text style={[styles.thNum, styles.th]}>Cost</Text>
          </View>
          {ownedStocks.length === 0 ? (
            <Text style={styles.empty}>No holdings yet.</Text>
          ) : (
            ownedStocks.map((s) => {
              const sh = client.holdings[s.id] || 0;
              return (
                <View key={s.id} style={styles.tableRow}>
                  <Text style={[styles.thName, styles.td]} numberOfLines={1}>{s.ticker}</Text>
                  <Text style={[styles.thNum, styles.td]}>{sh}</Text>
                  <Text style={[styles.thNum, styles.td]}>{formatMoney(Math.round(sh * s.price))}</Text>
                </View>
              );
            })
          )}
          <Text style={styles.cashNote}>Cash available: {formatMoney(Math.round(availableBalance(client)))}</Text>

          <Button title="Edit Portfolio" onPress={() => setEditing(true)} style={{ marginTop: 16 }} />
          <Button title="Close" onPress={onClose} variant="secondary" style={{ marginTop: 10 }} />
        </ScrollView>
      )}
    </View>
  );
}

const BLUE = '#4a90e2';

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
  detailBg: { color: '#666666', fontSize: 14, fontStyle: 'italic', lineHeight: 20, marginTop: 14 },
  returnsRow: { flexDirection: 'row', marginTop: 16 },
  returnsBox: { flex: 1 },
  statLabel: { color: '#888888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  wow: { fontSize: 15, fontWeight: '800', marginTop: 2 },
  allTime: { color: '#666666', fontSize: 14, fontWeight: '700', marginTop: 2 },
  happyBox: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 16, marginTop: 16 },
  sectionLabel: { color: '#888888', fontSize: 13, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5, marginTop: 18, marginBottom: 8 },
  tableHead: { flexDirection: 'row', paddingBottom: 6, borderBottomWidth: 1, borderBottomColor: '#cccccc' },
  th: { color: '#888888', fontSize: 12, fontWeight: '800', textTransform: 'uppercase' },
  td: { color: '#1a1a1a', fontSize: 14 },
  thName: { flex: 1.4 },
  thNum: { flex: 1, textAlign: 'right' },
  tableRow: { flexDirection: 'row', paddingVertical: 6 },
  empty: { color: '#888888', fontSize: 14, paddingVertical: 8 },
  cashNote: { color: '#4a4a4a', fontSize: 13, fontWeight: '700', marginTop: 12 },
});
