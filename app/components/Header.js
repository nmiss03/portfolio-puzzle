import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

import { colors, spacing, font } from '../theme';

/**
 * Top bar with an optional back button, a title, and an optional right slot.
 */
export default function Header({ title, subtitle, onBack, right }) {
  return (
    <View style={styles.container}>
      <View style={styles.side}>
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            style={({ pressed }) => [styles.backBtn, pressed && { opacity: 0.6 }]}
            accessibilityRole="button"
            accessibilityLabel="Go back"
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        ) : null}
      </View>

      <View style={styles.titleWrap}>
        <Text style={styles.title} numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>

      <View style={[styles.side, styles.rightSide]}>{right}</View>
    </View>
  );
}

const SIDE_WIDTH = 44;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    paddingTop: spacing.sm,
  },
  side: {
    width: SIDE_WIDTH,
    justifyContent: 'center',
  },
  rightSide: {
    alignItems: 'flex-end',
  },
  backBtn: {
    width: SIDE_WIDTH,
    height: SIDE_WIDTH,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -spacing.sm,
  },
  backText: {
    color: colors.text,
    fontSize: 34,
    lineHeight: 36,
    fontWeight: '300',
  },
  titleWrap: {
    flex: 1,
    alignItems: 'center',
  },
  title: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.subtext,
    fontSize: font.sm,
    marginTop: 2,
  },
});
