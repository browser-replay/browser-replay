# Contributing to dom-replay

Thanks for your interest in contributing to dom-replay! We welcome contributions from the community.

## Development Process

Development happens through pull requests. Please open an issue first to discuss significant changes or new features before investing time in a large PR.

## Pull Requests

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests.
3. Ensure the test suite passes: `pnpm test`
4. If you've changed APIs, update the documentation.
5. Make sure your code lints and typechecks: `pnpm lint` and `pnpm check-types`.
6. Format your code: `pnpm format`

## Issues

Please include enough detail to reproduce the problem. For replay-related bugs, a minimal recording or reproduction case is especially helpful.

## Run locally

- Install dependencies: `pnpm install`
- Build all packages: `pnpm build:all` or `pnpm dev`
- Run recorder on a website: (in `packages/core`) `pnpm repl`
- Run a cobrowsing/mirroring session: (in `packages/core`) `pnpm live-stream`
- Build individual packages: `pnpm build` or `pnpm dev`
- Test: `pnpm test` or `pnpm test:watch`
- Lint: `pnpm lint`
- Format: `pnpm format` or `pnpm format:head`

## Local development with a consuming app

When iterating on dom-replay while testing in another project, use the **pack-local-dev** workflow instead of publishing to a registry.

### 1. Build and pack tarballs

From the dom-replay repo root:

```bash
bash scripts/pack-local-dev.sh
```

This builds the packages needed for record + replay + player and writes tarballs to `.cache/dev-packs/<timestamp>/`.

### 2. Install tarballs in the consuming app

From the consuming project:

```bash
bash scripts/update-dom-replay-local.sh --repo /path/to/dom-replay --packs-dir /path/to/dom-replay/.cache/dev-packs/<timestamp>
```

(If your consuming app has a different install script, use that.)

### 3. Clear Vite's dependency cache

If the consuming app uses Vite, clear its cache after installing new tarballs:

```bash
rm -rf node_modules/.vite
```

Then restart the dev server.

## Coding style

See [documentation](docs/development/coding-style.md).

## Releases / publishing

See [Publishing packages](docs/development/publishing.md) for how to publish to npm and GitHub Packages (including deploy without OTP via GitHub Actions).

## License

This codebase includes MIT-licensed components; see `LICENSE` and `NOTICE`. By contributing, you agree that your contributions will be licensed under the MIT License.
