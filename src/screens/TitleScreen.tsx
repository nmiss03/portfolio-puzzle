import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PixelCharacter from '../components/PixelCharacter';
import NewGameIntro from './NewGameIntro';
import SettingsMenu from './SettingsMenu';
import { useGame } from '../state/GameContext';
import { useTheme, Palette } from '../contexts/ThemeContext';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function TitleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { canContinue, advisorName, firmName, newGame } = useGame();

  const [mode, setMode] = useState<'title' | 'intro'>('title');
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (mode === 'intro') {
    return (
      <NewGameIntro
        onCancel={() => setMode('title')}
        onDone={(advisor, firm) => {
          newGame(advisor, firm);
          router.push('/WeekScreen');
        }}
      />
    );
  }

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
      {/* Pixel financial-advisor backdrop */}
      <View style={styles.hero}>
        <View style={styles.avatarFrame}>
          <PixelCharacter seed={firmName ? `advisor-${firmName}` : 'advisor-default'} cell={11} />
        </View>
        <Text style={styles.kicker}>◆ PORTFOLIO MANAGER ◆</Text>
        <Text style={styles.title}>THE ADVISOR</Text>
      </View>

      {/* Big rectangle bubble buttons */}
      <View style={styles.buttons}>
        {canContinue && (
          <Pressable
            onPress={() => router.push('/WeekScreen')}
            style={({ pressed }) => [styles.bubble, styles.bubblePrimary, pressed && styles.bubblePressed]}
          >
            <Text style={styles.bubbleText}>CONTINUE GAME</Text>
            <Text style={styles.bubbleSub} numberOfLines={1}>
              as {advisorName} at {firmName} Inc
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={() => setMode('intro')}
          style={({ pressed }) => [styles.bubble, !canContinue && styles.bubblePrimary, pressed && styles.bubblePressed]}
        >
          <Text style={styles.bubbleText}>NEW GAME</Text>
        </Pressable>

        <Pressable
          onPress={() => setSettingsOpen(true)}
          style={({ pressed }) => [styles.bubble, pressed && styles.bubblePressed]}
        >
          <Text style={styles.bubbleText}>⚙ SETTINGS</Text>
        </Pressable>
      </View>

      <SettingsMenu visible={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </View>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    screen: { flex: 1, backgroundColor: c.bg, paddingHorizontal: 24, justifyContent: 'space-between', alignItems: 'center' },
    hero: { alignItems: 'center', marginTop: 12 },
    avatarFrame: { backgroundColor: c.panel, borderWidth: BORDER * 2, borderColor: c.border, padding: 14, marginBottom: 16 },
    kicker: { fontFamily: MONO, color: c.gold, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
    title: { fontFamily: MONO, color: c.text, fontSize: 30, fontWeight: '900', letterSpacing: 2, marginTop: 8 },

    buttons: { width: '100%', maxWidth: 340, marginBottom: 12 },
    bubble: {
      width: '100%',
      backgroundColor: c.panel,
      borderWidth: BORDER * 2,
      borderColor: c.border,
      paddingVertical: 18,
      paddingHorizontal: 16,
      alignItems: 'center',
      marginBottom: 16,
    },
    bubblePrimary: { borderColor: c.gold },
    bubblePressed: { transform: [{ translateY: 2 }] },
    bubbleText: { fontFamily: MONO, color: c.text, fontSize: 18, fontWeight: '900', letterSpacing: 1 },
    bubbleSub: { fontFamily: MONO, color: c.textDim, fontSize: 12, fontWeight: '700', marginTop: 4 },
  });
