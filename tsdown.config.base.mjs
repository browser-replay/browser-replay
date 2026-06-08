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
