import {
  Replayer,
  type playerConfig,
  type PlayerMachineState,
  type SpeedMachineState,
} from '@browser-replay/core';

// NOTE: CSS is no longer auto-imported here (Vite 6 + strict exports map resolution).
// Consumers using the low-level @browser-replay/replay package should import the styles themselves:
//   import '@browser-replay/core/dist/style.css';
// (The React @browser-replay/player package handles its own styles.)

export {
  Replayer,
  type playerConfig,
  type PlayerMachineState,
  type SpeedMachineState,
};

