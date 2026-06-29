import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';

import { colors, radius, spacing, font } from '../theme';

/**
 * Reusable pressable button.
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 */
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant].container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.content}>
        {loading && (
          <ActivityIndicator
            size="small"
            color={variantStyles[variant].text.color}
            style={{ marginRight: spacing.sm }}
          />
        )}
        <Text style={[styles.text, variantStyles[variant].text]}>{title}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingVertical: spacing.md + 2,
    paddingHorizontal: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  text: {
    fontSize: font.md,
    fontWeight: '700',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.99 }],
  },
  disabled: {
    opacity: 0.45,
  },
});

const variantStyles = {
  primary: StyleSheet.create({
    container: { backgroundColor: colors.primary },
    text: { color: colors.white },
  }),
  secondary: StyleSheet.create({
    container: {
      backgroundColor: colors.surfaceAlt,
      borderWidth: 1,
      borderColor: colors.borderStrong,
    },
    text: { color: colors.text },
  }),
  ghost: StyleSheet.create({
    container: { backgroundColor: 'transparent' },
    text: { color: colors.subtext },
  }),
  danger: StyleSheet.create({
    container: { backgroundColor: colors.danger },
    text: { color: colors.white },
  }),
};
