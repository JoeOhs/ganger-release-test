# UI shell

The window is one page with a header and three screens. The header holds the app name and three navigation buttons, "Reading list", "Add a book" and "Backup". The page is built with React, styled with Tailwind CSS, and uses shadcn-style components from `src/components/ui/`. Every screen reads and writes the `books` table through the `db` instance in `src/db/schema.ts`.

## Screens

| Screen | File | Must-have | What it does |
|---|---|---|---|
| Add a book | `src/screens/AddBook.tsx` (`AddBookScreen`) | MH-1: add a book with its title and author | A form with Title and Author fields. Both are required; the book is saved with `isRead` false and `addedAt` set to now, then the page goes back to the reading list. |
| Reading list | `src/screens/MarkBookAsRead.tsx` (`MarkBookAsReadScreen`) | MH-2: mark a book as read | Lists books under "To read" and "Read", each ordered by when it was added. "Mark as read" sets `isRead` and `readAt` on the book. |
| Backup | `src/screens/Backup.tsx` (`BackupScreen`) | Save a backup; open a backup | "Save a backup" writes every stored table to one JSON file (see `src/lib/backup.ts`). "Open a backup" reads a backup file, says how many books it holds, and replaces the books on this computer only after the person confirms. |

## Layout and wiring

- `index.html` and `src/main.tsx` mount the app on `#root`.
- `src/App.tsx` holds the header and switches between the three screens with component state. Adding a book returns the person to the reading list.
- `src/index.css` imports Tailwind and sets the colour variables that the components use.

## Desktop file bridge

- `electron/main.cjs` opens one window on `dist/index.html`, or on `VITE_DEV_SERVER_URL` when that is set. Context isolation is on, Node integration is off, and web links open in the browser.
- `electron/preload.cjs` exposes `window.readingListFiles` with two functions, `saveText` and `openText`. They open the system save and open dialogs.
- `src/lib/files.ts` uses that bridge when it is present. In the browser Preview it falls back to a file download and the browser's own file picker.
