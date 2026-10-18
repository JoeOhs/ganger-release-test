import Dexie, { type Table } from 'dexie';

/**
 * A book on the reading list.
 * Day-one fields: title and author (MH-1), isRead and readAt (MH-2).
 */
export interface Book {
  /** Auto-incremented primary key, assigned by IndexedDB. */
  id?: number;
  /** The book's title, as typed by the person. */
  title: string;
  /** The book's author, as typed by the person. */
  author: string;
  /** True once the person has marked the book as read. */
  isRead: boolean;
  /** When the book was added to the list. */
  addedAt: Date;
  /** When the book was marked as read; undefined while unread. */
  readAt?: Date;
}

export class ReadingListDB extends Dexie {
  books!: Table<Book, number>;

  constructor() {
    super('desktop-keeping-reading');
    this.version(1).stores({
      // Indexes: title and author for lookup, addedAt for ordering the list.
      // isRead is not indexed: IndexedDB cannot index boolean values.
      books: '++id, title, author, addedAt',
    });
  }
}

export const db = new ReadingListDB();
