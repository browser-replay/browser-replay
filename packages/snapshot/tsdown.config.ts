import { defineConfig } from 'tsdown';
import { baseConfig, umdBundleConfig } from '../../tsdown.config.base.mjs';

export default defineConfig([
  // Published dual ESM + CJS build with matching types (multi-entry).
  {
    ...baseConfig,
    entry: [
      'src/index.ts',
      'src/snapshot-utils.ts',
      'src/rebuild-utils.ts',
    ],
  },

  // Self-contained UMD bundle injected into a page by the Puppeteer
  // integration tests in `test/integration.test.ts` (global `browserReplaySnapshot`).
  umdBundleConfig({
    globalName: 'browserReplaySnapshot',
    fileName: 'snapshot.umd.cjs',
  }),
]);
