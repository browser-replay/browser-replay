import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@browser-replay/player': path.resolve(__dirname, '../src'),
      '@browser-replay/player-core': path.resolve(__dirname, '../../player-core/src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
});
