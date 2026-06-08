// @ts-check

/**
 * Shared tsdown configuration for all publishable workspace packages.
 *
 * Produces dual ESM + CJS output with matching, self-contained
 * `*.d.mts` / `*.d.cts` declaration files (correct under node16/nodenext,
 * bundler, and node10 resolution), and validates the published package
 * shape with publint + are-the-types-wrong on every build.
 *
 * Spread it into a package's `defineConfig`, overriding `entry` (and any
 * package-specific options) as needed:
 *
 * ```ts
 * import { defineConfig } from 'tsdown';
 * import { baseConfig } from '../../tsdown.config.base.mjs';
 * export default defineConfig({ ...baseConfig, entry: ['src/index.ts'] });
 * ```
 *
 * @type {import('tsdown').UserConfig}
 */
export const baseConfig = {
  format: ['es', 'cjs'],
  dts: true,
  sourcemap: true,
  clean: true,
  // Sibling workspace packages are external runtime dependencies and must
  // never be inlined into a package's JS or declaration output.
  deps: {
    neverBundle: [/^@browser-replay\//],
    dts: { neverBundle: [/^@browser-replay\//] },
  },
  publint: true,
  // Target the node16 profile (node16/nodenext + bundler resolution). The
  // project requires Node >=20; the legacy `node10` algorithm does not
  // understand subpath `exports`, so it is intentionally not gated.
  attw: { profile: 'node16' },
};

/**
 * Builds a second config that emits a single, self-contained UMD/CDN bundle
 * alongside the dual ESM + CJS build above.
 *
 * This is required for the browser-facing packages:
 *  - `@browser-replay/video` (a published CLI) loads `player-core.umd.cjs` at
 *    runtime and injects it into a Playwright page, so player-core must ship it.
 *  - the Puppeteer/Playwright test harnesses for `core`, `snapshot`, and `dom`
 *    inject `<name>.umd.cjs` into a page via a global (e.g. `window.browserReplay`).
 *
 * Unlike the npm-facing ESM/CJS output, a UMD bundle must be fully
 * self-contained: sibling `@browser-replay/*` packages (and any CSS) are
 * inlined rather than left as bare `require`/`import` calls that cannot be
 * resolved inside a browser page.
 *
 * Returned as a separate config (used via `defineConfig([baseConfig, …])`).
 * It sets `clean: false` so it never wipes the ESM/CJS artifacts written by the
 * base config into the same `dist` directory.
 *
 * @param {{ globalName: string, fileName: string, entry?: string, plugins?: import('tsdown').UserConfig['plugins'] }} options
 * @returns {import('tsdown').UserConfig}
 */
export function umdBundleConfig({
  globalName,
  fileName,
  entry = 'src/index.ts',
  plugins = [],
}) {
  return {
    entry: [entry],
    format: ['umd'],
    globalName,
    platform: 'browser',
    plugins,
    dts: false,
    sourcemap: false,
    // The base (ESM/CJS) config owns cleaning `dist`; never wipe it here.
    clean: false,
    report: false,
    // A UMD/CDN bundle injected into a browser page must be fully
    // self-contained: bundle ALL dependencies (sibling workspace packages AND
    // third-party deps like postcss/fflate), not just `@browser-replay/*`.
    // Declared `dependencies` are externalized by default, which would leave
    // bare `require('postcss')` calls that cannot resolve inside a page.
    deps: { alwaysBundle: () => true },
    outputOptions: { entryFileNames: fileName },
  };
}
