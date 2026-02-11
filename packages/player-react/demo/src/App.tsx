import React from 'react';
import { DomReplayPlayer } from '../../src';
import '../../src/style.css';
import { sampleEvents } from './sampleEvents';
import './App.css';

function PlayerWithControls({ 
  title, 
  className,
  ...playerProps 
}: { 
  title: string; 
  className: string;
  [key: string]: any;
}) {
  return (
    <div className="player-container">
      <h2>{title}</h2>
      <div className={`player-wrapper ${className}`}>
        <DomReplayPlayer
          events={sampleEvents}
          autoPlay={false}
          skipInactive={true}
          speed={1}
          maxScale={1}
          UNSAFE_replayCanvas={true}
          {...playerProps}
        />
      </div>
    </div>
  );
}

function App() {
  return (
    <div className="app">
      <header className="header">
        <h1>Dom Replay Player React Demo</h1>
        <p>Full-featured player with React-based controls</p>
      </header>

      <main className="main">
        <PlayerWithControls
          title="Auto-sized Player (fills container)"
          className="auto-size"
        />

        <PlayerWithControls
          title="Fixed Size Player (800x600)"
          className="fixed-size"
          width={800}
          height={600}
        />

        <PlayerWithControls
          title="Responsive Player (50% width)"
          className="responsive"
        />
      </main>
    </div>
  );
}

export default App;
