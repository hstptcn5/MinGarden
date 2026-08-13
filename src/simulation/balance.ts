import type { PlantSpecies, PlantStage, SpeciesId } from '../domain/types';

export const GAME_BALANCE = {
  simulationStepMs: 5 * 60 * 1000,
  maxOfflineMs: 7 * 24 * 60 * 60 * 1000,
  minimumHealth: 12,
  waterAmount: 38,
  fertilizerAmount: 32,
  healthRecoveryPerHour: 5,
  healthLossPerHour: 7,
  caterpillarGrowthMultiplier: 0.62,
  bloomSeedDelayMs: 30 * 60 * 1000,
  butterflyVisitMs: 45 * 1000,
} as const;

export const PLANT_SPECIES: Record<SpeciesId, PlantSpecies> = {
  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    waterDrainPerHour: 10,
    nutrientDrainPerHour: 2.5,
    growthPerHour: 18,
    preferredWaterMin: 32,
    preferredWaterMax: 100,
    colors: { flower: 0xffd447, leaf: 0x4f9d58, accent: 0x7a4a25 },
  },
  tulip: {
    id: 'tulip',
    name: 'Tulip',
    waterDrainPerHour: 9,
    nutrientDrainPerHour: 2.2,
    growthPerHour: 15,
    preferredWaterMin: 30,
    preferredWaterMax: 100,
    colors: { flower: 0xff6f91, leaf: 0x4f9d58, accent: 0xf7b4c6 },
  },
  succulent: {
    id: 'succulent',
    name: 'Succulent',
    waterDrainPerHour: 4,
    nutrientDrainPerHour: 1.4,
    growthPerHour: 11,
    preferredWaterMin: 18,
    preferredWaterMax: 100,
    colors: { flower: 0xa887d8, leaf: 0x63b58e, accent: 0xbedeb5 },
  },
};

export const stageForGrowth = (growth: number): PlantStage => {
  if (growth >= 100) return 'bloom';
  if (growth >= 72) return 'mature';
  if (growth >= 42) return 'young';
  if (growth >= 16) return 'sprout';
  return 'seed';
};
