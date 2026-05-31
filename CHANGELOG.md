# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.0.1] - 2026-05-31

Initial public release of browser-replay, a fork of [rrweb](https://github.com/rrweb-io/rrweb) with its own name, repository, and roadmap.

### Highlights

- All packages published under the `@browser-replay` scope
- Monorepo restructured with Turborepo and pnpm workspaces
- React-based player (`@browser-replay/player`)
- CI pipeline with lint, typecheck, build, and test stages
- OIDC-based npm publishing via GitHub Actions (no token required)
- Plugin architecture for console recording/replay, canvas WebRTC, and sequential IDs
- Full documentation in `docs/`
- Security: `type="hidden"` inputs now correctly masked when `maskAllInputs` is enabled
- UMD bundles are fully self-contained (no sibling `require()` calls)
- ESLint 9 flat config migration

### Attribution

browser-replay is built on rrweb. See `LICENSE` and `NOTICE` for full attribution.
