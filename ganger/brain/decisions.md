# Decisions

## The stack

Backend: no. Desktop software keeps its work on the computer it runs on, so nothing needs a server.
Archetype: Desktop program (desktop). A program in its own window on Windows, Mac or Linux: Electron around a Vite + React page that keeps its work on this computer. The Preview shows the window's page; Export as a desktop app makes the program.
- framework: Electron + Vite + React - Electron's main process opens one window on the Vite-built page; the page runs in a plain browser too, so it can be previewed and checked.
- styling: Tailwind CSS - Utility CSS keeps generated components consistent without a design system to learn.
- ui: shadcn/ui - Copy-in components on top of Tailwind; easy for later agents to modify in place.
- data: IndexedDB (Dexie) - Kept on this computer inside the program's own storage, and the same in the Preview's browser.
- auth: none - No accounts: everything stays on this computer.
- realtime: none - Nothing to sync.
- deploy: desktop program (Export as a desktop app) - Built to plain files and run in a window; Ganger's export makes the program for this computer.
- integrations: none - Files on this computer only through the window's own file picker.

## Overrides

No overrides: the preset was used as-is.

Written by Ganger from the stack decision and every override, with its reason.
