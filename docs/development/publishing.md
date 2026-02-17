# Publishing packages

How to publish `@dom-replay/*` to npm and/or GitHub Packages **without entering OTP on every publish**.

## Deploy without OTP: use GitHub Actions (recommended)

Publishing is done from CI using **npm Trusted Publishing (OIDC)**. No long-lived token and no OTP.

1. **One-time setup on npm**  
   For each `@dom-replay/*` package on [npmjs.com](https://www.npmjs.com/org/dom-replay):
   - Open the package → **Settings** → **Trusted publishing**
   - Add a trusted publisher: **GitHub Actions**
   - Workflow filename: `publish-npm.yml`
   - Repository: `dom-replay/dom-replay`
   - Save

   You only need to do this once per package (or when you add a new publishable package).  
   **New packages:** If a package does not exist on npm yet, publish it once with `NPM_TOKEN` and `./publish-all-to-npm.sh`, then add the trusted publisher so future releases use OIDC.

2. **Deploy**
   - **From a tag:**  
     Bump versions in the repo, then push a version tag:

     ```bash
     git tag v0.0.2
     git push origin v0.0.2
     ```

     The [Publish to npm](https://github.com/dom-replay/dom-replay/actions/workflows/publish-npm.yml) workflow runs and publishes all packages to npm.
   - **Manual run:**  
     In GitHub: **Actions** → **Publish to npm** → **Run workflow** (uses version from root `package.json`).

No `NPM_TOKEN` or OTP is required in the workflow; npm authenticates via OIDC.

## Alternative: publish from your machine

If you need to publish from your machine (e.g. one-off fix):

- **With 2FA enabled:**  
  Use a [Granular Access Token](https://www.npmjs.com/settings/~/tokens) with **Publish** scope and, if your org allows it, **Bypass two-factor authentication for automation**. Set it as `NPM_TOKEN` and run:

  ```bash
  NPM_TOKEN=... ./publish-all-to-npm.sh
  ```

  If npm still asks for OTP, the bypass option may not be available for your account (npm is tightening 2FA).

- **Temporarily disable 2FA:**  

  ```bash
  npm profile disable-2fa --otp=YOUR_OTP
  NPM_TOKEN=... ./publish-all-to-npm.sh
  npm profile enable-2fa auth-and-writes
  ```

## GitHub Packages

To publish to GitHub Packages (in addition to or instead of npm):

```bash
NODE_AUTH_TOKEN=... REGISTRY=https://npm.pkg.github.com ./scripts/publish-gh-packages.sh
```

Or use the **Publish (GitHub Packages)** workflow on tag push or manual dispatch (uses secret `DOM_REPLAY_PACKAGES_TOKEN`).

## Scripts reference

| Script | Purpose |
|--------|--------|
| `./publish-all-to-npm.sh` | Publish all packages to npm (requires `NPM_TOKEN`) |
| `./scripts/publish-gh-packages.sh` | Publish to npm or GitHub Packages; supports `--filter`, `--bump-version`, `--force` |

See `scripts/publish-gh-packages.sh --help` for full options.
