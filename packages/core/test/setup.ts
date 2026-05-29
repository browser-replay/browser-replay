import { expect } from 'vitest';
import { toMatchImageSnapshot } from 'jest-image-snapshot';
import { defaultImageSnapshotOptions } from './utils';

// Global image snapshot setup with robust defaults (see defaultImageSnapshotOptions).
// Tests can still pass custom options to override.
expect.extend({
  toMatchImageSnapshot(received: any, options?: any) {
    const mergedOptions = {
      ...defaultImageSnapshotOptions,
      ...options,
    };
    // @ts-ignore - jest-image-snapshot adds this matcher
    return toMatchImageSnapshot.call(this, received, mergedOptions);
  },
});