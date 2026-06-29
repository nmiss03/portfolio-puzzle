import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';

import LEVELS from '../data/levels';
import Badge from '../components/Badge';
import { colors, spacing, radius, font } from '../theme';

const difficultyColor = {
  Easy: colors.success,
  Medium: colors.warning,
  Hard: colors.danger,
};

export default function LevelSelect({ onSelectLevel }) {
  return (
    <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <Text style={styles.kicker}>PORTFOLIO PUZZLE</Text>
        <Text style={styles.title}>Be the Advisor</Text>
        <Text style={styles.subtitle}>
          Read each client's profile, then build the portfolio that fits them best. Match the
          ideal allocation to score 100.
        </Text>
      </View>

      {LEVELS.map((level) => {
        const locked = level.locked;
        return (
          <Pressable
            key={level.id}
            disabled={locked}
            onPress={() => onSelectLevel(level.id)}
            style={({ pressed }) => [
              styles.card,
              locked && styles.cardLocked,
              pressed && !locked && styles.cardPressed,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: locked }}
          >
            <View style={styles.cardTop}>
              <View style={styles.levelNumWrap}>
                <Text style={[styles.levelNum, locked && styles.dim]}>{level.id}</Text>
              </View>
              <View style={styles.cardBody}>
                <View style={styles.cardTitleRow}>
                  <Text style={[styles.cardTitle, locked && styles.dim]} numberOfLines={1}>
                    {level.name}
                  </Text>
                  <Badge
                    label={locked ? 'Locked' : level.difficulty}
                    color={locked ? colors.muted : difficultyColor[level.difficulty]}
                  />
                </View>
                <Text style={[styles.cardTagline, locked && styles.dim]}>{level.tagline}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              {locked ? (
                <Text style={styles.footerLocked}>🔒 Coming soon</Text>
              ) : (
                <Text style={styles.footerPlay}>Play ›</Text>
              )}
            </View>
          </Pressable>
        );
      })}

      <Text style={styles.note}>Level 1 is ready to play. Levels 2 & 3 are on the way.</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  hero: {
    marginTop: spacing.lg,
    marginBottom: spacing.xl,
  },
  kicker: {
    color: colors.primary,
    fontSize: font.sm,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.text,
    fontSize: font.display,
    fontWeight: '900',
    marginTop: spacing.xs,
  },
  subtitle: {
    color: colors.subtext,
    fontSize: font.md,
    lineHeight: 22,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  cardLocked: {
    opacity: 0.6,
  },
  cardPressed: {
    borderColor: colors.primary,
    transform: [{ scale: 0.995 }],
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  levelNumWrap: {
    width: 46,
    height: 46,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceAlt,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  levelNum: {
    color: colors.text,
    fontSize: font.xl,
    fontWeight: '900',
  },
  cardBody: {
    flex: 1,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    flex: 1,
    color: colors.text,
    fontSize: font.lg,
    fontWeight: '800',
    marginRight: spacing.sm,
  },
  cardTagline: {
    color: colors.subtext,
    fontSize: font.sm,
    marginTop: spacing.xs,
    lineHeight: 18,
  },
  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    alignItems: 'flex-end',
  },
  footerPlay: {
    color: colors.primary,
    fontSize: font.md,
    fontWeight: '800',
  },
  footerLocked: {
    color: colors.muted,
    fontSize: font.sm,
    fontWeight: '700',
  },
  dim: {
    color: colors.muted,
  },
  note: {
    color: colors.muted,
    fontSize: font.sm,
    textAlign: 'center',
    marginTop: spacing.md,
  },
});
