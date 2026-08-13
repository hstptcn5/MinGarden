import { describe, expect, it } from 'vitest';
import { createDefaultState, createPlant } from '../src/domain/defaults';
import { GAME_BALANCE, stageForGrowth } from '../src/simulation/balance';
import { simulateGarden, simulatePlant } from '../src/simulation/engine';

const hour = 3_600_000;

describe('plant simulation', () => {
  it('drains water and nutrients while a healthy plant grows', () => {
    const plant = createPlant('sunflower', 0);
    const next = simulatePlant(plant, hour, []);
    expect(next.water).toBeLessThan(plant.water);
    expect(next.nutrients).toBeLessThan(plant.nutrients);
    expect(next.growth).toBeGreaterThan(0);
  });

  it('grows more slowly while thirsty', () => {
    const healthy = { ...createPlant('sunflower', 0), water: 80 };
    const thirsty = { ...healthy, water: 15 };
    expect(simulatePlant(thirsty, hour, []).growth).toBeLessThan(
      simulatePlant(healthy, hour, []).growth,
    );
  });

  it('recovers health after care and never dies permanently', () => {
    const recovering = {
      ...createPlant('tulip', 0),
      water: 90,
      nutrients: 80,
      health: 30,
    };
    expect(simulatePlant(recovering, hour, []).health).toBeGreaterThan(30);
    const neglected = { ...recovering, water: 0, nutrients: 0, health: 13 };
    expect(simulatePlant(neglected, 100 * hour, []).health).toBe(
      GAME_BALANCE.minimumHealth,
    );
  });

  it('maps growth to all five stages', () => {
    expect([0, 16, 42, 72, 100].map(stageForGrowth)).toEqual([
      'seed',
      'sprout',
      'young',
      'mature',
      'bloom',
    ]);
  });

  it('caterpillars reduce growth', () => {
    const plant = createPlant('sunflower', 0);
    const pest = {
      id: 'bug',
      type: 'caterpillar' as const,
      potId: 'pot-1',
      startedAt: 0,
      endsAt: null,
    };
    expect(simulatePlant(plant, hour, [pest]).growth).toBeLessThan(
      simulatePlant(plant, hour, []).growth,
    );
  });
});

describe('offline progress', () => {
  it('advances from elapsed milliseconds', () => {
    const state = createDefaultState(0);
    state.pots[0].plant = createPlant('sunflower', 0);
    const next = simulateGarden(state, hour);
    expect(next.lastSimulationAt).toBe(hour);
    expect(next.pots[0].plant?.growth).toBeGreaterThan(0);
  });

  it('bounds very long offline durations', () => {
    const state = createDefaultState(0);
    const next = simulateGarden(state, 365 * 24 * hour);
    expect(next.lastSimulationAt).toBe(GAME_BALANCE.maxOfflineMs);
  });
});
