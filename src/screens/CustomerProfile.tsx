import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';

import Button from '../components/Button';
import Badge from '../components/Badge';
import { useGame } from '../state/GameContext';
import { RiskTolerance } from '../data/levels';
import { colors, spacing, radius, font } from '../theme';
import { formatMoney } from '../utils/format';

const riskColor: Record<RiskTolerance, string> = {
  Low: colors.bond,
  Moderate: colors.warning,
  High: colors.danger,
};

export default function CustomerProfile() {
  const router = useRouter();
  const { level } = useGame();
  const c = level.customer;

  if (!c) {
    return (
      <View style={styles.emptyScreen}>
        <Text style={styles.emptyText}>This level is not available yet.</Text>
      </View>
    );
  }

  const facts = [
    { label: 'Age', value: `${c.age}` },
    { label: 'Income', value: `${formatMoney(c.salary)}/yr` },
    { label: 'Dependents', value: `${c.dependents}` },
    { label: 'Time Horizon', value: `${c.horizonYears} yrs` },
  ];

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Identity card */}
        <View style={styles.card}>
          <View style={styles.identityRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(c.name)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name}>{c.name}</Text>
              <Text style={styles.occupation}>{c.occupation}</Text>
            </View>
            <Badge label={`Risk: ${c.riskTolerance}`} color={riskColor[c.riskTolerance]} />
          </View>

          <View style={styles.factsGrid}>
            {facts.map((f) => (
              <View key={f.label} style={styles.fact}>
                <Text style={styles.factLabel}>{f.label}</Text>
                <Text style={styles.factValue}>{f.value}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Goal */}
        <Text style={styles.sectionLabel}>THE GOAL</Text>
        <View style={[styles.card, styles.goalCard]}>
          <Text style={styles.goalTitle}>{c.goal}</Text>
          <Text style={styles.goalTarget}>{c.targetSummary}</Text>
        </View>

        {/* Summary */}
        <Text style={styles.sectionLabel}>THE SITUATION</Text>
        <View style={styles.card}>
          <Text style={styles.summary}>{c.summary}</Text>
        </View>

        {/* Hints */}
        <Text style={styles.sectionLabel}>WHAT TO CONSIDER</Text>
        <View style={styles.card}>
          {c.notes.map((note, i) => (
            <View key={i} style={[styles.noteRow, i === c.notes.length - 1 && { marginBottom: 0 }]}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.noteText}>{note}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button title="View the Stocks  ›" onPress={() => router.push('/stocks')} />
      </View>
    </View>
  );
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  emptyScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  emptyText: {
    color: colors.subtext,
    fontSize: font.md,
  },
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  identityRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: font.lg,
    fontWeight: '900',
  },
  name: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '900',
  },
  occupation: {
    color: colors.subtext,
    fontSize: font.sm,
    marginTop: 2,
  },
  factsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  fact: {
    width: '50%',
    paddingVertical: spacing.sm,
  },
  factLabel: {
    color: colors.muted,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  factValue: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    marginTop: 2,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  goalCard: {
    backgroundColor: colors.surfaceAlt,
    borderColor: colors.borderStrong,
  },
  goalTitle: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
  },
  goalTarget: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  summary: {
    color: colors.subtext,
    fontSize: font.md,
    lineHeight: 23,
  },
  noteRow: {
    flexDirection: 'row',
    marginBottom: spacing.sm,
  },
  bullet: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: '900',
    marginRight: spacing.sm,
    lineHeight: 21,
  },
  noteText: {
    flex: 1,
    color: colors.subtext,
    fontSize: font.md,
    lineHeight: 21,
  },
  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.bg,
  },
});
