import config from '../../vite.config.default';

export default config(
  {
    // 'core': 'src/index.ts',  // main bundle uses vite.config.js
    'core-record': 'src/entries/record.ts',
    'core-replay': 'src/entries/replay.ts',
  },
  'browserReplay',
  // { outputDir: 'dist/alt' },
  { outputDir: 'dist' },
);
