import { useCallback, useEffect, useRef, useState } from 'react';
import { createDefaultState } from '../domain/defaults';
import type {
  GardenState,
  InsectType,
  Settings,
  SpeciesId,
} from '../domain/types';
import { loadState, saveState } from '../persistence/store';
import {
  collectSeed,
  fertilizePlant,
  plantSeed,
  removeCaterpillar,
  triggerEvent,
  updateSettings,
  waterPlant,
} from '../simulation/actions';
import { simulateGarden, simulatePlant } from '../simulation/engine';

export function useGarden() {
  const [state, setState] = useState<GardenState>(() => createDefaultState());
  const [ready, setReady] = useState(false);
  const lastTick = useRef(0);

  useEffect(() => {
    void loadState().then((saved) => {
      const now = Date.now();
      setState({
        ...simulateGarden(saved, now - saved.lastSimulationAt),
        lastSimulationAt: now,
      });
      lastTick.current = now;
      setReady(true);
    });
  }, []);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setInterval(() => {
      const now = Date.now();
      setState((current) => ({
        ...simulateGarden(
          current,
          (now - lastTick.current) * current.settings.timeMultiplier,
        ),
        lastSimulationAt: now,
      }));
      lastTick.current = now;
    }, 5_000);
    return () => window.clearInterval(timer);
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const timeout = window.setTimeout(() => void saveState(state), 200);
    return () => window.clearTimeout(timeout);
  }, [ready, state]);

  useEffect(() => {
    if (!ready) return;
    const randomEvents = window.setInterval(() => {
      setState((current) => {
        const roll = Math.random();
        if (roll < 0.025) return triggerEvent(current, 'butterfly');
        if (roll < 0.04) return triggerEvent(current, 'caterpillar');
        return current;
      });
    }, 60_000);
    return () => window.clearInterval(randomEvents);
  }, [ready]);

  const mutate = useCallback(
    (operation: (current: GardenState) => GardenState) => setState(operation),
    [],
  );

  return {
    state,
    ready,
    plant: (potId: string, species: SpeciesId) =>
      mutate((current) => plantSeed(current, potId, species)),
    water: (potId: string) => mutate((current) => waterPlant(current, potId)),
    fertilize: (potId: string) =>
      mutate((current) => fertilizePlant(current, potId)),
    collect: (potId: string) =>
      mutate((current) => collectSeed(current, potId)),
    removePest: (eventId: string) =>
      mutate((current) => removeCaterpillar(current, eventId)),
    trigger: (type: InsectType, potId?: string) =>
      mutate((current) => triggerEvent(current, type, potId)),
    settings: (next: Partial<Settings>) =>
      mutate((current) => updateSettings(current, next)),
    advanceStage: (potId: string) =>
      mutate((current) => ({
        ...current,
        pots: current.pots.map((pot) =>
          pot.id === potId && pot.plant
            ? {
                ...pot,
                plant: simulatePlant(
                  pot.plant,
                  2 * 60 * 60 * 1000,
                  current.events.filter((event) => event.potId === potId),
                ),
              }
            : pot,
        ),
      })),
    reset: () => setState(createDefaultState()),
  };
}
