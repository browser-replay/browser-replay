import { unpack } from '@browser-replay/packer/unpack';
import { EventType } from '@browser-replay/types';
import type { eventWithTime, playerMetaData } from '@browser-replay/types';
import { Replayer, type playerConfig } from '@browser-replay/replay';
import type { Handler } from '@browser-replay/types';
import {
  exitFullscreen,
  getInactivePeriods,
  inlineCss,
  isFullscreen,
  onFullscreenChange,
  openFullscreen,
} from './utils';
import type {
  CustomEventMarker,
  InactivePeriodMarker,
  InternalReplayerStateChangePayload,
  PlayerHandle,
  PlayerProps,
  PlayerStateSnapshot,
  PlayerUiEventMap,
} from './types';

type Unsubscribe = () => void;

function createEmitter() {
  const listeners = new Map<string, Set<(detail: unknown) => unknown>>();

  return {
    on(event: string, cb: (detail: unknown) => unknown): Unsubscribe {
      const set = listeners.get(event) ?? new Set();
      set.add(cb);
      listeners.set(event, set);
      return () => {
        const s = listeners.get(event);
        if (!s) return;
        s.delete(cb);
        if (s.size === 0) listeners.delete(event);
      };
    },
    emit(event: string, detail: unknown) {
      const set = listeners.get(event);
      if (!set) return;
      for (const cb of set) cb(detail);
    },
  };
}

function clamp01(n: number) {
  if (n < 0) return 0;
  if (n > 1) return 1;
  return n;
}

function position(startTime: number, endTime: number, tagTime: number) {
  const sessionDuration = endTime - startTime;
  const eventDuration = endTime - tagTime;
  const eventPosition = 100 - (eventDuration / sessionDuration) * 100;
  return eventPosition.toFixed(2);
}

function computeCustomEventsMarkers(
  events: eventWithTime[],
  tags: Record<string, string>,
): CustomEventMarker[] {
  if (events.length < 2) return [];
  const start = events[0].timestamp;
  const end = events[events.length - 1].timestamp;
  const out: CustomEventMarker[] = [];
  for (const ev of events) {
    if (ev.type !== EventType.Custom) continue;
    out.push({
      name: ev.data.tag,
      background: tags[ev.data.tag] || 'rgb(73, 80, 246)',
      position: `${position(start, end, ev.timestamp)}%`,
      timestamp: ev.timestamp,
    });
  }
  return out;
}

function computeInactivePeriodMarkers(
  events: eventWithTime[],
  inactivePeriodThreshold: number,
  inactiveColor: string,
): InactivePeriodMarker[] {
  if (events.length < 2) return [];
  const start = events[0].timestamp;
  const end = events[events.length - 1].timestamp;
  const periods = getInactivePeriods(events, inactivePeriodThreshold);

  const getWidthPct = (tagStart: number, tagEnd: number) => {
    const sessionDuration = end - start;
    const eventDuration = tagEnd - tagStart;
    const width = (eventDuration / sessionDuration) * 100;
    return width.toFixed(2);
  };

  return periods.map(([pStart, pEnd]) => ({
    name: 'inactive period',
    background: inactiveColor,
    position: `${position(start, end, pStart)}%`,
    width: `${getWidthPct(pStart, pEnd)}%`,
    startMs: pStart,
    endMs: pEnd,
  }));
}

function defaultMeta(): playerMetaData {
  return { startTime: 0, endTime: 0, totalTime: 0 };
}

function normalizeStateValue(value: unknown): PlayerStateSnapshot['playerState'] {
  if (value === 'playing' || value === 'paused' || value === 'live') return value;
  return 'paused';
}

function normalizeSpeedStateValue(
  value: unknown,
): PlayerStateSnapshot['speedState'] {
  if (value === 'skipping') return 'skipping';
  return 'normal';
}

