import path from 'path';
import baseConfig from '../../vite.config.default';

export default baseConfig(path.resolve(__dirname, 'src/index.ts'), 'rrweb');
