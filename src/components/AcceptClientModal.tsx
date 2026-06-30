import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Button from './Button';
import { RuntimeClient, CONTRACT_WEEKS, riskPreferenceLabel } from '../data/gameState';
import { formatMoney } from '../utils/format';
import { C, FONT_PIXEL, BORDER_W } from '../theme';

export default function AcceptClientModal({
  client,
  onAccept,
  onCancel,
}: {
  client: RuntimeClient;
  onAccept: () => void;
  onCancel: () => void;
}) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirm Contract</Text>
        <Text style={styles.name}>{client.name} · {client.age} · {client.occupation}</Text>

        <View style={styles.rows}>
          <Row label="Duration" value={`${CONTRACT_WEEKS} weeks`} />
          <Row label="Initial capital" value={formatMoney(client.initialCapital)} />
          <Row label="Risk preference" value={riskPreferenceLabel(client.recommendedAllocation)} />
          <Row label="Your goal" value="Grow their capital in line with how they invest" />
        </View>

        <Button title="Accept Contract" onPress={onAccept} style={{ marginTop: 12 }} />
        <Button title="Cancel" variant="secondary" onPress={onCancel} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(10,16,16,0.7)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 },
  card: { width: '100%', maxWidth: 360, backgroundColor: C.panel, borderWidth: BORDER_W, borderColor: C.border, padding: 20 },
  title: { fontFamily: FONT_PIXEL, color: C.gold, fontSize: 16, fontWeight: '900', letterSpacing: 0.5, textTransform: 'uppercase' },
  name: { color: C.textDim, fontSize: 14, fontWeight: '700', marginTop: 4 },
  rows: { marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: C.divider },
  rowLabel: { fontFamily: FONT_PIXEL, color: C.muted, fontSize: 12, fontWeight: '700' },
  rowValue: { fontFamily: FONT_PIXEL, color: C.text, fontSize: 12, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 12 },
});
