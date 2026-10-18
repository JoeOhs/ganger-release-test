import { useCallback, useEffect, useState } from 'react';
import { db } from '../db/schema';
import { Button } from '../components/ui/button';
import { chooseBackup, restoreBackup, saveBackup, type Backup } from '../lib/backup';

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error ? err.message : fallback;
}

function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}

export function BackupScreen() {
  const [bookCount, setBookCount] = useState<number | null>(null);
  const [pending, setPending] = useState<Backup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setBookCount(await db.books.count());
    } catch (err) {
      setError(messageOf(err, 'The reading list could not be counted.'));
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSave() {
    setError(null);
    setNotice(null);
    try {
      const saved = await saveBackup();
      if (saved) setNotice('The backup was saved to a file.');
    } catch (err) {
      setError(messageOf(err, 'The backup could not be saved.'));
    }
  }

  async function handleChoose() {
    setError(null);
    setNotice(null);
    setPending(null);
    try {
      const backup = await chooseBackup();
      if (backup) setPending(backup);
    } catch (err) {
      setError(messageOf(err, 'The file could not be opened.'));
    }
  }

  async function handleRestore() {
    if (!pending) return;
    setError(null);
    setNotice(null);
    try {
      const count = await restoreBackup(pending);
      setPending(null);
      setNotice(`Replaced the books on this computer with ${plural(count, 'book', 'books')} from the backup.`);
      await refresh();
    } catch (err) {
      setError(messageOf(err, 'The backup could not be restored.'));
    }
  }

  const pendingRead = pending ? pending.books.filter((book) => book.isRead).length : 0;

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-2xl font-semibold">Backup</h2>
        <p className="text-sm text-muted-foreground">
          The reading list is stored only in this program on this computer. Save a backup to a
          file so the list can be restored if the program's data is lost.
        </p>
      </div>

      <div className="space-y-3 rounded-md border bg-card p-4">
        <h3 className="font-semibold">Save a backup</h3>
        <p className="text-sm text-muted-foreground">
          {bookCount === null
            ? 'Counting the books...'
            : `The list holds ${plural(bookCount, 'book', 'books')}. Saving writes all of them to one file.`}
        </p>
        <Button size="sm" onClick={() => void handleSave()}>
          Save a backup
        </Button>
      </div>

      <div className="space-y-3 rounded-md border bg-card p-4">
        <h3 className="font-semibold">Open a backup</h3>
        <p className="text-sm text-muted-foreground">
          Opening a backup replaces every book on this computer with the books in the file.
        </p>
        <Button size="sm" variant="outline" onClick={() => void handleChoose()}>
          Open a backup
        </Button>

        {pending && (
          <div role="alertdialog" aria-label="Confirm restore" className="space-y-3 border-t pt-4">
            <p className="text-sm">
              This backup holds {plural(pending.books.length, 'book', 'books')} ({pendingRead} read,{' '}
              {pending.books.length - pendingRead} to read), saved on{' '}
              {pending.exportedAt.toLocaleString()}.
            </p>
            <p className="text-sm">
              Replace the {bookCount === null ? 'current' : plural(bookCount, 'book', 'books')} on
              this computer with it? This cannot be undone.
            </p>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => void handleRestore()}>
                Replace my books
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-muted-foreground">
          {notice}
        </p>
      )}
    </section>
  );
}
