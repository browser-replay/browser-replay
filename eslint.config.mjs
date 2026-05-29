import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import compat from 'eslint-plugin-compat';
import reactHooks from 'eslint-plugin-react-hooks';
import tsdoc from 'eslint-plugin-tsdoc';
import globals from 'globals';

export default tseslint.config(
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      'node_modules/**',
      '**/dist/**',
      '**/build/**',
      '**/lib/**',
      '**/es/**',
      '**/typings/**',
      '**/*.d.ts',
      '**/*.d.cts',
      '.svelte-kit/**',
      'pnpm-lock.yaml',
      'package-lock.json',
      'yarn.lock',
      '.env',
      '.env.*',
      '!.env.example',
      '.DS_Store',
    ],
  },

  // Base recommended configs
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // Main project config
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      compat,
      'react-hooks': reactHooks,
      tsdoc,
    },
    rules: {
      // Keep these as warnings to avoid breaking CI while migrating
      'react-hooks/exhaustive-deps': 'warn',
      'tsdoc/syntax': 'warn',
      '@typescript-eslint/prefer-as-const': 'warn',

      // We rely on `pnpm check-types` for actual type checking
      '@typescript-eslint/no-explicit-any': 'off',

      camelcase: ['error', {
        allow: ['legacy_.*', 'UNSAFE_.*', '__dr_.*', 'dr_.*'],
      }],

      // Migration-friendly rules (tighten over time)
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }],
      '@typescript-eslint/no-empty-object-type': 'warn',
      '@typescript-eslint/no-unused-expressions': 'warn',
    },
    settings: {
      // For eslint-plugin-compat
      browserslist: [
        'defaults',
        'not op_mini all',
      ],
    },
  },

  // Package-specific overrides (migrated from old overrides)
  {
    files: ['packages/dom-nodejs/**/*.ts'],
    rules: {
      '@typescript-eslint/no-var-requires': 'off',
    },
  },
  {
    files: ['packages/player/**/*.{ts,tsx}'],
    rules: {
      'compat/compat': 'warn',
      '@typescript-eslint/no-empty-function': 'warn',
    },
  },
  {
    files: ['packages/player-core/src/index.ts'],
    rules: {
      '@typescript-eslint/no-empty-function': 'warn',
      'no-extra-boolean-cast': 'warn',
    },
  },
  {
    files: ['packages/core/src/utils.ts'],
    rules: {
      '@typescript-eslint/no-this-alias': 'warn',
    },
  },
);