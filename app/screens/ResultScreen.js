import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';

import Header from '../components/Header';
import Button from '../components/Button';
import AllocationBar from '../components/AllocationBar';
import { getLevel } from '../data/levels';
import { colors, spacing, radius, font } from '../theme';

const toneColor = {
  success: colors.success,
  warning: colors.warning,
  info: colors.primary,
};

export default function ResultScreen({ level, result, onRetry, onNextLevel, onHome }) {
  const nextLevel = getLevel(level.id + 1);
  const hasNext = !!nextLevel;
  const nextLocked = nextLevel ? nextLevel.locked : true;

  return (
    <View style={styles.screen}>
      <Header title="Results" subtitle={`Level ${level.id} · ${level.name}`} onBack={onHome} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Score hero */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>YOUR SCORE</Text>
          <View style={styles.scoreRow}>
            <Text style={[styles.scoreValue, { color: result.ratingColor }]}>{result.score}</Text>
            <Text style={styles.scoreMax}>/100</Text>
          </View>
          <View style={[styles.ratingPill, { backgroundColor: result.ratingColor }]}>
            <Text style={styles.ratingText}>{result.rating}</Text>
          </View>
          <Text style={styles.headline}>{result.headline}</Text>
        </View>

        {/* Your mix vs target */}
        <Text style={styles.sectionLabel}>YOUR MIX vs. TARGET</Text>
        <View style={styles.card}>
          <Text style={styles.compareLabel}>Your portfolio</Text>
          <AllocationBar byCategory={result.byCategory} total={100} />
          <View style={styles.divider} />
          <Text style={styles.compareLabel}>Ideal for this client</Text>
          <AllocationBar byCategory={result.ideal} total={100} />

          <View style={styles.splitRow}>
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>Your stocks / bonds</Text>
              <Text style={styles.splitValue}>
                {Math.round(result.byAssetClass.stock)}% / {Math.round(result.byAssetClass.bond)}%
              </Text>
            </View>
            <View style={styles.splitItem}>
              <Text style={styles.splitLabel}>Target stocks / bonds</Text>
              <Text style={[styles.splitValue, { color: colors.primary }]}>
                {Math.round(result.idealAssetClass.stock)}% / {Math.round(result.idealAssetClass.bond)}%
              </Text>
            </View>
          </View>
        </View>

        {/* Feedback */}
        <Text style={styles.sectionLabel}>FEEDBACK</Text>
        {result.messages.map((m, i) => (
          <View key={i} style={[styles.feedback, { borderLeftColor: toneColor[m.tone] || colors.primary }]}>
            <Text style={[styles.feedbackTitle, { color: toneColor[m.tone] || colors.primary }]}>
              {m.title}
            </Text>
            <Text style={styles.feedbackText}>{m.text}</Text>
          </View>
        ))}
      </ScrollView>

      <View style={styles.footer}>
        {hasNext && (
          <Button
            title={nextLocked ? `Next: ${nextLevel.name} (Coming Soon)` : `Next Level: ${nextLevel.name}  ›`}
            onPress={() => onNextLevel(nextLevel.id)}
            disabled={nextLocked}
            variant="primary"
          />
        )}
        <View style={styles.footerRow}>
          <Button title="Try Again" onPress={onRetry} variant="secondary" style={styles.footerBtn} />
          <Button title="All Levels" onPress={onHome} variant="secondary" style={styles.footerBtn} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xl,
  },
  scoreCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.sm,
  },
  scoreValue: {
    fontSize: 72,
    fontWeight: '900',
    lineHeight: 76,
  },
  scoreMax: {
    color: colors.muted,
    fontSize: font.xl,
    fontWeight: '700',
    marginLeft: spacing.xs,
  },
  ratingPill: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginTop: spacing.md,
  },
  ratingText: {
    color: colors.white,
    fontSize: font.sm,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  headline: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: spacing.md,
  },
  sectionLabel: {
    color: colors.muted,
    fontSize: font.xs,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.lg,
  },
  compareLabel: {
    color: colors.subtext,
    fontSize: font.sm,
    fontWeight: '700',
    marginBottom: spacing.sm,
  },
  divider: {
    height: spacing.lg,
  },
  splitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  splitItem: {
    flex: 1,
  },
  splitLabel: {
    color: colors.muted,
    fontSize: font.xs,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  splitValue: {
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    marginTop: 3,
  },
  feedback: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderLeftWidth: 4,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  feedbackTitle: {
    fontSize: font.md,
    fontWeight: '800',
    marginBottom: spacing.xs,
  },
  feedbackText: {
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
  footerRow: {
    flexDirection: 'row',
    marginTop: spacing.md,
  },
  footerBtn: {
    flex: 1,
    marginHorizontal: spacing.xs,
  },
});
