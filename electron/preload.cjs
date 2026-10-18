const { contextBridge, ipcRenderer } = require('electron');

// Only the two file actions the page needs. The page checks for window.readingListFiles
// and falls back to the browser's own file picker and downloads when it is absent.
contextBridge.exposeInMainWorld('readingListFiles', {
  saveText: (suggestedName, text) =>
    ipcRenderer.invoke('reading-list:save-text', suggestedName, text),
  openText: () => ipcRenderer.invoke('reading-list:open-text'),
});
