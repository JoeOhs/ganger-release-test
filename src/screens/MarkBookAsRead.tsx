import { useCallback, useEffect, useState } from 'react';
import { db, type Book } from '../db/schema';
import { Button } from '../components/ui/button';

/**
 * Marks a book as read (MH-2): sets isRead and records when it happened in readAt.
 * Writes to the books table in src/db/schema.ts.
 */
export async function markBookAsRead(book: Book): Promise<void> {
  if (book.id === undefined) {
    throw new Error('That book has no id and cannot be marked as read.');
  }
  await db.books.update(book.id, { isRead: true, readAt: new Date() });
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

export function MarkBookAsReadScreen() {
  const [books, setBooks] = useState<Book[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBooks(await db.books.orderBy('addedAt').toArray());
    } catch (err) {
      setError(messageOf(err, 'The reading list could not be loaded.'));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleMarkRead(book: Book) {
    setError(null);
    try {
      await markBookAsRead(book);
      await refresh();
    } catch (err) {
      setError(messageOf(err, 'The book could not be marked as read.'));
    }
  }

  if (books === null) {
    return <p className="text-sm text-muted-foreground">Loading the reading list...</p>;
  }

  const toRead = books.filter((book) => !book.isRead);
  const read = books.filter((book) => book.isRead);

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Reading list</h2>
        <p className="text-sm text-muted-foreground">
          Mark a book as read when you finish it.
        </p>
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}

      {books.length === 0 && (
        <p className="text-sm text-muted-foreground">
          The list is empty. Use Add a book to put the first one on it.
        </p>
      )}

      {toRead.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            To read ({toRead.length})
          </h3>
          <ul className="divide-y rounded-md border bg-card">
            {toRead.map((book) => (
              <li key={book.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{book.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{book.author}</p>
                </div>
                <Button size="sm" onClick={() => void handleMarkRead(book)}>
                  Mark as read
                </Button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {read.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Read ({read.length})
          </h3>
          <ul className="divide-y rounded-md border bg-card">
            {read.map((book) => (
              <li key={book.id} className="flex items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <p className="truncate font-medium">{book.title}</p>
                  <p className="truncate text-sm text-muted-foreground">{book.author}</p>
                </div>
                <p className="shrink-0 text-sm text-muted-foreground">
                  {book.readAt ? `Read ${book.readAt.toLocaleDateString()}` : 'Read'}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
