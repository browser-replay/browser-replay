import type * as React from 'react';
import type { PlayerHandle, PlayerProps, PlayerStateSnapshot } from '@browser-replay/player-core';

export type DomReplayPlayerProps = PlayerProps & {
  className?: string;
  style?: React.CSSProperties;
  /**
   * Called when player state changes (play/pause, progress, speed, etc.).
   * Fires frequently during playback (~10/sec due to throttling). Throttle
   * further in your handler if you do heavy work.
   */
  onStateChange?: (state: PlayerStateSnapshot) => void;
};

export type DomReplayPlayerRef = Omit<PlayerHandle, 'mount' | 'destroy'> & {
  getContainer(): HTMLDivElement | null;
};

