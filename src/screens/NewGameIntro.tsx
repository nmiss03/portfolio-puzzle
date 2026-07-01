import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, Animated, Easing, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PixelCharacter from '../components/PixelCharacter';
import { useTheme, Palette } from '../contexts/ThemeContext';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function NewGameIntro({
  onDone,
  onCancel,
}: {
  onDone: (advisorName: string, firmName: string) => void;
  onCancel: () => void;
}) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  const styles = useMemo(() => makeStyles(c), [c]);

  const walk = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const [arrived, setArrived] = useState(false);
  const [advisor, setAdvisor] = useState('');
  const [firm, setFirm] = useState('');

  useEffect(() => {
    Animated.timing(walk, { toValue: 1, duration: 1700, easing: Easing.inOut(Easing.quad), useNativeDriver: true }).start(() => {
      setArrived(true);
      Animated.timing(formOpacity, { toValue: 1, duration: 400, useNativeDriver: true }).start();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const translateX = walk.interpolate({ inputRange: [0, 1], outputRange: [-180, 0] });
  // Bob up and down a few times to fake a walk cycle.
  const translateY = walk.interpolate({ inputRange: [0, 0.2, 0.4, 0.6, 0.8, 1], outputRange: [0, -6, 0, -6, 0, 0] });

  const canConfirm = advisor.trim().length > 0 && firm.trim().length > 0;

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 }]}>
      <Text style={styles.caption}>{arrived ? 'A new office. A fresh start.' : 'Moving in...'}</Text>

      {/* Pixel office scene */}
      <View style={styles.office}>
        <View style={styles.window} />
        <View style={styles.deskShadow} />
        <View style={styles.desk} />
        <Animated.View style={[styles.advisor, { transform: [{ translateX }, { translateY }] }]}>
          <PixelCharacter seed={`advisor-${firm || 'new'}`} cell={9} />
        </Animated.View>
        <View style={styles.floor} />
      </View>

      {arrived && (
        <Animated.View style={[styles.form, { opacity: formOpacity }]}>
          <Text style={styles.title}>SET UP YOUR FIRM</Text>

          <Text style={styles.label}>ADVISOR NAME</Text>
          <TextInput
            style={styles.input}
            value={advisor}
            onChangeText={setAdvisor}
            placeholder="e.g. Jordan Reyes"
            placeholderTextColor={c.muted}
            maxLength={24}
          />

          <Text style={styles.label}>FIRM NAME</Text>
          <View style={styles.firmRow}>
            <TextInput
              style={[styles.input, styles.firmInput]}
              value={firm}
              onChangeText={setFirm}
              placeholder="e.g. Summit Capital"
              placeholderTextColor={c.muted}
              maxLength={24}
            />
            <Text style={styles.incSuffix}>Inc</Text>
          </View>

          <Pressable
            onPress={() => canConfirm && onDone(advisor.trim(), firm.trim())}
            disabled={!canConfirm}
            style={({ pressed }) => [styles.confirm, !canConfirm && styles.confirmDisabled, pressed && canConfirm && styles.confirmPressed]}
          >
            <Text style={styles.confirmText}>OPEN FOR BUSINESS ▶</Text>
          </Pressable>

          <Pressable onPress={onCancel} hitSlop={8}>
            <Text style={styles.back}>‹ Back</Text>
          </Pressable>
        </Animated.View>
      )}
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 20, alignItems: 'center' },
    caption: { fontFamily: MONO, color: c.textDim, fontSize: 13, fontStyle: 'italic', marginBottom: 12, textAlign: 'center' },
    office: { width: '100%', maxWidth: 360, height: 180, backgroundColor: c.panelDark, borderWidth: BORDER, borderColor: c.border, overflow: 'hidden', justifyContent: 'flex-end' },
    window: { position: 'absolute', top: 16, right: 20, width: 72, height: 56, backgroundColor: c.gold, borderWidth: BORDER, borderColor: c.border, opacity: 0.5 },
    desk: { position: 'absolute', bottom: 24, left: 24, width: 96, height: 28, backgroundColor: c.button, borderWidth: BORDER, borderColor: c.border },
    deskShadow: { position: 'absolute', bottom: 18, left: 24, width: 96, height: 8, backgroundColor: c.border, opacity: 0.4 },
    advisor: { position: 'absolute', bottom: 20, alignSelf: 'center' },
    floor: { width: '100%', height: 18, backgroundColor: c.panelLite, borderTopWidth: BORDER, borderTopColor: c.border },

    form: { width: '100%', maxWidth: 360, marginTop: 20 },
    title: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1, marginBottom: 16, textAlign: 'center' },
    label: { fontFamily: MONO, color: c.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 6, marginTop: 8 },
    input: { fontFamily: MONO, backgroundColor: c.panel, borderWidth: BORDER, borderColor: c.border, color: c.text, fontSize: 15, paddingVertical: 10, paddingHorizontal: 12 },
    firmRow: { flexDirection: 'row', alignItems: 'center' },
    firmInput: { flex: 1 },
    incSuffix: { fontFamily: MONO, color: c.textDim, fontSize: 15, fontWeight: '800', marginLeft: 10 },
    confirm: { backgroundColor: c.button, borderWidth: BORDER, borderColor: c.border, paddingVertical: 14, alignItems: 'center', marginTop: 20 },
    confirmDisabled: { opacity: 0.4 },
    confirmPressed: { transform: [{ translateY: 1 }] },
    confirmText: { fontFamily: MONO, color: c.ink, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    back: { fontFamily: MONO, color: c.textDim, fontSize: 13, fontWeight: '700', textAlign: 'center', marginTop: 14 },
  });
