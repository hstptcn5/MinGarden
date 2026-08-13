import { describe, expect, it } from 'vitest';
import { createDefaultState, createPlant } from '../src/domain/defaults';
import {
  collectSeed,
  plantSeed,
  removeCaterpillar,
  triggerEvent,
} from '../src/simulation/actions';
import { GAME_BALANCE } from '../src/simulation/balance';
import { simulateGarden } from '../src/simulation/engine';

describe('seed inventory', () => {
  it('consumes one seed when planting and blocks zero inventory', () => {
    const initial = createDefaultState(0);
    const planted = plantSeed(initial, 'pot-1', 'sunflower', 0);
    expect(planted.inventory.sunflower).toBe(0);
    expect(planted.pots[0].plant?.species).toBe('sunflower');
    expect(plantSeed(planted, 'pot-2', 'sunflower', 0)).toBe(planted);
  });

  it('collects one renewable seed only once', () => {
    const initial = createDefaultState(0);
    initial.pots[0].plant = {
      ...createPlant('tulip', 0),
      growth: 100,
      stage: 'bloom',
      bloomedAt: 0,
    };
    const collected = collectSeed(
      initial,
      'pot-1',
      GAME_BALANCE.bloomSeedDelayMs,
    );
    expect(collected.inventory.tulip).toBe(2);
    expect(
      collectSeed(collected, 'pot-1', GAME_BALANCE.bloomSeedDelayMs).inventory
        .tulip,
    ).toBe(2);
  });
});

describe('garden events', () => {
  it('removing a caterpillar restores the normal growth rate', () => {
    const state = createDefaultState(0);
    state.pots[0].plant = {
      ...createPlant('sunflower', 0),
      growth: 20,
      stage: 'sprout',
    };
    const infested = triggerEvent(state, 'caterpillar', 'pot-1', 0);
    const withPest = simulateGarden(infested, 3_600_000).pots[0].plant!.growth;
    const cleared = removeCaterpillar(infested, infested.events[0].id);
    const withoutPest = simulateGarden(cleared, 3_600_000).pots[0].plant!
      .growth;
    expect(withoutPest).toBeGreaterThan(withPest);
  });

  it('only allows butterflies at a blooming plant', () => {
    const state = createDefaultState(0);
    expect(triggerEvent(state, 'butterfly').events).toHaveLength(0);
    state.pots[0].plant = {
      ...createPlant('sunflower', 0),
      growth: 100,
      stage: 'bloom',
      bloomedAt: 0,
    };
    expect(triggerEvent(state, 'butterfly', 'pot-1', 0).events[0].type).toBe(
      'butterfly',
    );
  });
});
