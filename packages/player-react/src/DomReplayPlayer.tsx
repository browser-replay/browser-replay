import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type ForwardRefExoticComponent,
  type PropsWithoutRef,
  type RefAttributes,
} from 'react';
import {
  createPlayerHandle,
  type PlayerHandle,
  type PlayerStateSnapshot,
} from '@dom-replay/player-core';
import type { DomReplayPlayerProps, DomReplayPlayerRef } from './types';
import { Controller } from './Controller';

function tailSignature(events: unknown[] | undefined) {
  if (!events || events.length === 0) return '';
  const tail = events[events.length - 1] as any;
  return `${tail?.timestamp ?? ''}:${tail?.type ?? ''}`;
}

/** Throttle interval (ms) for state updates during playback. Reduces re-renders from ~60/sec to ~10/sec. */
const STATE_UPDATE_THROTTLE_MS = 100;

export const DomReplayPlayer: ForwardRefExoticComponent<
  PropsWithoutRef<DomReplayPlayerProps> & RefAttributes<DomReplayPlayerRef>
> = forwardRef<DomReplayPlayerRef, DomReplayPlayerProps>(function DomReplayPlayer(
  props,
  ref,
) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [snapshot, setSnapshot] = useState<PlayerStateSnapshot | null>(null);

  // Track container dimensions for auto-sizing
  const [containerSize, setContainerSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  // We keep a stable handle instance, and feed event updates incrementally
  // (recreating only when we can't safely append).
  const handleRef = useRef<PlayerHandle | null>(null);
  if (!handleRef.current) {
    handleRef.current = createPlayerHandle(props);
  }
  const lastEventsLenRef = useRef<number>(props.events?.length ?? 0);
  const lastTailSigRef = useRef<string>(tailSignature(props.events));
  const [hasMounted, setHasMounted] = useState(false);

  // Refs for subscription stability (avoid re-subscribing when callback identity changes)
  const onStateChangeRef = useRef(props.onStateChange);
  onStateChangeRef.current = props.onStateChange;

  /** Return the current handle, or `null` if the player is torn down. */
  const getHandle = (): PlayerHandle | null => handleRef.current;

  /** Ensure a handle exists (re-create if Strict Mode destroyed it) and return it. */
  const ensureHandle = (): PlayerHandle => {
    if (!handleRef.current) {
      handleRef.current = createPlayerHandle(props);
    }
    return handleRef.current;
  };

  const recreate = () => {
    const el = containerRef.current;
    // Always tear down the old player first so we don't leak listeners/iframes.
    handleRef.current?.destroy();
    handleRef.current = createPlayerHandle(props);
    if (el) {
      handleRef.current.mount(el);
    }
  };

  // Observe container size for auto-sizing
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0) {
          setContainerSize({ width, height });
        }
      }
    });

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // mount/unmount
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    // Re-create the handle if a previous cleanup (or Strict Mode) destroyed it.
    ensureHandle().mount(el);
    setHasMounted(true);
    return () => {
      handleRef.current?.destroy();
      handleRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // keep events in sync
  useEffect(() => {
    if (!hasMounted) return;
    const nextEvents = props.events ?? [];
    const nextLen = nextEvents.length;
    const prevLen = lastEventsLenRef.current ?? 0;

    // First run after mount: the underlying player already got the initial events via mount().
    if (prevLen === 0 && nextLen > 0) {
      lastEventsLenRef.current = nextLen;
      const tail = nextEvents[nextLen - 1] as any;
      lastTailSigRef.current =
        tail ? `${tail.timestamp ?? ''}:${tail.type ?? ''}` : '';
      return;
    }

    // If events got reset/replaced (common when loading a new recording), recreate the player.
    if (nextLen < prevLen) {
      recreate();
      lastEventsLenRef.current = nextLen;
      const tail = nextEvents[nextLen - 1] as any;
      lastTailSigRef.current =
        tail ? `${tail.timestamp ?? ''}:${tail.type ?? ''}` : '';
      return;
    }

    if (nextLen === prevLen) return;

    // Heuristic: if the previous tail matches the current event at (prevLen-1),
    // treat as append and only add the delta.
    const prevTailIndex = Math.max(0, prevLen - 1);
    const prevTailNow = (nextEvents[prevTailIndex] as any) || null;
    const prevTailNowSig = prevTailNow
      ? `${prevTailNow.timestamp ?? ''}:${prevTailNow.type ?? ''}`
      : '';

    const canAppend =
      prevLen === 0 || prevTailNowSig === lastTailSigRef.current;
    if (!canAppend) {
      recreate();
      lastEventsLenRef.current = nextLen;
      const tail = nextEvents[nextLen - 1] as any;
      lastTailSigRef.current =
        tail ? `${tail.timestamp ?? ''}:${tail.type ?? ''}` : '';
      return;
    }

    const h = getHandle();
    if (!h) return;
    for (let i = prevLen; i < nextLen; i++) {
      h.addEvent(nextEvents[i] as any);
    }
    lastEventsLenRef.current = nextLen;
    const tail = nextEvents[nextLen - 1] as any;
    lastTailSigRef.current =
      tail ? `${tail.timestamp ?? ''}:${tail.type ?? ''}` : '';
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMounted, props.events]);

  // keep sizing + scaling in sync
  useEffect(() => {
    // Use container size if width/height props are not provided
    const width = props.width ?? containerSize?.width;
    const height = props.height ?? containerSize?.height;

    getHandle()?.setProps({
      width,
      height,
      maxScale: props.maxScale,
    });
  }, [props.width, props.height, props.maxScale, containerSize]);

  // keep skipInactive/speed in sync (if consumer uses controlled props)
  useEffect(() => {
    if (typeof props.speed === 'number') {
      getHandle()?.setSpeed(props.speed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.speed]);

  useEffect(() => {
    if (typeof props.skipInactive === 'boolean') {
      const h = getHandle();
      if (!h) return;
      const current = h.getState().skipInactive;
      if (current !== props.skipInactive) {
        h.toggleSkipInactive();
      }
    }
  }, [props.skipInactive]);

  // Subscribe to player state. Throttles updates during playback; uses ref for onStateChange to avoid re-subscribing.
  useEffect(() => {
    const h = getHandle();
    if (!h) return;

    let lastUpdate = 0;
    let pending: PlayerStateSnapshot | null = null;
    let rafId: number | null = null;
    let cancelled = false;

    const flush = () => {
      rafId = null;
      if (cancelled) return;
      if (pending) {
        const next = pending;
        pending = null;
        setSnapshot(next);
        onStateChangeRef.current?.(next);
        lastUpdate = Date.now();
      }
    };

    const unsub = h.subscribe((next) => {
      pending = next;
      const now = Date.now();
      if (now - lastUpdate >= STATE_UPDATE_THROTTLE_MS) {
        flush();
      } else if (rafId == null) {
        rafId = requestAnimationFrame(flush);
      }
    });

    return () => {
      cancelled = true;
      if (rafId != null) cancelAnimationFrame(rafId);
      unsub();
    };
  }, []);

  useImperativeHandle(
    ref,
    (): DomReplayPlayerRef => ({
      addEventListener: ((event: any, handler: any) => {
        return getHandle()?.addEventListener(event as any, handler as any) as any;
      }) as DomReplayPlayerRef['addEventListener'],
      addEvent: (event) => {
        getHandle()?.addEvent(event as any);
      },
      getMetaData: () => getHandle()?.getMetaData() as any,
      getReplayer: () => getHandle()?.getReplayer() as any,
      getMirror: () => getHandle()?.getMirror() as any,
      toggle: () => getHandle()?.toggle(),
      setSpeed: (speed) => getHandle()?.setSpeed(speed),
      toggleSkipInactive: () => getHandle()?.toggleSkipInactive(),
      toggleFullscreen: () => getHandle()?.toggleFullscreen(),
      triggerResize: () => getHandle()?.triggerResize(),
      setProps: (next) => getHandle()?.setProps(next),
      play: () => getHandle()?.play(),
      pause: () => getHandle()?.pause(),
      goto: (timeOffset, playFromThere) =>
        getHandle()?.goto(timeOffset, playFromThere),
      playRange: (timeOffset, endTimeOffset, startLooping, afterHook) =>
        getHandle()?.playRange(
          timeOffset,
          endTimeOffset,
          startLooping,
          afterHook,
        ),
      getState: () => getHandle()?.getState() as any,
      subscribe: (listener) => getHandle()?.subscribe(listener) || (() => {}),
      getContainer: () => containerRef.current,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const speedOption = props.speedOption ?? [1, 2, 4, 8];
  const showController = props.showController ?? true;

  const onTogglePlay = useCallback(() => getHandle()?.toggle(), []);
  const onSetSpeed = useCallback((speed: number) => getHandle()?.setSpeed(speed), []);
  const onToggleSkipInactive = useCallback(
    () => getHandle()?.toggleSkipInactive(),
    [],
  );
  const onToggleFullscreen = useCallback(
    () => getHandle()?.toggleFullscreen(),
    [],
  );
  const onSeek = useCallback((percent: number) => {
    const h = getHandle();
    if (!h) return;
    const total = h.getState().meta.totalTime || 0;
    h.goto(total * percent);
  }, []);

  return (
    <div className={props.className} style={props.style}>
      <div ref={containerRef} />
      {snapshot ? (
        <Controller
          state={snapshot}
          speedOption={speedOption}
          showController={showController}
          onTogglePlay={onTogglePlay}
          onSetSpeed={onSetSpeed}
          onToggleSkipInactive={onToggleSkipInactive}
          onToggleFullscreen={onToggleFullscreen}
          onSeek={onSeek}
        />
      ) : null}
    </div>
  );
});

DomReplayPlayer.displayName = 'DomReplayPlayer';
