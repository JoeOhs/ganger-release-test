declare global {
  interface Window {
    /** Provided by electron/preload.cjs inside the desktop program; absent in the browser. */
    readingListFiles?: {
      saveText: (suggestedName: string, text: string) => Promise<boolean>;
      openText: () => Promise<string | null>;
    };
  }
}

/**
 * Saves text to a file. In the desktop program this opens the system save dialog;
 * in a browser it downloads the file. Resolves false when the person cancels.
 */
export async function saveTextFile(suggestedName: string, text: string): Promise<boolean> {
  if (window.readingListFiles) {
    return window.readingListFiles.saveText(suggestedName, text);
  }
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = suggestedName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  return true;
}

/**
 * Opens a text file chosen by the person. Resolves null when they cancel.
 */
export function openTextFile(): Promise<string | null> {
  if (window.readingListFiles) {
    return window.readingListFiles.openText();
  }
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.addEventListener('change', () => {
      const file = input.files?.[0];
      if (!file) {
        resolve(null);
        return;
      }
      file.text().then(resolve, () => resolve(null));
    });
    input.addEventListener('cancel', () => resolve(null));
    input.click();
  });
}
