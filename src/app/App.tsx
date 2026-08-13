import { useCallback, useEffect, useMemo, useState } from 'react';
import { enable, disable } from '@tauri-apps/plugin-autostart';
import { GardenCanvas } from '../garden/GardenCanvas';
import { DebugPanel } from '../components/DebugPanel';
import { PlantCard } from '../components/PlantCard';
import { SeedPicker } from '../components/SeedPicker';
import { SettingsPanel } from '../components/SettingsPanel';
import { useGarden } from '../state/useGarden';

export function App() {
  const garden = useGarden();
  const [selectedPotId, setSelectedPotId] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [careEffect, setCareEffect] = useState<{
    potId: string;
    kind: 'water' | 'fertilize';
    key: number;
  } | null>(null);
  const selectedPot = useMemo(
    () => garden.state.pots.find((pot) => pot.id === selectedPotId) ?? null,
    [garden.state.pots, selectedPotId],
  );
  const selectPot = useCallback((potId: string) => {
    setShowSettings(false);
    setSelectedPotId((current) => (current === potId ? null : potId));
  }, []);
  const removePest = useCallback(
    (eventId: string) => garden.removePest(eventId),
    [garden],
  );

  useEffect(() => {
    if (!('__TAURI_INTERNALS__' in window)) return;
    const windowSettings = async () => {
      const { getCurrentWindow } = await import('@tauri-apps/api/window');
      await getCurrentWindow().setAlwaysOnTop(
        garden.state.settings.alwaysVisible,
      );
    };
    void windowSettings();
  }, [garden.state.settings.alwaysVisible]);

  useEffect(() => {
    const openSettings = () => {
      setSelectedPotId(null);
      setShowSettings(true);
    };
    window.addEventListener('mingarden:settings', openSettings);
    return () => window.removeEventListener('mingarden:settings', openSettings);
  }, []);

  const changeSettings = async (
    next: Partial<typeof garden.state.settings>,
  ) => {
    garden.settings(next);
    if ('launchOnStartup' in next && '__TAURI_INTERNALS__' in window) {
      try {
        await (next.launchOnStartup ? enable() : disable());
      } catch (error) {
        console.warn('Autostart setting unavailable', error);
      }
    }
  };

  const showCareEffect = (potId: string, kind: 'water' | 'fertilize') => {
    setCareEffect({ potId, kind, key: Date.now() });
    window.setTimeout(() => setCareEffect(null), 850);
  };

  if (!garden.ready)
    return <main className="app-shell loading">Growing your tiny garden…</main>;

  return (
    <main
      className="app-shell"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) {
          setSelectedPotId(null);
          setShowSettings(false);
        }
      }}
    >
      <button
        className="settings-button"
        aria-label="Settings"
        onClick={() => {
          setSelectedPotId(null);
          setShowSettings((value) => !value);
        }}
      >
        ⚙
      </button>
      <GardenCanvas
        state={garden.state}
        selectedPotId={selectedPotId}
        onSelectPot={selectPot}
        onRemovePest={removePest}
      />
      {careEffect && (
        <div
          key={careEffect.key}
          className={`care-effect ${careEffect.kind}`}
          style={{
            left: `${[155, 360, 565][garden.state.pots.findIndex((pot) => pot.id === careEffect.potId)]}px`,
          }}
          aria-hidden="true"
        >
          {careEffect.kind === 'water' ? (
            <>
              <i>💧</i>
              <i>💧</i>
              <i>💧</i>
            </>
          ) : (
            <>
              <i>✨</i>
              <i>🌱</i>
            </>
          )}
        </div>
      )}
      {selectedPot && (
        <div className="card-anchor">
          {selectedPot.plant ? (
            <PlantCard
              plant={selectedPot.plant}
              onWater={() => {
                garden.water(selectedPot.id);
                showCareEffect(selectedPot.id, 'water');
              }}
              onFertilize={() => {
                garden.fertilize(selectedPot.id);
                showCareEffect(selectedPot.id, 'fertilize');
              }}
              onCollect={() => garden.collect(selectedPot.id)}
            />
          ) : (
            <SeedPicker
              inventory={garden.state.inventory}
              onPlant={(species) => garden.plant(selectedPot.id, species)}
            />
          )}
        </div>
      )}
      {showSettings && (
        <div className="settings-anchor">
          <SettingsPanel
            settings={garden.state.settings}
            onChange={(next) => void changeSettings(next)}
            onClose={() => setShowSettings(false)}
          />
        </div>
      )}
      <DebugPanel
        onTrigger={(type) => garden.trigger(type, selectedPotId ?? undefined)}
        onAdvance={() => selectedPotId && garden.advanceStage(selectedPotId)}
        onReset={garden.reset}
      />
    </main>
  );
}
