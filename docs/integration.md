# Integration

How each must-have is built, and where it lives. Every screen reads and writes the data through the `db` instance in `src/db/schema.ts`, which keeps the books in IndexedDB on this computer.

| Must-have | File | Function | How it is reached in the app |
|---|---|---|---|
| MH-1: add a book with its title and author | `src/screens/AddBook.tsx` | `AddBookScreen` (saves through `addBook`) | "Add a book" in the header. Both fields are required. |
| MH-2: mark a book as read | `src/screens/MarkBookAsRead.tsx` | `MarkBookAsReadScreen` (marks through `markBookAsRead`) | "Reading list" in the header. "Mark as read" on a book under "To read". |
| Save a backup of everything to a file, and open it again | `src/screens/Backup.tsx` | `BackupScreen` (uses `saveBackup`, `chooseBackup` and `restoreBackup` from `src/lib/backup.ts`) | "Backup" in the header. "Save a backup" writes every table to one JSON file named `desktop-keeping-reading-backup-YYYY-MM-DD.json`. "Open a backup" checks the chosen file (a file that is not a backup is refused), says what it holds, and replaces the books only after "Replace my books". |
| Save a backup of everything to a file, and open it again: saving | `src/lib/backup.ts` | `saveBackup` | Called by "Save a backup" on the Backup screen. |
| Save a backup of everything to a file, and open it again: opening | `src/lib/backup.ts` | `restoreBackup` (the file is read by `chooseBackup` and checked by `readBackupText`) | Called by "Replace my books" on the Backup screen, after the file has been checked. |

## Supporting files

- `src/db/schema.ts`: the `Book` type and the `db` instance (`books` table).
- `src/App.tsx`: header and screen switching.
- `src/lib/files.ts`: save and open a text file. Uses the desktop bridge when present, otherwise the browser's download and file picker.
- `electron/main.cjs` and `electron/preload.cjs`: the desktop window and the save and open dialogs.

## Environment

The app reads one setting from its environment: `VITE_DEV_SERVER_URL` (see `.env.example`), read by `electron/main.cjs` to decide which page the window opens while developing. No secrets are used.
