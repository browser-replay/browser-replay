# @browser-replay/replay

This package contains all the necessary code to replay recorded events.
See the [guide](../../docs/guide.md) for more info on rrweb.

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

Currently this package is really just a wrapper around the `Replayer` class in the main `rrweb` package.
All `Replayer` related code will get moved here in the future.
