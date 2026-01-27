
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { fileURLToPath, URL } from 'node:url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit', 'redux-observable', 'rxjs', 'use-sync-external-store', 'use-sync-external-store/shim', 'use-sync-external-store/with-selector']
  },
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  define: {
    global: 'globalThis',
  },
  build: {
    target: 'esnext',
    outDir: 'build',
    commonjsOptions: {
      include: [/node_modules/]
    }
  },
  server: {
    port: 3007,
    open: true,
  },
  });