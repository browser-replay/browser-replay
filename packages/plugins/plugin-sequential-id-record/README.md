# @dom-replay/plugin-sequential-id-record

Use this plugin in combination with the [@dom-replay/plugin-sequential-id-replay](../core-plugin-sequential-id-replay) plugin to record and replay events with a sequential id.
See the [guide](../../../guide.md) for more info.

## Installation

```bash
npm install @dom-replay/plugin-sequential-id-record
```

## Usage

```js
import { record } from '@dom-replay/record';
import { getRecordSequentialIdPlugin } from '@dom-replay/plugin-sequential-id-record';

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
