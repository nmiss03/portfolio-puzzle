import React, { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { useTheme, Palette } from '../contexts/ThemeContext';
import { ThemeMode } from '../styles/colors';
import { MONO } from '../styles/typography';
import { BORDER } from '../styles/spacing';

export default function SettingsMenu({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { c, mode, setMode } = useTheme();
  const styles = useMemo(() => makeStyles(c), [c]);

  if (!visible) return null;

  const Option = ({ value, label }: { value: ThemeMode; label: string }) => {
    const selected = mode === value;
    return (
      <Pressable style={styles.option} onPress={() => setMode(value)}>
        <View style={[styles.checkbox, selected && styles.checkboxOn]}>
          {selected && <Text style={styles.check}>x</Text>}
        </View>
        <Text style={styles.optionText}>{label}</Text>
      </Pressable>
    );
  };

  return (
    <Pressable style={styles.backdrop} onPress={onClose}>
      <Pressable style={styles.menu} onPress={(e) => e.stopPropagation()}>
        <View style={styles.header}>
          <Text style={styles.title}>SETTINGS</Text>
          <Pressable onPress={onClose} hitSlop={10}>
            <Text style={styles.close}>X</Text>
          </Pressable>
        </View>

        <Text style={styles.sectionLabel}>THEME</Text>
        <Option value="light" label="Light Mode" />
        <Option value="dark" label="Dark Mode" />

        <View style={styles.divider} />
        <Text style={styles.note}>More settings coming soon.</Text>
      </Pressable>
    </Pressable>
  );
}

const makeStyles = (c: Palette) =>
  StyleSheet.create({
    backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)', alignItems: 'flex-end', paddingTop: 60, paddingHorizontal: 12 },
    menu: { width: 220, backgroundColor: c.panel, borderWidth: BORDER, borderColor: c.border, padding: 12 },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
    title: { fontFamily: MONO, color: c.gold, fontSize: 14, fontWeight: '900', letterSpacing: 1 },
    close: { fontFamily: MONO, color: c.gold, fontSize: 14, fontWeight: '800' },
    sectionLabel: { fontFamily: MONO, color: c.muted, fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 8 },
    option: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8 },
    checkbox: { width: 18, height: 18, borderWidth: BORDER, borderColor: c.border, alignItems: 'center', justifyContent: 'center', marginRight: 10, backgroundColor: c.panelDark },
    checkboxOn: { borderColor: c.gold },
    check: { fontFamily: MONO, color: c.gold, fontSize: 13, fontWeight: '900', lineHeight: 15 },
    optionText: { fontFamily: MONO, color: c.text, fontSize: 13, fontWeight: '700' },
    divider: { height: BORDER, backgroundColor: c.divider, marginVertical: 12 },
    note: { fontFamily: MONO, color: c.muted, fontSize: 11, fontStyle: 'italic' },
  });
