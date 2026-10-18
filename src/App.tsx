import { useState } from 'react';
import { Button } from './components/ui/button';
import { AddBookScreen } from './screens/AddBook';
import { MarkBookAsReadScreen } from './screens/MarkBookAsRead';
import { BackupScreen } from './screens/Backup';

type ScreenId = 'list' | 'add' | 'backup';

const navItems: { id: ScreenId; label: string }[] = [
  { id: 'list', label: 'Reading list' },
  { id: 'add', label: 'Add a book' },
  { id: 'backup', label: 'Backup' },
];

export default function App() {
  const [screen, setScreen] = useState<ScreenId>('list');

  return (
    <div className="flex h-full flex-col">
      <header className="border-b bg-card">
        <nav aria-label="Main" className="mx-auto flex max-w-3xl items-center gap-2 p-4">
          <h1 className="mr-auto text-lg font-semibold">Reading List</h1>
          {navItems.map((item) => (
            <Button
              key={item.id}
              size="sm"
              variant={screen === item.id ? 'default' : 'ghost'}
              aria-current={screen === item.id ? 'page' : undefined}
              onClick={() => setScreen(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 overflow-y-auto p-6">
        {screen === 'add' && <AddBookScreen onAdded={() => setScreen('list')} />}
        {screen === 'list' && <MarkBookAsReadScreen />}
        {screen === 'backup' && <BackupScreen />}
      </main>
    </div>
  );
}
