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
  --delete-existing        Delete existing package version on GitHub before
                           publishing (avoids 409). Often 404 via API; prefer
                           --bump-version when possible.
  --delete-version <ver>   Delete a specific version from GitHub Packages
                           without publishing (use --filter to limit packages)
  --bump-version           Bump patch version (e.g. 0.0.1 -> 0.0.2) in all
                           publishable packages before publishing. Use this to
                           avoid 409 without needing delete:packages.
  --debug                  Print GitHub API URLs and responses for delete step.
  -h, --help               Show help

Auth:
  Provide a token via NODE_AUTH_TOKEN or GITHUB_TOKEN (write:packages).
  Optional: GITHUB_OWNER (default: vcatalano).

Examples:
  NODE_AUTH_TOKEN=... scripts/publish-gh-packages.sh
  NODE_AUTH_TOKEN=... scripts/publish-gh-packages.sh --bump-version --skip-install --skip-build
  GITHUB_TOKEN=... scripts/publish-gh-packages.sh --filter @dom-replay/core
  NODE_AUTH_TOKEN=... scripts/publish-gh-packages.sh --tag next --dry-run
EOF
}

SCOPE='@dom-replay'
REGISTRY='https://npm.pkg.github.com'
GITHUB_OWNER="${GITHUB_OWNER:-vcatalano}"
# Repository for package lookup (e.g. dom-replay/dom-replay). Used when org/user APIs return 404.
GITHUB_REPO="${GITHUB_REPO:-dom-replay/dom-replay}"
SKIP_INSTALL='0'
SKIP_BUILD='0'
DRY_RUN='0'
DELETE_EXISTING='0'
BUMP_VERSION='0'
DEBUG='0'
TAG=''
DELETE_VERSION=''
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
    --delete-existing)
      DELETE_EXISTING='1'
      shift 1
      ;;
    --delete-version)
      DELETE_VERSION="$2"
      shift 2
      ;;
    --bump-version)
      BUMP_VERSION='1'
      shift 1
      ;;
    --debug)
      DEBUG='1'
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

# Bump patch version in all publishable packages to avoid 409 (publish new version instead of overwriting)
if [[ "${BUMP_VERSION}" == "1" && "${DRY_RUN}" != "1" ]]; then
  echo "Bumping patch version in publishable packages ..." >&2
  while IFS= read -r dir; do
    [[ -n "$dir" ]] || continue
    [[ -f "${dir}/package.json" ]] || continue
    grep -q '"private": *true' "${dir}/package.json" 2>/dev/null && continue
    grep -q '"publishConfig"' "${dir}/package.json" 2>/dev/null || continue
    (cd "${dir}" && node -e "
      const fs = require('fs');
      const p = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const m = p.version && p.version.match(/^(\d+)\.(\d+)\.(\d+)$/);
      if (m) {
        p.version = m[1] + '.' + m[2] + '.' + (Number(m[3]) + 1);
        fs.writeFileSync('package.json', JSON.stringify(p, null, 2));
        console.log(p.name + ' -> ' + p.version);
      }
    ") || true
  done < <(pnpm -r exec pwd 2>/dev/null)
fi

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

# Replace workspace:* dependencies with published versions for publishing
prepare_package_for_publish() {
  local pkg_json="$1"
  # Get the current version from package.json
  local current_version
  current_version=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).version)" "$pkg_json" 2>/dev/null) || current_version="0.0.2"
  # Replace workspace:* with ^${current_version} in dependencies (but not devDependencies)
  sed -i "/\"dependencies\": {/,/},/ { s/\"workspace:\*\"/\"^${current_version}\"/g; }" "$pkg_json"
}

