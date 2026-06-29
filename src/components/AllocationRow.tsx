import React from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';

import Badge from './Badge';
import { Stock } from '../data/stocks';
import { colors, spacing, radius, font, categoryMeta } from '../theme';
import { formatPrice, volatilityLabel } from '../utils/format';

interface AllocationRowProps {
  stock: Stock;
  /** Current percent as a string ("" means 0). */
  value: string;
  onChange: (id: string, next: string) => void;
  step?: number;
}

/**
 * One editable allocation row for a single stock: identity + number input with
 * +/- steppers.
 */
export default function AllocationRow({ stock, value, onChange, step = 5 }: AllocationRowProps) {
  const cat = categoryMeta[stock.category];
  const vol = volatilityLabel(stock.volatility);
  const numeric = Number(value) || 0;

  const setNumber = (n: number) => {
    const clamped = Math.max(0, Math.min(100, n));
    onChange(stock.id, clamped === 0 ? '' : String(clamped));
  };

  const handleText = (text: string) => {
    const digits = text.replace(/[^0-9]/g, '');
    if (digits === '') return onChange(stock.id, '');
    let n = parseInt(digits, 10);
    if (Number.isNaN(n)) n = 0;
    onChange(stock.id, String(Math.min(100, n)));
  };

  return (
    <View style={[styles.row, numeric > 0 && styles.rowActive]}>
      {/* Category color rail */}
      <View style={[styles.rail, { backgroundColor: cat.color }]} />

      <View style={styles.info}>
        <View style={styles.infoTop}>
          <Text style={styles.ticker}>{stock.ticker}</Text>
          <Badge label={cat.label} color={cat.color} style={{ marginLeft: spacing.sm }} />
        </View>
        <Text style={styles.name} numberOfLines={1}>
          {stock.name}
        </Text>
        <Text style={styles.meta}>
          {formatPrice(stock.price)} · <Text style={{ color: vol.color }}>{vol.label} vol</Text>
        </Text>
      </View>

      <View style={styles.stepper}>
        <StepButton label="–" onPress={() => setNumber(numeric - step)} disabled={numeric <= 0} />
        <View style={styles.inputWrap}>
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={handleText}
            keyboardType="number-pad"
            placeholder="0"
            placeholderTextColor={colors.muted}
            maxLength={3}
            selectTextOnFocus
            accessibilityLabel={`${stock.ticker} allocation percent`}
          />
          <Text style={styles.percent}>%</Text>
        </View>
        <StepButton label="+" onPress={() => setNumber(numeric + step)} disabled={numeric >= 100} />
      </View>
    </View>
  );
}

function StepButton({
  label,
  onPress,
  disabled,
}: {
  label: string;
  onPress: () => void;
  disabled: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={({ pressed }) => [
        styles.stepBtn,
        pressed && !disabled && { opacity: 0.6 },
        disabled && { opacity: 0.3 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label === '+' ? 'increase' : 'decrease'}
    >
      <Text style={styles.stepBtnText}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.sm,
    overflow: 'hidden',
  },
  rowActive: {
    borderColor: colors.borderStrong,
  },
  rail: {
    width: 4,
    alignSelf: 'stretch',
  },
  info: {
    flex: 1,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
  },
  infoTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ticker: {
    color: colors.text,
    fontSize: font.md,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  name: {
    color: colors.subtext,
    fontSize: font.xs,
    marginTop: 2,
  },
  meta: {
    color: colors.muted,
    fontSize: font.xs,
    marginTop: 3,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: spacing.sm,
  },
  stepBtn: {
    width: 34,
    height: 34,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    color: colors.text,
    fontSize: 20,
    lineHeight: 22,
    fontWeight: '700',
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.xs,
  },
  input: {
    minWidth: 38,
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    textAlign: 'right',
    paddingVertical: 0,
  },
  percent: {
    color: colors.subtext,
    fontSize: font.sm,
    fontWeight: '700',
    marginLeft: 1,
  },
});
