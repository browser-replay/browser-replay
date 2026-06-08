import { defineConfig } from 'tsdown';
import { rolldown } from 'rolldown';
import type { Plugin } from 'rolldown';
import { baseConfig, umdBundleConfig } from '../../tsdown.config.base.mjs';

const WORKER_SUFFIX = '?worker&inline';

/**
 * Replicates Vite's `?worker&inline` import: the referenced module is bundled
 * into a single self-contained classic worker script, inlined as base64, and
 * exposed as a newable factory that constructs a `Worker` from a Blob URL. This
 * keeps the published package fully self-contained (no separate worker chunk to
 * resolve at runtime).
 *
 * The factory is a plain function (not a `class … extends Worker`) so the
 * `Worker` global is only referenced when a worker is actually instantiated.
 * A static `extends Worker` would evaluate `Worker` at module-load time and
 * throw `ReferenceError: Worker is not defined` in non-DOM environments (Node,
 * jsdom) the moment `@browser-replay/core` is imported — even transitively.
 */
function inlineWorkerPlugin(): Plugin {
  return {
    name: 'inline-worker',
    async resolveId(id, importer) {
      if (id.endsWith(WORKER_SUFFIX)) {
        const cleanId = id.slice(0, -WORKER_SUFFIX.length);
        const resolved = await this.resolve(cleanId, importer, {
          skipSelf: true,
        });
        if (resolved) return resolved.id + WORKER_SUFFIX;
      }
      return null;
    },
    async load(id) {
      if (!id.endsWith(WORKER_SUFFIX)) return null;
      const filePath = id.slice(0, -WORKER_SUFFIX.length);

      const bundle = await rolldown({ input: filePath, logLevel: 'silent' });
      const { output } = await bundle.generate({ format: 'iife' });
      await bundle.close();

      const base64 = Buffer.from(output[0].code, 'utf-8').toString('base64');
      return `
const __workerCode = "${base64}";
function __decodeWorker(b64) {
  const binary =
    typeof atob === 'function'
      ? atob(b64)
      : Buffer.from(b64, 'base64').toString('binary');
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}
export default function InlineWorker(options) {
  const blob = new Blob([__decodeWorker(__workerCode)], {
    type: 'application/javascript',
  });
  const url = URL.createObjectURL(blob);
  const worker = new Worker(url, options);
  URL.revokeObjectURL(url);
  return worker;
}
`;
    },
  };
}

export default defineConfig([
  // Published dual ESM + CJS build with matching types.
  {
    ...baseConfig,
    entry: ['src/index.ts'],
    plugins: [inlineWorkerPlugin()],
    // `./dist/style.css` is a stylesheet, not a JS/types entrypoint.
    attw: { profile: 'node16', entrypoints: ['.'] },
  },

  // Self-contained UMD bundle injected into a page by the Puppeteer
  // record/replay test harnesses (global `window.browserReplay`). Needs the
  // same inline-worker plugin so the canvas worker is embedded.
  umdBundleConfig({
    globalName: 'browserReplay',
    fileName: 'core.umd.cjs',
    plugins: [inlineWorkerPlugin()],
  }),
]);
