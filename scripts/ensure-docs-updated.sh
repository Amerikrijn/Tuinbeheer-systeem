#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${GITHUB_BASE_REF:-main}"
git fetch origin "$BASE_BRANCH" >/dev/null 2>&1 || true

if git rev-parse --verify "origin/$BASE_BRANCH" >/dev/null 2>&1; then
  COMPARE_BRANCH="origin/$BASE_BRANCH"
else
  COMPARE_BRANCH="$BASE_BRANCH"
fi

DIFF_FILES=$(git diff --name-only "$COMPARE_BRANCH"...HEAD)

CODE_CHANGES=$(echo "$DIFF_FILES" | grep -Ev '^(docs/|README.md$)' || true)
DOC_CHANGES=$(echo "$DIFF_FILES" | grep -E '^(docs/|README.md$)' || true)

if [[ -n "$CODE_CHANGES" && -z "$DOC_CHANGES" ]]; then
  echo "❌ Documentation missing: update README.md or docs/ when modifying code."
  echo "Code changes detected:"
  echo "$CODE_CHANGES"
  exit 1
fi

echo "✅ Documentation is up to date."
