const { app, BrowserWindow, Tray, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

let tray = null;
let win = null;
const dataPath = path.join(app.getPath('userData'), 'tasks.json');

const CATEGORIES = [
  {
    group: 'Legacy',
    activities: [
      'Adhoc Testing',
      'Creating automation scripts',
      'Executing automation scripts',
      'Functional TCs executed',
      'Functional TC Creation/Update/review'
    ]
  },
  {
    group: 'New Features',
    activities: [
      'Adhoc Testing',
      'Application TCs executed',
      'Creating automation scripts',
      'Executing automation scripts',
      'Story Analysis',
      'Test case/Plan creation/Update/Review'
    ]
  },
  {
    group: 'Linguistic Support',
    activities: ['GlaaS upload', 'Q-Doc', 'Screenshooting']
  },
  {
    group: 'I18N',
    activities: ['Adhoc Testing', 'TCs executed', 'Test cases Creation/Update/review']
  },
  {
    group: 'Bugs',
    activities: [
      'Bugs Regressed',
      'Bugs found in legacy feature testing',
      'Bugs found in new feature testing'
    ]
  },
  {
    group: 'IQE / AI',
    activities: ['AI Gen related IQE/Lead tasks', 'IQE responsibilities']
  }
];

function loadData() {
  if (!fs.existsSync(dataPath)) {
    const initial = { categories: CATEGORIES, history: [] };
    fs.writeFileSync(dataPath, JSON.stringify(initial, null, 2));
    return initial;
  }
  const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
  data.categories = CATEGORIES;
  return data;
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function getToday() {
  return new Date().toISOString().split('T')[0];
}

function createWindow() {
  win = new BrowserWindow({
    width: 380,
    height: 640,
    show: false,
    resizable: false,
    frame: false,
    transparent: true,
    hasShadow: false,
    webPreferences: { preload: path.join(__dirname, 'preload.js') },
  });
  win.setBackgroundColor('#00000000');
  win.setMenu(null);
  win.loadFile(path.join(__dirname, 'index.html'));

  win.on('close', (event) => {
    event.preventDefault();
    win.hide();
  });

  win.on('blur', () => {
    win.hide();
  });
}

app.whenReady().then(() => {
  createWindow();

  tray = new Tray(path.join(__dirname, '../icon.png'));
  tray.setToolTip('Task Tracker');

  tray.on('click', () => {
    if (win.isVisible()) {
      win.hide();
    } else {
      win.show();
      win.focus();
    }
  });
});

app.on('window-all-closed', (e) => e.preventDefault());

ipcMain.handle('get-data', () => ({ data: loadData(), today: getToday() }));

ipcMain.handle('get-entry-for-date', (event, date) => {
  const data = loadData();
  const entry = data.history.find((e) => e.date === date) || { date, counts: {} };
  return { data, entry };
});

ipcMain.handle('update-count', (event, group, activity, delta) => {
  const data = loadData();
  const today = getToday();

  let entry = data.history.find((e) => e.date === today);
  if (!entry) {
    entry = { date: today, counts: {} };
    data.history.push(entry);
  }
  if (!entry.counts[group]) entry.counts[group] = {};

  const current = entry.counts[group][activity] || 0;
  entry.counts[group][activity] = Math.max(0, current + delta);

  saveData(data);
  return entry.counts;
});