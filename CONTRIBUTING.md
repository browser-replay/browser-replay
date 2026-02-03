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

## Coding style

See [documentation](docs/development/coding-style.md)

## License

This codebase includes MIT-licensed components; see `LICENSE` and `NOTICE`.
