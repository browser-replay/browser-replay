import snapshot, {
  serializeNodeWithId,
  transformAttribute,
  ignoreAttribute,
  slimDOMDefaults,
  visitSnapshot,
  cleanupSnapshot,
  needMaskingText,
  classMatchesRegex,
  IGNORED_NODE,
  genId,
} from './snapshot';
import rebuild, {
  buildNodeWithSN,
  adaptCssForReplay,
  createCache,
  createSandboxedIframe,
  rebuildIntoSandboxedIframe,
} from './rebuild';
export * from './types';
// Legacy broad export kept for compatibility. New internal imports should
// prefer snapshot-utils.ts / rebuild-utils.ts domain entrypoints (enables
// tree-shaking postcss out of record bundles).
export * from './utils';

export {
  snapshot,
  serializeNodeWithId,
  rebuild,
  buildNodeWithSN,
  adaptCssForReplay,
  createCache,
  transformAttribute,
  ignoreAttribute,
  slimDOMDefaults,
  visitSnapshot,
  cleanupSnapshot,
  needMaskingText,
  classMatchesRegex,
  IGNORED_NODE,
  genId,
  // New sandboxed rebuild helpers (recommended for untrusted replay data)
  createSandboxedIframe,
  rebuildIntoSandboxedIframe,
};

// New domain entrypoints for better tree-shaking and separation of concerns.
// Record code should prefer importing from './snapshot-utils' (or the package subpath).
// Replay code should prefer importing from './rebuild-utils'.
export * from './snapshot-utils';
export * from './rebuild-utils';
