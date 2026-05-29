export default {
  test: {
    snapshotFormat: {
      escapeString: true,
      printBasicPrototype: true,
    },

    // 'forks' required for Vite 6 compatibility in browser-heavy packages.
    // Lighter packages override to 'threads' in their own config.
    pool: 'forks',

    // Auto-retry in CI (helps with browser/image snapshot flakiness).
    retry: process.env.CI ? 2 : 0,
  },

  resolve: {
    // Helps Vitest resolve modern exports maps for workspace packages
    // (@dom-replay/types, @dom-replay/snapshot, etc.) across the monorepo.
    conditions: ['development', 'node', 'import', 'require', 'default'],
  },
};
