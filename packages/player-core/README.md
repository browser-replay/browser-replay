# @browser-replay/player-core

Framework-agnostic, headless player for browser-replay sessions, built on
[`@browser-replay/replay`](../replay/). It owns the replay lifecycle — mounting,
playback, seeking, speed control, fullscreen, inactivity skipping, and
custom-event/inactivity markers — and exposes an imperative handle you can drive
from any UI framework, or none at all.

See the [guide](../../docs/guide.md) for more info.

## Installation

```bash
npm install @browser-replay/player-core
```

## Usage

```js
import { createPlayerHandle } from '@browser-replay/player-core';

const player = createPlayerHandle({ events });

player.mount(document.getElementById('app'));

player.subscribe((state) => {
  // React to currentTime, playerState, meta, markers, ...
});

player.play();
// player.pause(); player.goto(ms); player.setSpeed(2); player.destroy();
```

`createPlayerHandle(props)` returns a `PlayerHandle` exposing `mount`,
`destroy`, `play`, `pause`, `goto`, `playRange`, `setSpeed`,
`toggleSkipInactive`, `toggleFullscreen`, `setProps`, `subscribe`, `getState`,
and event helpers (`addEventListener`, `addEvent`).

For a ready-made React component built on this package, see
[`@browser-replay/player`](../player/).
