import React, { useEffect, useRef, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Button from '../components/Button';
import { useGame } from '../state/GameContext';

// The client tells their story one line at a time, like a cutscene.
const DIALOGUE = [
  "I'm 25 years old",
  'Just starting my career, $60k salary',
  'No dependents',
  'Want to grow my wealth aggressively, 40-year horizon',
];

const BUBBLE_DELAY_MS = 1500;

export default function CustomerIntro() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { level } = useGame();

  // How many dialogue bubbles are currently visible (revealed one by one).
  const [visibleCount, setVisibleCount] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (visibleCount >= DIALOGUE.length) return;
    const timer = setTimeout(() => setVisibleCount((c) => c + 1), BUBBLE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [visibleCount]);

  const allShown = visibleCount >= DIALOGUE.length;

  const startAnalysis = () => {
    // Pass the customer profile forward via route params (as well as keeping it
    // in shared game state for the scoring screens downstream).
    const customer = level.customer;
    router.push({
      pathname: '/StockDashboard',
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
          <View style={styles.head}>
            <View style={[styles.eye, styles.eyeLeft]} />
            <View style={[styles.eye, styles.eyeRight]} />
          </View>
          <View style={styles.body} />
        </View>
        <View style={styles.desk} />
      </View>

      {/* ---- Sequential dialogue bubbles ---- */}
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

      {/* ---- Start button (after the full story) ---- */}
      {allShown && (
        <View style={styles.actions}>
          <Button title="Start Portfolio Analysis" onPress={startAnalysis} />
        </View>
      )}
    </ScrollView>
  );
}

const COLORS = {
  bg: '#f5f5f5',
  card: '#ffffff',
  text: '#1a1a1a',
  border: '#cccccc',
  headSkin: '#D4A574',
  bodyShirt: '#8B6F47',
  eye: '#0066CC',
  desk: '#4A4A4A',
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: COLORS.bg,
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
    width: 40,
    height: 40,
    backgroundColor: COLORS.headSkin,
    position: 'relative',
  },
  eye: {
    position: 'absolute',
    width: 4,
    height: 4,
    backgroundColor: COLORS.eye,
    top: 16,
  },
  eyeLeft: {
    left: 10,
  },
  eyeRight: {
    right: 10,
  },
  body: {
    width: 60,
    height: 80,
    backgroundColor: COLORS.bodyShirt,
    marginTop: -2,
  },
  desk: {
    width: 120,
    height: 20,
    backgroundColor: COLORS.desk,
    marginTop: 4,
  },

  // Dialogue
  dialogue: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
  },
  bubble: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 12,
    marginTop: 12,
  },
  bubbleText: {
    color: COLORS.text,
    fontSize: 16,
    lineHeight: 22,
  },
  typing: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  typingText: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 2,
  },

  // Actions
  actions: {
    width: '100%',
    maxWidth: 460,
    alignSelf: 'center',
    marginTop: 24,
  },
});
