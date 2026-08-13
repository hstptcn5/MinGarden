import { createPlant } from '../domain/defaults';
import type {
  GardenEvent,
  GardenState,
  InsectType,
  Settings,
  SpeciesId,
} from '../domain/types';
import { GAME_BALANCE } from './balance';

const updatePlant = (
  state: GardenState,
  potId: string,
  update: (
    plant: NonNullable<GardenState['pots'][number]['plant']>,
  ) => NonNullable<GardenState['pots'][number]['plant']>,
): GardenState => ({
  ...state,
  pots: state.pots.map((pot) =>
    pot.id === potId && pot.plant ? { ...pot, plant: update(pot.plant) } : pot,
  ),
});

export function plantSeed(
  state: GardenState,
  potId: string,
  species: SpeciesId,
  now = Date.now(),
): GardenState {
  const pot = state.pots.find((candidate) => candidate.id === potId);
  if (!pot || pot.plant || state.inventory[species] < 1) return state;
  return {
    ...state,
    inventory: { ...state.inventory, [species]: state.inventory[species] - 1 },
    pots: state.pots.map((candidate) =>
      candidate.id === potId
        ? { ...candidate, plant: createPlant(species, now) }
        : candidate,
    ),
  };
}

export const waterPlant = (state: GardenState, potId: string): GardenState =>
  updatePlant(state, potId, (plant) => ({
    ...plant,
    water: Math.min(100, plant.water + GAME_BALANCE.waterAmount),
    health: Math.min(100, plant.health + 3),
  }));

export const fertilizePlant = (
  state: GardenState,
  potId: string,
): GardenState =>
  updatePlant(state, potId, (plant) => ({
    ...plant,
    nutrients: Math.min(100, plant.nutrients + GAME_BALANCE.fertilizerAmount),
    health: Math.min(100, plant.health + 2),
  }));

export function collectSeed(
  state: GardenState,
  potId: string,
  now = Date.now(),
): GardenState {
  const pot = state.pots.find((candidate) => candidate.id === potId);
  const plant = pot?.plant;
  if (
    !plant ||
    plant.stage !== 'bloom' ||
    plant.seedCollected ||
    plant.bloomedAt === null ||
    now - plant.bloomedAt < GAME_BALANCE.bloomSeedDelayMs
  )
    return state;
  return {
    ...updatePlant(state, potId, (value) => ({
      ...value,
      seedCollected: true,
    })),
    inventory: {
      ...state.inventory,
      [plant.species]: state.inventory[plant.species] + 1,
    },
  };
}

export function triggerEvent(
  state: GardenState,
  type: InsectType,
  potId?: string,
  now = Date.now(),
): GardenState {
  const eligible = state.pots.filter(
    (pot) =>
      pot.plant &&
      (type === 'caterpillar'
        ? pot.plant.growth >= 16
        : pot.plant.stage === 'bloom'),
  );
  const target = potId ? eligible.find((pot) => pot.id === potId) : eligible[0];
  if (
    !target ||
    state.events.some(
      (event) => event.type === type && event.potId === target.id,
    )
  )
    return state;
  const event: GardenEvent = {
    id: crypto.randomUUID(),
    type,
    potId: target.id,
    startedAt: now,
    endsAt: type === 'butterfly' ? now + GAME_BALANCE.butterflyVisitMs : null,
  };
  return { ...state, events: [...state.events, event] };
}

export const removeCaterpillar = (
  state: GardenState,
  eventId: string,
): GardenState => ({
  ...state,
  events: state.events.filter((event) => event.id !== eventId),
});
export const updateSettings = (
  state: GardenState,
  settings: Partial<Settings>,
): GardenState => ({ ...state, settings: { ...state.settings, ...settings } });
