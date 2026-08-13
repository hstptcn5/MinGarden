import { SPECIES_IDS, type SpeciesId } from '../domain/types';
import { PLANT_SPECIES } from '../simulation/balance';

const icon: Record<SpeciesId, string> = {
  sunflower: '🌻',
  tulip: '🌷',
  succulent: '🌵',
};

export function SeedPicker({
  inventory,
  onPlant,
}: {
  inventory: Record<SpeciesId, number>;
  onPlant: (species: SpeciesId) => void;
}) {
  return (
    <section className="popover seed-picker">
      <strong>Choose a seed</strong>
      {SPECIES_IDS.map((id) => (
        <button
          key={id}
          disabled={inventory[id] === 0}
          onClick={() => onPlant(id)}
        >
          <span>{icon[id]}</span>
          <span>{PLANT_SPECIES[id].name}</span>
          <small>×{inventory[id]}</small>
        </button>
      ))}
    </section>
  );
}
