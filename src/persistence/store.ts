import { createDefaultState } from '../domain/defaults';
import type { GardenState } from '../domain/types';

const SAVE_KEY = 'garden-state-v1';

const isValidState = (value: unknown): value is GardenState => {
  if (!value || typeof value !== 'object') return false;
  const candidate = value as Partial<GardenState>;
  return (
    candidate.schemaVersion === 1 &&
    Array.isArray(candidate.pots) &&
    candidate.pots.length === 3 &&
    !!candidate.inventory &&
    !!candidate.settings &&
    typeof candidate.lastSimulationAt === 'number'
  );
};

export function decodeState(raw: string | null, now = Date.now()): GardenState {
  if (!raw) return createDefaultState(now);
  try {
    const saved: unknown = JSON.parse(raw);
    return isValidState(saved) ? saved : createDefaultState(now);
  } catch {
    return createDefaultState(now);
  }
}

export async function loadState(): Promise<GardenState> {
  try {
    if ('__TAURI_INTERNALS__' in window) {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('mingarden.json', {
        autoSave: true,
        defaults: {},
      });
      const saved = await store.get<unknown>(SAVE_KEY);
      return isValidState(saved) ? saved : createDefaultState();
    }
    return decodeState(localStorage.getItem(SAVE_KEY));
  } catch {
    return createDefaultState();
  }
}

export async function saveState(state: GardenState): Promise<void> {
  try {
    if ('__TAURI_INTERNALS__' in window) {
      const { load } = await import('@tauri-apps/plugin-store');
      const store = await load('mingarden.json', {
        autoSave: true,
        defaults: {},
      });
      await store.set(SAVE_KEY, state);
      await store.save();
      return;
    }
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('MinGarden could not save state', error);
  }
}
