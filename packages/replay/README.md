# @browser-replay/replay

This package contains all the necessary code to replay recorded events.
See the [guide](../../docs/guide.md) for more info on browser-replay.

## Installation

```bash
npm install @browser-replay/replay
```

## Usage

```js
import { Replayer } from '@browser-replay/replay';

const replayer = new Replayer(events, {
  // options
});
replayer.play();
```

## Notes

Currently this package is a thin wrapper around the `Replayer` class in `@browser-replay/core`.
All `Replayer` related code will get moved here in the future.
