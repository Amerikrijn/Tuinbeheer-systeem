#!/bin/bash
set -euo pipefail

# Sends the latest test log to a generic agent API and applies the returned patch.

API_URL="${AGENT_API_URL:-}"

if [[ -z "$API_URL" ]]; then
  echo "AGENT_API_URL not set; skipping agent fix."
  exit 0
fi

if [[ ! -f test-log.txt ]]; then
  echo "test-log.txt not found; nothing to send."
  exit 0
fi

echo "Sending test log to agent at $API_URL..."
PATCH=$(curl -sS -X POST "$API_URL" -H "Content-Type: text/plain" --data-binary @test-log.txt || true)

if [[ -z "$PATCH" ]]; then
  echo "No patch received from agent."
  exit 0
fi

echo "Applying patch from agent..."
if git apply <<<"$PATCH"; then
  echo "Patch applied successfully."
else
  echo "Failed to apply patch."
fi

