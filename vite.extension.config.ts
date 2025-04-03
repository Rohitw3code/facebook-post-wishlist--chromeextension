import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist/extension',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        content: 'src/content.tsx'
      },
      output: {
        entryFileNames: '[name].js',
        format: 'iife'
      }
    }
  }
});