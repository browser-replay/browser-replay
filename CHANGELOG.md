# Changelog

All notable changes to this project will be documented in this file.

## [Unreleased]

## [0.0.2] - 2026-06-17

Second public release. **Breaking change:** recordings and integrations using the legacy `dr-*` / `dr_*` naming from dom-replay must migrate to `br-*` / `br_*`. Sessions recorded before this release will not replay.

### Breaking changes

- Renamed privacy class defaults: `dr-block` → `br-block`, `dr-ignore` → `br-ignore`, `dr-mask` → `br-mask`
- Renamed serialized wire-format attributes (`dr_width`, `dr_type`, `dr_open_mode`, etc.) to `br_*`
- Renamed player UI CSS classes (`dr-player`, `dr-controller`, …) to `br-*`
- Console plugin hook key: `__dr_original__` → `__br_original__`

### Added

- tsdown-based build for all publishable packages (#46)
- Enforced type-check CI gate, publint, and advisory attw validation
- npm publish script reads auth token from `~/.npmrc` when `NPM_TOKEN` is unset

### Changed

- Migrated publishable packages from Vite to tsdown
- Updated dev and production dependencies across the monorepo
- Player bundled CSS export aligned to `style.css` in the exports map (#42)
- Renamed `DomReplayPlayer` → `BrowserReplayPlayer`

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
