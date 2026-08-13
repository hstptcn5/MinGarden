# Architecture

MinGarden keeps time and game rules outside the renderer:

```text
versioned local save
        ↓
simulateGarden(state, elapsedMs)
        ↓
React application state
        ↓
PixiJS render model + contextual React UI
```

`src/simulation` is pure TypeScript and has no React or PixiJS dependency. Offline progress is calculated in bounded five-minute chunks and capped at seven days per launch. This avoids thousands of per-second ticks while preserving resource depletion and condition changes across elapsed time.

The Windows layer creates a 720×160 transparent frameless window. It queries the Windows monitor work area and places the garden at its bottom edge, which makes it sit immediately above a conventional taskbar. Other platforms use a documented 48 px taskbar fallback. Primary-monitor support is the MVP boundary.

Tauri Store persists schema version 1 in application data. Browser `localStorage` is used only when running the Vite preview outside Tauri. Invalid or incompatible saves return a recoverable starter garden.
