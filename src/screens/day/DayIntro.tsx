import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

// Dark screen that fades to light while the "Day X" title appears.
export default function DayIntro({ day, onContinue }: { day: number; onContinue: () => void }) {
  const overlay = useRef(new Animated.Value(1)).current; // 1 = dark
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.delay(500),
      Animated.timing(overlay, { toValue: 0, duration: 700, useNativeDriver: false }),
    ]).start();
    const t = setTimeout(onContinue, 2200);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable style={styles.screen} onPress={onContinue}>
      <Text style={styles.day}>Day {day}</Text>
      <Text style={styles.tap}>tap to continue</Text>
      <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlay }]}>
        <Animated.Text style={[styles.overlayText, { opacity: titleOpacity }]}>Day {day}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  day: { color: '#1a1a1a', fontSize: 44, fontWeight: '900' },
  tap: { color: '#888888', fontSize: 14, marginTop: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#101418', alignItems: 'center', justifyContent: 'center' },
  overlayText: { color: '#ffffff', fontSize: 48, fontWeight: '900', letterSpacing: 1 },
});
