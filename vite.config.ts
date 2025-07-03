import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { builtinModules } from 'module';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Vite plugin to handle Electron files
const electronPlugin = () => ({
  name: 'electron-plugin',
  configResolved(config: any) {
    // In development, copy the preload script to the dist directory
    if (config.mode === 'development') {
      const preloadSrc = resolve(fileURLToPath(import.meta.url), '../../electron/preload.ts');
      const preloadDest = resolve(config.build.outDir, 'preload.js');
      
      // Ensure the destination directory exists
      if (!fs.existsSync(config.build.outDir)) {
        fs.mkdirSync(config.build.outDir, { recursive: true });
      }
      
      // Copy the preload script
      if (fs.existsSync(preloadSrc)) {
        fs.copyFileSync(preloadSrc, preloadDest);
        console.log('Copied preload script for development');
      }
    }
  },
});

export default defineConfig(({ mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '');
  const isProduction = mode === 'production';

  return {
    plugins: [
      react(),
      electronPlugin(),
    ],
    base: './',
    // Required for Electron
    root: __dirname,
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      // Required for Electron
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1024 * 1024,
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        external: [
          ...builtinModules.flatMap(p => [p, `node:${p}`]),
          'electron',
        ],
        output: {
          format: 'es',
          entryFileNames: '[name].js',
          chunkFileNames: '[name].js',
          assetFileNames: '[name].[ext]',
        },
      },
    },
    server: {
      port: 5173,
      strictPort: true,
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
        '~': resolve(__dirname, './electron'),
      },
    },
    define: {
      'process.env': {},
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
    },
    optimizeDeps: {
      exclude: ['electron'],
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: 'globalThis',
        },
      },
    },
  };
});
