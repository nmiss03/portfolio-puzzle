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

import { C, FONT_PIXEL, BORDER_W } from '../theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
}

// Boxy bronze game button with a faux-3D bevel (light top/left, dark
// bottom/right). Pressing inverts the bevel for an inset "click".
export default function Button({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const v = variantStyles[variant];

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

const styles = StyleSheet.create({
  base: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: BORDER_W,
    borderRadius: 0,
    // raised bevel
    borderTopColor: C.borderHi,
    borderLeftColor: C.borderHi,
    borderBottomColor: C.borderLo,
    borderRightColor: C.borderLo,
  },
  content: { flexDirection: 'row', alignItems: 'center' },
  text: {
    fontFamily: FONT_PIXEL,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  // Pressed: invert the bevel so the button looks pushed in.
  pressed: {
    borderTopColor: C.borderLo,
    borderLeftColor: C.borderLo,
    borderBottomColor: C.borderHi,
    borderRightColor: C.borderHi,
    transform: [{ translateY: 1 }],
  },
  disabled: { opacity: 0.45 },
});

const variantStyles: Record<Variant, { container: ViewStyle; text: { color: string } & object }> = {
  primary: {
    container: { backgroundColor: C.button },
    text: { color: C.ink },
  },
  secondary: {
    container: { backgroundColor: C.panelLite },
    text: { color: C.text },
  },
  ghost: {
    container: { backgroundColor: 'transparent', borderColor: C.border },
    text: { color: C.textDim },
  },
  danger: {
    container: { backgroundColor: C.danger },
    text: { color: '#2A0E0C' },
  },
};
