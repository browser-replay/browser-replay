import { useCallback, useEffect, useRef } from 'react';
import type { KeyboardEvent, MouseEvent } from 'react';
import type {
  CustomEventMarker,
  InactivePeriodMarker,
  PlayerStateSnapshot,
} from '@dom-replay/player-core';

type ControllerProps = {
  state: PlayerStateSnapshot;
  speedOption: number[];
  showController: boolean;
  onTogglePlay(): void;
  onSetSpeed(speed: number): void;
  onToggleSkipInactive(): void;
  onToggleFullscreen(): void;
  onSeek(percent: number): void;
};

/* ── SVG Icons ── */

function PlayIcon() {
  return (
    <svg
      className="rr-controller-icon"
      viewBox="0 0 1024 1024"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path d="M170.65984 896l0-768 640 384zM644.66944 512l-388.66944-233.32864 0 466.65728z" />
    </svg>
  );
}

function PauseIcon() {
  return (
    <svg
      className="rr-controller-icon"
      viewBox="0 0 1024 1024"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path
        d="M682.65984 128q53.00224 0 90.50112 37.49888t37.49888 90.50112l0
        512q0 53.00224-37.49888 90.50112t-90.50112
        37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
        37.49888-90.50112t90.50112-37.49888zM341.34016 128q53.00224 0
        90.50112 37.49888t37.49888 90.50112l0 512q0 53.00224-37.49888
        90.50112t-90.50112
        37.49888-90.50112-37.49888-37.49888-90.50112l0-512q0-53.00224
        37.49888-90.50112t90.50112-37.49888zM341.34016 213.34016q-17.67424
        0-30.16704 12.4928t-12.4928 30.16704l0 512q0 17.67424 12.4928
        30.16704t30.16704 12.4928 30.16704-12.4928
        12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928zM682.65984
        213.34016q-17.67424 0-30.16704 12.4928t-12.4928 30.16704l0 512q0
        17.67424 12.4928 30.16704t30.16704 12.4928 30.16704-12.4928
        12.4928-30.16704l0-512q0-17.67424-12.4928-30.16704t-30.16704-12.4928z"
      />
    </svg>
  );
}

function FullscreenIcon() {
  return (
    <svg
      className="rr-controller-icon"
      viewBox="0 0 1024 1024"
      width="16"
      height="16"
      fill="currentColor"
    >
      <path
        d="M916 380c-26.4 0-48-21.6-48-48L868 223.2 613.6 477.6c-18.4
        18.4-48.8 18.4-68 0-18.4-18.4-18.4-48.8 0-68L800 156 692 156c-26.4
        0-48-21.6-48-48 0-26.4 21.6-48 48-48l224 0c26.4 0 48 21.6 48 48l0
        224C964 358.4 942.4 380 916 380zM231.2 860l108.8 0c26.4 0 48 21.6 48
        48s-21.6 48-48 48l-224 0c-26.4 0-48-21.6-48-48l0-224c0-26.4 21.6-48
        48-48 26.4 0 48 21.6 48 48L164 792l253.6-253.6c18.4-18.4 48.8-18.4
        68 0 18.4 18.4 18.4 48.8 0 68L231.2 860z"
      />
    </svg>
  );
}

/* ── Toggle Switch ── */

function ToggleSwitch({
  id,
  checked,
  disabled,
  label,
  onChange,
}: {
  id: string;
  checked: boolean;
  disabled: boolean;
  label: string;
  onChange(): void;
}) {
  return (
    <div className={`rr-switch${disabled ? ' disabled' : ''}`}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      <label htmlFor={id} />
      <span className="rr-switch__label">{label}</span>
    </div>
  );
}

/* ── Helpers ── */

