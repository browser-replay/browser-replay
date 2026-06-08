import { defineConfig } from 'tsdown';
import { baseConfig } from '../../tsdown.config.base.mjs';

export default defineConfig({
  ...baseConfig,
  entry: [
    'src/index.ts',
    'src/snapshot-utils.ts',
    'src/rebuild-utils.ts',
  ],
});
