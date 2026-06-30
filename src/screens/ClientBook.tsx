import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter from '../components/PixelCharacter';
import Sparkline from '../components/Sparkline';
import Button from '../components/Button';
import AcceptClientModal from '../components/AcceptClientModal';
import ClientDetail from './ClientDetail';
import { MAX_ACTIVE_CLIENTS, RuntimeClient } from '../data/gameState';
import { tierOf } from '../data/clientTiers';
import { useGame } from '../state/GameContext';
import { formatMoney } from '../utils/format';

function TierBadge({ tier }: { tier: number }) {
  return <Text style={styles.tierBadge}>Tier {tier} · {tierOf(tier).label}</Text>;
}

const BLUE = '#4a90e2';
const GREEN = '#22c55e';
const RED = '#ef4444';
const GRAY = '#666666';

function returnText(dollar: number, pct: number) {
  const p = dollar >= 0;
  return `${p ? '+' : '-'}${formatMoney(Math.abs(Math.round(dollar)))} (${p ? '+' : ''}${(pct * 100).toFixed(1)}%)`;
}

export default function ClientBook() {
  const { state, activeClients, availableClients, expiredClients, firedClients, canSign, signClient, renewClient, dismissExpired, openDetail, closeDetail, toggleBook } = useGame();
  const [pendingSign, setPendingSign] = useState<RuntimeClient | null>(null);

  if (!state.bookOpen) return null;
  const detailClient = state.detailClientId ? state.clients[state.detailClientId] : null;

  if (detailClient) {
    return (
      <View style={styles.backdrop}>
        <ClientDetail client={detailClient} onClose={closeDetail} />
      </View>
    );
  }

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>Client Book</Text>
          <Pressable onPress={() => toggleBook(false)} hitSlop={10}>
            <Text style={styles.close}>✕</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.list}>
          <Text style={styles.section}>Current Clients ({activeClients.length}/{MAX_ACTIVE_CLIENTS})</Text>
          {activeClients.length === 0 && <Text style={styles.emptyNote}>No active clients. Sign one below.</Text>}
          {activeClients.map((c) => (
            <ActiveCard key={c.id} client={c} onPress={() => openDetail(c.id)} />
          ))}

          {availableClients.length > 0 && (
            <>
              <Text style={styles.section}>Available Clients · {availableClients.length}</Text>
              {availableClients.map((c) => (
                <AvailableCard key={c.id} client={c} canSign={canSign} onAccept={() => setPendingSign(c)} />
              ))}
            </>
          )}

          {expiredClients.length > 0 && (
            <>
              <Text style={[styles.section, { color: '#888888' }]}>Past Clients</Text>
              {expiredClients.map((c) => (
                <ExpiredCard key={c.id} client={c} canSign={canSign} onRenew={() => renewClient(c.id)} onDismiss={() => dismissExpired(c.id)} />
              ))}
            </>
          )}

          {firedClients.length > 0 && (
            <>
              <Text style={[styles.section, { color: RED }]}>Terminated Relationships</Text>
              {firedClients.map((c) => (
                <View key={c.id} style={[styles.card, { opacity: 0.4 }]}>
                  <View style={styles.cardRow}>
                    <PixelCharacter seed={c.id} cell={5} />
                    <View style={styles.midCol}>
                      <Text style={styles.name}>{c.name}</Text>
                      <Text style={styles.firedNote}>Fired for low satisfaction</Text>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </View>

      {pendingSign && (
        <AcceptClientModal
          client={pendingSign}
          onAccept={() => { signClient(pendingSign.id); setPendingSign(null); }}
          onCancel={() => setPendingSign(null)}
        />
      )}
    </View>
  );
}

function ActiveCard({ client, onPress }: { client: RuntimeClient; onPress: () => void }) {
  const hasHistory = client.performanceHistory.length > 0;
  const positive = (client.lastWeekReturnDollar ?? 0) >= 0;
  const spark = client.performanceHistory.map((h) => h.returnPct);
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { borderColor: BLUE }]} onPress={onPress}>
      <Text style={styles.contract}>Contract: {client.contractWeeksRemaining} {client.contractWeeksRemaining === 1 ? 'week' : 'weeks'} left</Text>
      <View style={styles.cardRow}>
        <View style={styles.charCol}><PixelCharacter seed={client.id} cell={7} /></View>
        <View style={styles.midCol}>
          <Text style={styles.name}>{client.name} <Text style={styles.age}>· {client.age}</Text></Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <TierBadge tier={client.tier} />
          <Text style={styles.background} numberOfLines={2}>{client.background}</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.statLabel}>Week-over-week</Text>
          <Text style={[styles.wow, { color: positive ? GREEN : RED }]}>{hasHistory ? returnText(client.lastWeekReturnDollar ?? 0, client.lastWeekReturnPct ?? 0) : 'pending'}</Text>
          <Text style={[styles.statLabel, { marginTop: 4 }]}>All-time</Text>
          <Text style={styles.allTime}>{hasHistory ? returnText(client.allTimeReturnDollar, client.allTimeReturnPct) : '—'}</Text>
          {hasHistory && <View style={{ marginTop: 4 }}><Sparkline data={spark} color={client.allTimeReturnDollar >= 0 ? GREEN : RED} /></View>}
        </View>
      </View>
      <View style={styles.happyBar}><View style={{ width: `${client.happiness}%`, height: '100%', backgroundColor: BLUE }} /></View>
    </Pressable>
  );
}

