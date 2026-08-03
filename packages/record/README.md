# @browser-replay/record

Recording-only entry point for browser-replay.
See the [guide](../../docs/guide.md) for more info on browser-replay.

## Installation

```bash
npm install @browser-replay/record
```

## Usage

```js
import { record } from '@browser-replay/record';

record({
  emit(event) {
    // send event to server
  },
});
```

## Notes

Currently this package is a thin wrapper around the `record` function in `@browser-replay/core`.
All `record` related code will get moved here in the future.
