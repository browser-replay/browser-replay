#!/usr/bin/env bash
# publish-npm-all.sh — Publish all @browser-replay/* packages to npmjs.com
#
# AUTHENTICATION
#   Requires an npm Automation token (bypasses OTP — suitable for long sessions).
#   Create one at: https://www.npmjs.com/settings/tokens → Generate New Token → Automation
#
#   Store it in ~/.npmrc (never pass via env var — it ends up in shell history):
#     echo "//registry.npmjs.org/:_authToken=npm_YOUR_TOKEN" >> ~/.npmrc
#
# USAGE
#   ./scripts/publish-npm-all.sh            # full publish
#   ./scripts/publish-npm-all.sh --dry-run  # preview without publishing

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DRY_RUN=false

# ---------------------------------------------------------------------------
# Parse flags
# ---------------------------------------------------------------------------
for arg in "$@"; do
  case $arg in
    --dry-run) DRY_RUN=true ;;
    *) echo "Unknown argument: $arg"; exit 1 ;;
  esac
done

if $DRY_RUN; then
  echo "DRY RUN — no packages will be published"
  echo ""
fi

# ---------------------------------------------------------------------------
# Pre-flight checks
# ---------------------------------------------------------------------------

# Must be run from the repo root (or scripts/)
cd "$ROOT_DIR"

# Working tree must be clean
if [ -n "$(git status --porcelain)" ]; then
  echo "Error: Working tree is not clean. Commit or stash changes before publishing."
  git status --short
  exit 1
fi

# Must be on master
BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ "$BRANCH" != "master" ]; then
  echo "Error: Must publish from master (currently on '$BRANCH')."
  exit 1
fi

# Verify npm authentication before starting a long publish run.
# An Automation token in ~/.npmrc will satisfy this without requiring OTP.
echo "Checking npm authentication..."
if ! npm whoami --registry https://registry.npmjs.org 2>/dev/null; then
  echo ""
  echo "Error: Not authenticated with npm."
  echo ""
  echo "Set up an Automation token in ~/.npmrc:"
  echo "  1. Go to https://www.npmjs.com/settings/tokens"
  echo "  2. Generate New Token → Automation"
  echo "  3. echo '//registry.npmjs.org/:_authToken=YOUR_TOKEN' >> ~/.npmrc"
  echo ""
  echo "Automation tokens bypass OTP and are safe for long-running publish scripts."
  exit 1
fi
NPM_USER="$(npm whoami --registry https://registry.npmjs.org 2>/dev/null)"
echo "Authenticated as: $NPM_USER"
echo ""

# Read the version from root package.json
VERSION="$(node -p "require('./package.json').version")"
echo "Publishing version: $VERSION"
echo ""

# Confirm before proceeding
read -rp "Proceed with publish? [y/N] " CONFIRM
if [[ "$CONFIRM" != "y" && "$CONFIRM" != "Y" ]]; then
  echo "Aborted."
  exit 0
fi
echo ""

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------
echo "Building all packages..."
NODE_OPTIONS='--max-old-space-size=4096' pnpm turbo run prepublish
echo ""

# ---------------------------------------------------------------------------
# Publish — in dependency order
# pnpm publish handles workspace:* replacement automatically.
# ---------------------------------------------------------------------------

# Publish order matters: dependencies before dependants.
PACKAGES=(
  packages/types
  packages/utils
  packages/dom
  packages/snapshot
  packages/packer
  packages/core
  packages/dom-nodejs
  packages/record
  packages/replay
  packages/player-core
  packages/player
  packages/video
  packages/plugins/plugin-console-record
  packages/plugins/plugin-console-replay
  packages/plugins/plugin-canvas-webrtc-record
  packages/plugins/plugin-canvas-webrtc-replay
  packages/plugins/plugin-sequential-id-record
  packages/plugins/plugin-sequential-id-replay
)

PUBLISHED=()
FAILED=()

PUBLISH_FLAGS="--access public --no-git-checks"
if $DRY_RUN; then
  PUBLISH_FLAGS="$PUBLISH_FLAGS --dry-run"
fi

for pkg_dir in "${PACKAGES[@]}"; do
  pkg_json="$ROOT_DIR/$pkg_dir/package.json"

  if [ ! -f "$pkg_json" ]; then
    echo "Skipping $pkg_dir (no package.json)"
    continue
  fi

  pkg_name="$(node -p "require('$pkg_json').name")"
  pkg_version="$(node -p "require('$pkg_json').version")"

  echo "Publishing $pkg_name@$pkg_version..."

  if (cd "$ROOT_DIR/$pkg_dir" && pnpm publish $PUBLISH_FLAGS 2>&1); then
    echo "  ✓ $pkg_name"
    PUBLISHED+=("$pkg_name")
  else
    echo "  ✗ $pkg_name — FAILED"
    FAILED+=("$pkg_name")
  fi
  echo ""
done

# ---------------------------------------------------------------------------
# Summary
# ---------------------------------------------------------------------------
echo "==============================="
echo "Published:  ${#PUBLISHED[@]} packages"
echo "Failed:     ${#FAILED[@]} packages"

if [ ${#FAILED[@]} -gt 0 ]; then
  echo ""
  echo "Failed packages:"
  for pkg in "${FAILED[@]}"; do
    echo "  - $pkg"
  done
  exit 1
fi

if $DRY_RUN; then
  echo ""
  echo "Dry run complete — nothing was published."
  echo "Run without --dry-run to publish for real."
else
  echo ""
  echo "All packages published!"
  echo ""

  # Tag the release
  TAG="v$VERSION"
  if git rev-parse "$TAG" >/dev/null 2>&1; then
    echo "Tag $TAG already exists — skipping."
  else
    git tag "$TAG"
    git push origin "$TAG"
    echo "Tagged and pushed: $TAG"
  fi

  echo ""
  echo "View on npm: https://www.npmjs.com/org/browser-replay"
fi
