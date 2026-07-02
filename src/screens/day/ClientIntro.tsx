import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../../components/Button';
import PixelCharacter from '../../components/PixelCharacter';
import { useGame } from '../../state/GameContext';
import { FONT_PIXEL, BORDER_W, Palette } from '../../theme';
import { makeUseStyles } from '../../contexts/ThemeContext';

export default function ClientIntro({ onDone }: { onDone: () => void }) {
  const { introClient } = useGame();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const activeClient = introClient!;
  const dialogue = activeClient?.dialogue ?? [];

  const [index, setIndex] = useState(0);
  const isLast = index === dialogue.length - 1;
  const onNext = () => (isLast ? onDone() : setIndex((i) => i + 1));

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      <View style={styles.top}>
        <Text style={styles.title}>MEET THE CLIENT</Text>
        <PixelCharacter seed={activeClient.id} cell={7} />
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
        <Button title={isLast ? 'Start Portfolio Analysis' : 'Next'} onPress={onNext} />
      </View>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 20, alignItems: 'center', justifyContent: 'space-between' },
    top: { alignItems: 'center' },
    title: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 20, fontWeight: '900', marginBottom: 16, letterSpacing: 1 },
    name: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 13, fontWeight: '700', marginTop: 12 },
    bubbleArea: { width: '100%', alignItems: 'center' },
    bubble: { backgroundColor: c.panel, borderWidth: BORDER_W, borderColor: c.border, padding: 16, maxWidth: 320 },
    bubbleText: { color: c.text, fontSize: 16, lineHeight: 23 },
    counter: { fontFamily: FONT_PIXEL, color: c.muted, fontSize: 13, fontWeight: '700', marginTop: 12 },
    actions: { width: '100%', maxWidth: 320 },
  })
);
