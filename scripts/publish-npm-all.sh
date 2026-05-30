#!/bin/bash
set -e

# Publish all browser-replay packages to npmjs.com
# Usage: NPM_TOKEN=... ./scripts/publish-npm-all.sh

if [ -z "$NPM_TOKEN" ]; then
  echo "Error: Set NPM_TOKEN environment variable first"
  echo "Get token from: https://www.npmjs.com/settings/tokens"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Publishing browser-replay packages to npmjs.com..."

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

FAILED=0

for pkg_dir in "${PACKAGES[@]}"; do
  pkg_name=$(basename "$pkg_dir")

  if [ ! -f "$ROOT_DIR/$pkg_dir/package.json" ]; then
    echo "Skipping $pkg_name (no package.json)"
    continue
  fi

  echo ""
  echo "=== $pkg_name ==="

  cd "$ROOT_DIR/$pkg_dir"

  # Backup original package.json
  cp package.json package.json.backup

  # Replace workspace:* with ^0.0.1 in dependencies
  sed -i 's/"workspace:\*"/"^0.0.1"/g' package.json

  echo "Publishing $pkg_name..."

  if pnpm publish --access public --no-git-checks; then
    echo "Successfully published $pkg_name"
  else
    echo "Failed to publish $pkg_name"
    FAILED=$((FAILED + 1))
  fi

  # Restore original package.json
  mv package.json.backup package.json

  cd "$ROOT_DIR"
done

echo ""
if [ "$FAILED" -gt 0 ]; then
  echo "Finished with $FAILED failures."
else
  echo "All packages published successfully!"
fi
echo "Check: https://www.npmjs.com/org/browser-replay"
