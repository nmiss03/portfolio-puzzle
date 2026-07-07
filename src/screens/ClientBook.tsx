// The Client Book application: the heart of the firm. A dense, scannable
// roster — portrait, mood, relationship, weeks left, portfolio value — with
// the full client dossier (profile + portfolio + holdings + editor) one tap
// deep in ClientDetail.

import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter, { moodFor } from '../components/PixelCharacter';
import Button from '../components/Button';
import AcceptClientModal from '../components/AcceptClientModal';
import PixelWindow from '../components/PixelWindow';
import ClientDetail from './ClientDetail';
import { RuntimeClient, relationshipStage, riskPreferenceLabel } from '../data/gameState';
import { useGame } from '../state/GameContext';
import { feeLabel } from '../data/advisorEconomy';
import { formatMoney } from '../utils/format';
import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

const STAGE_LABEL = ['NEW', 'FRIENDLY', 'TRUSTED', 'CLOSE'];

export default function ClientBook() {
  const { state, activeClients, availableClients, expiredClients, firedClients, canSign, maxClients, signClient, renewClient, dismissExpired, openDetail, closeDetail, toggleBook } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
  const [pendingSign, setPendingSign] = useState<RuntimeClient | null>(null);

  if (!state.bookOpen) return null;
  const detailClient = state.detailClientId ? state.clients[state.detailClientId] : null;

  if (detailClient) {
    return (
      <PixelWindow title={detailClient.name} icon="👤" onClose={closeDetail} maxWidth={1100}>
        <ClientDetail client={detailClient} onClose={closeDetail} />
      </PixelWindow>
    );
  }

  return (
    <>
      <PixelWindow title="Client Book" icon="📖" onClose={() => toggleBook(false)} maxWidth={1100}>
        <ScrollView contentContainerStyle={styles.list}>
          <Text style={styles.section}>ACTIVE CONTRACTS · {activeClients.length}/{maxClients}</Text>
          {activeClients.length === 0 && <Text style={styles.emptyNote}>No active clients. Sign one below.</Text>}
          {activeClients.map((cl) => (
            <ActiveRow key={cl.id} client={cl} onPress={() => openDetail(cl.id)} />
          ))}

          {availableClients.length > 0 && (
            <>
              <Text style={styles.section}>WAITING ROOM · {availableClients.length}</Text>
              {availableClients.map((cl) => (
                <AvailableCard key={cl.id} client={cl} canSign={canSign} onAccept={() => setPendingSign(cl)} />
              ))}
            </>
          )}

          {expiredClients.length > 0 && (
            <>
              <Text style={[styles.section, { color: c.muted }]}>CONTRACTS ENDED</Text>
              {expiredClients.map((cl) => (
                <ExpiredCard key={cl.id} client={cl} canSign={canSign} onRenew={() => renewClient(cl.id)} onDismiss={() => dismissExpired(cl.id)} />
              ))}
            </>
          )}

          {firedClients.length > 0 && (
            <>
              <Text style={[styles.section, { color: c.danger }]}>WALKED OUT</Text>
              {firedClients.map((fc) => (
                <View key={fc.id} style={[styles.row, { opacity: 0.45 }]}>
                  <PixelCharacter seed={fc.id} cell={4} mood="sad" />
                  <View style={styles.rowMid}>
                    <Text style={styles.rowName}>{fc.name}</Text>
                    <Text style={styles.firedNote}>
                      {fc.returnsAtWeek ? `Fired you — may reconsider ~week ${fc.returnsAtWeek}` : 'Fired you'}
                    </Text>
                  </View>
                </View>
              ))}
            </>
          )}
        </ScrollView>
      </PixelWindow>

      {pendingSign && (
        <AcceptClientModal
          client={pendingSign}
          onAccept={() => { signClient(pendingSign.id); setPendingSign(null); }}
          onCancel={() => setPendingSign(null)}
        />
      )}
    </>
  );
}

// One compact roster line: portrait · name/relationship · weeks left · value.
function ActiveRow({ client, onPress }: { client: RuntimeClient; onPress: () => void }) {
  const { priceOf } = useGame();
  const styles = useStyles();
  const { c } = useTheme();
  const holdingsValue = Object.entries(client.holdings).reduce((s, [id, h]) => s + h.shares * priceOf(id), 0);
  const portfolioValue = client.cash + holdingsValue;
  const positive = (client.lastWeekReturnDollar ?? 0) >= 0;
  const hasHistory = client.performanceHistory.length > 0;
  const stage = STAGE_LABEL[relationshipStage(client.relationship)];
  return (
    <Pressable style={(st: any) => [styles.row, st.hovered && styles.rowHovered, st.pressed && styles.rowPressed]} onPress={onPress}>
      <PixelCharacter seed={client.id} cell={5} mood={moodFor(client.happiness)} />
      <View style={styles.rowMid}>
        <Text style={styles.rowName} numberOfLines={1}>
          {client.name} <Text style={styles.stageTag}>· {stage}</Text>
        </Text>
        <Text style={styles.rowSub} numberOfLines={1}>{client.occupation}</Text>
        <View style={styles.happyTrack}>
          <View style={{ width: `${client.happiness}%`, height: '100%', backgroundColor: client.happiness >= 60 ? c.success : client.happiness >= 30 ? c.gold : c.danger }} />
        </View>
      </View>
      <View style={styles.rowRight}>
        <Text style={styles.rowValue}>{formatMoney(Math.round(portfolioValue))}</Text>
        <Text style={[styles.rowDelta, { color: hasHistory ? (positive ? c.success : c.danger) : c.muted }]}>
          {hasHistory ? `${positive ? '+' : ''}${((client.lastWeekReturnPct ?? 0) * 100).toFixed(1)}% wk` : 'new'}
        </Text>
        <Text style={styles.rowWeeks}>{client.contractWeeksRemaining}wk left</Text>
      </View>
      <Text style={styles.chev}>›</Text>
    </Pressable>
  );
}