function AvailableCard({ client, canSign, onAccept }: { client: RuntimeClient; canSign: boolean; onAccept: () => void }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.charCol}><PixelCharacter seed={client.id} cell={7} /></View>
        <View style={styles.midCol}>
          <Text style={styles.name}>{client.name} <Text style={styles.age}>· {client.age}</Text></Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <TierBadge tier={client.tier} />
          <Text style={styles.background} numberOfLines={2}>{client.background}</Text>
        </View>
      </View>
      {canSign ? (
        <Button title="Accept 8-Week Contract" onPress={onAccept} style={{ marginTop: 10 }} />
      ) : (
        <Text style={styles.capNote}>You have {MAX_ACTIVE_CLIENTS} clients — finish a contract to take on more.</Text>
      )}
    </View>
  );
}

function ExpiredCard({ client, canSign, onRenew, onDismiss }: { client: RuntimeClient; canSign: boolean; onRenew: () => void; onDismiss: () => void }) {
  const positive = client.allTimeReturnDollar >= 0;
  return (
    <View style={[styles.card, { opacity: 0.6 }]}>
      <View style={styles.cardRow}>
        <View style={styles.charCol}><PixelCharacter seed={client.id} cell={7} /></View>
        <View style={styles.midCol}>
          <Text style={styles.name}>{client.name} <Text style={styles.age}>· {client.age}</Text></Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <Text style={[styles.allTime, { color: positive ? GREEN : RED, textAlign: 'left', marginTop: 4 }]}>All-time {returnText(client.allTimeReturnDollar, client.allTimeReturnPct)}</Text>
        </View>
      </View>
      <View style={styles.expiredBtns}>
        <Button title="Renew Contract" onPress={onRenew} disabled={!canSign} style={styles.expiredBtn} />
        <Button title="Dismiss" variant="secondary" onPress={onDismiss} style={styles.expiredBtn} />
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
  list: { padding: 12 },
  section: { color: '#1a1a1a', fontSize: 16, fontWeight: '900', marginTop: 10, marginBottom: 4 },
  emptyNote: { color: '#888888', fontSize: 13, marginBottom: 6 },
  card: { backgroundColor: '#ffffff', borderWidth: 1, borderColor: '#cccccc', borderRadius: 6, padding: 12, marginVertical: 8, overflow: 'hidden' },
  contract: { color: BLUE, fontSize: 12, fontWeight: '800', textAlign: 'right', marginBottom: 4 },
  cardRow: { flexDirection: 'row' },
  charCol: { width: 100, alignItems: 'flex-start', justifyContent: 'center' },
  midCol: { flex: 1, paddingHorizontal: 8 },
  name: { color: '#1a1a1a', fontSize: 16, fontWeight: '800' },
  age: { color: '#888888', fontSize: 13, fontWeight: '600' },
  occupation: { color: '#888888', fontSize: 12, marginTop: 1 },
  tierBadge: { color: '#888888', fontSize: 11, fontWeight: '800', marginTop: 3 },
  background: { color: '#666666', fontSize: 13, fontStyle: 'italic', lineHeight: 18, marginTop: 4 },
  firedNote: { color: RED, fontSize: 12, fontWeight: '700', marginTop: 4 },
  rightCol: { width: 140, alignItems: 'flex-end' },
  statLabel: { color: '#888888', fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  wow: { fontSize: 14, fontWeight: '800', marginTop: 1, textAlign: 'right' },
  allTime: { color: GRAY, fontSize: 12, fontWeight: '700', marginTop: 1, textAlign: 'right' },
  happyBar: { height: 3, backgroundColor: '#e5e7eb', borderRadius: 2, marginTop: 10, overflow: 'hidden' },
  capNote: { color: '#888888', fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  expiredBtns: { flexDirection: 'row', marginTop: 10 },
  expiredBtn: { flex: 1, marginHorizontal: 4 },
});
