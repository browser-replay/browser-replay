import { defineConfig } from 'tsdown';
import { baseConfig } from '../../tsdown.config.base.mjs';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts', 'src/pack.ts', 'src/unpack.ts'],
});
