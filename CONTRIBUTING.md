# Contributing to dom-replay

This repository is intended to be used as a private/closed-source project. If you are seeing this file in a private repo, contributions are typically by invitation.

## Our Development Process

Development occurs through pull requests. Please coordinate with the maintainers on branching/release strategy if this repo is private.

## Pull Requests

Pull requests (PRs) are handled internally.

1. Fork the repo and create your branch from `master`.
2. If you've added code that should be tested, add tests
3. Ensure the test suite passes or ask for help as to why tests are failing
4. If you've changed APIs, update the documentation.
5. Make sure your code lints and typechecks.

## Issues

If issues are enabled in your private repository, please include enough detail to reproduce the problem, along with a minimal recording/replay reproduction when possible.

## Run locally

- Install dependencies: `pnpm install`
- Build all packages: (in `/`) `pnpm build:all` or `pnpm dev`
- Run recorder on a website: (in `/packages/core`) `pnpm repl`
- Run a cobrowsing/mirroring session locally: (in `/packages/core`) `pnpm live-stream`
- Build individual packages: `pnpm build` or `pnpm dev`
- Test: `pnpm test` or `pnpm test:watch`
- Lint: `pnpm lint`
- Rewrite files with prettier: `pnpm format` or `pnpm format:head`

## Local development with a consuming app

When iterating on dom-replay while testing in another project (e.g. geo-kba), use
the **pack-local-dev** workflow instead of publishing to a registry.

### One-command sync to geo-kba

From the dom-replay repo root:

```bash
pnpm sync:geo-kba
```

This command:
- builds and packs the local dom-replay tarballs
- installs them into geo-kba via `scripts/update-dom-replay-local.sh`
- clears the consuming app's Vite cache (`apps/dashboard/node_modules/.vite`)

Useful variants:

```bash
# force rebuild of filtered packages before packing
pnpm sync:geo-kba -- --force-build

# skip build and only repack current dist outputs
pnpm sync:geo-kba -- --skip-build

# target a different geo-kba app cache path
pnpm sync:geo-kba -- --app-path apps/app
```

### 1. Build and pack tarballs

From the dom-replay repo root:

```bash
bash scripts/pack-local-dev.sh
```

This builds only the **10 packages** needed for record + replay + player-react
(`types`, `utils`, `snapshot`, `dom`, `core`, `packer`, `record`, `replay`,
`player-core`, `player-react`) and writes tarballs to `.cache/dev-packs/<timestamp>/`.
Packages like `web-extension`, `video`, `plugins`, and `dom-nodejs` are skipped.

If you already ran the build separately, you can skip the build step and just pack:

```bash
bash scripts/pack-local-dev.sh --skip-build
```

### 2. Force a rebuild after code changes

Turbo caches builds aggressively. If you edit source files and the cache doesn't
invalidate (e.g. changes in a dependency's `dist/` that Turbo doesn't track), force
a fresh build of only the relevant packages:

```bash
pnpm turbo run prepublish --force \
  --filter @dom-replay/types \
  --filter @dom-replay/utils \
  --filter @dom-replay/snapshot \
  --filter @dom-replay/dom \
  --filter @dom-replay/core \
  --filter @dom-replay/packer \
  --filter @dom-replay/record \
  --filter @dom-replay/replay \
  --filter @dom-replay/player-core \
  --filter @dom-replay/player-react
```

Then pack (skipping the build since you already ran it):

```bash
bash scripts/pack-local-dev.sh --skip-build
```

### 3. Install tarballs in the consuming app

From the consuming project (e.g. geo-kba):

```bash
bash scripts/update-dom-replay-local.sh --repo /absolute/path/to/dom-replay --packs-dir /absolute/path/to/dev-packs-dir
```

### 4. Clear Vite's dependency cache

Vite pre-bundles dependencies and fingerprints them with a content hash
(the `?v=...` in import URLs). If the tarball contents change but Vite doesn't
detect the difference, it will keep serving the old bundle. Force a re-optimize by
deleting the cache:

```bash
# from the consuming app directory
rm -rf node_modules/.vite
```

Then restart the dev server and do a **hard refresh** (Ctrl+Shift+R) in the browser.

## Coding style

See [documentation](docs/development/coding-style.md)

## License

This codebase includes MIT-licensed components; see `LICENSE` and `NOTICE`.
