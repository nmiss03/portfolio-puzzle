// 8-week client contracts: signing, countdown, expiry, renewal.

import { CONTRACT_WEEKS, MAX_ACTIVE_CLIENTS, RuntimeClient } from './gameState';

export function activeCount(clients: Record<string, RuntimeClient>): number {
  return Object.values(clients).filter((c) => c.status === 'signed').length;
}

// The cap defaults to MAX_ACTIVE_CLIENTS but rises with the Assistant upgrade.
export function canSignMore(clients: Record<string, RuntimeClient>, maxActive: number = MAX_ACTIVE_CLIENTS): boolean {
  return activeCount(clients) < maxActive;
}

// Sign a fresh contract (start the 8-week countdown).
export function signContract(client: RuntimeClient, currentWeek: number): RuntimeClient {
  return {
    ...client,
    status: 'signed',
    contractStartWeek: currentWeek,
    contractWeeksRemaining: CONTRACT_WEEKS,
  };
}

// Decrement an active contract; expire it when the countdown reaches 0.
export function tickContract(client: RuntimeClient): RuntimeClient {
  if (client.status !== 'signed') return client;
  const remaining = client.contractWeeksRemaining - 1;
  if (remaining <= 0) return { ...client, contractWeeksRemaining: 0, status: 'expired' };
  return { ...client, contractWeeksRemaining: remaining };
}

// ---------- Contract report cards ----------
// A finished 8-week contract is graded on total return with a small happiness
// adjustment, pays the advisor a tier- and grade-scaled completion bonus, and
// can earn a little reputation. This is the "chapter end" payoff.

export type ContractGrade = 'S' | 'A' | 'B' | 'C' | 'D';

export function gradeContract(allTimePct: number, happiness: number): ContractGrade {
  const score = allTimePct * 100 + (happiness - 50) * 0.05;
  if (score >= 10) return 'S';
  if (score >= 6) return 'A';
  if (score >= 3) return 'B';
  if (score >= 0) return 'C';
  return 'D';
}

const GRADE_MULT: Record<ContractGrade, number> = { S: 2, A: 1.5, B: 1, C: 0.5, D: 0 };
const TIER_BASE_BONUS = [0, 300, 500, 800, 1200]; // index by tier 1..4

export function contractBonus(tier: number, grade: ContractGrade): number {
  const base = TIER_BASE_BONUS[Math.max(1, Math.min(4, tier))];
  return Math.round(base * GRADE_MULT[grade]);
}

export function gradeRepBonus(grade: ContractGrade): number {
  if (grade === 'S' || grade === 'A') return 2;
  if (grade === 'B') return 1;
  return 0;
}
