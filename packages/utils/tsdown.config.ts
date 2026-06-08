import { defineConfig } from 'tsdown';
import { baseConfig } from '../../tsdown.config.base.mjs';

export default defineConfig({
  ...baseConfig,
  entry: ['src/index.ts'],
  // This package exposes both named exports and a default export; emit them
  // as named (default becomes `.default`) to match the previous build output.
  outputOptions: { exports: 'named' },
});
