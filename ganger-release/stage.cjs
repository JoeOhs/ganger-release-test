// Written by Ganger: puts the app's built page where the release's window opens it.
const fs = require("node:fs");
const path = require("node:path");
const root = path.join(__dirname, "..");
const from = ["out", "dist", "build"]
  .map((dir) => path.join(root, dir))
  .find((dir) => fs.existsSync(path.join(dir, "index.html")));
if (!from) throw new Error("The build wrote no index.html in out/, dist/ or build/.");
fs.rmSync(path.join(__dirname, "site"), { recursive: true, force: true });
fs.cpSync(from, path.join(__dirname, "site"), { recursive: true });
