import tseslint from 'typescript-eslint';
import baseConfig from './eslint.config.mjs';

export default tseslint.config(
  ...baseConfig,
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.eslint.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Type-aware specific rules can be added/enabled here
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/await-thenable': 'warn',
    },
  },
);