import React, { useEffect, useRef } from 'react';
import Player from '@dom-replay/player';
import '@dom-replay/player/dist/style.css';
import { sampleEvents } from './sampleEvents';
import './App.css';

function PlayerExample({ 
  title, 
  className,
  width,
  height,
}: { 
  title: string; 
  className: string;
  width?: number;
  height?: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Create Svelte player instance
    playerRef.current = new Player({
      target: containerRef.current,
      props: {
        events: sampleEvents,
        width: width || 1024,
        height: height || 576,
        autoPlay: false,
        showController: true,
        skipInactive: false,
        speed: 1,
        speedOption: [0.5, 1, 2, 4],
        maxScale: 1,
      },
    });

    return () => {
      playerRef.current?.$destroy();
    };
  }, [width, height]);

  return (
    <div className="player-container">
      <h2>{title}</h2>
      <div className={`svelte-player-wrapper ${className}`} ref={containerRef} />
    </div>
  );
}

function AppWithSveltePlayer() {
  return (
    <div className="app">
      <header className="header">
        <h1>Dom Replay Player (Svelte) in React</h1>
        <p>Full-featured player with built-in controls</p>
      </header>

      <main className="main">
        <PlayerExample
          title="Auto-sized Player (fills container)"
          className="auto-size"
        />

        <PlayerExample
          title="Fixed Size Player (800x600)"
          className="fixed-size"
          width={800}
          height={600}
        />

        <PlayerExample
          title="Responsive Player (50% width)"
          className="responsive"
        />
      </main>
    </div>
  );
}

export default AppWithSveltePlayer;
