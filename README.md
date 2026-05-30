# browser-replay

[![CI](https://github.com/browser-replay/browser-replay/actions/workflows/ci.yml/badge.svg)](https://github.com/browser-replay/browser-replay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![npm version](https://img.shields.io/npm/v/@browser-replay/core.svg)](https://www.npmjs.com/package/@browser-replay/core)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

Record and replay DOM interactions.

browser-replay is a separate project (own name, repo, and roadmap) built on [rrweb](https://github.com/rrweb-io/rrweb). See `LICENSE` and `NOTICE` for attribution.

## Quick start

### Record

```bash
npm install @browser-replay/record
```

```js
import { record } from '@browser-replay/record';

record({
  emit(event) {
    // store events (e.g. send to your backend)
    console.log(event);
  },
});
```

### Replay

```bash
npm install @browser-replay/player react react-dom
```

```jsx
import { DomReplayPlayer } from '@browser-replay/player';
import '@browser-replay/player/dist/style.css';

<DomReplayPlayer events={events} />;
```

See the [guide](guide.md) for full documentation.

## Packages

| Package                                             | Description          |
| --------------------------------------------------- | -------------------- |
| [@browser-replay/record](packages/record)               | Record DOM events    |
| [@browser-replay/replay](packages/replay)               | Replay engine        |
| [@browser-replay/player](packages/player)               | React player UI      |

| [@browser-replay/player-core](packages/player-core)     | Shared player logic  |
| [@browser-replay/core](packages/core)                   | Record + replay core |

Additional packages: [snapshot](packages/snapshot), [dom](packages/dom), [packer](packages/packer), [types](packages/types), [utils](packages/utils), [plugins](packages/plugins), [video](packages/video), [web-extension](packages/web-extension).

## Development

- Install: `pnpm install`
- Build: `pnpm build:all`
- Dev (watch): `pnpm dev`
- Test: `pnpm test`
- Lint: `pnpm lint`
- **Publishing:** [Publishing packages](docs/development/publishing.md) (npm and GitHub Packages; deploy without OTP via GitHub Actions)
- **Tests crashing or freezing your machine?** See [Running tests locally](docs/development/running-tests-locally.md) (use `pnpm test:core:safe` for a lighter run).

## Docs

- [Guide](guide.md) – Installation, recording, replay, plugins
- [Recipes](docs/recipes/index.md) – Use cases and examples

## Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) and [code of conduct](.github/CODE_OF_CONDUCT.md).

- [Bug reports](https://github.com/browser-replay/browser-replay/issues/new?template=bug-report.md)
- [Feature requests](https://github.com/browser-replay/browser-replay/issues/new?template=feature-request.md)
- [Pull requests](https://github.com/browser-replay/browser-replay/compare)
