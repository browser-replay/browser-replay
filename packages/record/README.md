# @dom-replay/record

This package contains all the record related code in rrweb.
See the [guide](../../guide.md) for more info on rrweb.

## Installation

```bash
npm install @dom-replay/record
```

## Usage

```js
import { record } from '@dom-replay/record';

record({
  emit(event) {
    // send event to server
  },
});
```

## Notes

Currently this package is really just a wrapper around the `record` function in the main `rrweb` package.
All `record` related code will get moved here in the future.
