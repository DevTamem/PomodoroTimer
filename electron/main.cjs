const path = require("path");
const {
  app,
  BrowserWindow,
  Menu,
  nativeImage,
  Notification,
  ipcMain,
  Tray,
} = require("electron");

const isDev = !app.isPackaged;
const devServerUrl = process.env.VITE_DEV_SERVER_URL;
const trayIconPath = path.join(__dirname, "tray-icon.png");
const APP_ID = "Pomodoro";

app.setName("Pomodoro");
app.setAppUserModelId(APP_ID);

let mainWindow;
let tray;
let isQuitting = false;
let isCompactMode = false;

// Window size presets
const WINDOW_SIZES = {
  full: { width: 480, height: 820, minWidth: 440, minHeight: 700 },
  compact: { width: 220, height: 300, minWidth: 180, minHeight: 240 },
};

function createTrayIcon() {
  return nativeImage.createFromPath(trayIconPath).resize({ width: 16, height: 16 });
}

function showMainWindow() {
  if (!mainWindow) {
    createWindow();
    return;
  }

  if (mainWindow.isMinimized()) {
    mainWindow.restore();
  }

  mainWindow.show();
  mainWindow.focus();
  sendWindowState();
}

function hideMainWindow() {
  if (!mainWindow || !mainWindow.isVisible()) {
    return;
  }

  mainWindow.hide();
  sendWindowState();
}

function createTray() {
  if (tray) {
    return;
  }

  tray = new Tray(createTrayIcon());
  tray.setToolTip("Pomodoro Timer");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      {
        label: "Show Pomodoro Timer",
        click: () => showMainWindow(),
      },
      {
        label: "Hide Window",
        click: () => hideMainWindow(),
      },
      { type: "separator" },
      {
        label: "Quit",
        click: () => {
          isQuitting = true;
          app.quit();
        },
      },
    ])
  );

  tray.on("click", () => {
    if (!mainWindow || !mainWindow.isVisible()) {
      showMainWindow();
      return;
    }

    if (mainWindow.isFocused()) {
      hideMainWindow();
    } else {
      showMainWindow();
    }
  });
}

function getWindowState() {
  if (!mainWindow) {
    return {
      isMaximized: false,
      isAlwaysOnTop: false,
      isFocused: false,
      isVisible: false,
      isCompactMode: false,
    };
  }

  return {
    isMaximized: mainWindow.isMaximized(),
    isAlwaysOnTop: mainWindow.isAlwaysOnTop(),
    isFocused: mainWindow.isFocused(),
    isVisible: mainWindow.isVisible(),
    isCompactMode: isCompactMode,
  };
}

function sendWindowState() {
  if (mainWindow?.webContents) {
    mainWindow.webContents.send("window:state", getWindowState());
  }
}

function createWindow() {
  const size = WINDOW_SIZES.full;

  mainWindow = new BrowserWindow({
    width: size.width,
    height: size.height,
    minWidth: size.minWidth,
    minHeight: size.minHeight,
    backgroundColor: "#f4ece3",
    frame: false,
    autoHideMenuBar: true,
    icon: trayIconPath,
    maximizable: false,
    fullscreenable: false,
    resizable: true,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false,
      backgroundThrottling: false,
    },
  });

  const syncEvents = [
    "focus",
    "blur",
    "show",
    "hide",
    "enter-full-screen",
    "leave-full-screen",
    "always-on-top-changed",
  ];

  syncEvents.forEach((eventName) => {
    mainWindow.on(eventName, sendWindowState);
  });

  mainWindow.on("close", (event) => {
    if (isQuitting) {
      return;
    }

    event.preventDefault();
    hideMainWindow();
  });

  mainWindow.once("ready-to-show", () => {
    mainWindow.show();
    sendWindowState();
  });

  if (isDev && devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, "..", "dist", "index.html"));
  }
}

function registerIpc() {
  ipcMain.handle("window:minimize", () => {
    mainWindow?.minimize();
    return getWindowState();
  });

  ipcMain.handle("window:close", () => {
    mainWindow?.close();
  });

  ipcMain.handle("window:get-state", () => getWindowState());

  ipcMain.handle("window:toggle-always-on-top", () => {
    if (!mainWindow) {
      return getWindowState();
    }

    mainWindow.setAlwaysOnTop(!mainWindow.isAlwaysOnTop());
    sendWindowState();
    return getWindowState();
  });

  ipcMain.handle("app:notify", (_, payload = {}) => {
    if (!Notification.isSupported()) {
      return false;
    }

    const notification = new Notification({
      title: payload.title || "Pomodoro Timer",
      body: payload.body || "",
      silent: payload.silent ?? false,
    });

    notification.on("click", () => {
      showMainWindow();
    });

    notification.show();
    return true;
  });

  ipcMain.handle("app:get-version", () => app.getVersion());

  ipcMain.handle("app:toggle-compact-mode", () => {
    if (!mainWindow) return getWindowState();

    isCompactMode = !isCompactMode;
    const size = isCompactMode ? WINDOW_SIZES.compact : WINDOW_SIZES.full;

    // Set new minimum size first
    mainWindow.setMinimumSize(size.minWidth, size.minHeight);

    // Animate to new size
    mainWindow.setSize(size.width, size.height, true);

    sendWindowState();
    return getWindowState();
  });

  ipcMain.handle("app:set-compact-mode", (_, enabled) => {
    if (!mainWindow) return getWindowState();

    isCompactMode = enabled;
    const size = isCompactMode ? WINDOW_SIZES.compact : WINDOW_SIZES.full;

    mainWindow.setMinimumSize(size.minWidth, size.minHeight);
    mainWindow.setSize(size.width, size.height, true);

    sendWindowState();
    return getWindowState();
  });

  ipcMain.handle("app:update-tray-timer", (_, timerInfo = {}) => {
    if (!tray) return;

    const { formattedTime, phase, running } = timerInfo;
    const phaseLabel = phase === "study" ? "Focus" : "Break";
    const status = running ? "Running" : "Paused";

    if (formattedTime) {
      tray.setToolTip(`Pomodoro Timer\n${phaseLabel}: ${formattedTime} (${status})`);
    } else {
      tray.setToolTip("Pomodoro Timer");
    }
  });
}

app.whenReady().then(() => {
  registerIpc();
  createTray();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    } else {
      showMainWindow();
    }
  });
});

app.on("before-quit", () => {
  isQuitting = true;
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
