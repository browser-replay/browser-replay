# dom-replay

[![CI](https://github.com/dom-replay/dom-replay/actions/workflows/ci.yml/badge.svg)](https://github.com/dom-replay/dom-replay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@dom-replay/core.svg)](https://www.npmjs.com/package/@dom-replay/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Record and replay DOM interactions.

dom-replay is a separate project (own name, repo, and roadmap) built on [rrweb](https://github.com/rrweb-io/rrweb). See `LICENSE` and `NOTICE` for attribution.

## Quick start

### Record

```bash
npm install @dom-replay/record
```

```js
import { record } from '@dom-replay/record';

record({
  emit(event) {
    // store events (e.g. send to your backend)
    console.log(event);
  },
});
```

### Replay

```bash
npm install @dom-replay/player react react-dom
```

```jsx
import { DomReplayPlayer } from '@dom-replay/player';
import '@dom-replay/player/dist/style.css';

<DomReplayPlayer events={events} />;
```

See the [guide](guide.md) for full documentation.

## Packages

| Package                                             | Description          |
| --------------------------------------------------- | -------------------- |
| [@dom-replay/record](packages/record)               | Record DOM events    |
| [@dom-replay/replay](packages/replay)               | Replay engine        |
| [@dom-replay/player](packages/player)               | React player UI      |
| [@dom-replay/player-svelte](packages/player-svelte) | Svelte player UI     |
| [@dom-replay/player-core](packages/player-core)     | Shared player logic  |
| [@dom-replay/core](packages/core)                   | Record + replay core |

Additional packages: [snapshot](packages/snapshot), [dom](packages/dom), [packer](packages/packer), [types](packages/types), [utils](packages/utils), [plugins](packages/plugins), [video](packages/video), [web-extension](packages/web-extension).

## Development

- Install: `pnpm install`
- Build: `pnpm build:all`
- Dev (watch): `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint`

## Docs

- [Guide](guide.md) – Installation, recording, replay, plugins
- [Recipes](docs/recipes/index.md) – Use cases and examples

## Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

- [Bug reports](https://github.com/dom-replay/dom-replay/issues/new?template=bug-report.md)
- [Feature requests](https://github.com/dom-replay/dom-replay/issues/new?template=feature-request.md)
- [Pull requests](https://github.com/dom-replay/dom-replay/compare)
