import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import PixelClient from '../../components/PixelClient';
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
      <View style={styles.scene}>
        <PixelClient character={activeClient.character} />
        <View style={styles.desk} />
        <Text style={styles.name}>
          {activeClient.name} · {activeClient.age} · {activeClient.occupation}
        </Text>
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
        <Button title={isLast ? 'Start Building Portfolio' : 'Next'} onPress={onNext} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between' },
  scene: { alignItems: 'center' },
  desk: { width: 150, height: 25, backgroundColor: '#3A3A3A', marginTop: 6 },
  name: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 12 },
  bubbleArea: { width: '100%', alignItems: 'center' },
  bubble: { backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#cccccc', borderRadius: 4, padding: 16, maxWidth: 320 },
  bubbleText: { color: '#1a1a1a', fontSize: 16, lineHeight: 23 },
  counter: { color: '#888888', fontSize: 13, fontWeight: '700', marginTop: 12 },
  actions: { width: '100%', maxWidth: 320 },
});
