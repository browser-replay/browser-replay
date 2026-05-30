#!/bin/bash
set -e

# Publish all browser-replay packages to npmjs.com (auto-discovers packages)
# Usage: NPM_TOKEN=... ./scripts/publish-npm.sh

if [ -z "$NPM_TOKEN" ]; then
  echo "Error: Set NPM_TOKEN environment variable first"
  echo "Get token from: https://www.npmjs.com/settings/tokens"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "Publishing browser-replay packages to npmjs.com..."

# Find all packages with package.json (excluding node_modules)
find "$ROOT_DIR/packages" -name "package.json" -not -path "*/node_modules/*" | while read -r pkg_json; do
  pkg_dir=$(dirname "$pkg_json")
  pkg_name=$(basename "$pkg_dir")

  echo "Processing $pkg_name..."

  # Skip if no name field
  if ! grep -q '"name"' "$pkg_json"; then
    echo "  Skipping $pkg_name (no name field)"
    continue
  fi

  cd "$pkg_dir"

  # Validate JSON before proceeding
  if ! python3 -c "import json; json.load(open('package.json'))" 2>/dev/null; then
    echo "  Skipping $pkg_name (invalid JSON)"
    cd - > /dev/null
    continue
  fi

  # Backup original package.json
  cp package.json package.json.backup

  # Replace workspace:* with ^0.0.1 in dependencies
  sed -i 's/"workspace:\*"/"^0.0.1"/g' package.json

  echo "  Publishing $pkg_name..."

  if NPM_TOKEN="$NPM_TOKEN" pnpm publish --access public --no-git-checks; then
    echo "  Successfully published $pkg_name"
  else
    echo "  Failed to publish $pkg_name"
    mv package.json.backup package.json
    cd - > /dev/null
    continue
  fi

  # Restore original package.json
  mv package.json.backup package.json

  cd - > /dev/null
done

echo "Finished publishing packages!"
echo "Check your packages at: https://www.npmjs.com/org/browser-replay"
