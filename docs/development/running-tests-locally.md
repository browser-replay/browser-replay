# Running tests locally without overloading your machine

Running the full test suite from inside Cursor (or another IDE) can freeze or crash your computer. This doc explains why and how to run tests safely locally.

## One-time: install Chrome for Puppeteer

The project uses a **project-local** Puppeteer cache (`.cache/puppeteer`, see `.puppeteerrc.cjs`). Before running any tests that use Puppeteer (e.g. core tests), install Chrome once from the repo root:

```bash
pnpm install:puppeteer-chrome
```

If you see **"Could not find Chrome (ver. …)"**, you haven’t run this yet or the cache was cleared.

## Why it can crash

1. **Heavy resource use**
   - **Turbo** runs one package at a time (`--concurrency=1`), but **Vitest** inside each package uses multiple workers (by default, one per CPU core when not in watch mode).
   - **Puppeteer/Chrome**: Many tests in `@dom-replay/core`, `@dom-replay/snapshot`, `@dom-replay/dom`, and some plugins launch a full Chromium instance per test file or suite. Each Chrome process can use **300–500+ MB** of RAM.
   - **Playwright** is used in `@dom-replay/video` (another browser process).
   - So: several Vitest worker processes + several Chrome instances at once = **several GB of RAM** and high CPU.

2. **Cursor/IDE on top**
   - Cursor (Electron) already uses a lot of memory and CPU. Running a memory‑heavy test run in the same machine can push you into swap, OOM, or kernel panics.

3. **Pool: forks**
   - The repo uses Vitest’s `pool: 'forks'` (separate Node processes per worker). Forks use more memory than threads because each worker is a full process.

## How to prevent crashes when running from Cursor

### 1. Run tests in an **external terminal** (recommended)

Run `pnpm test` (or the commands below) in a normal terminal (e.g. outside Cursor), so the IDE and the test run don’t compete as much for the same process tree and I/O.

### 2. Limit Vitest workers for the core package

The core package has the most Puppeteer tests. Cap workers so you don’t run many Chrome instances at once:

```bash
cd packages/core && pnpm exec vitest run --pool=forks --maxWorkers=1 --exclude test/benchmark
```

Or with headless Puppeteer (default for `test:headless`):

```bash
cd packages/core && cross-env PUPPETEER_HEADLESS=true pnpm exec vitest run --pool=forks --maxWorkers=1 --exclude test/benchmark
```

Use `--maxWorkers=2` if your machine has enough RAM (e.g. 16GB+) and you want a bit more parallelism.

### 3. Run only packages that don’t use a real browser

For a quick check without starting Chrome:

```bash
pnpm --filter @dom-replay/packer test
pnpm --filter @dom-replay/snapshot test
pnpm --filter @dom-replay/utils test
# etc.
```

`@dom-replay/core` and `@dom-replay/video` are the ones that launch browsers; others use happy-dom or no DOM.

### 4. Run a single test file

When working on one area, run only that file to avoid starting many suites at once:

```bash
cd packages/core && pnpm exec vitest run test/rrdom.test.ts --pool=forks --maxWorkers=1
```

### 5. Give Node more memory (optional)

If you still hit OOM with a single worker, you can raise Node’s limit:

```bash
NODE_OPTIONS='--max-old-space-size=4096' pnpm test
```

This doesn’t reduce the number of Chrome processes; it only helps if the crash is from Node heap, not from total system memory.

### 6. Rely on CI for the full suite

For the full matrix (all packages, all tests), use CI. Locally, run the subset you need (e.g. one package or one file) with limited workers as above.

## Suggested “safe” local command

To run the full suite locally with reduced risk of crashes (e.g. from a terminal, not Cursor):

```bash
# From repo root: run tests with a single worker per package (slower but much lighter)
pnpm turbo run test --concurrency=1 --continue -- --pool=forks --maxWorkers=1
```

Not all packages forward Vitest flags; for the core package (where most browser tests live), prefer running from `packages/core` with explicit flags as in (2) and (4) above.

## Quick command from root: core tests only, one worker

From the repo root you can run core tests in a lighter way (one Vitest worker, one Chrome at a time):

```bash
pnpm test:core:safe
```

Use this when working in Cursor or when the full `pnpm test` is too heavy for your machine.
