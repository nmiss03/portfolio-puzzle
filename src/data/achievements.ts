// Achievements: celebrations of mastery, not grind. Checked once per resolved
// week against career records and the week's outcome; earned ids are stored in
// state and never revoked. Pure data + predicates — no UI, no side effects.

import { CareerRecords } from './careerRecords';

export interface AchievementContext {
  records: CareerRecords;
  reputation: number; // after this week's changes
  lowestReputation: number; // lowest the career has ever seen
  week: number;
  advisorBalance: number;
  activeHappinesses: number[]; // happiness of surviving signed clients this week
}

export interface AchievementDef {
  id: string;
  icon: string;
  name: string;
  blurb: string;
  check: (ctx: AchievementContext) => boolean;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  // Contracts & grades
  { id: 'first-contract', icon: '📜', name: 'Closed the First One', blurb: 'Complete your first client contract.', check: (c) => c.records.contractsCompleted >= 1 },
  { id: 'five-contracts', icon: '🗂', name: 'Book of Business', blurb: 'Complete five contracts.', check: (c) => c.records.contractsCompleted >= 5 },
  { id: 'fifteen-contracts', icon: '🏛', name: 'Institution', blurb: 'Complete fifteen contracts.', check: (c) => c.records.contractsCompleted >= 15 },
  { id: 'first-s', icon: '🏵', name: 'Gold Standard', blurb: 'Earn an S-grade contract.', check: (c) => c.records.sGrades >= 1 },
  { id: 'five-s', icon: '👑', name: 'Perfectionist', blurb: 'Earn five S-grade contracts.', check: (c) => c.records.sGrades >= 5 },

  // Dreams
  { id: 'first-dream', icon: '🌠', name: 'Dream Maker', blurb: 'Fund a client\'s dream.', check: (c) => c.records.dreamsFunded >= 1 },
  { id: 'five-dreams', icon: '🎆', name: 'Life Changer', blurb: 'Fund five dreams.', check: (c) => c.records.dreamsFunded >= 5 },
  { id: 'ten-dreams', icon: '🌟', name: 'Patron Saint of Plans', blurb: 'Fund ten dreams.', check: (c) => c.records.dreamsFunded >= 10 },

  // Crashes & streaks
  { id: 'swan-1', icon: '🌊', name: 'Storm Rider', blurb: 'Survive a black swan with your career intact.', check: (c) => c.records.swansSurvived >= 1 },
  { id: 'swan-3', icon: '⚓', name: 'Unsinkable', blurb: 'Survive three black swans.', check: (c) => c.records.swansSurvived >= 3 },
  { id: 'swan-6', icon: '🗿', name: 'Made of Weather', blurb: 'Survive six black swans.', check: (c) => c.records.swansSurvived >= 6 },
  { id: 'streak-5', icon: '📈', name: 'On a Roll', blurb: 'Post five green weeks in a row.', check: (c) => c.records.bestGreenStreak >= 5 },
  { id: 'streak-10', icon: '🔥', name: 'Hot Hand', blurb: 'Post ten green weeks in a row.', check: (c) => c.records.bestGreenStreak >= 10 },
  { id: 'big-week', icon: '💥', name: 'The Print', blurb: 'Post a +6% book week.', check: (c) => c.records.bestWeekPct >= 0.06 },

  // Reputation & career
  { id: 'rep-90', icon: '🎖', name: 'Sterling Reputation', blurb: 'Reach 90 reputation.', check: (c) => c.reputation >= 90 },
  { id: 'comeback', icon: '🧗', name: 'Redemption Arc', blurb: 'Climb back to 60 reputation after nearly losing it all (≤15).', check: (c) => c.lowestReputation <= 15 && c.reputation >= 60 },
  { id: 'year-1', icon: '🗓', name: 'Fiscal Survivor', blurb: 'Manage money for a full year (52 weeks).', check: (c) => c.week >= 52 },
  { id: 'year-2', icon: '⏳', name: 'The Long Game', blurb: 'Reach week 104. Two years. One desk.', check: (c) => c.week >= 104 },

  // Money & clients
  { id: 'balance-25k', icon: '💼', name: 'War Chest', blurb: 'Hold $25,000 in advisor funds.', check: (c) => c.advisorBalance >= 25000 },
  { id: 'full-house', icon: '🏠', name: 'Full House', blurb: 'End a week with three clients all at 80+ happiness.', check: (c) => c.activeHappinesses.length >= 3 && c.activeHappinesses.every((h) => h >= 80) },
];

export const achievementsById: Record<string, AchievementDef> = ACHIEVEMENTS.reduce(
  (acc, a) => {
    acc[a.id] = a;
    return acc;
  },
  {} as Record<string, AchievementDef>
);

// Ids newly earned this week (not already in `earned`).
export function checkAchievements(earned: string[], ctx: AchievementContext): string[] {
  const have = new Set(earned);
  return ACHIEVEMENTS.filter((a) => !have.has(a.id) && a.check(ctx)).map((a) => a.id);
}
