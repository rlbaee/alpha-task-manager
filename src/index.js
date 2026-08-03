const {
  app,
  BrowserWindow,
  Tray,
  Menu,
  ipcMain,
} = require("electron");

const path = require("path");
const fs = require("fs");

let win = null;
let tray = null;
let quitting = false;

const dataPath = path.join(app.getPath("userData"), "tasks.json");

const CATEGORIES = [
  {
    group: "Legacy",
    activities: [
      "Adhoc Testing",
      "Creating automation scripts",
      "Executing automation scripts",
      "Functional TCs executed",
      "Functional TC Creation/Update/review",
    ],
  },
  {
    group: "New Features",
    activities: [
      "Adhoc Testing",
      "Application TCs executed",
      "Creating automation scripts",
      "Executing automation scripts",
      "Story Analysis",
      "Test case/Plan creation/Update/Review",
    ],
  },
  {
    group: "Linguistic Support",
    activities: [
      "GlaaS upload",
      "Q-Doc",
      "Screenshooting",
    ],
  },
  {
    group: "I18N",
    activities: [
      "Adhoc Testing",
      "TCs executed",
      "Test cases Creation/Update/review",
    ],
  },
  {
    group: "Bugs",
    activities: [
      "Bugs Regressed",
      "Bugs found in legacy feature testing",
      "Bugs found in new feature testing",
    ],
  },
  {
    group: "IQE / AI",
    activities: [
      "AI Gen related IQE/Lead tasks",
      "IQE responsibilities",
    ],
  },
];

function getToday() {
  const d = new Date();

  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function createInitialData() {
  return {
    categories: CATEGORIES,
    history: [],
  };
}

function saveData(data) {
  const tempPath = `${dataPath}.tmp`;

  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, dataPath);
}

function loadData() {
  if (!fs.existsSync(dataPath)) {
    const initial = createInitialData();
    saveData(initial);
    return initial;
  }

  try {
    const data = JSON.parse(fs.readFileSync(dataPath, "utf8"));

    data.categories = CATEGORIES;

    if (!Array.isArray(data.history)) {
      data.history = [];
    }

    return data;
  } catch (err) {
    console.error("Failed to load tasks.json:", err);

    try {
      fs.renameSync(
        dataPath,
        `${dataPath}.corrupted-${Date.now()}`
      );
    } catch {}

    const initial = createInitialData();
    saveData(initial);

    return initial;
  }
}

function getEntry(data, date) {
  let entry = data.history.find((x) => x.date === date);

  if (!entry) {
    entry = {
      date,
      counts: {},
    };

    data.history.push(entry);
  }

  return entry;
}

function positionWindow() {
  if (!tray || !win) return;

  const trayBounds = tray.getBounds();
  const windowBounds = win.getBounds();

  let x = Math.round(
    trayBounds.x +
      trayBounds.width / 2 -
      windowBounds.width / 2
  );

  let y;

  if (process.platform === "darwin") {
    y = Math.round(trayBounds.y + trayBounds.height + 6);
  } else {
    y = Math.round(
      trayBounds.y - windowBounds.height - 6
    );
  }

  win.setPosition(x, y, false);
}

function toggleWindow() {
  if (win.isVisible()) {
    win.hide();
    return;
  }

  positionWindow();

  win.show();
  win.focus();
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
    skipTaskbar: true,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setMenu(null);
  win.setBackgroundColor("#00000000");

  win.loadFile(path.join(__dirname, "index.html"));

  win.on("blur", () => {
    if (!quitting) {
      win.hide();
    }
  });

  win.on("close", (e) => {
    if (!quitting) {
      e.preventDefault();
      win.hide();
    }
  });
}

function createTray() {
  const icon =
    process.platform === "darwin"
      ? path.join(__dirname, "../iconTemplate.png")
      : path.join(__dirname, "../icon.png");

  tray = new Tray(icon);

  tray.setToolTip("Alpha Task Manager");

  tray.on("click", toggleWindow);

  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show",
        click: toggleWindow,
      },
      {
        type: "separator",
      },
      {
        label: "Quit",
        click() {
          quitting = true;
          app.quit();
        },
      },
    ])
  );
}

app.whenReady().then(() => {
  app.setLoginItemSettings({
    openAtLogin: true,
  });

  createWindow();
  createTray();
});

app.on("before-quit", () => {
  quitting = true;
});

app.on("window-all-closed", (e) => {
  e.preventDefault();
});

ipcMain.handle("get-data", () => {
  return {
    data: loadData(),
    today: getToday(),
  };
});

ipcMain.handle("get-entry-for-date", (event, date) => {
  const data = loadData();

  const entry =
    data.history.find((e) => e.date === date) || {
      date,
      counts: {},
    };

  return {
    data,
    entry,
  };
});

ipcMain.handle(
  "update-count",
  (event, group, activity, delta) => {
    const data = loadData();

    const today = getToday();

    const entry = getEntry(data, today);

    if (!entry.counts[group]) {
      entry.counts[group] = {};
    }

    const current =
      entry.counts[group][activity] || 0;

    entry.counts[group][activity] = Math.max(
      0,
      current + delta
    );

    saveData(data);

    return entry.counts;
  }
);