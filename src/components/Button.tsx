import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  ActivityIndicator,
  View,
  StyleProp,
  ViewStyle,
} from 'react-native';

import { FONT_PIXEL, BORDER_W, Palette } from '../theme';
import { makeUseStyles, useTheme } from '../contexts/ThemeContext';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Boxy pixel button, themed light/dark. Pressing nudges it down a pixel.
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const styles = useStyles();
  const { c } = useTheme();
  const v = variantStyles(c)[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        v.container,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
    >
      <View style={styles.content}>
        {loading && <ActivityIndicator size="small" color={v.text.color} style={{ marginRight: 8 }} />}
        <Text style={[styles.text, v.text]} numberOfLines={1}>
          {title.toUpperCase()}
        </Text>
      </View>
    </Pressable>
  );
}

const useStyles = makeUseStyles((c: Palette) =>
  StyleSheet.create({
    base: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: BORDER_W,
      borderRadius: 0,
      borderColor: c.border,
    },
    content: { flexDirection: 'row', alignItems: 'center' },
    text: {
      fontFamily: FONT_PIXEL,
      fontSize: 13,
      fontWeight: '700',
      letterSpacing: 1,
      textTransform: 'uppercase',
    },
    pressed: { transform: [{ translateY: 1 }] },
    disabled: { opacity: 0.45 },
  })
);

const variantStyles = (c: Palette): Record<Variant, { container: ViewStyle; text: { color: string } & object }> => ({
  primary: {
    container: { backgroundColor: c.button },
    text: { color: c.ink },
  },
  secondary: {
    container: { backgroundColor: c.panelLite },
    text: { color: c.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderColor: c.border },
    text: { color: c.textDim },
  },
  danger: {
    container: { backgroundColor: c.danger },
    text: { color: c.white },
  },
});
