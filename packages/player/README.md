# @browser-replay/player

React component for replaying browser-replay sessions, wrapping the
framework-agnostic [`@browser-replay/player-core`](../player-core/).

See the [guide](../../docs/guide.md) for more info.

## Installation

```bash
npm install @browser-replay/player react react-dom
```

`react` and `react-dom` (>=18) are peer dependencies.

## Usage

```jsx
import { BrowserReplayPlayer } from '@browser-replay/player';
import '@browser-replay/player/dist/style.css';

function App({ events }) {
  return <BrowserReplayPlayer events={events} autoPlay />;
}
```

### Bring your own styles

The default entry bundles the player's stylesheet. To control styling yourself,
import from the headless entry and load (or replace) the CSS separately:

```jsx
import { BrowserReplayPlayer } from '@browser-replay/player/headless';
// import '@browser-replay/player/dist/style.css'; // optional
```

The package also exports a `Controller` component and the
`BrowserReplayPlayerProps` / `BrowserReplayPlayerRef` types.
