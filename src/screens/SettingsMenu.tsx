// Settings: theme, autosave, and destructive actions (reset settings, delete
// save). Only real, wired-up options ship in the alpha — audio and cloud save
// are shown as disabled "coming soon" rows to set expectations honestly rather
// than fake controls. Reachable from the title screen and the desktop gear.

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import { useTheme, Palette } from '../contexts/ThemeContext';
import { ThemeMode } from '../styles/colors';
import { useGame } from '../state/GameContext';
import { useSettings, updateSettings, resetSettings } from '../data/settings';
import { VERSION_LABEL } from '../version';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function SettingsMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c, mode, setMode } = useTheme();
  const settings = useSettings();
  const { saveStatus, deleteSave } = useGame();
  const styles = useMemo(() => makeStyles(c), [c]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!visible) return null;

  const hasSave = saveStatus !== 'none';

  const Row = ({ on, label, onPress, disabled }: { on: boolean; label: string; onPress?: () => void; disabled?: boolean }) => (
    <Pressable style={[styles.option, disabled && styles.optionDisabled]} onPress={disabled ? undefined : onPress}>
      <View style={[styles.checkbox, on && styles.checkboxOn]}>{on && <Text style={styles.check}>x</Text>}</View>
      <Text style={[styles.optionText, disabled && styles.optionTextDim]}>{label}</Text>
    </Pressable>
  );

  const close = () => {
    setConfirmDelete(false);
    onClose();
  };

  return (
    <Pressable style={styles.backdrop} onPress={close}>
      <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
        <View style={styles.header}>
          <Text style={styles.title}>SETTINGS</Text>
          <Pressable onPress={close} hitSlop={10}>
            <Text style={styles.close}>X</Text>
          </Pressable>
        </View>

        <ScrollView>
          <Text style={styles.sectionLabel}>THEME</Text>
          <Row on={mode === 'light'} label="Light Mode" onPress={() => setMode('light' as ThemeMode)} />
          <Row on={mode === 'dark'} label="Dark Mode" onPress={() => setMode('dark' as ThemeMode)} />

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>GAME</Text>
          <Row on={settings.autosave} label="Autosave" onPress={() => updateSettings({ autosave: !settings.autosave })} />
          <Text style={styles.hint}>Your firm saves automatically to this browser. No account needed.</Text>

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>COMING SOON</Text>
          <Row on={false} label="Audio & Music" disabled />
          <Row on={false} label="Cloud Save" disabled />

          <View style={styles.divider} />
          <Text style={styles.sectionLabel}>DATA</Text>
          <Pressable style={styles.actionBtn} onPress={() => resetSettings()}>
            <Text style={styles.actionText}>Reset Settings</Text>
          </Pressable>
          {confirmDelete ? (
            <View style={styles.confirmBox}>
              <Text style={styles.confirmText}>Delete your saved firm? This cannot be undone.</Text>
              <View style={styles.confirmRow}>
                <Pressable
                  style={[styles.actionBtn, styles.dangerBtn, styles.confirmHalf]}
                  onPress={() => { deleteSave(); setConfirmDelete(false); }}
                >
                  <Text style={[styles.actionText, styles.dangerText]}>Delete</Text>
                </Pressable>
                <Pressable style={[styles.actionBtn, styles.confirmHalf]} onPress={() => setConfirmDelete(false)}>
                  <Text style={styles.actionText}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <Pressable
              style={[styles.actionBtn, !hasSave && styles.actionDisabled]}
              onPress={hasSave ? () => setConfirmDelete(true) : undefined}
            >
              <Text style={[styles.actionText, !hasSave && styles.optionTextDim]}>Delete Save</Text>
            </Pressable>
          )}

          <Text style={styles.version}>{VERSION_LABEL}</Text>
        </ScrollView>
      </Pressable>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)', alignItems: 'flex-end', paddingTop: 56, paddingHorizontal: 12 },
    menu: { width: 260, maxHeight: '86%', backgroundColor: c.panel, borderWidth: BORDER * 2, borderColor: c.border, padding: 14 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontFamily: MONO, color: c.gold, fontSize: 15, fontWeight: '900', letterSpacing: 1 },
    close: { fontFamily: MONO, color: c.gold, fontSize: 15, fontWeight: '800' },
    sectionLabel: { fontFamily: MONO, color: c.muted, fontSize: 10, fontWeight: '900', letterSpacing: 1, marginBottom: 6 },
    option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 7 },
    optionDisabled: { opacity: 0.4 },
    checkbox: { width: 18, height: 18, borderWidth: BORDER, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: c.panelDark },
    checkboxOn: { borderColor: c.gold },
    check: { fontFamily: MONO, color: c.gold, fontSize: 13, fontWeight: '900', lineHeight: 15 },
    optionText: { fontFamily: MONO, color: c.text, fontSize: 13, fontWeight: '700' },
    optionTextDim: { color: c.muted },
    hint: { fontFamily: MONO, color: c.muted, fontSize: 10, fontStyle: 'italic', marginTop: 2, lineHeight: 14 },
    divider: { height: BORDER, backgroundColor: c.divider, marginVertical: 12 },
    actionBtn: { borderWidth: BORDER, borderColor: c.border, backgroundColor: c.panelDark, paddingVertical: 9, alignItems: 'center', marginTop: 8 },
    actionDisabled: { opacity: 0.4 },
    actionText: { fontFamily: MONO, color: c.text, fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
    dangerBtn: { borderColor: c.danger },
    dangerText: { color: c.danger },
    confirmBox: { marginTop: 8, borderWidth: BORDER, borderColor: c.danger, padding: 8, backgroundColor: c.panelDark },
    confirmText: { fontFamily: MONO, color: c.textDim, fontSize: 11, lineHeight: 15, marginBottom: 6 },
    confirmRow: { flexDirection: 'row' },
    confirmHalf: { flex: 1, marginHorizontal: 3, marginTop: 0 },
    version: { fontFamily: MONO, color: c.muted, fontSize: 10, fontWeight: '800', letterSpacing: 1, textAlign: 'center', marginTop: 16 },
  });
