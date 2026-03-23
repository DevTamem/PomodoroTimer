const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("pomodoroDesktop", {
  isDesktop: true,
  minimizeWindow: () => ipcRenderer.invoke("window:minimize"),
  toggleMaximizeWindow: () => ipcRenderer.invoke("window:toggle-maximize"),
  closeWindow: () => ipcRenderer.invoke("window:close"),
  getWindowState: () => ipcRenderer.invoke("window:get-state"),
  toggleAlwaysOnTop: () => ipcRenderer.invoke("window:toggle-always-on-top"),
  notify: (payload) => ipcRenderer.invoke("app:notify", payload),
  getVersion: () => ipcRenderer.invoke("app:get-version"),
  onWindowState: (callback) => {
    const listener = (_, state) => callback(state);
    ipcRenderer.on("window:state", listener);

    return () => {
      ipcRenderer.removeListener("window:state", listener);
    };
  },
});
