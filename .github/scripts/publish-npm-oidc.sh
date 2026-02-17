#!/usr/bin/env bash
# Publish all @dom-replay/* packages to npm using OIDC (no token).
# Called from .github/workflows/publish-npm.yml.
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"

# Version: from tag (e.g. v0.0.1 -> 0.0.1) or root package.json
if [[ -n "${GITHUB_REF:-}" && "$GITHUB_REF" =~ ^refs/tags/v(.+)$ ]]; then
  VERSION="${BASH_REMATCH[1]}"
else
  VERSION=$(node -e "console.log(require('./package.json').version)")
fi
echo "Publishing @dom-replay/* at version ^${VERSION} (workspace refs)"

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
  packages/player-svelte
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
  [[ -f "$pkg_dir/package.json" ]] || continue
  # Skip private or non-publishable packages
  if node -e "const p=require('./$pkg_dir/package.json'); if(p.private||!p.publishConfig) process.exit(0); process.exit(1)" 2>/dev/null; then
    continue
  fi

  pkg_name=$(basename "$pkg_dir")
  echo "=== $pkg_name ==="

  # Replace workspace:* with ^VERSION in dependencies (JSON-safe)
  backup="$pkg_dir/package.json.bak"
  cp "$pkg_dir/package.json" "$backup"
  node -e "
    const fs = require('fs');
    const p = JSON.parse(fs.readFileSync('$pkg_dir/package.json', 'utf8'));
    if (p.dependencies) {
      for (const k of Object.keys(p.dependencies)) {
        if (p.dependencies[k] === 'workspace:*') p.dependencies[k] = '^$VERSION';
      }
    }
    fs.writeFileSync('$pkg_dir/package.json', JSON.stringify(p, null, 2) + '\n');
  "

  if (cd "$pkg_dir" && pnpm publish --access public --no-git-checks); then
    echo "Published $pkg_name"
  else
    echo "Failed $pkg_name"
    FAILED=$((FAILED + 1))
  fi

  mv "$backup" "$pkg_dir/package.json"
done

[[ $FAILED -eq 0 ]] || exit 1
echo "All packages published to npm."
