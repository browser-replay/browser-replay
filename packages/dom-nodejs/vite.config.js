import path from 'path';
import config from '../../vite.config.default';

export default config(
  path.resolve(__dirname, 'src/index.ts'),
  'browserReplayDomNodejs',
  // Node lib: externalize builtins to avoid Vite's browser-compat warning.
  { fileName: 'dom-nodejs', external: [/^node:/, 'perf_hooks'] },
);
