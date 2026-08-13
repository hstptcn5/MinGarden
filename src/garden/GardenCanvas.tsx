import { Application, Container, Graphics } from 'pixi.js';
import { useEffect, useRef } from 'react';
import type {
  GardenEvent,
  GardenState,
  Plant,
  PlantSpecies,
} from '../domain/types';
import { PLANT_SPECIES } from '../simulation/balance';

interface Props {
  state: GardenState;
  selectedPotId: string | null;
  onSelectPot: (potId: string) => void;
  onRemovePest: (eventId: string) => void;
}

const POT_X = [155, 360, 565];

function drawPot(container: Container, x: number, selected: boolean) {
  const shadow = new Graphics()
    .ellipse(x, 139, 49, 7)
    .fill({ color: 0x2c463d, alpha: 0.22 });
  const pot = new Graphics()
    .roundRect(x - 30, 106, 60, 13, 5)
    .fill(selected ? 0xffc68c : 0xd98c5f)
    .moveTo(x - 25, 116)
    .lineTo(x + 25, 116)
    .lineTo(x + 18, 142)
    .lineTo(x - 18, 142)
    .closePath()
    .fill(selected ? 0xe99d68 : 0xbd714d);
  const soil = new Graphics().ellipse(x, 110, 25, 5).fill(0x684532);
  container.addChild(shadow, pot, soil);
}

function leaf(
  graphics: Graphics,
  x: number,
  y: number,
  flip: number,
  color: number,
) {
  graphics.ellipse(x + flip * 8, y, 10, 5).fill(color);
}

function drawPlant(
  container: Container,
  plant: Plant,
  x: number,
  animation: boolean,
) {
  const species: PlantSpecies = PLANT_SPECIES[plant.species];
  const graphics = new Graphics();
  graphics.label = `plant-${plant.id}`;
  const thirsty = plant.water < species.preferredWaterMin;
  const droop = thirsty ? 5 : 0;
  const stageHeight = { seed: 0, sprout: 22, young: 42, mature: 66, bloom: 76 }[
    plant.stage
  ];

  if (plant.stage === 'seed') {
    graphics.ellipse(x, 105, 5, 3).fill(0x8c5b3b);
  } else {
    graphics
      .rect(x - 2, 108 - stageHeight, 4, stageHeight)
      .fill(species.colors.leaf);
    leaf(graphics, x, 95 - droop, -1, species.colors.leaf);
    leaf(graphics, x, 83 + droop, 1, species.colors.leaf);
    if (
      plant.stage === 'young' ||
      plant.stage === 'mature' ||
      plant.stage === 'bloom'
    ) {
      leaf(graphics, x, 69 + droop, -1, species.colors.leaf);
    }
    if (plant.species === 'succulent') {
      graphics.clear();
      for (let i = 0; i < Math.max(3, Math.round(stageHeight / 12)); i += 1) {
        graphics
          .ellipse(x - 8 + (i % 3) * 8, 104 - i * 7, 9, 15)
          .fill(species.colors.leaf);
      }
    }
    if (plant.stage === 'bloom') {
      if (plant.species === 'sunflower') {
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 6) {
          graphics
            .ellipse(x + Math.cos(angle) * 14, 31 + Math.sin(angle) * 14, 8, 13)
            .fill(species.colors.flower);
        }
        graphics.circle(x, 31, 11).fill(species.colors.accent);
      } else if (plant.species === 'tulip') {
        graphics
          .moveTo(x - 17, 35)
          .lineTo(x - 12, 18)
          .lineTo(x, 29)
          .lineTo(x + 12, 18)
          .lineTo(x + 17, 35)
          .quadraticCurveTo(x, 51, x - 17, 35)
          .fill(species.colors.flower);
      } else {
        graphics.circle(x, 54, 8).fill(species.colors.flower);
        graphics.circle(x - 7, 58, 5).fill(species.colors.accent);
        graphics.circle(x + 7, 58, 5).fill(species.colors.accent);
      }
      graphics.circle(x - 25, 27, 2).fill(0xfff3ad);
      graphics.circle(x + 27, 42, 1.5).fill(0xffffff);
      graphics.circle(x + 20, 17, 2).fill(0xffe27a);
    }
  }
  graphics.alpha = plant.health < 35 ? 0.72 : 1;
  if (animation) {
    graphics.pivot.set(x, 108);
    graphics.position.set(x, 108);
  }
  container.addChild(graphics);
  return graphics;
}

