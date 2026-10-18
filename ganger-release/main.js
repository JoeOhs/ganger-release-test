const { app, BrowserWindow, net, protocol, shell } = require("electron");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

protocol.registerSchemesAsPrivileged([
  { scheme: "app", privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } },
]);

const site = path.join(__dirname, "site");
// Saved data under the build's own id, never its display name: an app called "Ganger" must not
// open Ganger's data, nor two apps with one name each other's.
app.setPath("userData", path.join(app.getPath("appData"), require("./package.json").name));

function fileFor(pathname) {
  const clean = path.normalize(decodeURIComponent(pathname)).replace(/^[\\/]+/, "");
  for (const candidate of [clean, clean + ".html", path.join(clean, "index.html")]) {
    const full = path.join(site, candidate);
    if (!full.startsWith(site + path.sep)) continue;
    try {
      if (fs.statSync(full).isFile()) return full;
    } catch {}
  }
  return path.join(site, "index.html");
}

app.whenReady().then(() => {
  protocol.handle("app", (request) =>
    net.fetch(pathToFileURL(fileFor(new URL(request.url).pathname)).toString()),
  );
  const window = new BrowserWindow({
    width: 1280,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, sandbox: true },
  });
  window.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:/.test(url)) shell.openExternal(url);
    return { action: "deny" };
  });
  window.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("app://local/")) {
      event.preventDefault();
      if (/^https?:/.test(url)) shell.openExternal(url);
    }
  });
  window.loadURL("app://local/index.html");
});

app.on("window-all-closed", () => app.quit());
