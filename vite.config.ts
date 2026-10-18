import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base "./" makes the built page load from a file, which is how Electron opens it.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
