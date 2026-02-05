/// <reference types="vite/client" />
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'domReplayPlayerReact',
      fileName: 'player-react',
      formats: ['es', 'cjs'],
    },
    outDir: 'dist',
    emptyOutDir: !process.argv.includes('--watch'),
    minify: false,
    sourcemap: true,
    rollupOptions: {
      external: ['react', 'react-dom'],
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      afterBuild: (emittedFiles: Map<string, string>) => {
        const files: string[] = Array.from(emittedFiles.keys());
        files.forEach((file) => {
          const ctsFile = file.replace('.d.ts', '.d.cts');
          copyFileSync(file, ctsFile);
        });
      },
    }),
  ],
});

