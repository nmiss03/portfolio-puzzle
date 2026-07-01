// Tiny JSON persistence with no native dependency: uses web localStorage when
// available, otherwise an in-memory map (so it still works for the session on
// native). Used to autosave the game so the title screen can offer "Continue".

const memory: Record<string, string> = {};

function backend(): Storage | null {
  try {
    // @ts-ignore - localStorage exists on web only
    if (typeof localStorage !== 'undefined' && localStorage) return localStorage as Storage;
  } catch {
    // ignore
  }
  return null;
}

export function loadJSON<T>(key: string): T | null {
  try {
    const store = backend();
    const raw = store ? store.getItem(key) : memory[key];
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    const raw = JSON.stringify(value);
    const store = backend();
    if (store) store.setItem(key, raw);
    else memory[key] = raw;
  } catch {
    // ignore (quota / serialization)
  }
}

export function removeKey(key: string): void {
  try {
    const store = backend();
    if (store) store.removeItem(key);
    else delete memory[key];
  } catch {
    // ignore
  }
}
