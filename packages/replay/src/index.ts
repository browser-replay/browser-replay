import {
  Replayer,
  type playerConfig,
  type PlayerMachineState,
  type SpeedMachineState,
} from '@dom-replay/core';

// NOTE: CSS is no longer auto-imported here (Vite 6 + strict exports map resolution).
// Consumers using the low-level @dom-replay/replay package should import the styles themselves:
//   import '@dom-replay/core/dist/style.css';
// (The React @dom-replay/player package handles its own styles.)

// Re-export the new safe rebuild helpers (recommended for untrusted sessions).
// These come from the snapshot layer and were added in the upstream rrweb sandbox work.
export {
  createSandboxedIframe,
  rebuildIntoSandboxedIframe,
} from '@dom-replay/snapshot';

export {
  Replayer,
  type playerConfig,
  type PlayerMachineState,
  type SpeedMachineState,
};