function formatTime(ms: number) {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function renderInactiveMarker(marker: InactivePeriodMarker, idx: number) {
  return (
    <div
      key={`inactive-${idx}-${marker.startMs}`}
      title={marker.name}
      className="rr-progress__inactive"
      style={{
        width: marker.width,
        left: marker.position,
        background: marker.background,
      }}
    />
  );
}

function renderCustomMarker(marker: CustomEventMarker, idx: number) {
  return (
    <div
      key={`custom-${idx}-${marker.timestamp}-${marker.name}`}
      title={marker.name}
      className="rr-progress__custom"
      style={{
        left: marker.position,
        background: marker.background,
      }}
    />
  );
}

/* ── Controller ── */

export function Controller({
  state,
  speedOption,
  showController,
  onTogglePlay,
  onSetSpeed,
  onToggleSkipInactive,
  onToggleFullscreen,
  onSeek,
}: ControllerProps) {
  // All hooks MUST be called before any conditional returns (Rules of Hooks).
  const progressRef = useRef<HTMLDivElement | null>(null);
  const playButtonRef = useRef<HTMLButtonElement | null>(null);
  const draggingRef = useRef(false);
  const onSeekRef = useRef(onSeek);
  onSeekRef.current = onSeek;

  // Restore focus to play button when exiting fullscreen (e.g. via Escape)
  useEffect(() => {
    const handler = () => {
      if (!document.fullscreenElement) {
        playButtonRef.current?.focus();
      }
    };
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const seekFromPosition = useCallback(
    (clientX: number) => {
      const el = progressRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const p =
        rect.width > 0
          ? Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))
          : 0;
      onSeekRef.current(p);
    },
    [],
  );

  const handleMouseDown = useCallback(
    (evt: MouseEvent<HTMLDivElement>) => {
      evt.preventDefault();
      draggingRef.current = true;
      seekFromPosition(evt.clientX);

      const onMove = (e: globalThis.MouseEvent) => seekFromPosition(e.clientX);
      const onUp = () => {
        // Use a short timeout so the subsequent click event sees draggingRef as true
        // and skips, preventing a double-seek.
        setTimeout(() => {
          draggingRef.current = false;
        }, 0);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    },
    [seekFromPosition],
  );

  const handleProgressClick = useCallback(
    (evt: MouseEvent<HTMLDivElement>) => {
      // Skip if the click was the tail-end of a drag interaction.
      if (draggingRef.current) return;
      seekFromPosition(evt.clientX);
    },
    [seekFromPosition],
  );

  const seekFromKeyboard = useCallback(
    (evt: KeyboardEvent<HTMLDivElement>) => {
      if (evt.key === 'ArrowLeft') {
        const el = progressRef.current;
        if (!el) return;
        // Seek back ~2% of total time
        const totalTime = state.meta.totalTime || 0;
        if (totalTime <= 0) return;
        const currentPercent = state.currentTime / totalTime;
        onSeekRef.current(Math.max(0, currentPercent - 0.02));
        evt.preventDefault();
      } else if (evt.key === 'ArrowRight') {
        const totalTime = state.meta.totalTime || 0;
        if (totalTime <= 0) return;
        const currentPercent = state.currentTime / totalTime;
        onSeekRef.current(Math.min(1, currentPercent + 0.02));
        evt.preventDefault();
      }
    },
    [state.currentTime, state.meta.totalTime],
  );

  // Now safe to do conditional returns after all hooks.
  if (!showController) return null;

  const totalTime = state.meta.totalTime || 0;
  const percent =
    totalTime > 0 ? Math.min(1, state.currentTime / totalTime) : 0;
  const percentage = `${percent * 100}%`;
  const skipping = state.speedState === 'skipping';

  return (
    <div className="rr-controller">
      <div className="rr-timeline">
        <span
          className="rr-timeline__time"
          aria-live="polite"
          aria-atomic="true"
        >
          {formatTime(state.currentTime)}
        </span>
        <div
          ref={progressRef}
          className={`rr-progress${skipping ? ' disabled' : ''}`}
          role="slider"
          tabIndex={0}
          aria-label="Replay timeline"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(percent * 100)}
          onClick={skipping ? undefined : handleProgressClick}
          onMouseDown={skipping ? undefined : handleMouseDown}
          onKeyDown={seekFromKeyboard}
        >
          <div className="rr-progress__step" style={{ width: percentage }} />
          {state.inactivePeriods.map(renderInactiveMarker)}
          {state.customEvents.map(renderCustomMarker)}
          <div className="rr-progress__handler" style={{ left: percentage }} />
        </div>
        <span className="rr-timeline__time">{formatTime(totalTime)}</span>
      </div>

      <div className="rr-controller__btns">
        <button
          ref={playButtonRef}
          onClick={onTogglePlay}
          type="button"
          aria-label={state.playerState === 'playing' ? 'Pause' : 'Play'}
        >
          {state.playerState === 'playing' ? <PauseIcon /> : <PlayIcon />}
        </button>

        {speedOption.map((s) => (
          <button
            key={s}
            type="button"
            className={s === state.speed && !skipping ? 'active' : ''}
            onClick={() => onSetSpeed(s)}
            disabled={skipping}
          >
            {s}x
          </button>
        ))}

        <ToggleSwitch
          id="rr-skip-inactive"
          checked={state.skipInactive}
          disabled={skipping}
          label="skip inactive"
          onChange={onToggleSkipInactive}
        />

        <button
          type="button"
          onClick={onToggleFullscreen}
          aria-label="Toggle fullscreen"
        >
          <FullscreenIcon />
        </button>
      </div>
    </div>
  );
}
