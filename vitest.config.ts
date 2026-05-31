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
    // (@browser-replay/types, @browser-replay/snapshot, etc.) across the monorepo.
    conditions: ['development', 'node', 'import', 'require', 'default'],
  },

  optimizeDeps: {
    // Exclude workspace packages from pre-bundling to avoid resolution issues
    // with strict exports maps in monorepos (common after Vite 6 modernization).
    exclude: ['@browser-replay/types', '@browser-replay/snapshot'],
  },

  ssr: {
    // Ensure workspace packages are properly resolved (not externalized) in Vitest.
    // Complements the conditions + optimizeDeps settings.
    noExternal: ['@browser-replay/types', '@browser-replay/snapshot'],
  },
};
