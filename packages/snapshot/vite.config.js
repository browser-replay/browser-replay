import path from 'path';
import config from '../../vite.config.default';

export default config(
  {
    snapshot: path.resolve(__dirname, 'src/index.ts'),
    'snapshot-utils': path.resolve(__dirname, 'src/snapshot-utils.ts'),
    'rebuild-utils': path.resolve(__dirname, 'src/rebuild-utils.ts'),
  },
  'browserReplaySnapshot',
);
