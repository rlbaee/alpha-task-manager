const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getData: () => ipcRenderer.invoke('get-data'),
  getEntryForDate: (date) => ipcRenderer.invoke('get-entry-for-date', date),
  updateCount: (group, activity, delta) =>
    ipcRenderer.invoke('update-count', group, activity, delta),
});