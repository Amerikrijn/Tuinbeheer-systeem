#!/bin/bash

# Auto Deploy Safety Check Script
# This script performs basic safety checks before deployment

set -e

echo "🔒 Running deployment safety checks..."

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Error: Not in a git repository"
    exit 1
fi

# Check if there are uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Error: There are uncommitted changes. Please commit or stash them first."
    git status --short
    exit 1
fi

# Check if dependencies are installed
if [ ! -d "node_modules" ]; then
    echo "❌ Error: Dependencies not installed. Run 'npm install' first."
    exit 1
fi

# Check if build works
echo "🔨 Testing build process..."
if ! npm run build; then
    echo "❌ Error: Build failed"
    exit 1
fi

# Check if tests pass
echo "🧪 Running basic test check..."
if ! npm run test:ci; then
    echo "❌ Error: Basic tests failed"
    exit 1
fi

echo "✅ All safety checks passed. Ready for deployment."
exit 0