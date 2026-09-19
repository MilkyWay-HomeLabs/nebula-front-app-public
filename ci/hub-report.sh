#!/usr/bin/env bash
# Posts this build's hub-status.json to the Hub after the project's own test step has run
# (if it has one — players-front does not, see below), and optionally drops a plain-text
# version file into the static build output for the Hub's version poller to read once
# deployed. docs/contracts/hub-status.schema.json is the contract; this template's
# spring-maven/python-pytest-cov/node-vitest siblings explain the same shape for other
# stacks.
#
# Copy this file and hub_status_payload.py into the target repo (e.g. as
# ci/hub-report.sh, ci/hub_status_payload.py).
#
# --- Test/coverage step -----------------------------------------------------------------
#
# Vite + vitest projects (element-front-app, nebula-home, puzzel-front-app,
# racer-front-app, robak-front-app):
#
#   npx vitest run --coverage --coverage.reporter=json-summary \
#     --reporter=default --reporter=json --outputFile=test-results.json
#
# Create React App projects (chess-front-app — and nebula-front-app-public, but that repo
# is excluded from Hub reporting entirely, it is the public mirror):
#
#   CI=true npx react-scripts test --coverage --coverageReporters=json-summary \
#     --watchAll=false --json --outputFile=test-results.json
#
# Both write coverage/coverage-summary.json (istanbul's shape, identical either way) and a
# Jest-shaped test-results.json (react-scripts test IS Jest; vitest's --reporter=json
# deliberately mirrors it) — hub_status_payload.py reads both the same way regardless of
# which produced them.
#
# A project with no test suite at all yet (players-front, as of 2026-09) simply has no
# coverage-summary.json/test-results.json to find; the payload omits the `tests` block
# entirely and still reports version/commit_sha — do not block wiring the report step on a
# repo growing tests first.
#
# --- Version file ------------------------------------------------------------------------
#
# Static sites have no live process to expose a `GET .../api/v1/version` route the way
# every Spring/Node backend in this lab does, so this template writes the version straight
# into the build output as a plain file instead — `VERSION_FILE` (see below), pointed at
# e.g. `dist/version.txt` (vite) or `build/version.txt` (CRA), *before* that directory is
# deployed. Once live, the deployed site serves it at its own root
# (`https://.../<path>/version.txt`) — set that URL as the deployment's
# `version_endpoint_url` (Hub UI or `PATCH /api/v1/deployments/{id}`) so
# services/version_poller.py can read it.
#
# It MUST be plain text, not JSON: the poller does `response.text.strip()` verbatim as the
# version string, with no JSON parsing at all.
#
# --- Wiring the step -----------------------------------------------------------------
#
#   - name: Report to Hub
#     if: always()
#     continue-on-error: true
#     env:
#       HUB_URL: ${{ secrets.HUB_URL }}
#       HUB_CI_TOKEN: ${{ secrets.HUB_CI_TOKEN }}
#       COMPONENT_KEY: <app_group.key>/<component.role>/<component.name>
#       VERSION_FILE: dist/version.txt
#     run: ci/hub-report.sh
#
# `continue-on-error: true`: a Hub outage must never fail a real build over a status report.
# `HUB_CI_TOKEN` is minted once via POST /api/v1/components/{id}/tokens (session-cookie
# auth, from the Hub UI or curl) and stored as a repo secret -- plaintext is shown exactly
# once at creation.
#
# Required env:
#   HUB_URL           e.g. https://hub.milkyway.test  (no trailing /api/... needed)
#   HUB_CI_TOKEN       component bearer token
#   COMPONENT_KEY      e.g. element/front/element-front-app
# Optional env:
#   HUB_ENVIRONMENT    default: test
#   HUB_CACERT         path to a CA bundle for curl to trust, if HUB_URL's own cert is not
#                       already trusted system-wide (milkyway.test's is self-signed) --
#                       passed as --cacert, never -k; default: verify with the system store
#   PACKAGE_JSON       default: package.json
#   COVERAGE_SUMMARY   default: coverage/coverage-summary.json
#   TEST_RESULTS_JSON  default: test-results.json
#   VERSION_FILE       if set, the plain-text version is also written to this path (run
#                       this step after the build, so the path already exists to write into)
#
# P5-1: also reports whether a README exists at the repo root (checked in bash, right
# below, before the report is built) as checklist_item(check_key=documentation) -- no env
# var to configure it, the check is the same everywhere.

set -euo pipefail

: "${HUB_URL:?HUB_URL is required}"
: "${HUB_CI_TOKEN:?HUB_CI_TOKEN is required}"
: "${COMPONENT_KEY:?COMPONENT_KEY is required}"

ENVIRONMENT="${HUB_ENVIRONMENT:-test}"
PACKAGE_JSON="${PACKAGE_JSON:-package.json}"
COVERAGE_SUMMARY="${COVERAGE_SUMMARY:-coverage/coverage-summary.json}"
TEST_RESULTS_JSON="${TEST_RESULTS_JSON:-test-results.json}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

COMMIT_SHA="$(git rev-parse HEAD)"
REPORTED_AT="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

BUILD_URL=""
if [ -n "${GITHUB_SERVER_URL:-}" ] && [ -n "${GITHUB_REPOSITORY:-}" ] && [ -n "${GITHUB_RUN_ID:-}" ]; then
  BUILD_URL="${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}"
fi

VERSION_FILE_ARGS=()
if [ -n "${VERSION_FILE:-}" ]; then
  VERSION_FILE_ARGS=(--version-file "${VERSION_FILE}")
fi

# Checks the current working directory first, then the repo root -- a monorepo split
# (hub-backend's own `backend/` working-directory, element-editor's `frontend`/`backend`)
# keeps its one real README at the top, not inside the subdirectory this step runs in;
# checking only the cwd would false-negative every one of those (confirmed against
# hub-backend itself, 2026-09-14: backend/README.md does not exist, the real one is one
# level up).
DOCUMENTATION_PRESENT="false"
REPO_ROOT="$(git rev-parse --show-toplevel 2>/dev/null || echo .)"
for dir in "." "${REPO_ROOT}"; do
  for candidate in README.md README.rst README.txt README; do
    if [ -f "${dir}/${candidate}" ]; then
      DOCUMENTATION_PRESENT="true"
      break 2
    fi
  done
done

PAYLOAD="$(python3 "${SCRIPT_DIR}/hub_status_payload.py" \
  --package-json "${PACKAGE_JSON}" \
  --coverage-summary "${COVERAGE_SUMMARY}" \
  --test-results "${TEST_RESULTS_JSON}" \
  --component-key "${COMPONENT_KEY}" \
  --environment "${ENVIRONMENT}" \
  --commit-sha "${COMMIT_SHA}" \
  --build-url "${BUILD_URL}" \
  --documentation-present "${DOCUMENTATION_PRESENT}" \
  --reported-at "${REPORTED_AT}" \
  "${VERSION_FILE_ARGS[@]}")"

echo "==> Reporting to ${HUB_URL%/}/api/v1/reports: ${PAYLOAD}"

CACERT_ARGS=()
if [ -n "${HUB_CACERT:-}" ]; then
  CACERT_ARGS=(--cacert "${HUB_CACERT}")
fi

curl -sS --fail-with-body "${CACERT_ARGS[@]}" -X POST "${HUB_URL%/}/api/v1/reports" \
  -H "Authorization: Bearer ${HUB_CI_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "${PAYLOAD}"
echo
