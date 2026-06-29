import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
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

const BUBBLE_DELAY_MS = 1500;

export default function CustomerIntro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { level } = useGame();

  const [visibleCount, setVisibleCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visibleCount >= DIALOGUE.length) return;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), BUBBLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const allShown = visibleCount >= DIALOGUE.length;

  const startAnalysis = () => {
    const customer = level.customer;
    router.push({
      pathname: '/PortfolioBuilder',
      params: customer ? { customer: JSON.stringify(customer) } : {},
    });
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.screen}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 32 }]}
      onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
    >
      {/* ---- Pixel-art client at a desk ---- */}
      <View style={styles.scene}>
        <View style={styles.character}>
          {/* Head with eyes + mouth */}
          <View style={styles.head}>
            <View style={styles.eyesRow}>
              <View style={C.eye} />
              <View style={[C.eye, { marginLeft: 8 }]} />
            </View>
            <View style={styles.mouth} />
          </View>

          {/* Arms on each side of the body */}
          <View style={styles.torso}>
            <View style={styles.arm} />
            <View style={styles.body} />
            <View style={styles.arm} />
          </View>
        </View>

        <View style={styles.desk} />
      </View>

      {/* ---- Conversational dialogue bubbles ---- */}
      <View style={styles.dialogue}>
        {DIALOGUE.slice(0, visibleCount).map((line, i) => (
          <View key={i} style={styles.bubble}>
            <Text style={styles.bubbleText}>{line}</Text>
          </View>
        ))}

        {!allShown && (
          <View style={styles.typing}>
            <Text style={styles.typingText}>…</Text>
          </View>
        )}
      </View>

      {allShown && (
        <View style={styles.actions}>
          <Button title="Start Portfolio Analysis" onPress={startAnalysis} />
        </View>
      )}
    </ScrollView>
  );
}

const PALETTE = {
  bg: '#f5f5f5',
  card: '#ffffff',
  border: '#cccccc',
  text: '#1a1a1a',
  skin: '#D4A574',
  shirt: '#8B6F47',
  eye: '#0066CC',
  mouth: '#704214',
  desk: '#3A3A3A',
};

// Small reusable raw style for the eye squares.
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
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    alignItems: 'center',
  },

  // Scene
  scene: {
    alignItems: 'center',
    marginBottom: 24,
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

  // Dialogue
  dialogue: {
    width: '100%',
    alignItems: 'center',
  },
  bubble: {
    backgroundColor: PALETTE.card,
    borderWidth: 2,
    borderColor: PALETTE.border,
    borderRadius: 4,
    padding: 16,
    marginTop: 12,
    maxWidth: 320,
  },
  bubbleText: {
    color: PALETTE.text,
    fontSize: 16,
    lineHeight: 23,
  },
  typing: {
    backgroundColor: PALETTE.card,
    borderWidth: 2,
    borderColor: PALETTE.border,
    borderRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 12,
  },
  typingText: {
    color: PALETTE.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },

  actions: {
    width: '100%',
    maxWidth: 320,
    marginTop: 24,
  },
});
