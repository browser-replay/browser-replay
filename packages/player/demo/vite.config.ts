import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: path.resolve(__dirname),
  resolve: {
    alias: {
      '@dom-replay/player': path.resolve(__dirname, '../src'),
      '@dom-replay/player-core': path.resolve(__dirname, '../../player-core/src'),
    },
  },
  server: {
    port: 5174,
    open: true,
  },
});
