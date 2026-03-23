# Pomodoro Timer

Pomodoro Timer is a React + Vite productivity app that now runs both in the browser and as a desktop app through Electron.

## Project Structure

```text
PomodoroTimer/
|-- electron/
|   |-- main.cjs
|   `-- preload.cjs
|-- public/
|-- src/
|   |-- components/
|   |   |-- DesktopTitleBar.jsx
|   |   |-- LoadingScreen.jsx
|   |   `-- Timer.jsx
|   |-- lib/
|   |   `-- desktop.js
|   |-- App.css
|   |-- App.jsx
|   `-- main.jsx
|-- index.html
|-- package.json
`-- vite.config.js
```

## Features Added

- Electron desktop wrapper with a dedicated `main` process and `preload` bridge
- Safe Electron defaults: `contextIsolation: true` and `nodeIntegration: false`
- Frameless desktop window with custom title bar controls
- Native desktop notifications when focus and break sessions switch
- Always-on-top toggle for desktop mode
- Updated desktop-oriented layout, hierarchy, spacing, and controls
- Persistent settings for mascot choice, sound, and notifications

## Run The Web App

```bash
npm install
npm run dev
```

## Run The Desktop App In Dev

```bash
npm install
npm run electron:dev
```

This starts the Vite dev server and then launches Electron against it.

## Build The Web App

```bash
npm run build
```

## Run The Built Desktop App

```bash
npm run build
npm run electron:start
```

## Package The Desktop App

```bash
npm run electron:build
```

Electron Builder writes packaged output to the `release/` folder.

## Notes

- The renderer is still the original React app, now enhanced for desktop behavior.
- `vite.config.js` uses a relative base path so Electron can load built assets from `dist/`.
- The loading screen was shortened so the desktop app opens more like a native tool than a splash-heavy website.
