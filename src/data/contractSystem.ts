// 8-week client contracts: signing, countdown, expiry, renewal.

import { CONTRACT_WEEKS, MAX_ACTIVE_CLIENTS, RuntimeClient } from './gameState';

export function activeCount(clients: Record<string, RuntimeClient>): number {
  return Object.values(clients).filter((c) => c.status === 'signed').length;
}

export function canSignMore(clients: Record<string, RuntimeClient>): boolean {
  return activeCount(clients) < MAX_ACTIVE_CLIENTS;
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
