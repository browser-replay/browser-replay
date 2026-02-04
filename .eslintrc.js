module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
    'jest/globals': true,
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
  plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc', 'jest', 'compat'],
  reportUnusedDisableDirectives: true,
  rules: {
    'tsdoc/syntax': 'warn',
    '@typescript-eslint/prefer-as-const': 'warn',
    // Keep eslint lightweight; rely on `pnpm check-types` for typechecking.
    '@typescript-eslint/no-explicit-any': 'off',
    'camelcase': ['error', {
      allow: ['rr_.*', 'legacy_.*', 'UNSAFE_.*', '__rrweb_.*'],
    }],
  },
};