# Delete a package version from GitHub Packages (so we can republish).
# Requires token with delete:packages. Uses org API for scoped packages.
delete_github_package_version() {
  local pkg_name="$1"
  local version="$2"
  # For scoped packages, GitHub Packages API uses just the package name without scope
  local pkg_name_no_scope="${pkg_name##*/}"
  local encoded_no_scope
  encoded_no_scope=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "$pkg_name_no_scope")
  local version_id=""

  # For scoped packages, GitHub Packages API uses just the package name without scope
  local list_urls=(
    "https://api.github.com/orgs/${GITHUB_OWNER}/packages/npm/${encoded_no_scope}/versions"
  )
  for list_url in "${list_urls[@]}"; do
    [[ "${DEBUG}" == "1" ]] && echo "[debug] GET $list_url" >&2
    local resp
    resp=$(curl -sS -w "\n%{http_code}" -H "Authorization: Bearer ${TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "$list_url" 2>/dev/null) || true
    local code
    code=$(echo "$resp" | tail -1)
    local body
    body=$(echo "$resp" | sed '$d')
    if [[ "${DEBUG}" == "1" ]]; then
      echo "[debug] List versions response: ${code}, body length ${#body}" >&2
      [[ -n "$body" ]] && echo "[debug] Body (first 500 chars): ${body:0:500}" >&2
    fi
    if [[ "$code" == "200" && -n "$body" ]]; then
      [[ "${DEBUG}" == "1" ]] && echo "[debug] Found package versions at: $list_url" >&2
    fi
    if [[ "$code" != "200" ]]; then
      if [[ "$code" == "404" ]]; then
        continue
      fi
      echo "GitHub API list versions ${code} for ${pkg_name}: ${body:0:300}" >&2
      continue
    fi
    version_id=$(node -e "
      const raw = process.argv[1];
      const ver = process.argv[2];
      let arr = [];
      try {
        const v = JSON.parse(raw);
        arr = Array.isArray(v) ? v : (v && Array.isArray(v.versions) ? v.versions : []);
      } catch (e) {}
      const found = arr.find(function (x) {
        const n = x.name || x.version || (x.metadata && x.metadata.version);
        return n === ver;
      });
      console.log(found ? String(found.id) : '');
    " "$body" "$version" 2>/dev/null) || true
    if [[ "${DEBUG}" == "1" && -z "${version_id}" && -n "${body}" ]]; then
      echo "[debug] No version id found for '${version}'. First item keys: $(node -e "const v=JSON.parse(process.argv[1]); const a=Array.isArray(v)?v:(v.versions||[]); console.log(a[0]?Object.keys(a[0]).join(','):'empty');" "$body" 2>/dev/null)" >&2
    fi
    if [[ -n "${version_id}" ]]; then
      [[ "${DEBUG}" == "1" ]] && echo "[debug] Found version ${version} with ID ${version_id} using URL: $list_url" >&2
      break
    fi
  done
  if [[ -z "${version_id}" ]]; then
    echo "Warning: Could not find ${pkg_name}@${version} on GitHub to delete (404 or version not in list). Publish may fail with 409." >&2
    return 0
  fi
  echo "Deleting existing ${pkg_name}@${version} (version id ${version_id}) ..." >&2
  local delete_urls=(
    "https://api.github.com/orgs/${GITHUB_OWNER}/packages/npm/${encoded_no_scope}/versions/${version_id}"
  )
  for delete_url in "${delete_urls[@]}"; do
    [[ "${DEBUG}" == "1" ]] && echo "[debug] DELETE $delete_url" >&2
    local del_code
    del_code=$(curl -sS -o /dev/null -w "%{http_code}" -X DELETE \
      -H "Authorization: Bearer ${TOKEN}" \
      -H "Accept: application/vnd.github+json" \
      -H "X-GitHub-Api-Version: 2022-11-28" \
      "$delete_url" 2>/dev/null) || true
    if [[ "${DEBUG}" == "1" ]]; then echo "[debug] Delete response: ${del_code}" >&2; fi
    if [[ "$del_code" == "204" ]]; then
      [[ "${DEBUG}" == "1" ]] && echo "[debug] Successfully deleted using URL: $delete_url" >&2
      echo "Deleted ${pkg_name}@${version}." >&2
      return 0
    fi
    if [[ "$del_code" != "404" ]]; then
      echo "GitHub API delete version ${del_code} for ${pkg_name}@${version}. Check token has delete:packages and you have admin on the package." >&2
    fi
  done
}

# Publish each package separately so one failure (e.g. version already exists) doesn't stop the rest.
# Use pnpm's default order (dependency order) so dependents are published after their deps.
publish_one() {
  local dir="$1"
  [[ -f "${dir}/package.json" ]] || return 0
  grep -q '"private": *true' "${dir}/package.json" 2>/dev/null && return 0
  grep -q '"publishConfig"' "${dir}/package.json" 2>/dev/null || return 0

  # Prepare package for publishing (replace workspace:* with published versions)
  local temp_dir
  temp_dir=$(mktemp -d)
  cp -r "${dir}"/* "${temp_dir}/"
  prepare_package_for_publish "${temp_dir}/package.json"

  if [[ "${DELETE_EXISTING}" == "1" ]]; then
    local pkg_name version
    pkg_name=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).name)" "${temp_dir}/package.json" 2>/dev/null) || true
    version=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).version)" "${temp_dir}/package.json" 2>/dev/null) || true
    if [[ -n "${pkg_name}" && -n "${version}" ]]; then
      if [[ "${DRY_RUN}" == "1" ]]; then
        echo "[dry-run] Would delete existing ${pkg_name}@${version} from GitHub Packages" >&2
        # Show what URLs would be tried
        local encoded_no_scope
        encoded_no_scope=$(node -e "console.log(encodeURIComponent(process.argv[1]))" "${pkg_name##*/}")
        echo "[dry-run] Would try this list URL:" >&2
        echo "[dry-run]   GET https://api.github.com/orgs/${GITHUB_OWNER}/packages/npm/${encoded_no_scope}/versions" >&2
        echo "[dry-run] Would then try corresponding DELETE URLs if version found" >&2
      else
        delete_github_package_version "$pkg_name" "$version"
      fi
    fi
  fi
  echo "Publishing ${dir##*/} ..." >&2
  (cd "${temp_dir}" && pnpm publish "${PUBLISH_ARGS[@]}")
  rm -rf "${temp_dir}"
}

