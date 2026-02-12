module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:compat/recommended',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    tsconfigRootDir: __dirname,
  },
  plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc', 'compat'],
  reportUnusedDisableDirectives: true,
  rules: {
    'tsdoc/syntax': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',
    // Keep eslint lightweight; rely on `pnpm check-types` for typechecking.
    '@typescript-eslint/no-explicit-any': 'off',
    'camelcase': ['error', {
      allow: ['legacy_.*', 'UNSAFE_.*', '__dr_.*', 'dr_.*'],
    }],
  },
};
