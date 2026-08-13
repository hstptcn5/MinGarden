# MinGarden

**A tiny living garden above your Windows taskbar.**

Plant seeds, water your plants, watch them grow while you work, and discover small visitors living among your pots.

> Screenshot/GIF coming after the first native Windows review build.

## What is playable

- Three always-ready pots and starter seeds for sunflower, tulip, and succulent
- Five elapsed-time growth stages: seed, sprout, young, mature, and bloom
- Water, nutrients, recoverable health, visible thirst, and offline progress
- Renewable seeds collected from bloomed plants
- Ambient butterflies and removable caterpillar pests
- Deterministic development controls for time speed and insect events
- Transparent, frameless taskbar-positioned window, tray lifecycle, autostart, and local saves

Plants never permanently die. Neglect slows growth and lowers health, but watering and fertilizing let every plant recover.

## Technology

Tauri 2 · Rust · React 19 · TypeScript · Vite · PixiJS · Vitest

Simulation is renderer-independent: `simulateGarden(previousState, elapsedMs)` is the authority for real-time and offline growth. See [Architecture](docs/ARCHITECTURE.md).

## Requirements

- Windows 10 or Windows 11
- Node.js 22+
- Rust stable with the MSVC toolchain
- Microsoft C++ Build Tools and WebView2 (normally included on current Windows)

## Develop

```bash
npm install
npm run tauri dev
```

In development builds, open the small **Debug** control at the lower-left to choose `1×`, `60×`, or `600×` time, advance growth, trigger a butterfly/caterpillar, or reset the garden.

The Vite-only preview (`npm run dev`) is useful for the garden UI, but native positioning, tray, Store, and autostart require `npm run tauri dev`.

## Quality gates

```bash
npm run lint
npm run typecheck
npm test
npm run build
cargo check --manifest-path src-tauri/Cargo.toml
```

## Windows package

```bash
npm run tauri build
```

Artifacts are generated under:

```text
src-tauri/target/release/bundle/msi/
src-tauri/target/release/bundle/nsis/
```

## Current status

The MVP vertical slice is implemented. Native Windows packaging and real-taskbar visual verification remain part of the Draft PR review gate.

## Roadmap

After MVP validation: polished sprite sheets, multi-monitor placement, more plants and visitors, pot traits, gentle weather/day-night ambience, and eventually plant hybridization. There are intentionally no accounts, currency, cloud services, productivity timers, or plant death in this release.
