# @browser-replay/plugin-sequential-id-replay

Use this plugin in combination with the [@browser-replay/plugin-sequential-id-record](../core-plugin-sequential-id-record) plugin to record and replay events with a sequential id.
See the [guide](../../../guide.md) for more info.

## Installation

```bash
npm install @browser-replay/plugin-sequential-id-replay
```

## Usage

```js
import { Replayer } from '@browser-replay/replay';
import { getReplaySequentialIdPlugin } from '@browser-replay/plugin-sequential-id-replay';

const replayer = new Replayer(events, {
  plugins: [
    getReplaySequentialIdPlugin({
      // make sure this is the same as the record side
      key: '_id', // default value
      warnOnMissingId: true, // default value
    }),
  ],
});
replayer.play(); // ERROR: [sequential-id-plugin]: expect to get an id with value "42", but got "666"`
```
