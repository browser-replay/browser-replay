# @browser-replay/plugin-sequential-id-record

Use this plugin in combination with the [@browser-replay/plugin-sequential-id-replay](../core-plugin-sequential-id-replay) plugin to record and replay events with a sequential id.
See the [guide](../../../docs/guide.md) for more info.

## Installation

```bash
npm install @browser-replay/plugin-sequential-id-record
```

## Usage

```js
import { record } from '@browser-replay/record';
import { getRecordSequentialIdPlugin } from '@browser-replay/plugin-sequential-id-record';

record({
  emit: function emit(event) {
    // send events to server
  },
  plugins: [
    getRecordSequentialIdPlugin({
      key: '_sid', // default value
    }),
  ],
});
```
