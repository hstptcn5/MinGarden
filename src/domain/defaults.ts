import type { GardenState, Plant, SpeciesId } from './types';

export const createPlant = (species: SpeciesId, now = Date.now()): Plant => ({
  id: crypto.randomUUID(),
  species,
  stage: 'seed',
  growth: 0,
  water: 64,
  nutrients: 72,
  health: 100,
  plantedAt: now,
  lastUpdatedAt: now,
  bloomedAt: null,
  seedCollected: false,
});

export const createDefaultState = (now = Date.now()): GardenState => ({
  schemaVersion: 1,
  pots: [0, 1, 2].map((index) => ({ id: `pot-${index + 1}`, plant: null })),
  inventory: { sunflower: 1, tulip: 1, succulent: 1 },
  events: [],
  settings: {
    launchOnStartup: false,
    alwaysVisible: true,
    animation: true,
    timeMultiplier: 1,
  },
  lastSimulationAt: now,
});
