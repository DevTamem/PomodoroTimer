# Pomodoro Timer

Pomodoro Timer is a React + Vite productivity app that now runs both in the browser and as a desktop app through Electron.

## Project Structure

```text
PomodoroTimer/
|-- electron/
|   |-- main.cjs
|   |-- preload.cjs
|   `-- tray-icon.png
|-- public/
|-- scripts/
|   `-- electron-launch.cjs
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

## Features

### Core Timer
- Pomodoro Timer with customizable focus and break durations
- Circular progress ring with smooth animations
- Cute mascot companion (choose between Boy and Girl)
- Session tracking: completed sessions, total focus time, and streak counter

### Keyboard Shortcuts
- **Space**: Start/Pause the timer
- **R**: Reset the timer

### Daily Goals
- Set a daily session goal (1-99 sessions)
- Visual progress bar showing daily progress
- "Goal Reached" indicator when you hit your target
- Automatically resets at midnight

### Long Breaks
- Automatic long break (30 min default) after every 4 focus sessions
- Configurable long break duration
- Can be enabled/disabled in settings

### Auto-Start
- **Auto-break**: Automatically start break when focus session ends
- **Auto-focus**: Automatically start focus when break ends
- Both can be toggled independently

### Notifications & Sound
- Browser notifications when sessions complete
- Audio chimes with different melodies for focus/break transitions
- Both can be toggled on/off

### Statistics
- Track total sessions completed
- Track total focus time
- Streak counter for consecutive sessions
- Reset stats button to start fresh

### Desktop App (Electron)
- Frameless window with custom title bar
- **Mini/Compact Mode**: Shrink window to timer-only view (220x300px)
  - Shows just the timer ring, countdown, and play/pause button
  - Click the expand button to return to full view
  - Perfect for keeping timer visible without taking up space
- Window is resizable between full and compact sizes
- System tray integration with timer display in tooltip
- Tray shows remaining time and current phase (Focus/Break)
- Minimize to tray - closing hides to system tray
- Always-on-top toggle to keep timer visible
- Native desktop notifications
- Click tray icon to show/hide window

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
- The app runs in the system tray on desktop - closing the window minimizes to tray. Use the tray menu to fully quit the app.
- Settings and statistics are persisted in localStorage.
