// The one true window chrome. Every application in the firm's workstation —
// Client Book, News, Phone, Terminal, Shop, Settings — opens as one of these
// floating over the desktop: title bar with icon + close button, thick border,
// hard pixel drop-shadow, and a recessed interior bevel. The desktop stays
// visible around the edges so the player never feels they left their office.

import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles } from '../contexts/ThemeContext';

export default function PixelWindow({
  title,
  icon,
  onClose,
  children,
  height = '88%',
}: {
  title: string;
  icon?: string;
  onClose: () => void;
  children: React.ReactNode;
  height?: number | `${number}%`;
}) {
  const styles = useStyles();
  return (
    <View style={styles.backdrop}>
      <View style={[styles.windowWrap, { height }]}>
        <View style={styles.shadow} pointerEvents="none" />
        <View style={styles.frame}>
          <View style={styles.titleBar}>
            <View style={styles.titleLeft}>
              {icon ? <Text style={styles.titleIcon}>{icon}</Text> : null}
              <Text style={styles.title} numberOfLines={1}>{title.toUpperCase()}</Text>
            </View>
            <Pressable
              onPress={onClose}
              hitSlop={10}
              style={({ pressed }) => [styles.closeBtn, pressed && styles.closePressed]}
            >
              <Text style={styles.closeText}>✕</Text>
            </Pressable>
          </View>
          <View style={styles.inner}>{children}</View>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 10,
      zIndex: 40,
    },
    windowWrap: { width: '96%', maxWidth: 560 },
    shadow: {
      position: 'absolute',
      top: 7,
      left: 7,
      right: -7,
      bottom: -7,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    frame: {
      flex: 1,
      borderWidth: BORDER_W,
      borderColor: c.border,
      backgroundColor: c.bg,
      overflow: 'hidden',
    },
    titleBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: c.panelDark,
      borderBottomWidth: BORDER_W,
      borderBottomColor: c.border,
      paddingVertical: 8,
      paddingHorizontal: 10,
    },
    titleLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 },
    titleIcon: { fontSize: 14, marginRight: 8 },
    title: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 14, fontWeight: '900', letterSpacing: 1, flexShrink: 1 },
    closeBtn: {
      width: 26,
      height: 26,
      borderWidth: 2,
      borderColor: c.border,
      backgroundColor: c.panel,
      alignItems: 'center',
      justifyContent: 'center',
    },
    closePressed: { transform: [{ translateY: 1 }], backgroundColor: c.panelLite },
    closeText: { fontFamily: FONT_PIXEL, color: c.gold, fontSize: 13, fontWeight: '900', lineHeight: 15 },
    // Recessed interior: dark bevel top/left, light bevel bottom/right.
    inner: {
      flex: 1,
      borderTopWidth: 2,
      borderLeftWidth: 2,
      borderTopColor: c.borderLo,
      borderLeftColor: c.borderLo,
      borderBottomWidth: 2,
      borderRightWidth: 2,
      borderBottomColor: c.borderHi,
      borderRightColor: c.borderHi,
      backgroundColor: c.bg,
    },
  })
);
