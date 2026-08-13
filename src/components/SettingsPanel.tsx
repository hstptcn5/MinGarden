import type { Settings } from '../domain/types';

export function SettingsPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: Settings;
  onChange: (next: Partial<Settings>) => void;
  onClose: () => void;
}) {
  return (
    <section className="popover settings-panel">
      <header>
        <strong>Garden settings</strong>
        <button className="icon-button" onClick={onClose}>
          ×
        </button>
      </header>
      <label>
        <span>Always visible</span>
        <input
          type="checkbox"
          checked={settings.alwaysVisible}
          onChange={(event) =>
            onChange({ alwaysVisible: event.target.checked })
          }
        />
      </label>
      <label>
        <span>Animation</span>
        <input
          type="checkbox"
          checked={settings.animation}
          onChange={(event) => onChange({ animation: event.target.checked })}
        />
      </label>
      <label>
        <span>Launch on startup</span>
        <input
          type="checkbox"
          checked={settings.launchOnStartup}
          onChange={(event) =>
            onChange({ launchOnStartup: event.target.checked })
          }
        />
      </label>
      {import.meta.env.DEV && (
        <label>
          <span>Time speed</span>
          <select
            value={settings.timeMultiplier}
            onChange={(event) =>
              onChange({
                timeMultiplier: Number(
                  event.target.value,
                ) as Settings['timeMultiplier'],
              })
            }
          >
            <option value="1">1×</option>
            <option value="60">60×</option>
            <option value="600">600×</option>
          </select>
        </label>
      )}
    </section>
  );
}
