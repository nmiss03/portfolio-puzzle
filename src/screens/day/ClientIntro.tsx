import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import CharacterVisual from '../../components/CharacterVisual';
import { RISK_LABEL } from '../../data/gameState';
import { useGame } from '../../state/GameContext';

export default function ClientIntro({ onDone }: { onDone: () => void }) {
  const { activeClient } = useGame();
  const insets = useSafeAreaInsets();
  const dialogue = activeClient.dialogue;

  const [index, setIndex] = useState(0);
  const isLast = index === dialogue.length - 1;
  const onNext = () => (isLast ? onDone() : setIndex((i) => i + 1));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.top}>
        <Text style={styles.title}>Meet the Client</Text>
        <CharacterVisual color={activeClient.characterColor} width={70} height={95} />
        <Text style={styles.name}>
          {activeClient.name} · {activeClient.age} · {activeClient.occupation}
        </Text>
        <Text style={styles.risk}>{RISK_LABEL[activeClient.riskPreference]}</Text>
      </View>

      <View style={styles.bubbleArea}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{dialogue[index]}</Text>
        </View>
        <Text style={styles.counter}>
          {index + 1} / {dialogue.length}
        </Text>
      </View>

      <View style={styles.actions}>
        <Button title={isLast ? 'Start Portfolio Analysis' : 'Next'} onPress={onNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between' },
  top: { alignItems: 'center' },
  title: { color: '#1a1a1a', fontSize: 22, fontWeight: '900', marginBottom: 16 },
  name: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 12 },
  risk: { color: '#4a90e2', fontSize: 13, fontWeight: '800', marginTop: 2 },
  bubbleArea: { width: '100%', alignItems: 'center' },
  bubble: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#cccccc', borderRadius: 4, padding: 16, maxWidth: 320 },
  bubbleText: { color: '#1a1a1a', fontSize: 16, lineHeight: 23 },
  counter: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 12 },
  actions: { width: '100%', maxWidth: 320 },
});
