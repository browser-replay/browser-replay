import { defineConfig } from 'tsdown';
import { baseConfig, umdBundleConfig } from '../../tsdown.config.base.mjs';

export default defineConfig([
  // Published dual ESM + CJS build with matching types.
  { ...baseConfig, entry: ['src/index.ts'] },

  // Self-contained UMD bundle injected into a page by the Puppeteer tests in
  // `test/diff.test.ts` and `test/virtual-dom.test.ts` (global `browserReplayDom`).
  umdBundleConfig({
    globalName: 'browserReplayDom',
    fileName: 'dom.umd.cjs',
  }),
]);
