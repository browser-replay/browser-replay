import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { createPlayerHandle } from '@dom-replay/player-core';
import type { DomReplayPlayerProps, DomReplayPlayerRef } from './types';
import './style.css';

export const DomReplayPlayer = forwardRef<DomReplayPlayerRef, DomReplayPlayerProps>(
  function DomReplayPlayer(props, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);

    const handle = useMemo(() => {
      return createPlayerHandle(props);
      // Only create once; subsequent updates are applied via effects below.
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // mount/unmount
    useEffect(() => {
      const el = containerRef.current;
      if (!el) return;
      handle.mount(el);
      return () => {
        handle.destroy();
      };
    }, [handle]);

    // keep sizing + scaling in sync
    useEffect(() => {
      handle.setProps({
        width: props.width,
        height: props.height,
        maxScale: props.maxScale,
      });
    }, [handle, props.width, props.height, props.maxScale]);

    // keep skipInactive/speed in sync (if consumer uses controlled props)
    useEffect(() => {
      if (typeof props.speed === 'number') {
        handle.setSpeed(props.speed);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [handle, props.speed]);

    useEffect(() => {
      if (typeof props.skipInactive === 'boolean') {
        const current = handle.getState().skipInactive;
        if (current !== props.skipInactive) {
          handle.toggleSkipInactive();
        }
      }
    }, [handle, props.skipInactive]);

    useEffect(() => {
      if (!props.onStateChange) return;
      return handle.subscribe(props.onStateChange);
    }, [handle, props.onStateChange]);

    useImperativeHandle(
      ref,
      (): DomReplayPlayerRef => ({
        addEventListener: handle.addEventListener,
        addEvent: handle.addEvent,
        getMetaData: handle.getMetaData,
        getReplayer: handle.getReplayer,
        getMirror: handle.getMirror,
        toggle: handle.toggle,
        setSpeed: handle.setSpeed,
        toggleSkipInactive: handle.toggleSkipInactive,
        toggleFullscreen: handle.toggleFullscreen,
        triggerResize: handle.triggerResize,
        setProps: handle.setProps,
        play: handle.play,
        pause: handle.pause,
        goto: handle.goto,
        playRange: handle.playRange,
        getState: handle.getState,
        getContainer: () => containerRef.current,
      }),
      [handle],
    );

    return <div ref={containerRef} className={props.className} style={props.style} />;
  },
);

