import type { eventWithTime, playerMetaData } from '@dom-replay/types';
import type {
  Replayer,
  playerConfig,
  PlayerMachineState,
  SpeedMachineState,
} from '@dom-replay/replay';
import type { Mirror } from '@dom-replay/snapshot';

export type PlayerProps = {
  events: eventWithTime[];
  width?: number;
  height?: number;
  maxScale?: number;
  autoPlay?: boolean;
  speed?: number;
  speedOption?: number[];
  showController?: boolean;
  tags?: Record<string, string>;
  inactiveColor?: string;
} & Partial<playerConfig>;

export type PlayerUiEventMap = {
  [event: string]: unknown;
  'ui-update-current-time': { payload: number };
  'ui-update-progress': { payload: number }; // 0..1
  'ui-update-player-state': { payload: 'playing' | 'paused' | 'live' };
};

export type InactivePeriodMarker = {
  name: string;
  background: string;
  position: string;
  width: string;
  startMs: number;
  endMs: number;
};

export type CustomEventMarker = {
  name: string;
  background: string;
  position: string;
  timestamp: number;
};

export type PlayerStateSnapshot = {
  currentTime: number;
  meta: playerMetaData;
  playerState: 'playing' | 'paused' | 'live';
  speedState: 'normal' | 'skipping';
  speed: number;
  skipInactive: boolean;
  finished: boolean;
  width: number;
  height: number;
  maxScale: number;
  tags: Record<string, string>;
  inactiveColor: string;
  inactivePeriods: InactivePeriodMarker[];
  customEvents: CustomEventMarker[];
};

export type PlayerHandle = {
  mount(target: HTMLElement): void;
  destroy(): void;

  addEventListener<E extends keyof PlayerUiEventMap>(
    event: E,
    handler: (detail: PlayerUiEventMap[E]) => unknown,
  ): () => void;
  addEventListener(event: string, handler: (detail: unknown) => unknown): () => void;

  addEvent(event: eventWithTime): void;
  getMetaData: Replayer['getMetaData'];
  getReplayer(): Replayer;
  getMirror(): Mirror;

  toggle(): void;
  setSpeed(speed: number): void;
  toggleSkipInactive(): void;
  toggleFullscreen(): void;
  triggerResize(): void;
  setProps(next: Partial<Pick<PlayerProps, 'width' | 'height' | 'maxScale'>>): void;

  play(): void;
  pause(): void;
  goto(timeOffset: number, play?: boolean): void;
  playRange(
    timeOffset: number,
    endTimeOffset: number,
    startLooping?: boolean,
    afterHook?: undefined | (() => void),
  ): void;

  getState(): PlayerStateSnapshot;
  subscribe(listener: (state: PlayerStateSnapshot) => void): () => void;
};

export type InternalReplayerStateChangePayload = {
  player?: PlayerMachineState;
  speed?: SpeedMachineState;
};

