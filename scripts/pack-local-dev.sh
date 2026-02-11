#!/usr/bin/env bash
set -euo pipefail

# Build + pack dom-replay packages for fast local iteration
# Usage:
#   bash scripts/pack-local-dev.sh
#   bash scripts/pack-local-dev.sh --skip-build
#
# Output:
#   Writes tarballs into .cache/dev-packs/<timestamp>/
#   Writes the latest pack dir into .cache/dev-packs/latest

SKIP_BUILD=0
if [[ "${1:-}" == "--skip-build" ]]; then
  SKIP_BUILD=1
fi

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT_DIR}" ]]; then
  echo "Error: must be run from within the dom-replay git repo." >&2
  exit 1
fi

DEST_BASE="${ROOT_DIR}/.cache/dev-packs"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST_DIR="${DEST_BASE}/${STAMP}"

mkdir -p "${DEST_DIR}"

if [[ "${SKIP_BUILD}" != "1" ]]; then
  # Build the minimal closure needed for record+replay+player-react.
  pnpm turbo run prepublish \
    --filter @dom-replay/types \
    --filter @dom-replay/utils \
    --filter @dom-replay/snapshot \
    --filter @dom-replay/dom \
    --filter @dom-replay/core \
    --filter @dom-replay/packer \
    --filter @dom-replay/record \
    --filter @dom-replay/replay \
    --filter @dom-replay/player-core \
    --filter @dom-replay/player-react
fi

# Pack in dependency order (not strictly required, but clearer).
pnpm -C "${ROOT_DIR}/packages/types" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/utils" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/snapshot" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/dom" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/core" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/packer" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/record" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/replay" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/player-core" pack --pack-destination "${DEST_DIR}"
pnpm -C "${ROOT_DIR}/packages/player-react" pack --pack-destination "${DEST_DIR}"

mkdir -p "${DEST_BASE}"
echo "${DEST_DIR}" > "${DEST_BASE}/latest"

echo
echo "Packed dom-replay tarballs into:"
echo "  ${DEST_DIR}"
echo
echo "Next (from geo-kba):"
echo "  bash scripts/update-dom-replay-local.sh --repo \"${ROOT_DIR}\" --packs-dir \"${DEST_DIR}\""