FAILED=0

# Handle delete-version mode (delete specific version without publishing)
if [[ -n "${DELETE_VERSION}" ]]; then
  set +e
  dir_list=""
  if [[ ${#FILTER_ARGS[@]} -gt 0 ]]; then
    dir_list=$(pnpm -r "${FILTER_ARGS[@]}" exec pwd 2>/dev/null)
  else
    dir_list=$(pnpm -r exec pwd 2>/dev/null)
  fi
  while IFS= read -r dir; do
    [[ -n "$dir" ]] || continue
    [[ -f "${dir}/package.json" ]] || continue
    grep -q '"publishConfig"' "${dir}/package.json" 2>/dev/null || continue
    local pkg_name version
    pkg_name=$(node -e "console.log(JSON.parse(require('fs').readFileSync(process.argv[1],'utf8')).name)" "${dir}/package.json" 2>/dev/null) || continue
    if [[ -n "${pkg_name}" ]]; then
      echo "Deleting ${pkg_name}@${DELETE_VERSION} ..." >&2
      if [[ "${DRY_RUN}" == "1" ]]; then
        echo "[dry-run] Would delete ${pkg_name}@${DELETE_VERSION} from GitHub Packages" >&2
      else
        delete_github_package_version "$pkg_name" "$DELETE_VERSION" || FAILED=$((FAILED + 1))
      fi
    fi
  done <<< "$dir_list"
  set -e
  [[ "$FAILED" -gt 0 ]] && exit 1
  exit 0
fi

# Use per-package loop when filtering or when delete-existing (so delete runs before each publish)
if [[ ${#FILTER_ARGS[@]} -gt 0 ]] || [[ "${DELETE_EXISTING}" == "1" ]]; then
  set +e
  dir_list=""
  if [[ ${#FILTER_ARGS[@]} -gt 0 ]]; then
    dir_list=$(pnpm -r "${FILTER_ARGS[@]}" exec pwd 2>/dev/null)
  else
    dir_list=$(pnpm -r exec pwd 2>/dev/null)
  fi
  while IFS= read -r dir; do
    [[ -n "$dir" ]] || continue
    publish_one "${dir}" || FAILED=$((FAILED + 1))
  done <<< "$dir_list"
  set -e
else
  pnpm -r publish "${PUBLISH_ARGS[@]}" || FAILED=1
fi
[[ "$FAILED" -gt 0 ]] && exit 1
exit 0

