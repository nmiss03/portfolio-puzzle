import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

// Dark screen that fades to light while the "Week X" title appears.
export default function WeekIntro({ week, onContinue }: { week: number; onContinue: () => void }) {
  const overlay = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(titleOpacity, { toValue: 1, duration: 500, useNativeDriver: false }),
      Animated.delay(400),
      Animated.timing(overlay, { toValue: 0, duration: 700, useNativeDriver: false }),
    ]).start();
    const t = setTimeout(onContinue, 2100);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Pressable style={styles.screen} onPress={onContinue}>
      <Text style={styles.week}>Week {week}</Text>
      <Text style={styles.tap}>tap to continue</Text>
      <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlay }]}>
        <Animated.Text style={[styles.overlayText, { opacity: titleOpacity }]}>Week {week}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f5f5f5', alignItems: 'center', justifyContent: 'center' },
  week: { color: '#1a1a1a', fontSize: 44, fontWeight: '900' },
  tap: { color: '#888888', fontSize: 14, marginTop: 12 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#101418', alignItems: 'center', justifyContent: 'center' },
  overlayText: { color: '#ffffff', fontSize: 48, fontWeight: '900', letterSpacing: 1 },
});
