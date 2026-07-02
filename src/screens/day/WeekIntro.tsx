import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text } from 'react-native';

import { FONT_PIXEL, Palette } from '../../theme';
import { makeUseStyles } from '../../contexts/ThemeContext';

// Dark screen that fades away while the "Week X" title appears.
export default function WeekIntro({ week, onContinue }: { week: number; onContinue: () => void }) {
  const overlay = useRef(new Animated.Value(1)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const styles = useStyles();

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
      <Text style={styles.week}>WEEK {week}</Text>
      <Text style={styles.tap}>▶ tap to continue</Text>
      <Animated.View pointerEvents="none" style={[styles.overlay, { opacity: overlay }]}>
        <Animated.Text style={[styles.overlayText, { opacity: titleOpacity }]}>WEEK {week}</Animated.Text>
      </Animated.View>
    </Pressable>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg, alignItems: 'center', justifyContent: 'center' },
    week: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 40, fontWeight: '900', letterSpacing: 2 },
    tap: { fontFamily: FONT_PIXEL, color: c.textDim, fontSize: 13, marginTop: 12, letterSpacing: 1 },
    overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: c.panelDark, alignItems: 'center', justifyContent: 'center' },
    overlayText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 44, fontWeight: '900', letterSpacing: 2 },
  })
);
