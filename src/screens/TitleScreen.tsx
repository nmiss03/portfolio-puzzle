import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import PixelCharacter from '../components/PixelCharacter';
import NewGameIntro from './NewGameIntro';
import SettingsMenu from './SettingsMenu';
import { useGame } from '../state/GameContext';
import { careerTitle } from '../data/careerRecords';
import { useTheme, Palette } from '../contexts/ThemeContext';
import { VERSION_LABEL } from '../version';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function TitleScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { c } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);
  const { state, canContinue, saveStatus, deleteSave, advisorName, firmName, newGame } = useGame();
  const title = careerTitle(state.records, state.currentWeek);

  const [mode, setMode] = useState<'title' | 'intro' | 'credits'>('title');
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmNew, setConfirmNew] = useState(false);

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

  if (mode === 'credits') {
    return (
      <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 24 }]}>
        <View style={styles.creditsBox}>
          <Text style={styles.title}>THE ADVISOR</Text>
          <Text style={styles.creditsVersion}>{VERSION_LABEL}</Text>
          <View style={styles.creditsRule} />
          <Text style={styles.creditsLine}>A boutique investment-firm management sim.</Text>
          <Text style={styles.creditsLine}>Read the news. Fund their dreams.</Text>
          <Text style={styles.creditsSmall}>Built with React Native · Expo · TypeScript.</Text>
          <Text style={styles.creditsSmall}>Zero external UI libraries — every pixel hand-built.</Text>
          <Text style={styles.creditsSmall}>Client-side only. Your firm saves to this browser.</Text>
        </View>
        <Pressable
          onPress={() => setMode('title')}
          style={({ pressed }) => [styles.bubble, styles.bubblePrimary, pressed && styles.bubblePressed]}
        >
          <Text style={styles.bubbleText}>◀ BACK</Text>
        </Pressable>
      </View>
    );
  }

  const startNew = () => {
    setConfirmNew(false);
    setMode('intro');
  };
  const onNewGame = () => (canContinue ? setConfirmNew(true) : startNew());
  const recoverable = saveStatus === 'corrupt' || saveStatus === 'outdated';

  return (
    <View style={[styles.screen, { paddingTop: insets.top + 24, paddingBottom: insets.bottom + 16 }]}>
      {/* Pixel financial-advisor backdrop */}
      <View style={styles.hero}>
        <View style={styles.avatarFrame}>
          <PixelCharacter seed={firmName ? `advisor-${firmName}` : 'advisor-default'} cell={11} />
        </View>
        <Text style={styles.kicker}>◆ PORTFOLIO MANAGER ◆</Text>
        <Text style={styles.title}>THE ADVISOR</Text>
        <Text style={styles.versionTop}>{VERSION_LABEL}</Text>
      </View>

      {/* Save recovery: a stored save exists but can't be loaded. */}
      {recoverable && (
        <View style={styles.recovery}>
          <Text style={styles.recoveryTitle}>⚠ Save data could not be loaded</Text>
          <Text style={styles.recoveryBody}>
            {saveStatus === 'outdated'
              ? 'Your save is from an older version and cannot be continued.'
              : 'Your saved data appears to be corrupted.'}
          </Text>
          <Pressable style={styles.recoveryBtn} onPress={deleteSave}>
            <Text style={styles.recoveryBtnText}>DELETE SAVE & START FRESH</Text>
          </Pressable>
        </View>
      )}

      {/* Menu */}
      <View style={styles.buttons}>
        {canContinue && (
          <Pressable
            onPress={() => router.push('/WeekScreen')}
            style={({ pressed }) => [styles.bubble, styles.bubblePrimary, pressed && styles.bubblePressed]}
          >
            <Text style={styles.bubbleText}>CONTINUE GAME</Text>
            <Text style={styles.bubbleSub} numberOfLines={1}>
              as {advisorName} · {title} at {firmName} Inc
            </Text>
          </Pressable>
        )}

        <Pressable
          onPress={onNewGame}
          style={({ pressed }) => [styles.bubble, !canContinue && styles.bubblePrimary, pressed && styles.bubblePressed]}
        >
          <Text style={styles.bubbleText}>NEW GAME</Text>
        </Pressable>

        <View style={styles.miniRow}>
          <Pressable
            onPress={() => setSettingsOpen(true)}
            style={({ pressed }) => [styles.miniBtn, pressed && styles.bubblePressed]}
          >
            <Text style={styles.miniText}>⚙ SETTINGS</Text>
          </Pressable>
          <Pressable
            onPress={() => setMode('credits')}
            style={({ pressed }) => [styles.miniBtn, pressed && styles.bubblePressed]}
          >
            <Text style={styles.miniText}>CREDITS</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.footer}>{VERSION_LABEL} · saves to this browser · no account needed</Text>

      {/* New Game overwrite confirmation */}
      {confirmNew && (
        <Pressable style={styles.confirmBackdrop} onPress={() => setConfirmNew(false)}>
          <Pressable style={styles.confirmCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.confirmTitle}>START NEW GAME?</Text>
            <Text style={styles.confirmBody}>
              Your current firm ({advisorName} at {firmName} Inc) will be overwritten. This cannot be undone.
            </Text>
            <Pressable style={[styles.bubble, styles.bubblePrimary, { marginBottom: 10 }]} onPress={startNew}>
              <Text style={styles.bubbleText}>OVERWRITE & START</Text>
            </Pressable>
            <Pressable style={styles.bubble} onPress={() => setConfirmNew(false)}>
              <Text style={styles.bubbleText}>CANCEL</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      )}

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
    versionTop: { fontFamily: MONO, color: c.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginTop: 6 },

    recovery: { width: '100%', maxWidth: 360, borderWidth: BORDER * 2, borderColor: c.danger, backgroundColor: c.panel, padding: 12 },
    recoveryTitle: { fontFamily: MONO, color: c.danger, fontSize: 12, fontWeight: '900', letterSpacing: 0.5 },
    recoveryBody: { fontFamily: MONO, color: c.textDim, fontSize: 11, lineHeight: 16, marginTop: 6 },
    recoveryBtn: { borderWidth: BORDER, borderColor: c.danger, paddingVertical: 8, alignItems: 'center', marginTop: 10 },
    recoveryBtnText: { fontFamily: MONO, color: c.danger, fontSize: 11, fontWeight: '900', letterSpacing: 0.5 },

    buttons: { width: '100%', maxWidth: 340 },
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
    miniRow: { flexDirection: 'row', justifyContent: 'space-between' },
    miniBtn: { flex: 1, backgroundColor: c.panel, borderWidth: BORDER * 2, borderColor: c.border, paddingVertical: 14, alignItems: 'center', marginHorizontal: 4 },
    miniText: { fontFamily: MONO, color: c.text, fontSize: 13, fontWeight: '900', letterSpacing: 1 },

    footer: { fontFamily: MONO, color: c.muted, fontSize: 10, fontWeight: '700', letterSpacing: 0.5, textAlign: 'center', marginTop: 8 },

    confirmBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center', padding: 24 },
    confirmCard: { width: '100%', maxWidth: 340, backgroundColor: c.panel, borderWidth: BORDER * 2, borderColor: c.gold, padding: 18 },
    confirmTitle: { fontFamily: MONO, color: c.gold, fontSize: 16, fontWeight: '900', letterSpacing: 1, marginBottom: 8, textAlign: 'center' },
    confirmBody: { fontFamily: MONO, color: c.textDim, fontSize: 12, lineHeight: 18, marginBottom: 16, textAlign: 'center' },

    creditsBox: { alignItems: 'center', marginTop: 40 },
    creditsVersion: { fontFamily: MONO, color: c.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1, marginTop: 6 },
    creditsRule: { width: 120, height: BORDER, backgroundColor: c.border, marginVertical: 16 },
    creditsLine: { fontFamily: MONO, color: c.text, fontSize: 13, fontWeight: '700', textAlign: 'center', lineHeight: 20 },
    creditsSmall: { fontFamily: MONO, color: c.muted, fontSize: 11, fontWeight: '600', textAlign: 'center', lineHeight: 18, marginTop: 8 },
  });