export function createPlayerHandle(initialProps: PlayerProps): PlayerHandle {
  const uiEmitter = createEmitter();
  const subscribers = new Set<(s: PlayerStateSnapshot) => void>();

  let props: PlayerProps = {
    width: 1024,
    height: 576,
    maxScale: 1,
    autoPlay: true,
    speed: 1,
    speedOption: [1, 2, 4, 8],
    showController: true,
    tags: {},
    inactiveColor: '#D4D4D4',
    ...initialProps,
  };

  let rootEl: HTMLDivElement | null = null;
  let frameEl: HTMLDivElement | null = null;
  let replayer: Replayer | null = null;

  let raf: number | null = null;
  let finished = false;
  let pauseAt: number | false = false;
  let onPauseHook: (() => unknown) | null = null;
  let loop: { start: number; end: number } | null = null;

  let fullscreenCleanup: null | (() => void) = null;
  let prevDimensions: { width: number; height: number } | null = null;

  let state: PlayerStateSnapshot = {
    currentTime: 0,
    meta: defaultMeta(),
    playerState: 'paused',
    speedState: 'normal',
    speed: props.speed ?? 1,
    skipInactive: Boolean(props.skipInactive),
    finished: false,
    width: props.width ?? 1024,
    height: props.height ?? 576,
    maxScale: props.maxScale ?? 1,
    tags: props.tags ?? {},
    inactiveColor: props.inactiveColor ?? '#D4D4D4',
    inactivePeriods: [],
    customEvents: [],
  };

  function notify() {
    for (const fn of subscribers) fn(state);
  }

  function emitUi<E extends keyof PlayerUiEventMap>(
    event: E,
    detail: PlayerUiEventMap[E],
  ) {
    uiEmitter.emit(event as string, detail);
  }

  function computeDerivedState() {
    if (!replayer) {
      state = { ...state, inactivePeriods: [], customEvents: [] };
      return;
    }
    const events = (replayer.service.state.context.events || []) as eventWithTime[];
    state = {
      ...state,
      inactivePeriods: computeInactivePeriodMarkers(
        events,
        replayer.config.inactivePeriodThreshold,
        state.inactiveColor,
      ),
      customEvents: computeCustomEventsMarkers(events, state.tags),
    };
  }

  function updateProgressUi() {
    const total = state.meta.totalTime || 0;
    const pct = total > 0 ? clamp01(state.currentTime / total) : 0;
    emitUi('ui-update-current-time', { payload: state.currentTime });
    emitUi('ui-update-progress', { payload: pct });
    emitUi('ui-update-player-state', { payload: state.playerState });
  }

  function stopRaf() {
    if (raf != null) {
      cancelAnimationFrame(raf);
      raf = null;
    }
  }

  function startRaf() {
    stopRaf();
    const tick = () => {
      if (!replayer) return;
      const current = replayer.getCurrentTime();
      state = { ...state, currentTime: current };

      if (pauseAt && current >= pauseAt) {
        if (loop) {
          playRange(loop.start, loop.end, true, undefined);
        } else {
          replayer.pause();
          pauseAt = false;
          if (onPauseHook) {
            onPauseHook();
            onPauseHook = null;
          }
        }
      }

      updateProgressUi();
      notify();

      if (current < state.meta.totalTime) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
  }

  function applyDimensions() {
    if (!rootEl || !frameEl) return;
    const width = props.width ?? 1024;
    const height = props.height ?? 576;
    state = { ...state, width, height, maxScale: props.maxScale ?? 1 };

    frameEl.setAttribute(
      'style',
      inlineCss({
        width: `${width}px`,
        height: `${height}px`,
      }),
    );
    rootEl.setAttribute(
      'style',
      inlineCss({
        width: `${width}px`,
        height: `${height}px`,
      }),
    );
  }

  function updateScale(
    el: HTMLElement,
    frameDimension: { width: number; height: number },
  ) {
    const width = state.width;
    const height = state.height;
    const maxScale = state.maxScale;
    const widthScale = width / frameDimension.width;
    const heightScale = height / frameDimension.height;
    const scale = [widthScale, heightScale];
    if (maxScale) scale.push(maxScale);
    const finalScale = Math.min(...scale);
    el.style.transform = `translate(-50%, -50%) scale(${finalScale})`;
  }

  function triggerResize() {
    if (!replayer) return;
    updateScale(replayer.wrapper, {
      width: replayer.iframe.offsetWidth,
      height: replayer.iframe.offsetHeight,
    });
  }

  function refreshMeta() {
    if (!replayer) return;
    state = { ...state, meta: replayer.getMetaData() };
  }

  function mount(target: HTMLElement) {
    if (replayer) return;

    rootEl = document.createElement('div');
    rootEl.className = 'dr-player';

    frameEl = document.createElement('div');
    frameEl.className = 'dr-player__frame';

    rootEl.appendChild(frameEl);
    target.appendChild(rootEl);

    applyDimensions();

    const {
      events,
      width: _width,
      height: _height,
      maxScale: _maxScale,
      autoPlay: _autoPlay,
      speedOption: _speedOption,
      showController: _showController,
      tags: _tags,
      inactiveColor: _inactiveColor,
      ...rest
    } = props;

    const cfg: Partial<playerConfig> = {
      ...rest,
      speed: props.speed ?? 1,
      root: frameEl,
      unpackFn: unpack,
      mouseTail: props.mouseTail ?? {
        duration: 500,
        lineCap: 'round',
        lineWidth: 3,
        strokeStyle: 'yellow',
      },
    };

    replayer = new Replayer(events, cfg);
    refreshMeta();
    computeDerivedState();

    triggerResize();

    replayer.on('resize', (dimension: unknown) => {
      if (!replayer) return;
      updateScale(replayer.wrapper, dimension as { width: number; height: number });
    });

    const stateChangeHandler: Handler = (payload: unknown) => {
      const p = payload as InternalReplayerStateChangePayload;
      if (p.player?.value) {
        const next = normalizeStateValue(p.player.value);
        if (next !== state.playerState) {
          state = { ...state, playerState: next };
          if (next === 'playing') startRaf();
          if (next === 'paused') stopRaf();
        }
      }
      if (p.speed?.value) {
        state = { ...state, speedState: normalizeSpeedStateValue(p.speed.value) };
      }
      updateProgressUi();
      notify();
    };
    replayer.on('state-change', stateChangeHandler);

    replayer.on('finish', () => {
      finished = true;
      state = { ...state, finished: true };
      if (onPauseHook) {
        onPauseHook();
        onPauseHook = null;
      }
      updateProgressUi();
      notify();
    });

    fullscreenCleanup = onFullscreenChange(() => {
      if (!replayer || !rootEl) return;
      if (isFullscreen()) {
        prevDimensions = { width: state.width, height: state.height };
        setTimeout(() => {
          if (!rootEl) return;
          props = {
            ...props,
            width: rootEl.offsetWidth,
            height: rootEl.offsetHeight,
          };
          applyDimensions();
          triggerResize();
          refreshMeta();
          computeDerivedState();
          updateProgressUi();
          notify();
        }, 0);
      } else if (prevDimensions) {
        props = {
          ...props,
          width: prevDimensions.width,
          height: prevDimensions.height,
        };
        prevDimensions = null;
        applyDimensions();
        triggerResize();
        refreshMeta();
        computeDerivedState();
        updateProgressUi();
        notify();
      }
    });

    state = {
      ...state,
      playerState: normalizeStateValue(replayer.service.state.value),
      speedState: normalizeSpeedStateValue(replayer.speedService.state.value),
      skipInactive: Boolean(replayer.config.skipInactive),
      speed: replayer.config.speed,
    };
    updateProgressUi();
    notify();

    if (props.autoPlay) {
      replayer.play();
    }
  }

  function destroy() {
    stopRaf();
    fullscreenCleanup?.();
    fullscreenCleanup = null;

    if (replayer) {
      try {
        replayer.pause();
      } catch {
        // Ignore — the replayer's internal DOM may already be torn down.
      }
      try {
        const maybeDestroy = (replayer as any).destroy as undefined | (() => void);
        maybeDestroy?.();
      } catch {
        // Ignore teardown errors.
      }
    }
    replayer = null;

    if (rootEl && rootEl.parentNode) rootEl.parentNode.removeChild(rootEl);
    rootEl = null;
    frameEl = null;
    subscribers.clear();
  }

  function addEventListener(event: string, handler: (detail: unknown) => unknown): Unsubscribe {
    if (event.startsWith('ui-update-')) {
      return uiEmitter.on(event, handler);
    }
    if (!replayer) {
      return () => {};
    }
    const h = handler as unknown as Handler;
    replayer.on(event, h);
    return () => replayer?.off(event, h);
  }

  function addEvent(ev: eventWithTime) {
    if (!replayer) return;
    replayer.addEvent(ev);
    refreshMeta();
    computeDerivedState();
    updateProgressUi();
    notify();
  }

  function getReplayer() {
    if (!replayer) throw new Error('Player is not mounted yet.');
    return replayer;
  }

  function getMirror() {
    return getReplayer().getMirror();
  }

  function toggleFullscreen() {
    if (!rootEl) return;
    isFullscreen() ? exitFullscreen() : openFullscreen(rootEl);
  }

  function setProps(next: Partial<Pick<PlayerProps, 'width' | 'height' | 'maxScale'>>) {
    props = { ...props, ...next };
    applyDimensions();
    triggerResize();
    notify();
  }

  function toggle() {
    if (state.playerState === 'playing') pause();
    else if (state.playerState === 'paused') play();
  }

  function play() {
    if (!replayer) return;
    if (state.playerState !== 'paused') return;
    if (finished) {
      replayer.play();
      finished = false;
      state = { ...state, finished: false };
    } else {
      replayer.play(state.currentTime);
    }
  }

  function pause() {
    if (!replayer) return;
    if (state.playerState !== 'playing') return;
    replayer.pause();
    pauseAt = false;
  }

  function goto(timeOffset: number, playFromThere?: boolean) {
    if (!replayer) return;
    state = { ...state, currentTime: timeOffset, finished: false };
    pauseAt = false;
    finished = false;
    const resumePlaying =
      typeof playFromThere === 'boolean' ? playFromThere : state.playerState === 'playing';
    if (resumePlaying) replayer.play(timeOffset);
    else replayer.pause(timeOffset);
    updateProgressUi();
    notify();
  }

  function playRange(
    timeOffset: number,
    endTimeOffset: number,
    startLooping = false,
    afterHook: undefined | (() => void) = undefined,
  ) {
    if (!replayer) return;
    loop = startLooping ? { start: timeOffset, end: endTimeOffset } : null;
    state = { ...state, currentTime: timeOffset };
    pauseAt = endTimeOffset;
    onPauseHook = afterHook || null;
    replayer.play(timeOffset);
    updateProgressUi();
    notify();
  }

  function setSpeed(newSpeed: number) {
    if (!replayer) return;
    const needFreeze = state.playerState === 'playing';
    state = { ...state, speed: newSpeed };
    if (needFreeze) replayer.pause();
    replayer.setConfig({ speed: newSpeed });
    if (needFreeze) replayer.play(state.currentTime);
    updateProgressUi();
    notify();
  }

  function toggleSkipInactive() {
    if (!replayer) return;
    const next = !Boolean(replayer.config.skipInactive);
    replayer.setConfig({ skipInactive: next });
    state = { ...state, skipInactive: next };
    updateProgressUi();
    notify();
  }

  function getState() {
    return state;
  }

  function subscribe(listener: (s: PlayerStateSnapshot) => void) {
    subscribers.add(listener);
    listener(state);
    return () => subscribers.delete(listener);
  }

  return {
    mount,
    destroy,
    addEventListener: addEventListener as PlayerHandle['addEventListener'],
    addEvent,
    getMetaData: () => getReplayer().getMetaData(),
    getReplayer,
    getMirror,
    toggle,
    setSpeed,
    toggleSkipInactive,
    toggleFullscreen,
    triggerResize,
    setProps,
    play,
    pause,
    goto,
    playRange,
    getState,
    subscribe,
  };
}

export type {
  PlayerHandle,
  PlayerProps,
  PlayerStateSnapshot,
  PlayerUiEventMap,
  CustomEventMarker,
  InactivePeriodMarker,
} from './types';

