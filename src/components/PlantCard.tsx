import type { Plant, SpeciesId } from '../domain/types';
import { PLANT_SPECIES } from '../simulation/balance';

interface Props {
  plant: Plant;
  onWater: () => void;
  onFertilize: () => void;
  onCollect: () => void;
}

const icon: Record<SpeciesId, string> = {
  sunflower: '🌻',
  tulip: '🌷',
  succulent: '🌵',
};

function Meter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: string;
}) {
  return (
    <div className="meter-row">
      <span>{label}</span>
      <div className="meter">
        <i style={{ width: `${Math.round(value)}%`, background: tone }} />
      </div>
      <b>{Math.round(value)}%</b>
    </div>
  );
}

export function PlantCard({ plant, onWater, onFertilize, onCollect }: Props) {
  const species = PLANT_SPECIES[plant.species];
  const canCollect = plant.stage === 'bloom' && !plant.seedCollected;
  return (
    <section
      className="popover plant-card"
      aria-label={`${species.name} details`}
    >
      <header>
        <span>{icon[plant.species]}</span>
        <div>
          <strong>{species.name}</strong>
          <small>{plant.stage}</small>
        </div>
      </header>
      <Meter label="Water" value={plant.water} tone="#65b9dc" />
      <Meter label="Nutrients" value={plant.nutrients} tone="#83b66d" />
      <Meter label="Health" value={plant.health} tone="#e78286" />
      <Meter label="Growth" value={plant.growth} tone="#e6b95e" />
      <footer>
        <button onClick={onWater}>💧 Water</button>
        <button onClick={onFertilize}>🌱 Fertilize</button>
        {canCollect && (
          <button className="collect" onClick={onCollect}>
            ✨ Collect seed
          </button>
        )}
      </footer>
    </section>
  );
}
