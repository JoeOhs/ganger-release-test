const { app, BrowserWindow, dialog, ipcMain, shell } = require('electron');
const fs = require('node:fs/promises');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const distDir = path.join(__dirname, '..', 'dist');
const indexHtml = path.join(distDir, 'index.html');
const devServerUrl = process.env.VITE_DEV_SERVER_URL;

function isWebUrl(url) {
  return /^https?:\/\//i.test(url);
}

function isAppUrl(url) {
  if (devServerUrl && url.startsWith(devServerUrl)) return true;
  return url.startsWith(pathToFileURL(distDir).href);
}

function createWindow() {
  const win = new BrowserWindow({
    width: 960,
    height: 720,
    minWidth: 640,
    minHeight: 480,
    title: 'Reading List',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  // Links to the web open in the person's browser, never inside the app window.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isWebUrl(url)) shell.openExternal(url);
    return { action: 'deny' };
  });

  win.webContents.on('will-navigate', (event, url) => {
    if (isAppUrl(url)) return;
    event.preventDefault();
    if (isWebUrl(url)) shell.openExternal(url);
  });

  if (devServerUrl) {
    win.loadURL(devServerUrl);
  } else {
    win.loadFile(indexHtml);
  }
}

ipcMain.handle('reading-list:save-text', async (event, suggestedName, text) => {
  const owner = BrowserWindow.fromWebContents(event.sender);
  const defaultName =
    typeof suggestedName === 'string' && suggestedName.trim() !== ''
      ? path.basename(suggestedName)
      : 'reading-list.json';
  const result = await dialog.showSaveDialog(owner, {
    defaultPath: defaultName,
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (result.canceled || !result.filePath) return false;
  await fs.writeFile(result.filePath, typeof text === 'string' ? text : '', 'utf8');
  return true;
});

ipcMain.handle('reading-list:open-text', async (event) => {
  const owner = BrowserWindow.fromWebContents(event.sender);
  const result = await dialog.showOpenDialog(owner, {
    properties: ['openFile'],
    filters: [{ name: 'JSON', extensions: ['json'] }],
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return fs.readFile(result.filePaths[0], 'utf8');
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
