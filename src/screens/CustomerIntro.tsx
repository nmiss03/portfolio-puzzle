import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { useGame } from '../state/GameContext';

// The client talks naturally — the player has to *infer* the key facts:
//   age ~25 · salary $60k · no dependents · HIGH risk · 40-year horizon · $50,000
const DIALOGUE = [
  "Hey, thanks for taking the time. I've been working at my first job for about a year now and I'm finally making decent money.",
  "My salary's around 60k — not huge, but I'm pretty frugal with spending. No one depends on me, which is nice.",
  "I've got about 40 years until retirement, maybe longer. I want to be aggressive with this money because, honestly, I can afford to take some risks right now.",
  'So yeah, help me figure out where to put this $50,000 I\'ve saved up. I want it working for me.',
];

export default function CustomerIntro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { level } = useGame();

  // Which bubble is currently shown (one at a time, click to advance).
  const [index, setIndex] = useState(0);
  const isLast = index === DIALOGUE.length - 1;

  const startAnalysis = () => {
    const customer = level.customer;
    router.push({
      pathname: '/PortfolioBuilder',
      params: customer ? { customer: JSON.stringify(customer) } : {},
    });
  };

  const onNext = () => {
    if (isLast) startAnalysis();
    else setIndex((i) => i + 1);
  };

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      {/* ---- Pixel-art client at a desk ---- */}
      <View style={styles.scene}>
        <View style={styles.character}>
          <View style={styles.head}>
            <View style={styles.eyesRow}>
              <View style={C.eye} />
              <View style={[C.eye, { marginLeft: 8 }]} />
            </View>
            <View style={styles.mouth} />
          </View>

          <View style={styles.torso}>
            <View style={styles.arm} />
            <View style={styles.body} />
            <View style={styles.arm} />
          </View>
        </View>
        <View style={styles.desk} />
      </View>

      {/* ---- One dialogue bubble at a time ---- */}
      <View style={styles.bubbleArea}>
        <View style={styles.bubble}>
          <Text style={styles.bubbleText}>{DIALOGUE[index]}</Text>
        </View>
        <Text style={styles.counter}>
          {index + 1} / {DIALOGUE.length}
        </Text>
      </View>

      {/* ---- Advance / start ---- */}
      <View style={styles.actions}>
        <Button title={isLast ? 'Start Portfolio Analysis' : 'Next'} onPress={onNext} />
      </View>
    </View>
  );
}

const PALETTE = {
  bg: '#f5f5f5',
  card: '#ffffff',
  border: '#cccccc',
  text: '#1a1a1a',
  muted: '#888888',
  skin: '#D4A574',
  shirt: '#8B6F47',
  eye: '#0066CC',
  mouth: '#704214',
  desk: '#3A3A3A',
};

const C = StyleSheet.create({
  eye: {
    width: 6,
    height: 6,
    backgroundColor: PALETTE.eye,
  },
});

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PALETTE.bg,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  // Scene
  scene: {
    alignItems: 'center',
  },
  character: {
    alignItems: 'center',
  },
  head: {
    width: 50,
    height: 50,
    backgroundColor: PALETTE.skin,
    alignItems: 'center',
  },
  eyesRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  mouth: {
    width: 2,
    height: 2,
    backgroundColor: PALETTE.mouth,
    marginTop: 10,
  },
  torso: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  body: {
    width: 50,
    height: 80,
    backgroundColor: PALETTE.shirt,
  },
  arm: {
    width: 8,
    height: 60,
    backgroundColor: PALETTE.shirt,
  },
  desk: {
    width: 140,
    height: 25,
    backgroundColor: PALETTE.desk,
    marginTop: 6,
  },

  // Bubble
  bubbleArea: {
    width: '100%',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: PALETTE.card,
    borderWidth: 2,
    borderColor: PALETTE.border,
    borderRadius: 4,
    padding: 16,
    maxWidth: 320,
  },
  bubbleText: {
    color: PALETTE.text,
    fontSize: 16,
    lineHeight: 23,
  },
  counter: {
    color: PALETTE.muted,
    fontSize: 13,
    fontWeight: '700',
    marginTop: 12,
  },

  actions: {
    width: '100%',
    maxWidth: 320,
  },
});
