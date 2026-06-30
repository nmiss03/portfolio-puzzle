import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter from '../components/PixelCharacter';
import Sparkline from '../components/Sparkline';
import ClientDetail from './ClientDetail';
import { RuntimeClient } from '../data/gameState';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

const BLUE = '#4a90e2';
const GREEN = '#22c55e';
const RED = '#ef4444';
const GRAY = '#666666';

function returnText(dollar: number, pct: number) {
  const positive = dollar >= 0;
  return `${positive ? '+' : '-'}${formatMoney(Math.abs(Math.round(dollar)))} (${positive ? '+' : ''}${(pct * 100).toFixed(1)}%)`;
}

export default function ClientBook() {
  const { state, unlockedClients, teaserClient, toggleBook, openDetail, closeDetail } = useGame();
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
          <ScrollView contentContainerStyle={styles.list}>
            {unlockedClients.map((c) => (
              <ClientCard key={c.id} client={c} onPress={() => openDetail(c.id)} />
            ))}
            {teaserClient && <TeaserCard client={teaserClient} />}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

function ClientCard({ client, onPress }: { client: RuntimeClient; onPress: () => void }) {
  const hasHistory = client.performanceHistory.length > 0;
  const positive = (client.lastWeekReturnDollar ?? 0) >= 0;
  const sparkData = client.performanceHistory.map((h) => h.returnPct);
  const allTimePositive = client.allTimeReturnDollar >= 0;

  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && styles.cardPressed]} onPress={onPress}>
      <View style={styles.cardRow}>
        <View style={styles.charCol}>
          <PixelCharacter seed={client.id} cell={7} />
        </View>

        <View style={styles.midCol}>
          <Text style={styles.name}>
            {client.name} <Text style={styles.age}>· {client.age}</Text>
            {client.fired && <Text style={styles.fired}>  FIRED</Text>}
          </Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <Text style={styles.background} numberOfLines={2}>{client.background}</Text>
        </View>

        <View style={styles.rightCol}>
          <Text style={styles.statLabel}>Week-over-week</Text>
          {hasHistory ? (
            <Text style={[styles.wow, { color: positive ? GREEN : RED }]}>
              {returnText(client.lastWeekReturnDollar ?? 0, client.lastWeekReturnPct ?? 0)}
            </Text>
          ) : (
            <Text style={styles.pending}>pending</Text>
          )}
          <Text style={[styles.statLabel, { marginTop: 4 }]}>All-time</Text>
          {hasHistory ? (
            <Text style={styles.allTime}>{returnText(client.allTimeReturnDollar, client.allTimeReturnPct)}</Text>
          ) : (
            <Text style={styles.pending}>—</Text>
          )}
          {hasHistory && (
            <View style={{ marginTop: 4 }}>
              <Sparkline data={sparkData} color={allTimePositive ? GREEN : RED} width={60} height={20} />
            </View>
          )}
        </View>
      </View>

      <View style={styles.happyBar}>
        <View style={{ width: `${client.happiness}%`, height: '100%', backgroundColor: BLUE }} />
      </View>
    </Pressable>
  );
}

function TeaserCard({ client }: { client: RuntimeClient }) {
  return (
    <View style={[styles.card, styles.teaser]}>
      <View style={styles.cardRow}>
        <View style={styles.charCol}>
          <PixelCharacter seed={client.id} cell={7} />
        </View>
        <View style={styles.midCol}>
          <Text style={styles.name}>
            {client.name} <Text style={styles.age}>· {client.age}</Text>
          </Text>
          <Text style={styles.unlockText}>Unlock next week →</Text>
        </View>
        <View style={styles.rightCol} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,24,30,0.45)', justifyContent: 'flex-end' },
  panel: { height: '88%', backgroundColor: '#f5f5f5', borderTopLeftRadius: 16, borderTopRightRadius: 16, overflow: 'hidden' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#cccccc', backgroundColor: '#ffffff' },
  title: { color: '#1a1a1a', fontSize: 20, fontWeight: '900' },
  close: { color: BLUE, fontSize: 18, fontWeight: '800' },

  list: { padding: 12 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 6, padding: 12, marginVertical: 8, overflow: 'hidden' },
  cardPressed: { borderColor: BLUE },
  teaser: { opacity: 0.5 },
  cardRow: { flexDirection: 'row' },
  charCol: { width: 100, alignItems: 'flex-start', justifyContent: 'center' },
  midCol: { flex: 1, paddingHorizontal: 8 },
  name: { color: '#1a1a1a', fontSize: 16, fontWeight: '800' },
  age: { color: '#888888', fontSize: 13, fontWeight: '600' },
  fired: { color: RED, fontSize: 11, fontWeight: '900' },
  occupation: { color: '#888888', fontSize: 12, marginTop: 1 },
  background: { color: '#666666', fontSize: 13, fontStyle: 'italic', lineHeight: 18, marginTop: 4 },
  risk: { color: '#888888', fontSize: 12, fontWeight: '700', marginTop: 4 },
  unlockText: { color: '#666666', fontSize: 14, fontWeight: '700', marginTop: 8 },

  rightCol: { width: 140, alignItems: 'flex-end' },
  statLabel: { color: '#888888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  wow: { fontSize: 14, fontWeight: '800', marginTop: 1, textAlign: 'right' },
  allTime: { color: GRAY, fontSize: 12, fontWeight: '700', marginTop: 1, textAlign: 'right' },
  pending: { color: '#bbbbbb', fontSize: 13, fontWeight: '700', marginTop: 1 },
  happyBar: { height: 3, backgroundColor: '#e5e7eb', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
});
