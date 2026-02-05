#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Publish this workspace to GitHub Packages (npm).

Usage:
  scripts/publish-gh-packages.sh [options]

Options:
  --filter <pnpm-filter>   Publish only matching workspace packages (repeatable)
  --tag <dist-tag>         Publish with npm dist-tag (e.g. next)
  --dry-run                Perform a dry run (no publish)
  --skip-install           Skip pnpm install step
  --skip-build             Skip pnpm build:all step
  -h, --help               Show help

Auth:
  Provide a token via NODE_AUTH_TOKEN or GITHUB_TOKEN.
  The token must have write access to GitHub Packages.

Examples:
  NODE_AUTH_TOKEN=... scripts/publish-gh-packages.sh
  GITHUB_TOKEN=... scripts/publish-gh-packages.sh --filter @dom-replay/core
  NODE_AUTH_TOKEN=... scripts/publish-gh-packages.sh --tag next --dry-run
EOF
}

SCOPE='@dom-replay'
REGISTRY='https://npm.pkg.github.com'
SKIP_INSTALL='0'
SKIP_BUILD='0'
DRY_RUN='0'
TAG=''
FILTER_ARGS=()

while [[ $# -gt 0 ]]; do
  case "$1" in
    --filter)
      FILTER_ARGS+=("--filter" "$2")
      shift 2
      ;;
    --tag)
      TAG="$2"
      shift 2
      ;;
    --dry-run)
      DRY_RUN='1'
      shift 1
      ;;
    --skip-install)
      SKIP_INSTALL='1'
      shift 1
      ;;
    --skip-build)
      SKIP_BUILD='1'
      shift 1
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      echo >&2
      usage >&2
      exit 2
      ;;
  esac
done

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || true)"
if [[ -z "${ROOT_DIR}" ]]; then
  echo "Error: must be run from within a git repo." >&2
  exit 1
fi

TOKEN="${NODE_AUTH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "${TOKEN}" ]]; then
  echo "Error: set NODE_AUTH_TOKEN (or GITHUB_TOKEN) with GitHub Packages write access." >&2
  exit 1
fi

TMP_NPMRC="$(mktemp)"
cleanup() {
  rm -f "${TMP_NPMRC}"
}
trap cleanup EXIT

cat >"${TMP_NPMRC}" <<EOF
${SCOPE}:registry=${REGISTRY}
//npm.pkg.github.com/:_authToken=${TOKEN}
always-auth=true
EOF

export NODE_AUTH_TOKEN="${TOKEN}"
export NPM_CONFIG_USERCONFIG="${TMP_NPMRC}"

cd "${ROOT_DIR}"

if [[ "${SKIP_INSTALL}" != "1" ]]; then
  pnpm install --frozen-lockfile
fi

if [[ "${SKIP_BUILD}" != "1" ]]; then
  pnpm build:all
fi

PUBLISH_ARGS=(--access restricted --no-git-checks)
if [[ -n "${TAG}" ]]; then
  PUBLISH_ARGS+=(--tag "${TAG}")
fi
if [[ "${DRY_RUN}" == "1" ]]; then
  PUBLISH_ARGS+=(--dry-run)
fi

pnpm -r "${FILTER_ARGS[@]}" publish "${PUBLISH_ARGS[@]}"

