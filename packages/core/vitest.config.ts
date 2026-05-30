/// <reference types="vitest" />
import { defineProject, mergeConfig } from 'vitest/config';
import configShared from '../../vitest.config';

export default mergeConfig(
  configShared,
  defineProject({
    test: {
      globals: true,
      // Automatically load robust image snapshot defaults + matcher registration
      setupFiles: ['./test/setup.ts'],
    },
    resolve: {
      // Important after exports map modernization + Vite 6.
      // Helps Vitest resolve workspace packages (@browser-replay/types, @browser-replay/snapshot, etc.)
      // correctly when running tests that import from them.
      conditions: ['development', 'node', 'import', 'require', 'default'],
    },
    optimizeDeps: {
      // Exclude workspace packages from Vite's pre-bundling.
      // This is a common requirement in monorepos with strict exports maps
      // to avoid "Failed to resolve entry for package" errors during tests.
      exclude: ['@browser-replay/types', '@browser-replay/snapshot'],
    },
    ssr: {
      // Ensure workspace packages are not externalized during SSR-like resolution
      // in Vitest (forks pool). Helps with the types/snapshot resolution issues
      // after the exports map modernization.
      noExternal: ['@browser-replay/types', '@browser-replay/snapshot'],
    },
  }),
);
