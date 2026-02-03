import config from '../../vite.config.default';

export default config(
  {
    // rrweb: 'src/index.ts',
    'core-record': 'src/entries/record.ts',
    'core-replay': 'src/entries/replay.ts',
  },
  'domReplayCore',
  // { outputDir: 'dist/alt' },
  { outputDir: 'dist' },
);
