/**
 * Snapshot-domain utility entrypoint.
 *
 * Intent:
 * - Keep snapshot.ts imports explicit and decoupled from rebuild concerns.
 * - Serve as a stable seam for future extraction into snapshot-only modules.
 * - Preserve current public API behavior by re-exporting from legacy utils.ts.
 *
 * This file exists to enable tree-shaking of postcss (used only in rebuild)
 * out of record bundles. See upstream rrweb PRs #1837 / #1838.
 */
export * from './types';

export {
  Mirror,
  is2DCanvasBlank,
  isElement,
  isShadowRoot,
  maskInputValue,
  isNativeShadowDom,
  stringifyStylesheet,
  stringifyRule,
  createMirror,
  getInputType,
  toLowerCase,
  extractFileExtension,
  absolutifyURLs,
  markCssSplits,
} from './utils';

export {
  default as snapshot,
  serializeNodeWithId,
  transformAttribute,
  ignoreAttribute,
  needMaskingText,
  slimDOMDefaults,
  IGNORED_NODE,
  genId,
  classMatchesRegex,
  visitSnapshot,
  cleanupSnapshot,
} from './snapshot';
