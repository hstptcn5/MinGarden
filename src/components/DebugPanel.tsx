import type { InsectType } from '../domain/types';

export function DebugPanel({
  onTrigger,
  onAdvance,
  onReset,
}: {
  onTrigger: (type: InsectType) => void;
  onAdvance: () => void;
  onReset: () => void;
}) {
  if (!import.meta.env.DEV) return null;
  return (
    <details className="debug-panel">
      <summary>Debug</summary>
      <div>
        <button onClick={() => onTrigger('butterfly')}>Butterfly</button>
        <button onClick={() => onTrigger('caterpillar')}>Caterpillar</button>
        <button onClick={onAdvance}>Advance stage</button>
        <button onClick={onReset}>Reset</button>
      </div>
    </details>
  );
}
