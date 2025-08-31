#!/bin/bash

# Find all occurrences of window.location.href
echo "Finding all window.location.href occurrences..."

grep -r "window\.location\.href" \
  --include="*.tsx" \
  --include="*.ts" \
  app/ components/ \
  -n | grep -v "error.tsx" | grep -v "global-error.tsx"