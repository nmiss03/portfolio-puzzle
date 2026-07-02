import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter from '../components/PixelCharacter';
import Sparkline from '../components/Sparkline';
import Button from '../components/Button';
import AcceptClientModal from '../components/AcceptClientModal';
import ClientDetail from './ClientDetail';
import { RuntimeClient, riskPreferenceLabel } from '../data/gameState';
import { useGame } from '../state/GameContext';
import { feeLabel } from '../data/advisorEconomy';
import { formatMoney } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

function returnText(dollar: number, pct: number) {
  const p = dollar >= 0;
  return `${p ? '+' : '-'}${formatMoney(Math.abs(Math.round(dollar)))} (${p ? '+' : ''}${(pct * 100).toFixed(1)}%)`;
}

export default function ClientBook() {
  const { state, activeClients, availableClients, expiredClients, firedClients, canSign, maxClients, signClient, renewClient, dismissExpired, openDetail, closeDetail, toggleBook } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
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
          <Text style={styles.section}>Current Clients ({activeClients.length}/{maxClients})</Text>
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
              <Text style={[styles.section, { color: c.muted }]}>Past Clients</Text>
              {expiredClients.map((c) => (
                <ExpiredCard key={c.id} client={c} canSign={canSign} onRenew={() => renewClient(c.id)} onDismiss={() => dismissExpired(c.id)} />
              ))}
            </>
          )}

          {firedClients.length > 0 && (
            <>
              <Text style={[styles.section, { color: c.danger }]}>Terminated Relationships</Text>
              {firedClients.map((fc) => (
                <View key={fc.id} style={[styles.card, { opacity: 0.4 }]}>
                  <View style={styles.cardRow}>
                    <PixelCharacter seed={fc.id} cell={5} />
                    <View style={styles.midCol}>
                      <Text style={styles.name}>{fc.name}</Text>
                      <Text style={styles.firedNote}>
                        {fc.returnsAtWeek ? `Fired you — may reconsider around week ${fc.returnsAtWeek}` : 'Fired for low satisfaction'}
                      </Text>
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
  const { priceOf } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
  const hasHistory = client.performanceHistory.length > 0;
  const positive = (client.lastWeekReturnDollar ?? 0) >= 0;
  const spark = client.performanceHistory.map((h) => h.returnPct);
  const holdingsValue = Object.entries(client.holdings).reduce((s, [id, h]) => s + h.shares * priceOf(id), 0);
  const portfolioValue = client.cash + holdingsValue;
  return (
    <Pressable style={({ pressed }) => [styles.card, pressed && { borderColor: c.gold }]} onPress={onPress}>
      <Text style={styles.contract}>Contract: {client.contractWeeksRemaining} {client.contractWeeksRemaining === 1 ? 'week' : 'weeks'} left</Text>
      <View style={styles.cardRow}>
        <View style={styles.charCol}><PixelCharacter seed={client.id} cell={7} /></View>
        <View style={styles.midCol}>
          <Text style={styles.name}>{client.name} <Text style={styles.age}>· {client.age}</Text></Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <Text style={styles.portLine}>Portfolio {formatMoney(Math.round(portfolioValue))} · Cash {formatMoney(Math.round(client.cash))}</Text>
          <Text style={styles.background} numberOfLines={2}>{client.background}</Text>
        </View>
        <View style={styles.rightCol}>
          <Text style={styles.statLabel}>Week-over-week</Text>
          <Text style={[styles.wow, { color: positive ? c.success : c.danger }]}>{hasHistory ? returnText(client.lastWeekReturnDollar ?? 0, client.lastWeekReturnPct ?? 0) : 'pending'}</Text>
          <Text style={[styles.statLabel, { marginTop: 4 }]}>All-time</Text>
          <Text style={styles.allTime}>{hasHistory ? returnText(client.allTimeReturnDollar, client.allTimeReturnPct) : '—'}</Text>
          {hasHistory && <View style={{ marginTop: 4 }}><Sparkline data={spark} color={client.allTimeReturnDollar >= 0 ? c.success : c.danger} /></View>}
        </View>
      </View>
      <View style={styles.happyBar}><View style={{ width: `${client.happiness}%`, height: '100%', backgroundColor: c.gold }} /></View>
    </Pressable>
  );
}

function AvailableCard({ client, canSign, onAccept }: { client: RuntimeClient; canSign: boolean; onAccept: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <View style={styles.charCol}><PixelCharacter seed={client.id} cell={7} /></View>
        <View style={styles.midCol}>
          <Text style={styles.name}>{client.name} <Text style={styles.age}>· {client.age}</Text></Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <Text style={styles.riskLine}>{riskPreferenceLabel(client.recommendedAllocation)} · {formatMoney(client.initialCapital)} to invest</Text>
          <Text style={styles.feeLine}>Your fee: {feeLabel(client)}</Text>
          <Text style={styles.background} numberOfLines={2}>{client.background}</Text>
        </View>
      </View>
      {canSign ? (
        <Button title="Accept 8-Week Contract" onPress={onAccept} style={{ marginTop: 10 }} />
      ) : (
        <Text style={styles.capNote}>Your client roster is full — finish a contract (or hire an assistant) to take on more.</Text>
      )}
    </View>
  );
}

function ExpiredCard({ client, canSign, onRenew, onDismiss }: { client: RuntimeClient; canSign: boolean; onRenew: () => void; onDismiss: () => void }) {
  const styles = useStyles();
  const { c } = useTheme();
  const positive = client.allTimeReturnDollar >= 0;
  return (
    <View style={[styles.card, { opacity: 0.6 }]}>
      <View style={styles.cardRow}>
        <View style={styles.charCol}><PixelCharacter seed={client.id} cell={7} /></View>
        <View style={styles.midCol}>
          <Text style={styles.name}>{client.name} <Text style={styles.age}>· {client.age}</Text></Text>
          <Text style={styles.occupation}>{client.occupation}</Text>
          <Text style={[styles.allTime, { color: positive ? c.success : c.danger, textAlign: 'left', marginTop: 4 }]}>All-time {returnText(client.allTimeReturnDollar, client.allTimeReturnPct)}</Text>
        </View>
      </View>
      <View style={styles.expiredBtns}>
        <Button title="Renew Contract" onPress={onRenew} disabled={!canSign} style={styles.expiredBtn} />
        <Button title="Dismiss" variant="secondary" onPress={onDismiss} style={styles.expiredBtn} />
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
  list: { padding: 12 },
  section: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 14, fontWeight: '900', marginTop: 12, marginBottom: 4, letterSpacing: 0.5, textTransform: 'uppercase' },
  emptyNote: { color: c.textDim, fontSize: 13, marginBottom: 6 },
  card: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 12, marginVertical: 8, overflow: 'hidden' },
  contract: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '800', textAlign: 'right', marginBottom: 4 },
  cardRow: { flexDirection: 'row' },
  charCol: { width: 100, alignItems: 'flex-start', justifyContent: 'center' },
  midCol: { flex: 1, paddingHorizontal: 8 },
  name: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 15, fontWeight: '800' },
  age: { color: c.muted, fontSize: 13, fontWeight: '600' },
  occupation: { color: c.muted, fontSize: 12, marginTop: 1 },
  portLine: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 12, fontWeight: '800', marginTop: 3 },
  riskLine: { color: c.textDim, fontSize: 12, fontWeight: '700', marginTop: 3 },
  background: { color: c.textDim, fontSize: 13, fontStyle: 'italic', lineHeight: 18, marginTop: 4 },
  firedNote: { color: c.danger, fontSize: 12, fontWeight: '700', marginTop: 4 },
  rightCol: { width: 140, alignItems: 'flex-end' },
  statLabel: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 9, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.3 },
  wow: { fontFamily: FONT_PIXEL, fontSize: 13, fontWeight: '800', marginTop: 1, textAlign: 'right' },
  allTime: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 12, fontWeight: '700', marginTop: 1, textAlign: 'right' },
  happyBar: { height: 6, backgroundColor: c.panelDark, borderWidth: 2, borderColor: c.border, marginTop: 10, overflow: 'hidden' },
  capNote: { color: c.muted, fontSize: 12, fontStyle: 'italic', marginTop: 8 },
  feeLine: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '800', marginTop: 3 },
  expiredBtns: { flexDirection: 'row', marginTop: 10 },
  expiredBtn: { flex: 1, marginHorizontal: 4 },
  })
);
