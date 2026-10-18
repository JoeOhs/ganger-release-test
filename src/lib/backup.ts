import { db, type Book } from '../db/schema';
import { openTextFile, saveTextFile } from './files';

const APP_NAME = 'desktop-keeping-reading';
const BACKUP_FORMAT = 'desktop-keeping-reading-backup';
const BACKUP_VERSION = 1;
const REFUSED_MESSAGE = 'That file is not a backup of this reading list.';

/** A backup read from a file, checked and ready to restore. */
export interface Backup {
  /** When the backup was made, as stored in the file. */
  exportedAt: Date;
  /** Every book in the backup, with its original id. */
  books: Book[];
}

function localDateStamp(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Saves everything the app stores (every table in the Dexie database) to one JSON file
 * named for the app and the date. Resolves false when the person cancels the save.
 */
export async function saveBackup(): Promise<boolean> {
  const now = new Date();
  const tables: Record<string, unknown[]> = {};
  for (const table of db.tables) {
    tables[table.name] = await table.toArray();
  }
  const payload = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    app: APP_NAME,
    exportedAt: now.toISOString(),
    tables,
  };
  return saveTextFile(
    `${APP_NAME}-backup-${localDateStamp(now)}.json`,
    JSON.stringify(payload, null, 2),
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function parseDate(value: unknown): Date | null {
  if (typeof value !== 'string') return null;
  const date = new Date(value);
  return isNaN(date.getTime()) ? null : date;
}

function toBook(value: unknown): Book {
  if (!isRecord(value)) throw new Error(REFUSED_MESSAGE);
  const { id, title, author, isRead, addedAt, readAt } = value;

  if (typeof title !== 'string' || title.trim() === '') throw new Error(REFUSED_MESSAGE);
  if (typeof author !== 'string' || author.trim() === '') throw new Error(REFUSED_MESSAGE);
  if (typeof isRead !== 'boolean') throw new Error(REFUSED_MESSAGE);

  const added = parseDate(addedAt);
  if (!added) throw new Error(REFUSED_MESSAGE);

  const book: Book = { title, author, isRead, addedAt: added };

  if (id !== undefined) {
    if (typeof id !== 'number' || !Number.isInteger(id) || id <= 0) {
      throw new Error(REFUSED_MESSAGE);
    }
    book.id = id;
  }
  if (readAt !== undefined && readAt !== null) {
    const read = parseDate(readAt);
    if (!read) throw new Error(REFUSED_MESSAGE);
    book.readAt = read;
  }
  return book;
}

/**
 * Checks the text of a file and turns it into a Backup. Anything that is not a backup
 * of this app is refused with a plain message; nothing is written.
 */
export function readBackupText(text: string): Backup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error(REFUSED_MESSAGE);
  }
  if (!isRecord(parsed)) throw new Error(REFUSED_MESSAGE);
  if (parsed.format !== BACKUP_FORMAT || parsed.version !== BACKUP_VERSION) {
    throw new Error(REFUSED_MESSAGE);
  }
  const exportedAt = parseDate(parsed.exportedAt);
  if (!exportedAt || !isRecord(parsed.tables)) throw new Error(REFUSED_MESSAGE);

  const tableNames = Object.keys(parsed.tables);
  if (tableNames.some((name) => name !== 'books')) throw new Error(REFUSED_MESSAGE);

  const rawBooks = parsed.tables.books;
  if (!Array.isArray(rawBooks)) throw new Error(REFUSED_MESSAGE);

  const books = rawBooks.map(toBook);
  const ids = books.map((book) => book.id).filter((id): id is number => id !== undefined);
  if (new Set(ids).size !== ids.length) throw new Error(REFUSED_MESSAGE);

  return { exportedAt, books };
}

/**
 * Asks the person for a backup file and reads it. Resolves null when they cancel.
 * Nothing on this computer changes until restoreBackup is called.
 */
export async function chooseBackup(): Promise<Backup | null> {
  const text = await openTextFile();
  if (text === null) return null;
  return readBackupText(text);
}

/**
 * Replaces every book on this computer with the books in the backup, in one transaction.
 * If anything fails, the current books are left as they were.
 */
export async function restoreBackup(backup: Backup): Promise<number> {
  try {
    await db.transaction('rw', db.books, async () => {
      await db.books.clear();
      await db.books.bulkAdd(backup.books);
    });
  } catch {
    throw new Error('The backup could not be restored. Nothing was changed.');
  }
  return backup.books.length;
}
