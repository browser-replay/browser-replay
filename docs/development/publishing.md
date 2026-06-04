# Publishing packages

How to publish the `@browser-replay/*` packages to npm.

> **Heads-up:** Publishing currently runs **locally** from a maintainer's machine via
> [`scripts/publish-npm-all.sh`](../../scripts/publish-npm-all.sh). There is no CI publish
> workflow — the GitHub Actions publish workflows were removed. If you want OIDC-based
> Trusted Publishing from CI, that has to be re-added as a workflow first.

## What gets published

Every non-private workspace package under `packages/*` and `packages/plugins/*` — 18
packages, all scoped `@browser-replay/*` and published with **public** access.
`@browser-replay/web-extension` is `private: true` and is **not** published (it's the
demo app, and the publish build skips it).

## Prerequisites

1. **npm org + membership.** The packages are scoped to the `browser-replay` npm org. The
   org must exist and your npm account must be a member with publish rights. Create it
   once at [npmjs.com](https://www.npmjs.com/org/create) (free for public packages) if it
   doesn't exist yet.

2. **Authenticate without OTP prompts.** The script publishes ~18 packages in a loop;
   interactive 2FA would prompt for a one-time password on *every* package. Use an
   **Automation token** (bypasses OTP), stored in `~/.npmrc`:

   ```bash
   # npmjs.com -> Access Tokens -> Generate New Token -> Automation
   echo "//registry.npmjs.org/:_authToken=npm_YOUR_TOKEN" >> ~/.npmrc
   ```

   The script verifies `npm whoami` before doing anything.

3. **Clean git state on `master`.** The script refuses to run with a dirty working tree or
   off `master`.

## Publish

```bash
# Preview — builds and packs everything, publishes nothing:
./scripts/publish-npm-all.sh --dry-run

# For real — builds, publishes all packages in dependency order, then tags the release:
./scripts/publish-npm-all.sh
```

The script:

- builds the publishable packages (`turbo run prepublish`, excluding the private demo app);
- publishes each in dependency order with `pnpm publish --access public --no-git-checks`
  (each package is published at its own `package.json` version);
- tags the release `v<root package.json version>` and pushes the tag.

### Versioning

Each package is published at the `version` in its own `package.json`; the git tag uses the
**root** `package.json` version. For a coordinated release keep them in sync (e.g. all at
`0.0.1` for the first release).

### First publish of a scoped package

A scoped package can only be published once the `browser-replay` org exists and you're a
member. The script already passes `--access public`, which is required so the first
publish of each scoped package is public (a scoped package defaults to restricted, which
fails for accounts without a paid plan).

## Alternative: GitHub Packages

To publish to GitHub Packages instead of / in addition to npm:

```bash
pnpm publish:gh        # wraps scripts/publish-gh-packages.sh
pnpm publish:gh:dry    # dry run
```

[`scripts/publish-gh-packages.sh`](../../scripts/publish-gh-packages.sh) supports
`--filter`, `--tag`, `--dry-run`, `--bump-version`, `--force`, and more
(`scripts/publish-gh-packages.sh --help`). Auth via `NODE_AUTH_TOKEN` / `GITHUB_TOKEN`
with `write:packages`.

> Note: that script's `GITHUB_OWNER` still defaults to the old `dom-replay` owner — pass
> `GITHUB_OWNER=browser-replay` (or fix the default) when using it.

## Scripts reference

| Script | Purpose |
|--------|---------|
| `./scripts/publish-npm-all.sh` | Publish all public packages to npm (auth via `~/.npmrc`). `--dry-run` to preview. |
| `./scripts/publish-gh-packages.sh` | Publish to GitHub Packages (or npm); supports `--filter`, `--bump-version`, `--force`, etc. |
