// The Telephone application: the firm's front line. Requests that still need
// action this week sit at the top under NEEDS ACTION; everything else — client
// texts, tips, thank-yous, breakups — reads like a message log underneath.

import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter from '../components/PixelCharacter';
import PixelWindow from '../components/PixelWindow';
import { ClientMessage } from '../data/clientMessages';
import { useGame } from '../state/GameContext';
import { useTheme, Palette } from '../contexts/ThemeContext';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function PhoneNotifications() {
  const { state, togglePhone } = useGame();
  const { c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  // Newest first; actionable requests pulled out on top.
  const sorted = useMemo(() => [...state.messages].sort((a, b) => b.weekIssued - a.weekIssued), [state.messages]);
  const pending = sorted.filter((m) => !m.resolved && m.weekIssued === state.currentWeek);
  const pendingIds = new Set(pending.map((m) => m.id));
  const rest = sorted.filter((m) => !pendingIds.has(m.id));

  if (!state.phoneOpen) return null;

  return (
    <PixelWindow title="Telephone" icon="☎" onClose={() => togglePhone(false)}>
      {sorted.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>No messages yet.</Text>
          <Text style={styles.emptyText}>Clients will call when they want something — or when they have something to say.</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {pending.length > 0 && (
            <>
              <Text style={styles.sectionHot}>☎ NEEDS ACTION THIS WEEK · {pending.length}</Text>
              {pending.map((m) => (
                <MessageCard key={m.id} m={m} highlight />
              ))}
            </>
          )}
          <Text style={styles.section}>MESSAGE LOG</Text>
          {rest.map((m) => (
            <MessageCard key={m.id} m={m} />
          ))}
        </ScrollView>
      )}
    </PixelWindow>
  );
}

function MessageCard({ m, highlight = false }: { m: ClientMessage; highlight?: boolean }) {
  const { c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const isTip = m.messageType === 'insider_tip';
  const isNote = m.messageType === 'client_note';
  const status = isTip ? 'INSIDER' : isNote ? 'NOTE' : !m.resolved ? 'PENDING' : m.fulfilled ? 'DONE' : 'MISSED';
  const statusColor = isTip ? c.warning : isNote ? c.gold : !m.resolved ? c.gold : m.fulfilled ? c.success : c.danger;
  return (
    <View style={[styles.card, isTip && { borderColor: c.warning }, highlight && { borderColor: c.gold }]}>
      <View style={styles.cardTop}>
        <PixelCharacter seed={m.clientId} cell={4} />
        <View style={styles.cardHead}>
          <Text style={styles.name}>{m.clientName}</Text>
          <Text style={styles.sent}>Week {m.weekIssued}</Text>
        </View>
        <View style={[styles.badge, { borderColor: statusColor }]}>
          <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
        </View>
      </View>
      <Text style={styles.body}>{m.messageText}</Text>
      {m.stockName ? (
        <Text style={styles.ask}>
          {isTip || isNote ? 'Concerns ' : m.messageType === 'new_stock_request' ? 'Wants to BUY ' : 'Wants to ADD to '}
          <Text style={styles.askStock}>{m.stockName}</Text>
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    list: { padding: 10 },
    section: { fontFamily: MONO, color: c.muted, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginTop: 10, marginBottom: 6 },
    sectionHot: { fontFamily: MONO, color: c.gold, fontSize: 11, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
    card: { backgroundColor: c.panel, borderWidth: BORDER, borderColor: c.border, padding: 10, marginBottom: 8 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    cardHead: { flex: 1, marginLeft: 10 },
    name: { fontFamily: MONO, color: c.text, fontSize: 13, fontWeight: '800' },
    sent: { fontFamily: MONO, color: c.muted, fontSize: 10, marginTop: 1 },
    badge: { borderWidth: BORDER, paddingHorizontal: 5, paddingVertical: 2 },
    badgeText: { fontFamily: MONO, fontSize: 9, fontWeight: '800' },
    body: { fontFamily: MONO, color: c.textDim, fontSize: 12, lineHeight: 18, marginTop: 8 },
    ask: { fontFamily: MONO, color: c.text, fontSize: 11, fontWeight: '700', marginTop: 6 },
    askStock: { color: c.gold, fontWeight: '900' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    emptyTitle: { fontFamily: MONO, color: c.gold, fontSize: 15, fontWeight: '800' },
    emptyText: { fontFamily: MONO, color: c.textDim, fontSize: 12, marginTop: 8, textAlign: 'center' },
  });
