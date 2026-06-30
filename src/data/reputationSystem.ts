// Advisor reputation: a 0-100 score driven by weekly returns and client
// happiness milestones. Hitting 0 ends the game.

export const STARTING_REPUTATION = 22;

export interface RepChange {
  amount: number;
  reason: string;
}

// Per-client milestone flags so a bonus/penalty is applied once and reversed
// only when the client genuinely backslides.
export interface Milestone {
  h75: boolean; // +3 bonus currently applied for happiness >= 75
  h100: boolean; // +3 bonus permanently earned for hitting 100
  p25: boolean; // -3 penalty currently applied for happiness <= 25
}

export type MilestoneMap = Record<string, Milestone>;

export function emptyMilestone(): Milestone {
  return { h75: false, h100: false, p25: false };
}

export interface ActiveSnapshot {
  clientId: string;
  name: string;
  happiness: number;
  returnPct: number;
}

export interface ReputationResult {
  newReputation: number;
  changes: RepChange[];
  milestones: MilestoneMap;
}

function returnsChange(avgReturnPct: number): RepChange | null {
  if (avgReturnPct > 0.02) return { amount: 3, reason: `Excellent returns (${(avgReturnPct * 100).toFixed(1)}% avg)` };
  if (avgReturnPct > 0.005) return { amount: 2, reason: `Strong returns (${(avgReturnPct * 100).toFixed(1)}% avg)` };
  if (avgReturnPct >= 0) return { amount: 1, reason: `Positive returns (${(avgReturnPct * 100).toFixed(1)}% avg)` };
  if (avgReturnPct > -0.005) return { amount: -1, reason: `Slightly negative returns (${(avgReturnPct * 100).toFixed(1)}% avg)` };
  if (avgReturnPct > -0.02) return { amount: -2, reason: `Weak returns (${(avgReturnPct * 100).toFixed(1)}% avg)` };
  return { amount: -3, reason: `Poor returns (${(avgReturnPct * 100).toFixed(1)}% avg)` };
}

export function calculateWeeklyReputation(
  prevReputation: number,
  milestones: MilestoneMap,
  active: ActiveSnapshot[],
  firedNames: string[]
): ReputationResult {
  const changes: RepChange[] = [];
  let delta = 0;
  const next: MilestoneMap = {};
  Object.keys(milestones).forEach((k) => (next[k] = { ...milestones[k] }));

  // 1) Returns
  if (active.length > 0) {
    const avg = active.reduce((s, a) => s + a.returnPct, 0) / active.length;
    const rc = returnsChange(avg);
    if (rc) {
      delta += rc.amount;
      changes.push(rc);
    }
  }

  // 2) Happiness milestones (event-based)
  active.forEach((a) => {
    const m = next[a.clientId] || emptyMilestone();
    // 100 — earned once, never removed
    if (a.happiness >= 100 && !m.h100) {
      delta += 3; m.h100 = true; changes.push({ amount: 3, reason: `${a.name} reached 100% happiness` });
    }
    // 75 — applied while >=75, removed if it slips below
    if (a.happiness >= 75 && !m.h75) {
      delta += 3; m.h75 = true; changes.push({ amount: 3, reason: `${a.name} hit a happiness milestone (75+)` });
    } else if (a.happiness < 75 && m.h75) {
      delta -= 3; m.h75 = false; changes.push({ amount: -3, reason: `${a.name} happiness dropped below 75` });
    }
    // 25 — penalty while <=25, removed on recovery
    if (a.happiness <= 25 && !m.p25) {
      delta -= 3; m.p25 = true; changes.push({ amount: -3, reason: `${a.name} happiness fell below 25` });
    } else if (a.happiness > 25 && m.p25) {
      delta += 3; m.p25 = false; changes.push({ amount: 3, reason: `${a.name} happiness recovered above 25` });
    }
    next[a.clientId] = m;
  });

  // 3) Fired clients
  firedNames.forEach((name) => {
    delta -= 10;
    changes.push({ amount: -10, reason: `${name} fired you (happiness hit 0)` });
  });

  const newReputation = Math.max(0, Math.min(100, prevReputation + delta));
  return { newReputation, changes, milestones: next };
}

export function repColor(rep: number): string {
  if (rep <= 0) return '#999999';
  if (rep < 25) return '#ef4444';
  if (rep < 50) return '#f59e0b';
  if (rep < 75) return '#4a90e2';
  return '#22c55e';
}
