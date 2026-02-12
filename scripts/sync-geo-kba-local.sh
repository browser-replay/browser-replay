#!/usr/bin/env bash
set -euo pipefail

# Build + pack dom-replay packages, then sync them into geo-kba.
#
# Usage:
#   bash scripts/sync-geo-kba-local.sh
#   bash scripts/sync-geo-kba-local.sh --force-build
#   bash scripts/sync-geo-kba-local.sh --skip-build
#   bash scripts/sync-geo-kba-local.sh --geo-kba-repo /path/to/geo-kba
#   bash scripts/sync-geo-kba-local.sh --app-path apps/app
#
# Options:
#   --force-build    Force a fresh rebuild of filtered packages before packing
#   --skip-build     Skip build and only pack current dist outputs
#   --geo-kba-repo   Path to geo-kba repository (default: sibling ../geo-kba)
#   --app-path       App path for Vite cache cleanup (default: apps/dashboard)
#   --no-cache-clear Do not clear Vite cache in consuming app
#   -h, --help       Show help

show_help() {
  sed -n '2,28p' "$0"
}

FORCE_BUILD=0
SKIP_BUILD=0
CLEAR_CACHE=1
GEO_KBA_REPO=""
APP_PATH="apps/dashboard"

while [[ $# -gt 0 ]]; do
  case "$1" in
    --force-build)
      FORCE_BUILD=1
      shift
      ;;
    --skip-build)
      SKIP_BUILD=1
      shift
      ;;
    --geo-kba-repo)
      GEO_KBA_REPO="${2:-}"
      shift 2
      ;;
    --app-path)
      APP_PATH="${2:-}"
      shift 2
      ;;
    --no-cache-clear)
      CLEAR_CACHE=0
      shift
      ;;
    -h|--help)
      show_help
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      show_help >&2
      exit 1
      ;;
  esac
done

if [[ "$FORCE_BUILD" == "1" && "$SKIP_BUILD" == "1" ]]; then
  echo "Error: --force-build and --skip-build cannot be used together." >&2
  exit 1
fi

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "$ROOT_DIR" ]]; then
  echo "Error: must be run from within the dom-replay git repo." >&2
  exit 1
fi

if [[ -z "$GEO_KBA_REPO" ]]; then
  GEO_KBA_REPO="$(cd "${ROOT_DIR}/.." && pwd)/geo-kba"
fi

if [[ ! -d "$GEO_KBA_REPO" ]]; then
  echo "Error: geo-kba repo not found at: ${GEO_KBA_REPO}" >&2
  echo "Pass --geo-kba-repo /absolute/path/to/geo-kba" >&2
  exit 1
fi

if [[ ! -f "${GEO_KBA_REPO}/scripts/update-dom-replay-local.sh" ]]; then
  echo "Error: expected update script not found at:" >&2
  echo "  ${GEO_KBA_REPO}/scripts/update-dom-replay-local.sh" >&2
  exit 1
fi

if [[ "$FORCE_BUILD" == "1" ]]; then
  pnpm turbo run prepublish --force \
    --filter @dom-replay/types \
    --filter @dom-replay/utils \
    --filter @dom-replay/snapshot \
    --filter @dom-replay/dom \
    --filter @dom-replay/core \
    --filter @dom-replay/packer \
    --filter @dom-replay/record \
    --filter @dom-replay/replay \
    --filter @dom-replay/player-core \
    --filter @dom-replay/player
  bash "${ROOT_DIR}/scripts/pack-local-dev.sh" --skip-build
elif [[ "$SKIP_BUILD" == "1" ]]; then
  bash "${ROOT_DIR}/scripts/pack-local-dev.sh" --skip-build
else
  bash "${ROOT_DIR}/scripts/pack-local-dev.sh"
fi

LATEST_FILE="${ROOT_DIR}/.cache/dev-packs/latest"
if [[ ! -f "$LATEST_FILE" ]]; then
  echo "Error: could not find ${LATEST_FILE} after packing." >&2
  exit 1
fi
PACKS_DIR="$(cat "$LATEST_FILE")"

(
  cd "${GEO_KBA_REPO}"
  bash "scripts/update-dom-replay-local.sh" \
    --repo "${ROOT_DIR}" \
    --packs-dir "${PACKS_DIR}"
)

if [[ "$CLEAR_CACHE" == "1" ]]; then
  VITE_CACHE_DIR="${GEO_KBA_REPO}/${APP_PATH}/node_modules/.vite"
  if [[ -d "$VITE_CACHE_DIR" ]]; then
    rm -rf "$VITE_CACHE_DIR"
  fi
  echo "Cleared Vite cache at:"
  echo "  ${VITE_CACHE_DIR}"
fi

echo
echo "geo-kba sync complete."
echo "Next:"
echo "  1) restart geo-kba dev server"
echo "  2) hard refresh the browser (Ctrl+Shift+R)"
