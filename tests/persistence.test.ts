import { describe, expect, it } from 'vitest';
import { createDefaultState } from '../src/domain/defaults';
import { decodeState } from '../src/persistence/store';

describe('save compatibility', () => {
  it('loads a valid versioned save', () => {
    const state = createDefaultState(100);
    state.inventory.sunflower = 4;
    expect(decodeState(JSON.stringify(state), 999).inventory.sunflower).toBe(4);
  });

  it('initializes defaults for a missing save', () => {
    expect(decodeState(null, 123).lastSimulationAt).toBe(123);
  });

  it('falls back safely for malformed or incompatible data', () => {
    expect(decodeState('{oops', 456).lastSimulationAt).toBe(456);
    expect(decodeState('{"schemaVersion":99}', 789).schemaVersion).toBe(1);
  });
});
