import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: 'electron/preload.ts',
      formats: ['cjs'],
      fileName: () => 'preload.js',
    },
    outDir: 'dist-electron',
    emptyOutDir: false,
    rollupOptions: {
      external: ['electron'],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, '../src'),
    },
  },
});
