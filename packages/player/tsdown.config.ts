import { defineConfig } from 'tsdown';
import { baseConfig } from '../../tsdown.config.base.mjs';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/headless.ts'],
  tsconfig: 'tsconfig.build.json',
  // The `./dist/style.css` export is a stylesheet, not a JS/types entrypoint;
  // only type-check the real JS entrypoints.
  attw: { profile: 'node16', entrypoints: ['.', './headless'] },
});
