import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

import Button from './Button';
import { RuntimeClient, CONTRACT_WEEKS } from '../data/gameState';
import { formatMoney } from '../utils/format';

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
          <Row label="Risk profile" value={client.recommendedAllocation} />
          <Row label="Your goal" value="Steady growth matching their risk profile" />
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
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(20,24,30,0.55)', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 50 },
  card: { width: '100%', maxWidth: 360, backgroundColor: '#ffffff', borderRadius: 12, padding: 20 },
  title: { color: '#1a1a1a', fontSize: 18, fontWeight: '900' },
  name: { color: '#666666', fontSize: 14, fontWeight: '700', marginTop: 4 },
  rows: { marginTop: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#eee' },
  rowLabel: { color: '#888888', fontSize: 13, fontWeight: '700' },
  rowValue: { color: '#1a1a1a', fontSize: 13, fontWeight: '700', flex: 1, textAlign: 'right', marginLeft: 12 },
});
