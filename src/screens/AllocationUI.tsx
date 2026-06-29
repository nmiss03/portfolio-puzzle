import React, { useMemo, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Pressable,
} from 'react-native';
import { useRouter, useNavigation } from 'expo-router';

import Button from '../components/Button';
import AllocationRow from '../components/AllocationRow';
import AllocationBar from '../components/AllocationBar';
import { getStocksByIds } from '../data/stocks';
import { summarizeAllocation, Allocations } from '../data/scoring';
import { useGame } from '../state/GameContext';
import { colors, spacing, radius, font } from '../theme';

type Values = Record<string, string>;

export default function AllocationUI() {
  const router = useRouter();
  const navigation = useNavigation();
  const { level, allocations, saveAllocations, submitAllocations } = useGame();
  const stocks = useMemo(() => getStocksByIds(level.stockIds), [level]);

  // Local editable state: stock id -> string percent ("" means 0).
  const [values, setValues] = useState<Values>(() => {
    const init: Values = {};
    stocks.forEach((s) => {
      const v = allocations[s.id];
      init[s.id] = v ? String(v) : '';
    });
    return init;
  });

  const toNumeric = (vals: Values): Allocations => {
    const numeric: Allocations = {};
    stocks.forEach((s) => (numeric[s.id] = Number(vals[s.id]) || 0));
    return numeric;
  };

  // Keep edits in the shared store so they survive navigating back & forth.
  useEffect(() => {
    saveAllocations(toNumeric(values));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  // A "Reset" action in the header.
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Pressable onPress={resetAll} hitSlop={8} accessibilityRole="button">
          <Text style={styles.reset}>Reset</Text>
        </Pressable>
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigation]);

  const handleChange = (id: string, next: string) =>
    setValues((prev) => ({ ...prev, [id]: next }));

  const resetAll = () => {
    const cleared: Values = {};
    stocks.forEach((s) => (cleared[s.id] = ''));
    setValues(cleared);
  };

  const { byCategory, total } = useMemo(() => summarizeAllocation(values, stocks), [values, stocks]);
  const remaining = 100 - total;
  const isValid = total === 100;
  const totalColor = isValid ? colors.success : total > 100 ? colors.danger : colors.warning;

  const submit = () => {
    if (!isValid) return;
    submitAllocations(toNumeric(values));
    router.push('/ResultScreen');
  };

  return (
    <View style={styles.screen}>
      {/* Live summary */}
      <View style={styles.summary}>
        <View style={styles.summaryTop}>
          <Text style={styles.summaryLabel}>Total allocated</Text>
          <Text style={[styles.summaryTotal, { color: totalColor }]}>{total}%</Text>
        </View>
        <AllocationBar byCategory={byCategory} total={total} height={12} />
        <Text style={[styles.remaining, { color: totalColor }]}>
          {isValid
            ? '✓ Fully allocated — ready to submit'
            : total > 100
            ? `${Math.abs(remaining)}% over — remove some`
            : `${remaining}% left to allocate`}
        </Text>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {stocks.map((stock) => (
            <AllocationRow
              key={stock.id}
              stock={stock}
              value={values[stock.id]}
              onChange={handleChange}
            />
          ))}
        </ScrollView>

        <View style={styles.footer}>
          <Button
            title={isValid ? 'Submit Portfolio' : `Allocate 100% (${total}%)`}
            onPress={submit}
            disabled={!isValid}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingTop: spacing.md,
  },
  flex: {
    flex: 1,
  },
  reset: {
    color: colors.subtext,
    fontSize: font.sm,
    fontWeight: '700',
  },
  summary: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  summaryTop: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    color: colors.subtext,
    fontSize: font.md,
    fontWeight: '600',
  },
  summaryTotal: {
    fontSize: font.xxl,
    fontWeight: '900',
  },
  remaining: {
    fontSize: font.sm,
    fontWeight: '700',
    marginTop: spacing.md,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
