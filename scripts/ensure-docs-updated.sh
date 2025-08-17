#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH="${GITHUB_BASE_REF:-main}"

# In GitHub Actions, we need to fetch the base branch first
echo "🔍 Checking documentation compliance..."

# Try to fetch the base branch, but don't fail if it doesn't exist
if git fetch origin "$BASE_BRANCH" >/dev/null 2>&1; then
  COMPARE_BRANCH="origin/$BASE_BRANCH"
  echo "📋 Comparing with origin/$BASE_BRANCH"
else
  # Fallback: compare with current branch or just check if docs exist
  COMPARE_BRANCH="HEAD~1"
  echo "⚠️  Could not fetch origin/$BASE_BRANCH, comparing with previous commit"
fi

# Check if we can actually compare
if git rev-parse --verify "$COMPARE_BRANCH" >/dev/null 2>&1; then
  DIFF_FILES=$(git diff --name-only "$COMPARE_BRANCH"...HEAD 2>/dev/null || echo "")
  
  if [[ -n "$DIFF_FILES" ]]; then
    CODE_CHANGES=$(echo "$DIFF_FILES" | grep -Ev '^(docs/|README.md$)' || true)
    DOC_CHANGES=$(echo "$DIFF_FILES" | grep -E '^(docs/|README.md$)' || true)

    if [[ -n "$CODE_CHANGES" && -z "$DOC_CHANGES" ]]; then
      echo "❌ Documentation missing: update README.md or docs/ when modifying code."
      echo "Code changes detected:"
      echo "$CODE_CHANGES"
      exit 1
    fi
  fi
else
  # If we can't compare, just check if basic docs exist
  echo "ℹ️  Could not determine changes, checking if basic documentation exists..."
  
  if [[ ! -f "README.md" ]]; then
    echo "❌ README.md is missing!"
    exit 1
  fi
  
  if [[ ! -d "docs" ]]; then
    echo "⚠️  docs/ directory is missing, but README.md exists"
    echo "✅ Documentation compliance check passed (basic docs exist)"
    exit 0
  fi
fi

echo "✅ Documentation is up to date."
