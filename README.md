# Alpha Task Manager

A minimal, always-available task tracker that lives in your system tray. Built for tracking daily work activity counts against a fixed set of categories, with full history by date.

![platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS-blue)
![built with](https://img.shields.io/badge/built%20with-Electron-47848F)

## Features

- **Lives in the tray** — click the tray icon to toggle the window, click elsewhere to auto-hide
- **Grouped activity counters** — activities organized under categories (Legacy, New Features, Linguistic Support, I18N, Bugs, IQE / AI), each with independent +/- counters
- **Daily history** — every day's counts are saved separately; navigate back through previous dates with ‹ › controls
- **Local-only storage** — all data saved to a local JSON file, no external servers or accounts
- **Frameless, modern UI** — dark theme, rounded window, no native title bar
- **Launch on startup** — optionally starts automatically when you log in

## Screenshots

<img width="421" height="674" alt="image" src="https://github.com/user-attachments/assets/76002103-ef54-4f8a-967a-11f1abec297a" />


## Installation

Download the latest installer for your platform from the [Releases](../../releases) page:

- **Windows** — `Setup.exe`
- **macOS** — `.dmg`

Run the installer and the app will appear in your system tray.

## Usage

- **Click the tray icon** to open/close the tracker window
- **Click + or −** next to any activity to adjust today's count
- **Use ‹ ›** at the top to browse previous days (read-only — past days can't be edited)
- Counts reset to zero automatically each new day; nothing is deleted, just a new entry is added

## Data storage

All data is stored locally in a single JSON file:

- **Windows:** `%APPDATA%\alpha-task-manager\tasks.json`
- **macOS:** `~/Library/Application Support/alpha-task-manager/tasks.json`

The file structure looks like:

```json
{
  "categories": [
    { "group": "Legacy", "activities": ["Adhoc Testing", "..."] }
  ],
  "history": [
    {
      "date": "2026-08-03",
      "counts": {
        "Legacy": { "Adhoc Testing": 2 }
      }
    }
  ]
}
```

You can safely open this file in a text editor to inspect or manually correct past entries — just make sure to save any manual edits before the app writes again, to avoid your changes being skipped.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)

### Setup

```bash
git clone https://github.com/<your-username>/alpha-task-manager.git
cd alpha-task-manager
npm install
```

### Run in development

```bash
npm start
```

### Build an installer

```bash
npm run make
```

Output installers are placed in `out/make/`.

### Project structure

```
alpha-task-manager/
├── src/
│   ├── index.js       # Main process — tray, window, data persistence
│   ├── preload.js      # Secure bridge between main and renderer
│   ├── index.html      # UI markup and styling
│   └── renderer.js     # UI logic — rendering rows, date navigation
├── forge.config.js      # Electron Forge build/packaging config
├── icon.png             # Tray icon
└── package.json
```

## Tech stack

- [Electron](https://www.electronjs.org/) — desktop app shell
- [Electron Forge](https://www.electronforge.io/) — build, packaging, and installer tooling
- Vanilla JavaScript / HTML / CSS — no frontend framework

## License

MIT