function AvailableCard({ client, canSign, onAccept }: { client: RuntimeClient; canSign: boolean; onAccept: () => void }) {
  const styles = useStyles();
  return (
    <View style={styles.card}>
      <View style={styles.cardRow}>
        <PixelCharacter seed={client.id} cell={6} />
        <View style={styles.rowMid}>
          <Text style={styles.rowName}>{client.name} <Text style={styles.stageTag}>· {client.age} · T{client.tier}</Text></Text>
          <Text style={styles.rowSub}>{client.occupation}</Text>
          <Text style={styles.riskLine}>{riskPreferenceLabel(client.recommendedAllocation)} · {formatMoney(client.initialCapital)}</Text>
          <Text style={styles.feeLine}>Your fee: {feeLabel(client)}</Text>
          <Text style={styles.background} numberOfLines={2}>{client.background}</Text>
        </View>
      </View>
      {canSign ? (
        <Button title="Accept 8-Week Contract" onPress={onAccept} style={{ marginTop: 8 }} />
      ) : (
        <Text style={styles.capNote}>Roster full — finish a contract (or hire an assistant) to take on more.</Text>
      )}
    </View>
  );
}

function ExpiredCard({ client, canSign, onRenew, onDismiss }: { client: RuntimeClient; canSign: boolean; onRenew: () => void; onDismiss: () => void }) {
  const styles = useStyles();
  const { c } = useTheme();
  const positive = client.allTimeReturnDollar >= 0;
  return (
    <View style={[styles.card, { opacity: 0.75 }]}>
      <View style={styles.cardRow}>
        <PixelCharacter seed={client.id} cell={5} />
        <View style={styles.rowMid}>
          <Text style={styles.rowName}>{client.name}</Text>
          <Text style={[styles.rowSub, { color: positive ? c.success : c.danger }]}>
            All-time {positive ? '+' : '-'}{formatMoney(Math.abs(Math.round(client.allTimeReturnDollar)))} ({positive ? '+' : ''}{(client.allTimeReturnPct * 100).toFixed(1)}%)
          </Text>
        </View>
      </View>
      <View style={styles.expiredBtns}>
        <Button title="Renew" onPress={onRenew} disabled={!canSign} style={styles.expiredBtn} />
        <Button title="Dismiss" variant="secondary" onPress={onDismiss} style={styles.expiredBtn} />
      </View>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
  list: { padding: 10 },
  section: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 11, fontWeight: '900', marginTop: 10, marginBottom: 6, letterSpacing: 1 },
  emptyNote: { color: c.textDim, fontSize: 12, marginBottom: 6 },

  // Compact roster rows
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.panel, borderWidth: 2, borderColor: c.border, padding: 8, marginBottom: 6 },
  rowHovered: { borderColor: c.goldDim },
  rowPressed: { borderColor: c.gold, transform: [{ translateY: 1 }] },
  rowMid: { flex: 1, marginLeft: 10 },
  rowName: { fontFamily: FONT_PIXEL, color: c.text, fontSize: 13, fontWeight: '900' },
  stageTag: { color: c.gold, fontSize: 9, fontWeight: '800' },
  rowSub: { color: c.muted, fontSize: 10, marginTop: 1 },
  happyTrack: { height: 5, backgroundColor: c.panelDark, borderWidth: 1, borderColor: c.border, marginTop: 5, overflow: 'hidden' },
  rowRight: { alignItems: 'flex-end', marginLeft: 8 },
  rowValue: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 12, fontWeight: '900' },
  rowDelta: { fontFamily: FONT_PIXEL, fontSize: 9, fontWeight: '800', marginTop: 2 },
  rowWeeks: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 8, fontWeight: '800', marginTop: 2 },
  chev: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 16, fontWeight: '900', marginLeft: 6 },

  // Signing / expired cards
  card: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 10, marginBottom: 8 },
  cardRow: { flexDirection: 'row' },
  riskLine: { color: c.textDim, fontSize: 11, fontWeight: '700', marginTop: 2 },
  feeLine: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 10, fontWeight: '800', marginTop: 2 },
  background: { color: c.textDim, fontSize: 11, fontStyle: 'italic', lineHeight: 15, marginTop: 3 },
  firedNote: { color: c.danger, fontSize: 10, fontWeight: '700', marginTop: 2 },
  capNote: { color: c.muted, fontSize: 11, fontStyle: 'italic', marginTop: 6 },
  expiredBtns: { flexDirection: 'row', marginTop: 8 },
  expiredBtn: { flex: 1, marginHorizontal: 3 },
  })
);
