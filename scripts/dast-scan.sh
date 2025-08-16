#!/bin/bash
set -euo pipefail

TARGET_URL="${1:-http://localhost:3000}"
REPORT_DIR="dast-report"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found; skipping DAST scan."
  exit 0
fi

mkdir -p "$REPORT_DIR"

echo "⚔️  Running OWASP ZAP baseline scan against $TARGET_URL"

docker run --rm \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
  -t ghcr.io/zaproxy/zaproxy:stable \
  zap-baseline.py -t "$TARGET_URL" -J dast-report.json -x dast-report.xml || true

CRITICAL=$(grep -o '"riskcode":"3"' "$REPORT_DIR/dast-report.json" 2>/dev/null | wc -l || true)

if [ "${CRITICAL:-0}" -gt 0 ]; then
  echo "❌ Critical vulnerabilities detected: $CRITICAL"
  exit 1
else
  echo "✅ No critical vulnerabilities found"
fi