function drawInsect(container: Container, event: GardenEvent, x: number) {
  const insect = new Graphics();
  insect.label = event.id;
  insect.eventMode = 'static';
  insect.cursor = 'pointer';
  if (event.type === 'caterpillar') {
    for (let i = 0; i < 4; i += 1)
      insect
        .circle(x - 12 + i * 8, 73 + (i % 2) * 2, 6)
        .fill(i === 3 ? 0x86b74b : 0x9dcc59);
    insect.circle(x + 13, 70, 1.5).fill(0x24372f);
  } else {
    insect.ellipse(x - 7, 50, 9, 13).fill({ color: 0xf3a7c7, alpha: 0.9 });
    insect.ellipse(x + 7, 50, 9, 13).fill({ color: 0x8ec5f4, alpha: 0.9 });
    insect.rect(x - 1, 43, 2, 15).fill(0x4a3a4a);
  }
  container.addChild(insect);
  return insect;
}

export function GardenCanvas({
  state,
  selectedPotId,
  onSelectPot,
  onRemovePest,
}: Props) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!host.current) return;
    const holder = host.current;
    let disposed = false;
    const app = new Application();

    void app
      .init({
        width: 720,
        height: 160,
        backgroundAlpha: 0,
        antialias: false,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      })
      .then(() => {
        if (disposed) {
          app.destroy(true);
          return;
        }
        holder.appendChild(app.canvas);
        const scene = new Container();
        app.stage.addChild(scene);
        scene.addChild(
          new Graphics()
            .roundRect(85, 146, 550, 5, 3)
            .fill({ color: 0x577a65, alpha: 0.45 }),
        );
        const animatedPlants: Graphics[] = [];
        const bloomPlants: Graphics[] = [];
        const insects: Array<{
          graphic: Graphics;
          type: string;
          phase: number;
        }> = [];

        state.pots.forEach((pot, index) => {
          const hit = new Graphics()
            .rect(POT_X[index] - 72, 8, 144, 144)
            .fill({ color: 0xffffff, alpha: 0.001 });
          hit.eventMode = 'static';
          hit.cursor = 'pointer';
          hit.on('pointertap', () => onSelectPot(pot.id));
          scene.addChild(hit);
          drawPot(scene, POT_X[index], selectedPotId === pot.id);
          if (pot.plant) {
            const plantGraphic = drawPlant(
              scene,
              pot.plant,
              POT_X[index],
              state.settings.animation,
            );
            animatedPlants.push(plantGraphic);
            if (pot.plant.stage === 'bloom') bloomPlants.push(plantGraphic);
          }
          state.events
            .filter((event) => event.potId === pot.id)
            .forEach((event, eventIndex) => {
              const graphic = drawInsect(
                scene,
                event,
                POT_X[index] + 38 + eventIndex * 13,
              );
              if (event.type === 'caterpillar')
                graphic.on('pointertap', (pointerEvent) => {
                  pointerEvent.stopPropagation();
                  onRemovePest(event.id);
                });
              insects.push({ graphic, type: event.type, phase: index * 1.9 });
            });
        });

        if (state.settings.animation) {
          app.ticker.add((ticker) => {
            const time = performance.now() / 1000;
            animatedPlants.forEach((plant, index) => {
              plant.rotation = Math.sin(time * 1.1 + index) * 0.018;
            });
            bloomPlants.forEach((plant, index) => {
              plant.alpha = 0.92 + Math.sin(time * 2 + index) * 0.08;
            });
            insects.forEach((item) => {
              if (item.type === 'butterfly') {
                item.graphic.y = Math.sin(time * 2.2 + item.phase) * 7;
                item.graphic.x = Math.sin(time * 0.8 + item.phase) * 18;
                item.graphic.scale.x =
                  0.85 + Math.abs(Math.sin(time * 7)) * 0.25;
              } else
                item.graphic.x +=
                  Math.sin(time * 3 + item.phase) * 0.03 * ticker.deltaTime;
            });
          });
        }
      });

    return () => {
      disposed = true;
      if (app.renderer) app.destroy(true, { children: true });
      holder.replaceChildren();
    };
  }, [state, selectedPotId, onSelectPot, onRemovePest]);

  return (
    <div className="garden-canvas" ref={host} aria-label="Three-pot garden" />
  );
}
