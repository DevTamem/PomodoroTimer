const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pomodoroDesktop", {
  isDesktop: true,
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggle-maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  getWindowState: () => ipcRenderer.invoke("window:get-state"),
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window:toggle-always-on-top"),
  toggleCompactMode: () => ipcRenderer.invoke("app:toggle-compact-mode"),
  setCompactMode: (enabled) => ipcRenderer.invoke("app:set-compact-mode", enabled),
  notify: (payload) => ipcRenderer.invoke("app:notify", payload),
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  updateTrayTimer: (timerInfo) => ipcRenderer.invoke("app:update-tray-timer", timerInfo),
  onWindowState: (callback) => {
    const listener = (_, state) => callback(state);
    ipcRenderer.on("window:state", listener);

    return () => {
      ipcRenderer.removeListener("window:state", listener);
    };
  },
});
