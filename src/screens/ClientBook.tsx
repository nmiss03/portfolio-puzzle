import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelClient from '../components/PixelClient';
import HappinessMeter from '../components/HappinessMeter';
import Stars from '../components/Stars';
import Button from '../components/Button';
import PortfolioBuilder from './day/PortfolioBuilder';
import STOCKS from '../data/stocks';
import { scorePortfolio } from '../data/scoring';
import { RuntimeClient } from '../data/gameState';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const BLUE = '#4a90e2';
const GREEN = '#22c55e';
const RED = '#ef4444';

// Live projected value/return/stars for a client from their current holdings.
function projection(client: RuntimeClient) {
  const r = scorePortfolio(client.holdings, client);
  return { value: client.initialCapital + r.gain, gain: r.gain, returnPct: r.returnPct, stars: r.stars };
}

export default function ClientBook() {
  const { state, clientList, toggleBook, openDetail, closeDetail } = useGame();
  if (!state.bookOpen) return null;

  const detailClient = state.detailClientId ? state.clients[state.detailClientId] : null;

  return (
    <View style={styles.backdrop}>
      {detailClient ? (
        <ClientDetail client={detailClient} onClose={closeDetail} />
      ) : (
        <View style={styles.panel}>
          <View style={styles.header}>
            <Text style={styles.title}>Client Book</Text>
            <Pressable onPress={() => toggleBook(false)} hitSlop={10}>
              <Text style={styles.close}>✕</Text>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.grid}>
            {clientList.map((c) => {
              const p = projection(c);
              const positive = p.gain >= 0;
              return (
                <Pressable key={c.id} style={styles.card} onPress={() => openDetail(c.id)}>
                  <View style={styles.cardTop}>
                    <PixelClient character={c.character} scale={0.5} />
                  </View>
                  <Text style={styles.cardName}>{c.name}</Text>
                  {c.fired && <Text style={styles.firedTag}>FIRED</Text>}
                  <Text style={styles.cardValue}>{formatMoney(Math.round(p.value))}</Text>
                  <Text style={[styles.cardReturn, { color: positive ? GREEN : RED }]}>
                    {positive ? '+' : '-'}
                    {formatMoney(Math.abs(Math.round(p.gain)))} ({positive ? '+' : ''}
                    {(p.returnPct * 100).toFixed(1)}%)
                  </Text>
                  <Stars count={c.lastStars ?? p.stars} size={16} style={styles.cardStars} />
                  <View style={{ width: '100%', marginTop: 8 }}>
                    <HappinessMeter value={c.happiness} height={8} showLabel={false} />
                    <Text style={styles.happyPct}>{Math.round(c.happiness)}% happy</Text>
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function ClientDetail({ client, onClose }: { client: RuntimeClient; onClose: () => void }) {
  const { availableBalance } = useGame();
  const [editing, setEditing] = useState(false);
  const p = projection(client);
  const positive = p.gain >= 0;

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
            <PixelClient character={client.character} scale={0.7} />
            <View style={styles.detailInfo}>
              <Text style={styles.detailName}>{client.name}</Text>
              <Text style={styles.detailMeta}>{client.age} · {client.occupation}</Text>
              <Text style={styles.detailValue}>{formatMoney(Math.round(p.value))}</Text>
              <Text style={[styles.detailReturn, { color: positive ? GREEN : RED }]}>
                {positive ? '+' : '-'}
                {formatMoney(Math.abs(Math.round(p.gain)))} ({positive ? '+' : ''}
                {(p.returnPct * 100).toFixed(1)}%)
              </Text>
              <Stars count={client.lastStars ?? p.stars} size={18} />
            </View>
          </View>

          <View style={styles.happyBox}>
            <HappinessMeter value={client.happiness} height={14} />
          </View>

          <Text style={styles.sectionLabel}>Holdings</Text>
          <View style={styles.tableHead}>
            <Text style={[styles.thName, styles.th]}>Stock</Text>
            <Text style={[styles.thNum, styles.th]}>Shares</Text>
            <Text style={[styles.thNum, styles.th]}>Cost</Text>
            <Text style={[styles.thNum, styles.th]}>Value</Text>
          </View>
          {ownedStocks.length === 0 ? (
            <Text style={styles.empty}>No holdings yet.</Text>
          ) : (
            ownedStocks.map((s) => {
              const sh = client.holdings[s.id] || 0;
              const v = sh * s.price;
              return (
                <View key={s.id} style={styles.tableRow}>
                  <Text style={[styles.thName, styles.td]} numberOfLines={1}>{s.ticker}</Text>
                  <Text style={[styles.thNum, styles.td]}>{sh}</Text>
                  <Text style={[styles.thNum, styles.td]}>{formatMoney(Math.round(v))}</Text>
                  <Text style={[styles.thNum, styles.td]}>{formatMoney(Math.round(v))}</Text>
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

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,24,30,0.45)', justifyContent: 'flex-end' },
  panel: { height: '88%', backgroundColor: '#f5f5f5', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#cccccc', backgroundColor: '#ffffff' },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '900' },
  close: { color: '#4a90e2', fontSize: 18, fontWeight: '800' },

  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', padding: 16 },
  card: { width: '48%', backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 8, padding: 12, marginBottom: 14, alignItems: 'center' },
  cardTop: { height: 60, justifyContent: 'center' },
  cardName: { color: BLUE, fontSize: 16, fontWeight: '900', marginTop: 8 },
  firedTag: { color: RED, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 2 },
  cardValue: { color: '#1a1a1a', fontSize: 16, fontWeight: '800', marginTop: 6 },
  cardReturn: { fontSize: 13, fontWeight: '800', marginTop: 2 },
  cardStars: { marginTop: 6 },
  happyPct: { color: '#888888', fontSize: 11, fontWeight: '700', textAlign: 'center', marginTop: 4 },

  detailTop: { flexDirection: 'row', alignItems: 'center' },
  detailInfo: { flex: 1, marginLeft: 16 },
  detailName: { color: '#1a1a1a', fontSize: 22, fontWeight: '900' },
  detailMeta: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 2 },
  detailValue: { color: '#1a1a1a', fontSize: 20, fontWeight: '900', marginTop: 8 },
  detailReturn: { fontSize: 15, fontWeight: '800', marginTop: 2 },
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
