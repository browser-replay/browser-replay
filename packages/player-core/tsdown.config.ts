import { defineConfig } from 'tsdown';
import { baseConfig, umdBundleConfig } from '../../tsdown.config.base.mjs';

export default defineConfig([
  // Published dual ESM + CJS build with matching types.
  { ...baseConfig, entry: ['src/index.ts'] },

  // Self-contained UMD/CDN bundle. The published `@browser-replay/video` CLI
  // resolves this file (`dist/player-core.umd.cjs`) relative to player-core's
  // entry and injects it into a Playwright page (global `browserReplayPlayerCore`),
  // so it must be a real, published artifact.
  umdBundleConfig({
    globalName: 'browserReplayPlayerCore',
    fileName: 'player-core.umd.cjs',
  }),
]);
