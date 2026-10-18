import { useState, type FormEvent } from 'react';
import { db } from '../db/schema';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

/**
 * Adds a book to the reading list with its title and author (MH-1).
 * Writes to the books table in src/db/schema.ts and returns the new book's id.
 */
export async function addBook(title: string, author: string): Promise<number> {
  const cleanTitle = title.trim();
  const cleanAuthor = author.trim();
  if (cleanTitle === '' || cleanAuthor === '') {
    throw new Error('Enter both a title and an author.');
  }
  return db.books.add({
    title: cleanTitle,
    author: cleanAuthor,
    isRead: false,
    addedAt: new Date(),
  });
}

interface AddBookScreenProps {
  onAdded: () => void;
}

export function AddBookScreen({ onAdded }: AddBookScreenProps) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await addBook(title, author);
      onAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'The book could not be added.');
      setSaving(false);
    }
  }

  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Add a book</h2>
        <p className="text-sm text-muted-foreground">
          Give the title and author. The book goes on your reading list straight away.
        </p>
      </div>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        <div className="space-y-2">
          <Label htmlFor="book-title">Title</Label>
          <Input
            id="book-title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
            autoFocus
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="book-author">Author</Label>
          <Input
            id="book-author"
            value={author}
            onChange={(event) => setAuthor(event.target.value)}
            required
          />
        </div>
        {error && (
          <p role="alert" className="text-sm text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={saving}>
          Add book
        </Button>
      </form>
    </section>
  );
}
