#!/usr/bin/env python3
"""Builds one `hub-status.json` (docs/contracts/hub-status.schema.json) for a static SPA
build. Identical parsing to `ci-templates/node-vitest`'s own script — vitest's
`coverage-summary.json`/`--reporter=json` and Jest's (so also Create React App's
`react-scripts test`) `--coverageReporters=json-summary`/`--json --outputFile=...` write the
exact same shapes, so one script covers both test runners this lab's SPAs actually use.
Python rather than a Node script for the same reason every template in this lab is: python3
is a hard requirement of every self-hosted runner regardless of the project's own stack.
"""

from __future__ import annotations

import argparse
import json
import sys


def read_version(package_json_path: str) -> str:
    with open(package_json_path) as f:
        data = json.load(f)
    try:
        return data["version"]
    except KeyError as error:
        raise SystemExit(f'no "version" field in {package_json_path}') from error


def read_coverage_percent(coverage_summary_path: str) -> float | None:
    try:
        with open(coverage_summary_path) as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return None
    try:
        return round(data["total"]["lines"]["pct"], 2)
    except KeyError:
        return None


def read_test_counts(test_results_path: str) -> tuple[int, int]:
    try:
        with open(test_results_path) as f:
            data = json.load(f)
    except (FileNotFoundError, json.JSONDecodeError):
        return 0, 0
    # Vitest's own --reporter=json is Jest-compatible, and this is Jest's real own
    # --json output too (react-scripts test wraps Jest directly): numPassedTests/
    # numFailedTests count individual tests, separately from the TestSuites variants (files).
    return data.get("numPassedTests", 0), data.get("numFailedTests", 0)


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--package-json", required=True)
    parser.add_argument("--coverage-summary", required=True)
    parser.add_argument("--test-results", required=True)
    parser.add_argument("--component-key", required=True)
    parser.add_argument("--environment", required=True)
    parser.add_argument("--commit-sha", required=True)
    parser.add_argument("--build-url", default="")
    parser.add_argument("--reported-at", required=True)
    # Optional: also drop the plain version string on disk, e.g. into the built static
    # output next to index.html, so the deployed site serves it as a plain-text file the
    # Hub's version poller (services/version_poller.py) can GET directly -- that poller
    # reads `response.text.strip()` verbatim, so this must stay plain text, never JSON.
    parser.add_argument("--version-file")
    # P5-1: always known (hub-report.sh checks for the file itself, in bash, before
    # calling this script), so this is required rather than optional like --build-url.
    parser.add_argument("--documentation-present", required=True, choices=["true", "false"])
    args = parser.parse_args()

    version = read_version(args.package_json)

    if args.version_file:
        with open(args.version_file, "w") as f:
            f.write(version)

    passed, failed = read_test_counts(args.test_results)
    coverage_percent = read_coverage_percent(args.coverage_summary)
    payload = {
        "schema_version": 1,
        "component_key": args.component_key,
        "environment": args.environment,
        "version": version,
        "commit_sha": args.commit_sha,
        "build_url": args.build_url or None,
        "documentation": {"present": args.documentation_present == "true"},
        "reported_at": args.reported_at,
    }
    # A build with nothing to say about tests (no coverage configured, or a project with no
    # test suite at all yet, e.g. players-front) omits the block entirely rather than
    # sending passed=0/failed=0 -- every other template in this lab carries the same rule.
    if passed or failed or coverage_percent is not None:
        payload["tests"] = {
            "passed": passed,
            "failed": failed,
            "coverage_percent": coverage_percent,
        }
    json.dump(payload, sys.stdout)


if __name__ == "__main__":
    main()
