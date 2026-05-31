/// <reference types="vite/client" />
import { copyFileSync } from 'node:fs';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  build: {
    lib: {
      entry: {
        'player': resolve(__dirname, 'src/index.ts'),
        headless: resolve(__dirname, 'src/headless.ts'),
      },
      name: 'browserReplayPlayer',
      formats: ['es', 'cjs'],
    },
    outDir: 'dist',
    emptyOutDir: !process.argv.includes('--watch'),
    minify: false,
    sourcemap: true,
    rollupOptions: {
      // IMPORTANT: keep all React runtime entrypoints external.
      // If we accidentally bundle `react/jsx-runtime`, consumers that alias React
      // (e.g. preact/compat) can crash at runtime with React internals errors.
      external: ['react', 'react-dom', 'react/jsx-runtime', 'react/jsx-dev-runtime'],
    },
  },
  plugins: [
    dts({
      tsconfigPath: resolve(__dirname, 'tsconfig.build.json'),
      insertTypesEntry: true,
      rollupTypes: true,
      afterBuild: (emittedFiles: Map<string, string>) => {
        // eslint-disable-next-line compat/compat -- build-time node config
        const files: string[] = Array.from(emittedFiles.keys());
        files.forEach((file) => {
          const ctsFile = file.replace('.d.ts', '.d.cts');
          copyFileSync(file, ctsFile);
        });
      },
    }),
  ],
});

