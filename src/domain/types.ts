export const SPECIES_IDS = ['sunflower', 'tulip', 'succulent'] as const;
export type SpeciesId = (typeof SPECIES_IDS)[number];
export type PlantStage = 'seed' | 'sprout' | 'young' | 'mature' | 'bloom';
export type InsectType = 'butterfly' | 'caterpillar';

export interface PlantSpecies {
  id: SpeciesId;
  name: string;
  waterDrainPerHour: number;
  nutrientDrainPerHour: number;
  growthPerHour: number;
  preferredWaterMin: number;
  preferredWaterMax: number;
  colors: { flower: number; leaf: number; accent: number };
}

export interface Plant {
  id: string;
  species: SpeciesId;
  stage: PlantStage;
  growth: number;
  water: number;
  nutrients: number;
  health: number;
  plantedAt: number;
  lastUpdatedAt: number;
  bloomedAt: number | null;
  seedCollected: boolean;
}

export interface Pot {
  id: string;
  plant: Plant | null;
}

export interface GardenEvent {
  id: string;
  type: InsectType;
  potId: string;
  startedAt: number;
  endsAt: number | null;
}

export interface Settings {
  launchOnStartup: boolean;
  alwaysVisible: boolean;
  animation: boolean;
  timeMultiplier: 1 | 60 | 600;
}

export interface GardenState {
  schemaVersion: 1;
  pots: Pot[];
  inventory: Record<SpeciesId, number>;
  events: GardenEvent[];
  settings: Settings;
  lastSimulationAt: number;
}
