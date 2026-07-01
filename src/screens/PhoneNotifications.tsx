import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import PixelCharacter from '../components/PixelCharacter';
import { useGame } from '../state/GameContext';
import { useTheme, Palette } from '../contexts/ThemeContext';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function PhoneNotifications() {
  const { state, togglePhone } = useGame();
  const { c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  // Newest first.
  const messages = useMemo(() => [...state.messages].sort((a, b) => b.weekIssued - a.weekIssued), [state.messages]);

  if (!state.phoneOpen) return null;

  return (
    <View style={styles.backdrop}>
      <View style={styles.panel}>
        <View style={styles.header}>
          <Text style={styles.title}>MESSAGES</Text>
          <Pressable onPress={() => togglePhone(false)} hitSlop={10}>
            <Text style={styles.close}>X</Text>
          </Pressable>
        </View>

        {messages.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyTitle}>No messages yet.</Text>
            <Text style={styles.emptyText}>Clients will text you when they want to buy something.</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.list}>
            {messages.map((m) => {
              const isTip = m.messageType === 'insider_tip';
              const status = isTip ? 'INSIDER' : !m.resolved ? 'PENDING' : m.fulfilled ? 'DONE' : 'MISSED';
              const statusColor = isTip ? c.warning : !m.resolved ? c.gold : m.fulfilled ? c.success : c.danger;
              return (
                <View key={m.id} style={[styles.card, isTip && { borderColor: c.warning }]}>
                  <View style={styles.cardTop}>
                    <PixelCharacter seed={m.clientId} cell={4} />
                    <View style={styles.cardHead}>
                      <Text style={styles.name}>{m.clientName}</Text>
                      <Text style={styles.sent}>Sent: Week {m.weekIssued}</Text>
                    </View>
                    <View style={[styles.badge, { borderColor: statusColor }]}>
                      <Text style={[styles.badgeText, { color: statusColor }]}>{status}</Text>
                    </View>
                  </View>
                  <Text style={styles.body}>{m.messageText}</Text>
                  {m.stockName ? (
                    <Text style={styles.ask}>
                      {isTip ? 'Concerns ' : m.messageType === 'new_stock_request' ? 'Wants to BUY ' : 'Wants to ADD to '}
                      <Text style={styles.askStock}>{m.stockName}</Text>
                    </Text>
                  ) : null}
                </View>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    panel: { height: '90%', backgroundColor: c.bg, borderTopWidth: BORDER * 2, borderColor: c.border, overflow: 'hidden' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: BORDER, borderBottomColor: c.border, backgroundColor: c.panelDark },
    title: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1 },
    close: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '800' },
    list: { padding: 12 },
    card: { backgroundColor: c.panel, borderWidth: BORDER, borderColor: c.border, padding: 12, marginBottom: 12 },
    cardTop: { flexDirection: 'row', alignItems: 'center' },
    cardHead: { flex: 1, marginLeft: 12 },
    name: { fontFamily: MONO, color: c.text, fontSize: 14, fontWeight: '800' },
    sent: { fontFamily: MONO, color: c.muted, fontSize: 11, marginTop: 2 },
    badge: { borderWidth: BORDER, paddingHorizontal: 6, paddingVertical: 2 },
    badgeText: { fontFamily: MONO, fontSize: 10, fontWeight: '800' },
    body: { fontFamily: MONO, color: c.textDim, fontSize: 12, lineHeight: 19, marginTop: 12 },
    ask: { fontFamily: MONO, color: c.text, fontSize: 12, fontWeight: '700', marginTop: 8 },
    askStock: { color: c.gold, fontWeight: '900' },
    empty: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 30 },
    emptyTitle: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '800' },
    emptyText: { fontFamily: MONO, color: c.textDim, fontSize: 13, marginTop: 8, textAlign: 'center' },
  });
