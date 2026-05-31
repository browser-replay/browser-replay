#!/bin/bash

# Manual publish helper for browser-replay packages
# Usage: ./scripts/publish-npm-manual.sh [package-name]

if [ -z "$NPM_TOKEN" ]; then
  echo "Error: Set NPM_TOKEN environment variable first"
  exit 1
fi

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# If a specific package is requested
if [ -n "$1" ]; then
  pkg_name="$1"
  pkg_dir="$ROOT_DIR/packages/$pkg_name"

  if [ ! -d "$pkg_dir" ]; then
    echo "Package $pkg_name not found"
    exit 1
  fi

  echo "Publishing $pkg_name..."

  cd "$pkg_dir"

  # Backup
  cp package.json package.json.backup

  # Replace workspace deps
  sed -i 's/"workspace:\*"/"^0.0.1"/g' package.json

  # Publish
  if NPM_TOKEN="$NPM_TOKEN" pnpm publish --access public --no-git-checks; then
    echo "Successfully published $pkg_name"
  else
    echo "Failed to publish $pkg_name"
    mv package.json.backup package.json
    exit 1
  fi

  # Restore
  mv package.json.backup package.json
  cd - > /dev/null

else
  # List all packages and their status
  echo "Package Status:"
  echo ""

  for pkg_dir in "$ROOT_DIR"/packages/*/ "$ROOT_DIR"/packages/plugins/*/; do
    if [ -f "$pkg_dir/package.json" ]; then
      pkg_name=$(basename "$pkg_dir")

      # Check JSON validity
      if (cd "$pkg_dir" && python3 -c "import json; json.load(open('package.json'))" 2>/dev/null); then
        echo "  $pkg_name - Ready to publish"
      else
        echo "  $pkg_name - JSON needs fixing"
      fi
    fi
  done

  echo ""
  echo "To publish a package: ./scripts/publish-npm-manual.sh <package-name>"
fi
