import type { GardenEvent, GardenState, Plant } from '../domain/types';
import { GAME_BALANCE, PLANT_SPECIES, stageForGrowth } from './balance';

const clamp = (value: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, value));

export function simulatePlant(
  plant: Plant,
  elapsedMs: number,
  events: GardenEvent[],
): Plant {
  const hours = elapsedMs / 3_600_000;
  const species = PLANT_SPECIES[plant.species];
  const nextWater = clamp(plant.water - species.waterDrainPerHour * hours);
  const nextNutrients = clamp(
    plant.nutrients - species.nutrientDrainPerHour * hours,
  );
  const waterFactor =
    nextWater >= species.preferredWaterMin
      ? 1
      : nextWater / species.preferredWaterMin;
  const nutrientFactor = nextNutrients >= 25 ? 1 : 0.45 + nextNutrients / 45;
  const isStarving = nextWater < 8 || nextNutrients < 5;
  const nextHealth = clamp(
    plant.health +
      (isStarving
        ? -GAME_BALANCE.healthLossPerHour
        : GAME_BALANCE.healthRecoveryPerHour) *
        hours,
    GAME_BALANCE.minimumHealth,
  );
  const hasPest = events.some((event) => event.type === 'caterpillar');
  const pestFactor = hasPest ? GAME_BALANCE.caterpillarGrowthMultiplier : 1;
  const healthFactor = nextHealth < 30 ? 0.12 : nextHealth / 100;
  const growthGain =
    species.growthPerHour *
    hours *
    waterFactor *
    nutrientFactor *
    pestFactor *
    healthFactor;
  const growth = clamp(plant.growth + growthGain);
  const stage = stageForGrowth(growth);

  return {
    ...plant,
    water: nextWater,
    nutrients: nextNutrients,
    health: nextHealth,
    growth,
    stage,
    lastUpdatedAt: plant.lastUpdatedAt + elapsedMs,
    bloomedAt:
      stage === 'bloom'
        ? (plant.bloomedAt ?? plant.lastUpdatedAt + elapsedMs)
        : null,
  };
}

export function simulateGarden(
  input: GardenState,
  elapsedMs: number,
): GardenState {
  const boundedMs = Math.min(Math.max(0, elapsedMs), GAME_BALANCE.maxOfflineMs);
  if (boundedMs === 0) return input;
  const state = structuredClone(input);
  let remaining = boundedMs;

  while (remaining > 0) {
    const step = Math.min(remaining, GAME_BALANCE.simulationStepMs);
    const stepEnd = state.lastSimulationAt + step;
    state.events = state.events.filter(
      (event) => event.endsAt === null || event.endsAt > stepEnd,
    );
    state.pots = state.pots.map((pot) => ({
      ...pot,
      plant: pot.plant
        ? simulatePlant(
            pot.plant,
            step,
            state.events.filter((event) => event.potId === pot.id),
          )
        : null,
    }));
    state.lastSimulationAt = stepEnd;
    remaining -= step;
  }
  return state;
}

export function progressFromTimestamp(
  state: GardenState,
  now = Date.now(),
): GardenState {
  return simulateGarden(state, now - state.lastSimulationAt);
}
