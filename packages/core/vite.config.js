import config from '../../vite.config.default';

// export default config('src/index.ts', 'browserReplay', { outputDir: 'dist/main' });
export default config('src/index.ts', 'browserReplay', { fileName: 'core' });
