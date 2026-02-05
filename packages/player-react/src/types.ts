import type * as React from 'react';
import type { PlayerHandle, PlayerProps, PlayerStateSnapshot } from '@dom-replay/player-core';

export type DomReplayPlayerProps = PlayerProps & {
  className?: string;
  style?: React.CSSProperties;
  onStateChange?: (state: PlayerStateSnapshot) => void;
};

export type DomReplayPlayerRef = Omit<PlayerHandle, 'mount' | 'destroy' | 'subscribe'> & {
  getContainer(): HTMLDivElement | null;
};

